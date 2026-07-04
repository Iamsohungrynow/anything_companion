import type { NextRequest } from "next/server";

// The Yorimi runtime is Node CommonJS and uses Node built-ins (fs, https, crypto,
// FormData, fetch), so this route must run on the Node.js runtime, never Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Load web/.env into process.env for local dev BEFORE the vendored runtime's
// config reads it. On Vercel there is no .env file; provider keys come from the
// project's Environment Variables (already in process.env), so this is a no-op there.
(() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const envPath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    /* ignore */
  }
})();

// The Yorimi runtime, pre-bundled into one self-contained CJS file (all internal
// requires inlined; only Node built-ins external). Load it with Node's NATIVE
// require at runtime (via eval so the Next bundler never re-processes the esbuild
// output, which breaks its CJS lazy-init). The file is trace-included for Vercel
// via outputFileTracingIncludes in next.config. Regenerate the bundle with:
//   npx esbuild server/http/runtimeHandlers.js --bundle --platform=node --format=cjs --outfile=server/runtime.bundle.cjs
// eslint-disable-next-line no-eval
const nodeRequire = eval("require") as NodeRequire;
const runtimePath = nodeRequire("path").join(
  process.cwd(),
  "server",
  "runtime.bundle.cjs",
);
const { handleHttpRequest } = nodeRequire(runtimePath) as {
  handleHttpRequest: (req: unknown, res: unknown) => Promise<void>;
};

const HOP_BY_HOP = new Set(["content-length", "connection", "transfer-encoding"]);

async function handle(request: NextRequest): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";

  // Minimal Node-style request the runtime understands. host is pinned so the
  // runtime's host allowlist always passes (Next already vetted the real host);
  // no Origin header is sent, so the runtime's CORS check is skipped.
  const req: Record<string, unknown> = {
    method,
    url: url.pathname + url.search,
    headers: {
      host: "127.0.0.1",
      accept: request.headers.get("accept") || "",
      "content-type": request.headers.get("content-type") || "",
    },
  };
  if (hasBody) req.body = await request.text();

  // Streaming-capable fake response bridged to a Web ReadableStream.
  let status = 200;
  const resHeaders: Record<string, string> = {};
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  let ended = false;
  const encoder = new TextEncoder();
  const pending: Uint8Array[] = [];
  let resolveHead!: () => void;
  const headReady = new Promise<void>((resolve) => {
    resolveHead = resolve;
  });

  const push = (chunk: unknown) => {
    if (chunk == null) return;
    const bytes =
      typeof chunk === "string"
        ? encoder.encode(chunk)
        : chunk instanceof Uint8Array
          ? chunk
          : encoder.encode(String(chunk));
    if (controller) controller.enqueue(bytes);
    else pending.push(bytes);
  };

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
      for (const b of pending) c.enqueue(b);
      pending.length = 0;
      if (ended) c.close();
    },
  });

  const res = {
    setHeader(key: string, value: unknown) {
      resHeaders[key.toLowerCase()] = String(value);
    },
    getHeader(key: string) {
      return resHeaders[key.toLowerCase()];
    },
    writeHead(code: number, headers?: Record<string, unknown>) {
      status = code;
      if (headers) {
        for (const [k, v] of Object.entries(headers)) {
          resHeaders[k.toLowerCase()] = String(v);
        }
      }
      resolveHead();
      return res;
    },
    write(chunk: unknown) {
      resolveHead();
      push(chunk);
      return true;
    },
    end(chunk?: unknown) {
      resolveHead();
      if (chunk != null) push(chunk);
      ended = true;
      if (controller) controller.close();
    },
  };

  // Kick off the real runtime without awaiting so SSE chunks stream out live.
  Promise.resolve()
    .then(() => handleHttpRequest(req, res))
    .catch((error: unknown) => {
      if (ended) return;
      if (!resHeaders["content-type"]) {
        resHeaders["content-type"] = "application/json; charset=utf-8";
      }
      status = 500;
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      push(JSON.stringify({ ok: false, error: message }));
      res.end();
    });

  await headReady;

  const outHeaders = new Headers();
  for (const [k, v] of Object.entries(resHeaders)) {
    if (!HOP_BY_HOP.has(k)) outHeaders.set(k, v);
  }
  return new Response(stream, { status, headers: outHeaders });
}

export const GET = handle;
export const POST = handle;
export const OPTIONS = handle;
export const HEAD = handle;
