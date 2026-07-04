// Regenerate web/server/runtime.bundle.cjs from the canonical runtime at /server.
//
// The web app loads this single self-contained CommonJS bundle at runtime
// (see app/api/[...path]/route.ts), so ONE Vercel deployment serves the landing,
// the demo, and the whole /api/* runtime. The bundle is committed, so Vercel does
// not need to run this. Run it yourself after changing anything under /server:
//   npm run build:runtime
import { cpSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(webDir, "..");
const srcServer = path.join(repoRoot, "server");
const dataJson = path.join(
  repoRoot,
  "frontend",
  "static",
  "nextstep-companion-data.json",
);
const tmp = path.join(webDir, ".runtime-build");
const outFile = path.join(webDir, "server", "runtime.bundle.cjs");

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
cpSync(srcServer, tmp, { recursive: true });

// Not needed by the API handler; drop them from the bundle input.
rmSync(path.join(tmp, "index.js"), { force: true });
rmSync(path.join(tmp, "tests"), { recursive: true, force: true });

// web/ is type:module, so mark the vendored runtime as CommonJS for esbuild,
// and make the companion-data load bundler-safe (no runtime fs read).
writeFileSync(
  path.join(tmp, "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2) + "\n",
);
cpSync(dataJson, path.join(tmp, "companion-data.json"));
writeFileSync(
  path.join(tmp, "data.js"),
  'const companionData = require("./companion-data.json");\nmodule.exports = { companionData };\n',
);

execFileSync(
  "npx",
  [
    "--yes",
    "esbuild",
    path.join(tmp, "http", "runtimeHandlers.js"),
    "--bundle",
    "--platform=node",
    "--format=cjs",
    `--outfile=${outFile}`,
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);

rmSync(tmp, { recursive: true, force: true });
console.log("Wrote", path.relative(webDir, outFile));
