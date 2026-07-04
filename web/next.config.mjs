import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// The Yorimi runtime (server/index.js) listens on 127.0.0.1:3017 by default.
// We proxy /api/* to it so the browser makes same-origin calls (no CORS) and
// all provider keys stay server-side. Override with YORIMI_API_ORIGIN if needed.
const API_ORIGIN = process.env.YORIMI_API_ORIGIN || "http://127.0.0.1:3017";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app lives in a subfolder of a larger repo (a Node backend at the root).
  // Pin file tracing to this folder so Next does not infer the repo root.
  outputFileTracingRoot: __dirname,
  async rewrites() {
    return {
      // Serve the full original working demo (static HTML + its /assets media)
      // at /demo, before filesystem routing.
      beforeFiles: [{ source: "/demo", destination: "/demo.html" }],
      // Proxy API calls to the Yorimi runtime (no CORS, keys stay server-side).
      afterFiles: [{ source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` }],
    };
  },
};

export default nextConfig;
