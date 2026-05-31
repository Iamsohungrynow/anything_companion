import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleApiRequest, handleHealth } = require("../server/http/runtimeHandlers.js");

export default function health(req, res) {
  return handleApiRequest(req, res, () => handleHealth(req, res));
}
