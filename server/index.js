const fs = require("fs");
const http = require("http");
const path = require("path");
const packageJson = require("../package.json");
const { ALLOWED_HOSTS, ALLOWED_ORIGINS, HTML_FILE, HOST, PORT, ROOT_DIR, USE_MOCK_AI, OPENAI_MODEL, FISH_AUDIO_API_KEY, FISH_AUDIO_REFERENCE_ID, FISH_AUDIO_TIMEOUT_MS, MAX_SESSIONS, SESSION_TTL_MS } = require("./config");
const { companionData } = require("./data");
const { runTurn } = require("./runtime/orchestrator");
const { normalizeScenario } = require("./schemas");
const { createSession, getSession, resetSession } = require("./store/sessionStore");

const ttsCache = new Map();
const MAX_TTS_CACHE_ENTRIES = 40;

const server = http.createServer(async (req, res) => {
  try {
    if (!isAllowedHost(req)) {
      sendJson(res, 421, { ok: false, error: "Host not allowed." });
      return;
    }

    if (!setCors(req, res)) return;

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        service: "nextstep-runtime",
        version: packageJson.version,
        timestamp: new Date().toISOString(),
        host: HOST,
        allowed_hosts: ALLOWED_HOSTS,
        openai_configured: Boolean(process.env.OPENAI_API_KEY),
        fish_audio_configured: Boolean(FISH_AUDIO_API_KEY && FISH_AUDIO_REFERENCE_ID),
        mock_forced: USE_MOCK_AI,
        model: OPENAI_MODEL,
        max_sessions: MAX_SESSIONS,
        session_ttl_ms: SESSION_TTL_MS,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/scenarios") {
      sendJson(res, 200, {
        companions: companionData.companions || {},
        adaptive_modes: companionData.adaptive_modes || [],
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/session") {
      const body = await readJson(req);
      const scenario = normalizeScenario(body?.scenario);
      const session = createSession({
        scenario,
        companion: body?.companion || companionData.companions?.[scenario],
        tone: body?.tone,
        use_case: body?.use_case,
      });
      sendJson(res, 200, {
        session_id: session.id,
        scenario: session.scenario,
        companion: session.companion,
        memory: session.memory,
        created_at: session.created_at,
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/chat") {
      const body = await readJson(req);
      const result = await runTurn(body);
      console.log(
        "[api/chat]",
        JSON.stringify({
          openai_configured: Boolean(process.env.OPENAI_API_KEY),
          mock_forced: USE_MOCK_AI,
          runtime_source: result?.fallback_used ? "fallback" : "openai",
          intent: result?.intent,
          mode: result?.mode,
          model: OPENAI_MODEL,
        })
      );
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/tts") {
      const body = await readJson(req);
      await proxyFishAudioTts(body, res);
      return;
    }

    const memoryMatch = url.pathname.match(/^\/api\/session\/([^/]+)\/memory$/);
    if (req.method === "GET" && memoryMatch) {
      const session = getSession(memoryMatch[1]);
      if (!session) {
        sendJson(res, 404, { ok: false, error: "Session not found." });
        return;
      }
      sendJson(res, 200, { session_id: session.id, memory: session.memory });
      return;
    }

    const resetMatch = url.pathname.match(/^\/api\/session\/([^/]+)\/reset$/);
    if (req.method === "POST" && resetMatch) {
      sendJson(res, 200, { ok: resetSession(resetMatch[1]) });
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(url.pathname, req.method, res);
      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found." });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      ok: false,
      error: error.message || "Internal server error.",
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`NextStep runtime listening on http://${HOST}:${PORT}`);
});

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    sendJson(res, 403, { ok: false, error: "Origin not allowed." });
    return false;
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return true;
}

function isAllowedHost(req) {
  const host = normalizeHost(req.headers.host || "");
  return Boolean(host) && ALLOWED_HOSTS.includes(host);
}

function normalizeHost(hostHeader) {
  const host = String(hostHeader).trim().toLowerCase();
  if (!host) return "";
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return end === -1 ? host : host.slice(1, end);
  }
  return host.split(":")[0];
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function proxyFishAudioTts(body, res) {
  const text = String(body?.text || "").trim();
  if (!text) {
    sendJson(res, 400, { ok: false, error: "text is required." });
    return;
  }

  if (!FISH_AUDIO_API_KEY || !FISH_AUDIO_REFERENCE_ID) {
    sendJson(res, 503, { ok: false, error: "Fish Audio TTS is not configured." });
    return;
  }

  const cacheKey = text;
  const cached = ttsCache.get(cacheKey);
  if (cached) {
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=300",
      "Content-Length": cached.length,
      "X-TTS-Cache": "HIT",
    });
    res.end(cached);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FISH_AUDIO_TIMEOUT_MS);

  try {
    const fishResponse = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${FISH_AUDIO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        reference_id: FISH_AUDIO_REFERENCE_ID,
        format: "mp3",
        latency: "normal",
      }),
    });

    if (!fishResponse.ok) {
      const errorText = await fishResponse.text().catch(() => "");
      sendJson(res, fishResponse.status, {
        ok: false,
        error: "Fish Audio TTS request failed.",
        detail: errorText.slice(0, 300),
      });
      return;
    }

    const audioBuffer = Buffer.from(await fishResponse.arrayBuffer());
    ttsCache.set(cacheKey, audioBuffer);
    if (ttsCache.size > MAX_TTS_CACHE_ENTRIES) {
      ttsCache.delete(ttsCache.keys().next().value);
    }
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=300",
      "Content-Length": audioBuffer.length,
      "X-TTS-Cache": "MISS",
    });
    res.end(audioBuffer);
  } catch (error) {
    sendJson(res, error.name === "AbortError" ? 504 : 502, {
      ok: false,
      error: error.name === "AbortError" ? "Fish Audio TTS timed out." : "Fish Audio TTS proxy failed.",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const contentType = String(req.headers["content-type"] || "");
    if (!contentType.toLowerCase().includes("application/json")) {
      reject(Object.assign(new Error("Content-Type must be application/json."), { statusCode: 415 }));
      return;
    }

    let raw = "";
    let size = 0;
    let tooLarge = false;
    req.on("data", (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > 1024 * 1024) {
        tooLarge = true;
        raw = "";
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      if (tooLarge) {
        reject(Object.assign(new Error("Request body too large."), { statusCode: 413 }));
        return;
      }
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error("Invalid JSON body."), { statusCode: 400 }));
      }
    });
    req.on("error", () => {
      if (tooLarge) reject(Object.assign(new Error("Request body too large."), { statusCode: 413 }));
      else reject(Object.assign(new Error("Request stream error."), { statusCode: 400 }));
    });
  });
}

