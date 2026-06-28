const fs = require("fs");
const { randomUUID } = require("crypto");
const path = require("path");
const packageJson = require("../../package.json");
const {
  ALLOWED_HOSTS,
  ALLOWED_ORIGINS,
  DATA_FILE,
  FISH_AUDIO_API_KEY,
  FISH_AUDIO_REFERENCE_ID,
  FISH_AUDIO_TIMEOUT_MS,
  HOST,
  HTML_FILE,
  MAX_SESSIONS,
  OPENAI_MODEL,
  PORT,
  ROOT_DIR,
  SESSION_TTL_MS,
  STT_PROVIDER,
  STT_MODEL,
  VOLC_APP_ID,
  VOLC_ACCESS_TOKEN,
  VOLC_ASR_CLUSTER,
  USE_MOCK_AI,
  VERCEL_HOST_SUFFIXES,
} = require("../config");
const { companionData } = require("../data");
const { runTurn } = require("../engines/runtime/orchestrator");
const { normalizeScenario } = require("../schemas");
const { createSession, getSession, resetSession } = require("../store/sessionStore");

const ttsCache = new Map();
const MAX_TTS_CACHE_ENTRIES = 40;

async function handleHttpRequest(req, res) {
  return handleRequest(req, res, async () => {
    const url = new URL(req.url, "http://localhost");

    if (url.pathname === "/api/health") return handleHealth(req, res);
    if (url.pathname === "/api/scenarios") return handleScenarios(req, res);
    if (url.pathname === "/api/session") return handleSession(req, res);
    if (url.pathname === "/api/chat") return handleChat(req, res);
    if (url.pathname === "/api/tts") return handleTts(req, res);
    if (url.pathname === "/api/stt") return handleStt(req, res);

    const memoryMatch = url.pathname.match(/^\/api\/session\/([^/]+)\/memory$/);
    if (memoryMatch) return handleSessionMemory(req, res, memoryMatch[1]);

    const resetMatch = url.pathname.match(/^\/api\/session\/([^/]+)\/reset$/);
    if (resetMatch) return handleSessionReset(req, res, resetMatch[1]);

    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(url.pathname, req.method, res);
      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found." });
  });
}

async function handleApiRequest(req, res, routeHandler) {
  return handleRequest(req, res, routeHandler);
}

async function handleRequest(req, res, routeHandler) {
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

    await routeHandler();
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      ok: false,
      error: error.message || "Internal server error.",
    });
  }
}

async function handleHealth(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  sendJson(res, 200, buildHealthPayload());
}

async function handleScenarios(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  sendJson(res, 200, {
    companions: companionData.companions || {},
    adaptive_modes: companionData.adaptive_modes || [],
  });
}

async function handleSession(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
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
}

async function handleChat(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const body = await readJson(req);
  const result = await runTurn(body);
  console.log(
    "[api/chat]",
    JSON.stringify({
      mock_forced: USE_MOCK_AI,
      runtime_source: result?.runtime_source,
      intent: result?.intent,
      mode: result?.mode,
    })
  );
  sendJson(res, 200, result);
}

async function handleTts(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const body = await readJson(req);
  await proxyFishAudioTts(body, res);
}

async function handleStt(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const body = await readJson(req);

  const { audio, mimeType = "audio/webm" } = body || {};
  if (!audio || typeof audio !== "string") {
    sendJson(res, 400, { error: "audio (base64 string) is required." });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    if (STT_PROVIDER === "openai") {
      await sttOpenAI(res, audio, mimeType, controller);
    } else {
      await sttVolcano(res, audio, mimeType, controller);
    }
  } catch (error) {
    const isTimeout = error.name === "AbortError";
    sendJson(res, isTimeout ? 504 : 502, {
      error: isTimeout ? "STT timed out." : "STT request failed.",
      provider: STT_PROVIDER,
      error_name: error?.name,
      error_message: error?.message,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function sttOpenAI(res, audio, mimeType, controller) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(res, 503, { error: "OPENAI_API_KEY is not configured." });
    return;
  }

  const audioBuffer = Buffer.from(audio, "base64");
  const baseMime = mimeType.split(";")[0].trim();
  const ext = baseMime.includes("mp4") ? "mp4" : baseMime.includes("ogg") ? "ogg" : "webm";

  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer], { type: baseMime }), `audio.${ext}`);
  formData.append("model", STT_MODEL);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    signal: controller.signal,
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.text();
    sendJson(res, 502, {
      error: `STT provider error (${response.status}).`,
      provider: "openai",
      model: STT_MODEL,
      provider_status: response.status,
      provider_body: errBody.slice(0, 200),
    });
    return;
  }

  const data = await response.json();
  sendJson(res, 200, { text: data.text || "", provider: "openai", model: STT_MODEL });
}

