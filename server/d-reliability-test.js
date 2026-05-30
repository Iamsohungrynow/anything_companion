"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "nextstep-companion.html"), "utf8");
const renderYamlPath = path.join(root, "render.yaml");
const packageJson = require(path.join(root, "package.json"));

function inspectRenderConfig() {
  const script = `
    const config = require("./server/config");
    process.stdout.write(JSON.stringify({
      host: config.HOST,
      allowedHosts: config.ALLOWED_HOSTS,
      allowedOrigins: config.ALLOWED_ORIGINS
    }));
  `;

  return JSON.parse(
    execFileSync(process.execPath, ["-e", script], {
      cwd: root,
      env: {
        ...process.env,
        HOST: "",
        ALLOWED_HOSTS: "",
        ALLOWED_ORIGINS: "",
        RENDER_EXTERNAL_HOSTNAME: "nextstep-companion-demo.onrender.com",
        RENDER_EXTERNAL_URL: "",
      },
      encoding: "utf8",
    }),
  );
}

function testFrontendRuntimeContract() {
  assert.match(html, /function requestRuntimeTurn\s*\(/, "frontend should define requestRuntimeTurn()");
  assert.match(html, /fetch\(["']\/api\/chat["']/, "frontend should call POST /api/chat");
  assert.match(html, /check_in_result/, "frontend should persist sprint check-ins");
  assert.match(html, /micro_task_plan/, "frontend should prefer structured micro-task plans");
  assert.match(html, /fallback_used/, "frontend should expose fallback state");
  assert.match(html, /result\.trace/, "frontend should render runtime trace");
  assert.match(html, /URLSearchParams\(window\.location\.search\)/, "frontend should support ?runtime=local");
  assert.doesNotMatch(html, /<script[^>]+pixi-live2d-display/, "Study should not preload Live2D from an external CDN");
  assert.doesNotMatch(html, /<script[^>]+pixi\.min\.js/, "Study should not preload Pixi from an external CDN");
  assert.match(html, /if\(!ttsSup\)\{if\(onEnd\) onEnd\(\);return;\}/, "unsupported TTS should not block Video Mode text input");
}

function testRenderDeploymentContract() {
  const renderConfig = inspectRenderConfig();

  assert.equal(renderConfig.host, "0.0.0.0", "Render should bind to all interfaces");
  assert.ok(
    renderConfig.allowedHosts.includes("nextstep-companion-demo.onrender.com"),
    "Render hostname should be accepted by the host allowlist",
  );
  assert.ok(
    renderConfig.allowedOrigins.includes("https://nextstep-companion-demo.onrender.com"),
    "Render URL should be accepted by the origin allowlist",
  );
  assert.ok(fs.existsSync(renderYamlPath), "Render blueprint should exist");

  const renderYaml = fs.readFileSync(renderYamlPath, "utf8");
  assert.match(renderYaml, /startCommand:\s*npm start/, "Render should start with npm start");
  assert.match(renderYaml, /healthCheckPath:\s*\/api\/health/, "Render should use /api/health");
  assert.match(renderYaml, /key:\s*USE_MOCK_AI[\s\S]*value:\s*["']?true["']?/, "Render backup should default to mock AI");
}

function testPackageScript() {
  assert.equal(packageJson.scripts["test:d"], "node server/d-reliability-test.js");
}

testFrontendRuntimeContract();
testRenderDeploymentContract();
testPackageScript();

console.log("D reliability test passed.");
