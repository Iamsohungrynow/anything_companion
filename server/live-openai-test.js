const assert = require("assert");
const { spawn } = require("child_process");

const PORT = Number(process.env.PORT || (35000 + Math.floor(Math.random() * 15000)));
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
      USE_MOCK_AI: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer();

    const health = await getJson("/api/health");
    assert.equal(health.openai_configured, true, "OPENAI_API_KEY must be set in .env or the environment");
    assert.equal(health.mock_forced, false);

    const chat = await postJson("/api/chat", {
      scenario: "study",
      message: "I have a finance quiz but I am tired and stuck.",
      channel: "text",
      tone: "soft_supportive",
      use_case: "study",
    });

    assert.equal(chat.fallback_used, false, "Expected live OpenAI response, got fallback");
    assert.ok(chat.reply);
    assert.ok(chat.mode);
    assert.ok(Array.isArray(chat.micro_task_plan));
    assert.deepEqual(chat.check_in_options, ["Done", "Partly done", "I got stuck"]);

    console.log("Live OpenAI API test passed.");
    console.log(`model=${health.model}`);
    console.log(`mode=${chat.mode}`);
    console.log(`first_task=${chat.micro_task_plan[0]?.label || ""}`);
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
  if (!response.ok) throw new Error(`${path} failed with ${response.status}: ${await response.text()}`);
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

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