function serveStatic(urlPath, method, res) {
  const isHead = method === "HEAD";
  if (urlPath === "/" || urlPath === "/nextstep-companion.html") {
    sendFile(res, HTML_FILE, "text/html; charset=utf-8", isHead);
    return;
  }

  if (urlPath === "/nextstep-companion-data.json") {
    sendFile(res, path.join(ROOT_DIR, "nextstep-companion-data.json"), "application/json; charset=utf-8", isHead);
    return;
  }

  if (urlPath.startsWith("/assets/")) {
    serveSafeStatic(ROOT_DIR, "assets", urlPath, res, isHead);
    return;
  }

  if (!urlPath.startsWith("/models/")) {
    sendJson(res, 404, { ok: false, error: "Not found." });
    return;
  }

  serveSafeStatic(ROOT_DIR, "models", urlPath, res, isHead);
}

function serveSafeStatic(rootDir, publicPrefix, urlPath, res, isHead) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch {
    sendJson(res, 400, { ok: false, error: "Malformed path." });
    return;
  }

  const staticRoot = path.resolve(rootDir, publicPrefix);
  const staticPath = decodedPath.replace(new RegExp(`^/${publicPrefix}[\\\\/]`), "");
  const fullPath = path.resolve(staticRoot, staticPath);
  const relative = path.relative(staticRoot, fullPath);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    sendJson(res, 404, { ok: false, error: "Not found." });
    return;
  }

  sendFile(res, fullPath, contentType(fullPath), isHead);
}

function sendFile(res, filePath, type, headOnly = false) {
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  });
  if (headOnly) {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".mp4" || ext === ".m4v") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}
