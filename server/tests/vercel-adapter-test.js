"use strict";

process.env.USE_MOCK_AI = "true";
process.env.HOST = "127.0.0.1";
process.env.ALLOWED_HOSTS = "127.0.0.1,localhost,::1";
process.env.ALLOWED_ORIGINS = "http://127.0.0.1:3017,http://localhost:3017";
process.env.FISH_AUDIO_API_KEY = "";
process.env.FISH_AUDIO_REFERENCE_ID = "";

const assert = require("assert");
const { EventEmitter } = require("events");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..", "..");

async function main() {
  testVercelFiles();
  const {
    health,
    scenarios,
    session,
    chat,
    tts,
    memory,
    reset,
  } = await loadHandlers();

  const healthResponse = await invoke(health, { method: "GET", url: "/api/health" });
  assert.equal(healthResponse.statusCode, 200);
  assert.equal(healthResponse.json.ok, true);
  assert.equal(healthResponse.json.service, "nextstep-runtime");

  const scenariosResponse = await invoke(scenarios, { method: "GET", url: "/api/scenarios" });
  assert.equal(scenariosResponse.statusCode, 200);
  assert.ok(scenariosResponse.json.companions.study);

  const sessionResponse = await invoke(session, {
    method: "POST",
    url: "/api/session",
    body: { scenario: "study" },
  });
  assert.equal(sessionResponse.statusCode, 200);
  assert.ok(sessionResponse.json.session_id);

  const chatResponse = await invoke(chat, {
    method: "POST",
    url: "/api/chat",
    body: {
      session_id: sessionResponse.json.session_id,
      scenario: "study",
      message: "I need to study periodic table",
      channel: "text",
      tone: "soft_supportive",
      use_case: "study",
    },
  });
  assert.equal(chatResponse.statusCode, 200);
  assert.ok(chatResponse.json.answer);
  assert.equal(chatResponse.json.fallback_used, true);
  assert.equal(chatResponse.json.runtime_source, "mock");

  const memoryResponse = await invoke(memory, {
    method: "GET",
    url: `/api/session/${sessionResponse.json.session_id}/memory`,
    query: { id: sessionResponse.json.session_id },
  });
  assert.equal(memoryResponse.statusCode, 200);
  assert.equal(memoryResponse.json.session_id, sessionResponse.json.session_id);

  const resetResponse = await invoke(reset, {
    method: "POST",
    url: `/api/session/${sessionResponse.json.session_id}/reset`,
    body: {},
    query: { id: sessionResponse.json.session_id },
  });
  assert.equal(resetResponse.statusCode, 200);
  assert.equal(resetResponse.json.ok, true);

  const missingFish = await invoke(tts, {
    method: "POST",
    url: "/api/tts",
    body: { text: "hello" },
  });
  assert.equal(missingFish.statusCode, 503);
  assert.match(missingFish.json.error, /Fish Audio TTS is not configured/);

  const options = await invoke(chat, { method: "OPTIONS", url: "/api/chat" });
  assert.equal(options.statusCode, 204);

  console.log("Vercel adapter test passed.");
}

function testVercelFiles() {
  for (const file of [
    "api/health.mjs",
    "api/scenarios.mjs",
    "api/session.mjs",
    "api/chat.mjs",
    "api/tts.mjs",
    "api/session/[id]/memory.mjs",
    "api/session/[id]/reset.mjs",
    "vercel.json",
  ]) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
  }

  const vercelConfig = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  assert.ok(vercelConfig.rewrites.some((rewrite) => rewrite.source === "/" && rewrite.destination.includes("nextstep-companion.html")));
  assert.ok(vercelConfig.rewrites.some((rewrite) => rewrite.source === "/nextstep-companion.html"));
  assert.ok(vercelConfig.rewrites.some((rewrite) => rewrite.source === "/nextstep-companion-data.json"));
  assert.ok(vercelConfig.rewrites.some((rewrite) => rewrite.source === "/assets/:path*"));
  assert.ok(vercelConfig.functions["api/**/*.mjs"], "Vercel must configure .mjs API functions");
}

async function loadHandlers() {
  const load = async (...parts) => {
    const mod = await import(pathToFileURL(path.join(root, ...parts)).href);
    return mod.default;
  };

  return {
    health: await load("api", "health.mjs"),
    scenarios: await load("api", "scenarios.mjs"),
    session: await load("api", "session.mjs"),
    chat: await load("api", "chat.mjs"),
    tts: await load("api", "tts.mjs"),
    memory: await load("api", "session", "[id]", "memory.mjs"),
    reset: await load("api", "session", "[id]", "reset.mjs"),
  };
}

function invoke(handler, options) {
  const req = new EventEmitter();
  req.method = options.method || "GET";
  req.url = options.url || "/";
  req.query = options.query || {};
  req.body = options.body;
  req.headers = {
    host: "127.0.0.1",
    "content-type": options.body === undefined ? undefined : "application/json",
    ...(options.headers || {}),
  };

  const res = {
    statusCode: 200,
    headers: {},
    rawBody: "",
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    writeHead(statusCode, headers = {}) {
      this.statusCode = statusCode;
      for (const [name, value] of Object.entries(headers)) this.setHeader(name, value);
    },
    end(chunk = "") {
      this.rawBody += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
      this.finished = true;
      this.resolve?.(this);
    },
  };

  return new Promise((resolve, reject) => {
    res.resolve = resolve;
    Promise.resolve(handler(req, res)).catch(reject);
  }).then((response) => {
    if (response.rawBody) {
      try {
        response.json = JSON.parse(response.rawBody);
      } catch {
        response.json = null;
      }
    }
    return response;
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
