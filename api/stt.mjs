import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleApiRequest, handleStt } = require("../server/http/runtimeHandlers.js");

export default function stt(req, res) {
  return handleApiRequest(req, res, () => handleStt(req, res));
}
