const fs = require("fs");
const https = require("https");
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
  OPENAI_TIMEOUT_MS,
  PORT,
  ROOT_DIR,
  SESSION_TTL_MS,
  STT_PROVIDER,
  STT_MODEL,
  VOLC_APP_ID,
  VOLC_ACCESS_TOKEN,
  VOLC_SECRET_KEY,
  VOLC_ASR_CLUSTER,
  USE_MOCK_AI,
  VERCEL_HOST_SUFFIXES,
} = require("../config");
const { companionData } = require("../data");
const { runTurn, inferDefaultMode } = require("../engines/runtime/orchestrator");
const { runDoubaoStream } = require("../engines/doubao/client");
const { validateChatRequest, normalizeRuntimeResult, normalizeScenario } = require("../schemas");
const { createSession, ensureSession, getSession, resetSession, updateSessionAfterTurn } = require("../store/sessionStore");

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

  // Contract-safe default: plain JSON unless the client opts into SSE streaming.
  const wantsStream = String(req.headers.accept || "").includes("text/event-stream");
  if (!wantsStream) {
    const result = await runTurn(body);
    console.log(
      "[api/chat]",
      JSON.stringify({
        openai_configured: Boolean(process.env.OPENAI_API_KEY),
        mock_forced: USE_MOCK_AI,
        runtime_source: result?.runtime_source || (result?.fallback_used ? "mock" : "openai"),
        intent: result?.intent,
        mode: result?.mode,
        model: OPENAI_MODEL,
      })
    );
    sendJson(res, 200, result);
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  const emit = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    let runtimeResult;

    if (!USE_MOCK_AI) {
      const parsed = validateChatRequest(body);
      if (!parsed.ok) { emit("error", { error: parsed.error }); res.end(); return; }

      const input = parsed.value;
      const session = ensureSession(input);

      try {
        // Real streaming path — sentences arrive before LLM finishes
        const raw = await runDoubaoStream({ input, session }, (sentence) => {
          emit("reply_chunk", { text: sentence });
        });
        runtimeResult = normalizeRuntimeResult(raw, {
          session_id: session.id,
          message: input.message,
          defaultMode: inferDefaultMode(input),
          fallback_used: false,
        });
        runtimeResult.runtime_source = "doubao";
        const updated = updateSessionAfterTurn(session, input, runtimeResult);
        runtimeResult.memory = updated.memory;
      } catch (streamErr) {
        console.error("[handleChat] stream failed, falling back to runTurn:", streamErr?.message);
        runtimeResult = await runTurn(body);
        // Emit reply chunks from the fallback result so frontend TTS still works
        splitSentences(runtimeResult.reply || runtimeResult.answer || "")
          .forEach((s) => emit("reply_chunk", { text: s }));
      }
    } else {
      runtimeResult = await runTurn(body);
      splitSentences(runtimeResult.reply || runtimeResult.answer || "")
        .forEach((s) => emit("reply_chunk", { text: s }));
    }

    console.log("[api/chat] source=%s intent=%s", runtimeResult?.runtime_source, runtimeResult?.intent);
    emit("result", runtimeResult);
  } catch (err) {
    emit("error", { error: err.message || "Internal error" });
  }

  res.end();
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?。！？])\s+|(?<=[。！？])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 4);
}

async function handleTts(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const body = await readJson(req);
  await proxyFishAudioTts(body, res);
}

async function handleStt(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const body = await readJson(req);

  const audio = String(body?.audio || "").trim();
  const mimeType = String(body?.mimeType || "audio/webm").trim();
  const language = String(body?.lang || "").trim();

  if (!audio) {
    sendJson(res, 400, { ok: false, error: "audio is required." });
    return;
  }

  const audioBuffer = Buffer.from(audio, "base64");
  if (!audioBuffer.length) {
    sendJson(res, 400, { ok: false, error: "audio must be a valid base64 string." });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(OPENAI_TIMEOUT_MS, 25000));

  try {
    // Volcano needs its own credentials; fall back to OpenAI Whisper when they are absent.
    const volcanoConfigured = Boolean(VOLC_APP_ID && VOLC_ACCESS_TOKEN);
    if (STT_PROVIDER === "openai" || !volcanoConfigured) {
      await sttOpenAI(res, audioBuffer, mimeType, language, controller);
    } else {
      await sttVolcano(res, audio, mimeType, controller);
    }
  } catch (error) {
    const isTimeout = error?.name === "AbortError";
    sendJson(res, isTimeout ? 504 : 502, {
      ok: false,
      error: isTimeout ? "STT timed out." : "STT request failed.",
      provider: STT_PROVIDER,
      error_name: error?.name,
      error_message: error?.message,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function sttOpenAI(res, audioBuffer, mimeType, language, controller) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 503, { ok: false, error: "OpenAI STT is not configured." });
    return;
  }

  const baseMimeType = mimeType.split(";")[0].trim() || "audio/webm";
  const extension = getAudioExtension(baseMimeType);

  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer], { type: baseMimeType }), `audio.${extension}`);
  formData.append("model", STT_MODEL);
  // Whisper expects ISO-639-1 ("zh", "en"); browsers send BCP-47 ("zh-CN").
  if (language) formData.append("language", language.split("-")[0]);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const providerBody = await response.text();
    sendJson(res, 502, {
      ok: false,
      error: `OpenAI STT request failed (${response.status}).`,
      provider: "openai",
      model: STT_MODEL,
      provider_status: response.status,
      provider_body: providerBody.slice(0, 200),
    });
    return;
  }

  const data = await response.json();
  sendJson(res, 200, {
    text: String(data?.text || ""),
    provider: "openai",
    model: STT_MODEL,
  });
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

  const bodyStr = JSON.stringify(payload);

  const data = await new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "openspeech.bytedance.com",
        path: "/api/v1/asr",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
          // Bearer;{token} is the correct format for Volcano Engine one-shot ASR
          Authorization: `Bearer;${VOLC_ACCESS_TOKEN}`,
        },
      },
      (r) => {
        let raw = "";
        r.on("data", (chunk) => { raw += chunk; });
        r.on("end", () => {
          try { resolve({ status: r.statusCode, body: JSON.parse(raw) }); }
          catch { resolve({ status: r.statusCode, body: { message: raw } }); }
        });
      },
    );
    req.on("error", reject);
    if (controller?.signal) {
      controller.signal.addEventListener("abort", () => req.destroy(new Error("aborted")));
    }
    req.write(bodyStr);
    req.end();
  });

  if (data.status !== 200) {
    sendJson(res, 502, {
      error: `STT provider error (${data.status}).`,
      provider: "volcano",
      provider_status: data.status,
      provider_body: JSON.stringify(data.body).slice(0, 200),
    });
    return;
  }

  if (data.body.code !== 1000) {
    sendJson(res, 502, {
      error: `Volcano STT error: ${data.body.message || "unknown"}`,
      provider: "volcano",
      provider_code: data.body.code,
    });
    return;
  }

  const text = (data.body.utterances || []).map((u) => u.text).join("").trim();
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
    service: "yorimi-runtime",
    version: packageJson.version,
    timestamp: new Date().toISOString(),
    host: HOST,
    allowed_hosts: ALLOWED_HOSTS,
    openai_configured: Boolean(process.env.OPENAI_API_KEY),
    stt_provider: STT_PROVIDER,
    stt_volcano_configured: Boolean(VOLC_APP_ID && VOLC_ACCESS_TOKEN),
    stt_model: STT_MODEL,
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

function getAudioExtension(mimeType) {
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("webm")) return "webm";
  return "bin";
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
