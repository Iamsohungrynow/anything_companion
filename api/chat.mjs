import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleApiRequest, handleChat } = require("../server/http/runtimeHandlers.js");

export default function chat(req, res) {
  return handleApiRequest(req, res, () => handleChat(req, res));
}
