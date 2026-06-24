const http = require("http");
const { HOST, PORT } = require("./config");
const { handleHttpRequest } = require("./http/runtimeHandlers");

const server = http.createServer(handleHttpRequest);

server.listen(PORT, HOST, () => {
  console.log(`Yorimi runtime listening on http://${HOST}:${PORT}`);
});
