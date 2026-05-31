import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleApiRequest, handleTts } = require("../server/http/runtimeHandlers.js");

export default function tts(req, res) {
  return handleApiRequest(req, res, () => handleTts(req, res));
}
