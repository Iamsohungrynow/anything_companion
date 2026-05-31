import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleApiRequest, handleSession } = require("../server/http/runtimeHandlers.js");

export default function session(req, res) {
  return handleApiRequest(req, res, () => handleSession(req, res));
}
