"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..", "..");
const html = fs.readFileSync(path.join(root, "frontend", "static", "nextstep-companion.html"), "utf8");
const renderYamlPath = path.join(root, "render.yaml");
const config = fs.readFileSync(path.join(root, "server", "config.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const demoScript = fs.readFileSync(path.join(root, "docs", "deliverables", "person-c", "DEMO_SCRIPT.md"), "utf8");
const qaChecklist = fs.readFileSync(path.join(root, "docs", "deliverables", "person-d", "D_QA_CHECKLIST.md"), "utf8");
const martCases = fs.readFileSync(path.join(root, "docs", "testing", "MART_BACKEND_TEST_CASES.md"), "utf8");
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
  assert.match(html, /@babel\/standalone@7\/babel\.min\.js/, "frontend should pin Babel standalone to v7");
  assert.doesNotMatch(html, /@babel\/standalone\/babel\.min\.js/, "frontend must not load unpinned Babel standalone");
  assert.match(html, /check_in_result/, "frontend should persist sprint check-ins");
  assert.match(html, /micro_task_plan/, "frontend should prefer structured micro-task plans");
  assert.match(html, /fallback_used/, "frontend should expose fallback state");
  assert.match(html, /result\.trace/, "frontend should render runtime trace");
  assert.match(html, /URLSearchParams\(window\.location\.search\)/, "frontend should support ?runtime=local");
  assert.doesNotMatch(html, /<script[^>]+pixi-live2d-display/, "Study should not preload Live2D from an external CDN");
  assert.doesNotMatch(html, /<script[^>]+pixi\.min\.js/, "Study should not preload Pixi from an external CDN");
  assert.match(html, /if\(!ttsSup\)\{if\(onEnd\) onEnd\(\);return;\}/, "unsupported TTS should not block Video Mode text input");
}

function testFrontendReliabilityHardening() {
  assert.match(html, /get\(['"]runtime['"]\)/, "frontend should read the runtime query parameter");
  assert.match(html, /RUNTIME_MODE\s*===\s*['"]local['"]/, "?runtime=local should force the browser-only backup");
  assert.match(html, /COMPANION_STATE_VIDEOS/, "Video Mode should map runtime states to deterministic videos");
  assert.match(html, /concerned:\s*['"]\.\/assets\/remind\.mp4['"]/, "concerned state should use the gentle reminder video");
  assert.match(html, /focused:\s*['"]\.\/assets\/turn_around\.mp4['"]/, "focused state should use the focus video");
  assert.doesNotMatch(html, /replyVideoIndexRef/, "Video Mode should not cycle through unrelated reply animations");
  assert.doesNotMatch(html, /video\.muted\s*=\s*false/, "Video Mode should not unmute autoplay videos");
  assert.match(html, /video\.muted\s*=\s*true/, "Video Mode should explicitly preserve muted autoplay");
  assert.match(html, /scenario===['"]study['"]\?['"]coffee['"]:null/, "Study upload should preselect Coffee Cup");
  assert.match(html, /uploadError/, "Image upload failures should be visible");
  assert.match(html, /r\.onerror/, "FileReader errors should fall back cleanly");
  assert.match(html, /Microphone access denied\. Please allow and try again\./, "microphone denial should preserve a text-input fallback");
  assert.match(html, /URL\.revokeObjectURL/, "obsolete uploaded image URLs should be released");
  assert.match(html, /sourceImageKind/, "built-in and uploaded companion images should be labeled differently");
  assert.match(html, /\.\.\.\(res\.memory\|\|\{\}\)/, "Memory summary should preserve server session memory");
  assert.match(html, /check_in_history/, "Memory summary should expose synced sprint check-ins");
  assert.match(html, /duration_minutes/, "structured micro-task durations should be rendered");
  assert.match(html, /content:assistantText,mode:res\.mode,ts:/, "assistant messages should preserve the mode active when they were created");
  assert.match(html, /Mode switched to \{msg\.mode\}/, "historic chat bubbles should render their own saved mode");
}

function testLocalDemoContract() {
  assert.match(config, /parsePositiveInteger\(process\.env\.PORT,\s*3017\)/, "npm start should default to the documented local port 3017");
  for (const [label, contents] of [
    ["README", readme],
    ["Person C demo script", demoScript],
    ["Person D QA checklist", qaChecklist],
    ["Mart backend cases", martCases],
  ]) {
    assert.doesNotMatch(contents, /127\.0\.0\.1:3000/, `${label} should not point at the stale local demo port`);
  }
}

function testVideoAssetsExist() {
  for (const assetPath of [
    "assets/idle loop.mp4",
    "assets/thinking.mp4",
    "assets/remind.mp4",
    "assets/turn_around.mp4",
    "assets/jump.mp4",
  ]) {
    assert.ok(fs.existsSync(path.join(root, assetPath)), `${assetPath} must exist`);
  }
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
  assert.equal(packageJson.scripts["test:d"], "node server/tests/d-reliability-test.js");
}

testFrontendRuntimeContract();
testFrontendReliabilityHardening();
testLocalDemoContract();
testVideoAssetsExist();
testRenderDeploymentContract();
testPackageScript();

console.log("D reliability test passed.");
