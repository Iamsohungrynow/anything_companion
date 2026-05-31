import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleApiRequest, handleSessionMemory } = require("../../../server/http/runtimeHandlers.js");

export default function sessionMemory(req, res) {
  return handleApiRequest(req, res, () => handleSessionMemory(req, res, getSessionId(req)));
}

function getSessionId(req) {
  const id = req.query?.id;
  return Array.isArray(id) ? id[0] : id;
}
