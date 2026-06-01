"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const guide = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
const html = fs.readFileSync(path.join(root, "frontend", "static", "nextstep-companion.html"), "utf8");
const voiceOutput = fs.readFileSync(path.join(root, "frontend", "companion-experience", "features", "voice", "voiceOutput.ts"), "utf8");
const serverIndex = fs.readFileSync(path.join(root, "server", "index.js"), "utf8");
const runtimeHandlers = fs.readFileSync(path.join(root, "server", "http", "runtimeHandlers.js"), "utf8");
const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
const vercelConfig = fs.readFileSync(path.join(root, "vercel.json"), "utf8");
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
const assistantTextFunction = html.match(/function getAssistantText\(result\)\{[\s\S]*?\n\}/)?.[0] || "";
assert.match(assistantTextFunction, /result\?\.answer\s*\|\|\s*result\?\.reply/, "main chat must render the model answer before compatibility fields");
assert.doesNotMatch(assistantTextFunction, /micro_task_plan/, "main chat answer must not be built from micro_task_plan");

assert.match(html, /\/api\/tts/, "HTML should keep /api/tts integration");
assert.match(html, /speechSynthesis/, "HTML should keep browser speech synthesis support");
assert.match(html, /speakBrowserText\(spoken,onEnd\)/, "HTML /api/tts failure must fall back to browser speech");
assert.match(voiceOutput, /catch\s*\{[\s\S]*speakBrowserText\(spokenText,\s*scenario,\s*onEnd,\s*voiceWaits\)/, "TS voice helper must fall back to browser speech");
assert.match(runtimeHandlers, /url\.pathname === "\/api\/tts"|handleTts/, "backend must expose POST /api/tts");
assert.match(runtimeHandlers, /fish_audio_configured/, "health response must expose Fish Audio configuration state");
assert.match(runtimeHandlers, /Fish Audio TTS is not configured/, "backend must clearly report missing Fish Audio configuration");
assert.match(serverIndex, /handleHttpRequest/, "local server must delegate to shared runtime handlers");
assert.doesNotMatch(serverIndex, /\/api\/chat/, "local server route table should live in shared handlers");
assert.match(vercelConfig, /nextstep-companion\.html/, "vercel.json must rewrite to the static HTML demo");
assert.match(vercelConfig, /\/assets\/:path\*/, "vercel.json must preserve asset paths");

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
assert.equal(packageJson.scripts["test:vercel"], "node server/tests/vercel-adapter-test.js", "package.json must expose test:vercel");

console.log("Agent guide contract test passed.");
