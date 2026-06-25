const http = require("http");
const { HOST, PORT } = require("./config");
const { handleHttpRequest } = require("./http/runtimeHandlers");

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
if (proxy) {
  const { ProxyAgent, setGlobalDispatcher } = require("undici");
  setGlobalDispatcher(new ProxyAgent(proxy));
  console.log(`[proxy] routing fetch through ${proxy}`);
}

const server = http.createServer(handleHttpRequest);

server.listen(PORT, HOST, () => {
  console.log(`NextStep runtime listening on http://${HOST}:${PORT}`);
});
