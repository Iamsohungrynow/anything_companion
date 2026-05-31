import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleApiRequest, handleSessionReset } = require("../../../server/http/runtimeHandlers.js");

export default function sessionReset(req, res) {
  return handleApiRequest(req, res, () => handleSessionReset(req, res, getSessionId(req)));
}

function getSessionId(req) {
  const id = req.query?.id;
  return Array.isArray(id) ? id[0] : id;
}
