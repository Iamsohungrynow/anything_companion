"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const guide = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
const html = fs.readFileSync(path.join(root, "frontend", "static", "nextstep-companion.html"), "utf8");
const voiceOutput = fs.readFileSync(path.join(root, "frontend", "person-c", "utils", "voiceOutput.ts"), "utf8");
const serverIndex = fs.readFileSync(path.join(root, "server", "index.js"), "utf8");
const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
const packageJson = require(path.join(root, "package.json"));

for (const heading of [
  "Project Purpose",
  "Non-Negotiable Runtime Rules",
  "Frontend Rendering Rules",
  "Voice Rules",
  "Assets Rules",
  "Env And Secrets Rules",
  "Required Tests Before Commit",
]) {
  assert.match(guide, new RegExp(`## ${heading}`), `AGENTS.md missing ${heading}`);
}

assert.match(html, /result\?\.(answer|reply)|result\.answer\s*\|\|\s*result\.reply|answer\s*\|\|\s*reply/, "frontend must preserve answer-first rendering");
assert.doesNotMatch(html, /micro_task_plan\.map\([^)]*\)\.join\([^)]*\).*assistant|assistant.*micro_task_plan\.map/s, "main chat answer must not be built from micro_task_plan");

assert.match(html, /\/api\/tts/, "HTML should keep /api/tts integration");
assert.match(html, /speechSynthesis/, "HTML should keep browser speech synthesis support");
assert.match(html, /speakBrowserText\(spoken,onEnd\)/, "HTML /api/tts failure must fall back to browser speech");
assert.match(voiceOutput, /catch\s*\{[\s\S]*speakBrowserText\(spokenText,\s*scenario,\s*onEnd,\s*voiceWaits\)/, "TS voice helper must fall back to browser speech");
assert.match(serverIndex, /url\.pathname === "\/api\/tts"/, "backend must expose POST /api/tts");
assert.match(serverIndex, /fish_audio_configured/, "health response must expose Fish Audio configuration state");
assert.match(serverIndex, /Fish Audio TTS is not configured/, "backend must clearly report missing Fish Audio configuration");

for (const assetPath of [
  "assets/companions/coffee.jpg",
  "assets/companions/folio-open-book.png",
  "assets/companions/luma-desk-lamp.png",
]) {
  assert.ok(fs.existsSync(path.join(root, assetPath)), `${assetPath} must exist`);
  assert.match(html, new RegExp(assetPath.replace(/[/.]/g, "\\$&")), `${assetPath} must be referenced by frontend`);
}

assert.match(envExample, /OPENAI_API_KEY=/, ".env.example must document OPENAI_API_KEY");
assert.match(envExample, /FISH_AUDIO_API_KEY=/, ".env.example must document optional Fish Audio key");
assert.match(envExample, /speechSynthesis/, ".env.example must document browser voice fallback");
assert.equal(packageJson.scripts["test:agents"], "node server/tests/agent-guide-test.js", "package.json must expose test:agents");

console.log("Agent guide contract test passed.");
