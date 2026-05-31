import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleApiRequest, handleScenarios } = require("../server/http/runtimeHandlers.js");

export default function scenarios(req, res) {
  return handleApiRequest(req, res, () => handleScenarios(req, res));
}
