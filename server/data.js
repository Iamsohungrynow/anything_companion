const fs = require("fs");
const { DATA_FILE } = require("./config");

function loadCompanionData() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

module.exports = {
  companionData: loadCompanionData(),
};
