const path = require("path");
const { loadDotEnv } = require("./env");

loadDotEnv();

const ROOT_DIR = path.resolve(__dirname, "..");
const FRONTEND_STATIC_DIR = path.join(ROOT_DIR, "frontend", "static");
const DATA_FILE = path.join(FRONTEND_STATIC_DIR, "nextstep-companion-data.json");
const HTML_FILE = path.join(FRONTEND_STATIC_DIR, "nextstep-companion.html");

const PORT = parsePositiveInteger(process.env.PORT, 3017);
const RENDER_EXTERNAL_HOSTNAME = String(process.env.RENDER_EXTERNAL_HOSTNAME || "").trim().toLowerCase();
const RENDER_EXTERNAL_URL = String(process.env.RENDER_EXTERNAL_URL || (RENDER_EXTERNAL_HOSTNAME ? `https://${RENDER_EXTERNAL_HOSTNAME}` : ""))
  .trim()
  .replace(/\/+$/, "");
const VERCEL_HOSTNAMES = [
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
]
  .map((value) => String(value || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, ""))
  .filter(Boolean);
const VERCEL_EXTERNAL_URLS = VERCEL_HOSTNAMES.map((hostname) => `https://${hostname}`);
const IS_VERCEL = String(process.env.VERCEL || "").toLowerCase() === "1" || VERCEL_HOSTNAMES.length > 0;
const VERCEL_HOST_SUFFIXES = IS_VERCEL ? [".vercel.app"] : [];
const HOST = process.env.HOST || (RENDER_EXTERNAL_HOSTNAME ? "0.0.0.0" : "127.0.0.1");
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const OPENAI_SEARCH_MODEL = process.env.OPENAI_SEARCH_MODEL || "gpt-5.5";
const OPENAI_TIMEOUT_MS = parsePositiveInteger(process.env.OPENAI_TIMEOUT_MS, 12000);
const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY || "";
const FISH_AUDIO_REFERENCE_ID = process.env.FISH_AUDIO_REFERENCE_ID || "";
const FISH_AUDIO_TIMEOUT_MS = parsePositiveInteger(process.env.FISH_AUDIO_TIMEOUT_MS, 20000);
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const STT_PROVIDER = process.env.STT_PROVIDER || "groq";
const STT_MODEL = process.env.STT_MODEL || "whisper-large-v3-turbo";
const USE_MOCK_AI = String(process.env.USE_MOCK_AI || "").toLowerCase() === "true";
const MAX_SESSIONS = parsePositiveInteger(process.env.MAX_SESSIONS, 250);
const SESSION_TTL_MS = parsePositiveInteger(process.env.SESSION_TTL_MS, 1000 * 60 * 60 * 8);
const ALLOWED_ORIGINS = parseAllowedOrigins(process.env.ALLOWED_ORIGINS, PORT, RENDER_EXTERNAL_URL, VERCEL_EXTERNAL_URLS);
const ALLOWED_HOSTS = parseAllowedHosts(process.env.ALLOWED_HOSTS, ["127.0.0.1", "localhost", "::1", RENDER_EXTERNAL_HOSTNAME, ...VERCEL_HOSTNAMES])
  .filter(Boolean)
  .map((host) => host.toLowerCase());

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseAllowedOrigins(value, port, renderExternalUrl, vercelExternalUrls) {
  const portDefaults = [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
    renderExternalUrl,
    ...vercelExternalUrls,
  ].filter(Boolean);
  if (value && value.trim()) {
    return Array.from(new Set([...parseList(value, []), ...portDefaults]));
  }
  return portDefaults;
}

function parseAllowedHosts(value, defaults) {
  return Array.from(new Set([...parseList(value, []), ...defaults]));
}

function parseList(value, fallback) {
  if (!value || !value.trim()) return fallback;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

module.exports = {
  ROOT_DIR,
  FRONTEND_STATIC_DIR,
  DATA_FILE,
  HTML_FILE,
  PORT,
  HOST,
  OPENAI_MODEL,
  OPENAI_SEARCH_MODEL,
  OPENAI_TIMEOUT_MS,
  FISH_AUDIO_API_KEY,
  FISH_AUDIO_REFERENCE_ID,
  FISH_AUDIO_TIMEOUT_MS,
  GROQ_API_KEY,
  STT_PROVIDER,
  STT_MODEL,
  USE_MOCK_AI,
  MAX_SESSIONS,
  SESSION_TTL_MS,
  ALLOWED_ORIGINS,
  ALLOWED_HOSTS,
  VERCEL_HOST_SUFFIXES,
};
