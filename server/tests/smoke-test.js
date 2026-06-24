const assert = require("assert");
const { spawn } = require("child_process");

const PORT = Number(process.env.PORT || (31000 + Math.floor(Math.random() * 20000)));
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function main() {
  const child = spawn(process.execPath, ["server/index.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      ALLOWED_HOSTS: "127.0.0.1,localhost,::1",
      ALLOWED_ORIGINS: `http://localhost:${PORT},http://127.0.0.1:${PORT}`,
      PORT: String(PORT),
      USE_MOCK_AI: "true",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer();

    const health = await getJson("/api/health");
    assert.equal(health.ok, true);
    assert.equal(health.service, "yorimi-runtime");
    assert.ok(health.version);
    assert.ok(health.timestamp);

    const session = await postJson("/api/session", { scenario: "study" });
    assert.ok(session.session_id);
    assert.ok(session.memory);
    assert.ok(session.created_at);

    const chat = await postJson("/api/chat", {
      session_id: session.session_id,
      scenario: "study",
      message: "I have a finance quiz but I am tired and stuck.",
    });

    assert.ok(chat.session_id);
    assert.ok(chat.reply);
    assert.ok(chat.detected_state);
    assert.ok(chat.mode);
    assert.ok(Array.isArray(chat.micro_task_plan));
    assert.ok(Array.isArray(chat.micro_task));
    assert.ok(chat.memory);
    assert.equal(chat.fallback_used, true);

    const secondChat = await postJson("/api/chat", {
      session_id: session.session_id,
      scenario: "study",
      message: "I am ready to focus now.",
    });
    assert.equal(secondChat.session_id, session.session_id);
    assert.ok(secondChat.memory.recent_goals.length >= 2);

    const memory = await getJson(`/api/session/${chat.session_id}/memory`);
    assert.ok(memory.memory.latest_memory_update);

    const missingMessage = await postJsonExpectStatus("/api/chat", { scenario: "study" }, 400);
    assert.match(missingMessage.error, /message/);

    const reset = await postJson(`/api/session/${chat.session_id}/reset`, {});
    assert.equal(reset.ok, true);

    const missingMemory = await getJsonExpectStatus(`/api/session/${chat.session_id}/memory`, 404);
    assert.equal(missingMemory.ok, false);

    console.log("API smoke test passed.");
  } finally {
    child.kill();
  }
}

function waitForServer() {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        await getJson("/api/health");
        resolve();
      } catch (error) {
        if (Date.now() - started > 5000) reject(error);
        else setTimeout(check, 100);
      }
    };
    check();
  });
}

async function getJson(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`);
  return response.json();
}

async function postJson(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path} failed with ${response.status}: ${await response.text()}`);
  return response.json();
}

async function getJsonExpectStatus(path, status) {
  const response = await fetch(`${BASE_URL}${path}`);
  assert.equal(response.status, status);
  return response.json();
}

async function postJsonExpectStatus(path, body, status) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  assert.equal(response.status, status);
  return response.json();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
