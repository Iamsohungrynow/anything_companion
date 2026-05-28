const path = require("path");
const { loadDotEnv } = require("./env");

loadDotEnv();

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_FILE = path.join(ROOT_DIR, "nextstep-companion-data.json");
const HTML_FILE = path.join(ROOT_DIR, "nextstep-companion.html");

const PORT = parsePositiveInteger(process.env.PORT, 3000);
const HOST = process.env.HOST || "127.0.0.1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const OPENAI_TIMEOUT_MS = parsePositiveInteger(process.env.OPENAI_TIMEOUT_MS, 12000);
const USE_MOCK_AI = String(process.env.USE_MOCK_AI || "").toLowerCase() === "true";
const MAX_SESSIONS = parsePositiveInteger(process.env.MAX_SESSIONS, 250);
const SESSION_TTL_MS = parsePositiveInteger(process.env.SESSION_TTL_MS, 1000 * 60 * 60 * 8);
const ALLOWED_ORIGINS = parseAllowedOrigins(process.env.ALLOWED_ORIGINS, PORT);
const ALLOWED_HOSTS = parseList(process.env.ALLOWED_HOSTS, ["127.0.0.1", "localhost", "::1"])
  .map((host) => host.toLowerCase());

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseAllowedOrigins(value, port) {
  if (value && value.trim()) {
    return parseList(value, []);
  }
  return [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ];
}

function parseList(value, fallback) {
  if (!value || !value.trim()) return fallback;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

module.exports = {
  ROOT_DIR,
  DATA_FILE,
  HTML_FILE,
  PORT,
  HOST,
  OPENAI_MODEL,
  OPENAI_TIMEOUT_MS,
  USE_MOCK_AI,
  MAX_SESSIONS,
  SESSION_TTL_MS,
  ALLOWED_ORIGINS,
  ALLOWED_HOSTS,
};