async function sttVolcano(res, audio, mimeType, controller) {
  if (!VOLC_APP_ID || !VOLC_ACCESS_TOKEN) {
    sendJson(res, 503, { error: "VOLC_APP_ID and VOLC_ACCESS_TOKEN are required for Volcano STT." });
    return;
  }

  const baseMime = mimeType.split(";")[0].trim();
  const format = baseMime.includes("mp4") ? "mp4" : baseMime.includes("ogg") ? "ogg" : "webm";
  const codec = mimeType.includes("opus") ? "opus" : "default";

  const payload = {
    app: { appid: VOLC_APP_ID, token: VOLC_ACCESS_TOKEN, cluster: VOLC_ASR_CLUSTER },
    user: { uid: "companion_stt" },
    request: {
      reqid: randomUUID(),
      nbest: 1,
      workflow: "audio_in,resample,partition,vad,fe,decode,itn,nlu_punctuation",
      show_utterances: false,
      result_type: "full",
      sequence: -1,
    },
    audio: { format, codec, sample_rate: 16000, bits: 16, channel: 1, language: "zh-CN", audio_data: audio },
  };

  const response = await fetch("https://openspeech.bytedance.com/api/v1/asr", {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VOLC_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errBody = await response.text();
    sendJson(res, 502, {
      error: `STT provider error (${response.status}).`,
      provider: "volcano",
      provider_status: response.status,
      provider_body: errBody.slice(0, 200),
    });
    return;
  }

  const data = await response.json();
  if (data.code !== 1000) {
    sendJson(res, 502, {
      error: `Volcano STT error: ${data.message || "unknown"}`,
      provider: "volcano",
      provider_code: data.code,
    });
    return;
  }

  const text = (data.utterances || []).map((u) => u.text).join("").trim();
  sendJson(res, 200, { text, provider: "volcano", cluster: VOLC_ASR_CLUSTER });
}

async function handleSessionMemory(req, res, id) {
  if (!allowMethods(req, res, ["GET"])) return;
  const session = getSession(id);
  if (!session) {
    sendJson(res, 404, { ok: false, error: "Session not found." });
    return;
  }
  sendJson(res, 200, { session_id: session.id, memory: session.memory });
}

async function handleSessionReset(req, res, id) {
  if (!allowMethods(req, res, ["POST"])) return;
  sendJson(res, 200, { ok: resetSession(id) });
}

function buildHealthPayload() {
  return {
    ok: true,
    service: "nextstep-runtime",
    version: packageJson.version,
    timestamp: new Date().toISOString(),
    host: HOST,
    allowed_hosts: ALLOWED_HOSTS,
    openai_configured: Boolean(process.env.OPENAI_API_KEY),
    stt_provider: STT_PROVIDER,
    stt_volcano_configured: Boolean(VOLC_APP_ID && VOLC_ACCESS_TOKEN),
    stt_openai_model: STT_MODEL,
    fish_audio_configured: Boolean(FISH_AUDIO_API_KEY && FISH_AUDIO_REFERENCE_ID),
    mock_forced: USE_MOCK_AI,
    model: OPENAI_MODEL,
    max_sessions: MAX_SESSIONS,
    session_ttl_ms: SESSION_TTL_MS,
  };
}

function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  sendJson(res, 405, { ok: false, error: "Method not allowed." });
  return false;
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    sendJson(res, 403, { ok: false, error: `Origin not allowed: ${origin}` });
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
  if (!host) return false;
  if (ALLOWED_HOSTS.includes(host)) return true;
  return VERCEL_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
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
  if (Object.prototype.hasOwnProperty.call(req, "body") && req.body !== undefined) {
    return readPreparedJson(req);
  }

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

function readPreparedJson(req) {
  const contentType = String(req.headers["content-type"] || "");
  if (contentType && !contentType.toLowerCase().includes("application/json")) {
    throw Object.assign(new Error("Content-Type must be application/json."), { statusCode: 415 });
  }
  if (req.body === null || req.body === "") return {};
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > 1024 * 1024) {
      throw Object.assign(new Error("Request body too large."), { statusCode: 413 });
    }
    return parseJsonString(req.body.toString("utf8"));
  }
  if (typeof req.body === "string") {
    if (Buffer.byteLength(req.body) > 1024 * 1024) {
      throw Object.assign(new Error("Request body too large."), { statusCode: 413 });
    }
    return parseJsonString(req.body);
  }
  return req.body || {};
}

function parseJsonString(raw) {
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw Object.assign(new Error("Invalid JSON body."), { statusCode: 400 });
  }
}

function serveStatic(urlPath, method, res) {
  const isHead = method === "HEAD";
  if (urlPath === "/" || urlPath === "/nextstep-companion.html") {
    sendFile(res, HTML_FILE, "text/html; charset=utf-8", isHead);
    return;
  }

  if (urlPath === "/nextstep-companion-data.json") {
    sendFile(res, DATA_FILE, "application/json; charset=utf-8", isHead);
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

module.exports = {
  buildHealthPayload,
  handleApiRequest,
  handleChat,
  handleHealth,
  handleHttpRequest,
  handleScenarios,
  handleSession,
  handleSessionMemory,
  handleSessionReset,
  handleStt,
  handleTts,
  sendJson,
};
