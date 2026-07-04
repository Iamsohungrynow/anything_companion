import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app lives in a subfolder of a larger repo; pin tracing to this folder.
  outputFileTracingRoot: __dirname,
  // The API route loads the pre-bundled runtime via a runtime require, so Next
  // cannot see it statically; force it into the serverless function bundle.
  outputFileTracingIncludes: {
    "/api/[...path]": ["./server/runtime.bundle.cjs"],
  },
  async rewrites() {
    return {
      // Serve the full companion demo (static HTML + its /assets media) at /demo.
      // /api/* is handled in-app by app/api/[...path]/route.ts (the vendored runtime),
      // so no proxy rewrite is needed.
      beforeFiles: [{ source: "/demo", destination: "/demo.html" }],
    };
  },
};

export default nextConfig;
