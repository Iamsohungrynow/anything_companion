const assert = require("assert");
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const { loadDotEnv } = require("../env");
const { normalizeRuntimeResult, normalizeScenario } = require("../schemas");

const PORT = Number(process.env.PORT || randomPort());
let baseUrl = `http://127.0.0.1:${PORT}`;
const VALID_MODES = new Set([
  "Encourage Mode",
  "Focus Mode",
  "Study Companion Mode",
  "Study Sprint Mode",
  "Quiz Mode",
  "Companion Mode",
  "Companion Presence Mode",
  "Routine Check-in Mode",
  "Check-in Mode",
  "Routine Mode",
]);
const VALID_COMPANION_STATES = new Set(["idle", "happy", "thinking", "encouraging", "focused", "resting", "concerned"]);

async function main() {
  const child = startServer(PORT, { USE_MOCK_AI: "true" });

  try {
    await waitForServer();

    await testHealth();
    await testCorsOptions();
    await testRejectedHostHeader();
    await testScenarios();
    await testStaticSecurityAndHead();
    const session = await testSession();
    const firstChat = await testChatContract(session.session_id);
    await testGeneralStudySubjectPlanning(session.session_id);
    await testFlexibleIntentRouting(session.session_id);
    await testUnknownSubjectFallback(session.session_id);
    await testMemoryPersistence(session.session_id, firstChat.memory);
    await testCheckInMemory(session.session_id);
    await testImplicitSessionAndScenarioNormalization();
    await testOversizedBody();
    await testValidationErrors();
    await testReset(session.session_id);
  } finally {
    child.kill();
  }

  await testMissingOpenAIKeyFallback();
  await testSessionLimit();
  await testSessionTtlExpiry();
  await testDotEnvLoader();
  testSchemaNormalizationHelpers();

  console.log("Mart backend contract test passed.");
}

function randomPort() {
  return 32000 + Math.floor(Math.random() * 20000);
}

function startServer(port, env) {
  baseUrl = `http://127.0.0.1:${port}`;
  const testEnv = {
    HOST: "127.0.0.1",
    ALLOWED_HOSTS: "127.0.0.1,localhost,::1",
    ALLOWED_ORIGINS: `http://localhost:${port},http://127.0.0.1:${port}`,
    ...env,
    PORT: String(port),
  };

  return spawn(process.execPath, ["server/index.js"], {
    cwd: process.cwd(),
    env: { ...process.env, ...testEnv },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function testHealth() {
  const health = await getJson("/api/health");
  assert.equal(health.ok, true);
  assert.equal(health.service, "nextstep-runtime");
  assert.ok(health.version);
  assert.ok(health.timestamp);
  assert.equal(health.host, "127.0.0.1");
  assert.ok(Array.isArray(health.allowed_hosts));
  assert.ok(Object.prototype.hasOwnProperty.call(health, "openai_configured"));
  assert.ok(health.model);
  assert.equal(typeof health.max_sessions, "number");
  assert.equal(typeof health.session_ttl_ms, "number");
}

async function testScenarios() {
  const scenarios = await getJson("/api/scenarios");
  assert.ok(scenarios.companions.study);
  assert.ok(Array.isArray(scenarios.adaptive_modes));
}

async function testCorsOptions() {
  const response = await fetch(`${baseUrl}/api/chat`, { method: "OPTIONS" });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), null);

  const allowed = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: `http://127.0.0.1:${PORT}` },
  });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get("access-control-allow-origin"), `http://127.0.0.1:${PORT}`);

  const denied = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: "https://evil.example" },
  });
  assert.equal(denied.status, 403);
}

async function testRejectedHostHeader() {
  const result = await requestWithHost("/api/health", "evil.example");
  assert.equal(result.statusCode, 421);
  assert.equal(result.body.ok, false);

  const missing = await requestWithoutHost("/api/health");
  assert.equal(missing.statusCode, 421);
  assert.ok(missing.body.includes("Host not allowed."));
}

async function testStaticSecurityAndHead() {
  const head = await fetch(`${baseUrl}/nextstep-companion.html`, { method: "HEAD" });
  assert.equal(head.status, 200);

  const env = await getJsonExpectStatus("/.env", 404);
  assert.equal(env.ok, false);

  const serverFile = await getJsonExpectStatus("/server/index.js", 404);
  assert.equal(serverFile.ok, false);

  const traversal = await getJsonExpectStatus("/models/%2e%2e/.env", 404);
  assert.equal(traversal.ok, false);

  const malformed = await getJsonExpectStatus("/models/%E0%A4%A", 400);
  assert.equal(malformed.ok, false);
}

async function testSession() {
  const session = await postJson("/api/session", {
    scenario: "study",
    tone: "soft_supportive",
    use_case: "study",
  });
  assert.ok(session.session_id);
  assert.equal(session.scenario, "study");
  assert.ok(session.companion);
  assert.ok(session.memory);
  assert.ok(session.created_at);
  return session;
}

async function testChatContract(sessionId) {
  const chat = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "I have a finance quiz but I am tired and stuck.",
    channel: "text",
    tone: "soft_supportive",
    use_case: "study",
  });

  assert.equal(chat.session_id, sessionId);
  assertRequiredString(chat.intent, "intent");
  assertRequiredString(chat.answer, "answer");
  assertRequiredString(chat.reply, "reply");
  assertRequiredString(chat.detected_state, "detected_state");
  assertRequiredString(chat.companion_state, "companion_state");
  assert.ok(VALID_COMPANION_STATES.has(chat.companion_state), "companion_state must be in enum");
  assertRequiredString(chat.mode, "mode");
  assert.ok(VALID_MODES.has(chat.mode), "mode must be in enum");
  assertRequiredString(chat.goal_understanding, "goal_understanding");
  assertRequiredString(chat.start_button_label, "start_button_label");
  assertRequiredString(chat.check_in_message, "check_in_message");
  assertRequiredString(chat.memory_update, "memory_update");

  assert.ok(Array.isArray(chat.micro_task), "micro_task must be a frontend-compatible array");
  assert.ok(chat.micro_task.length >= 2, "micro_task should include at least two items");

  assert.ok(Array.isArray(chat.micro_task_plan), "micro_task_plan must exist");
  assert.ok(chat.micro_task_plan.length >= 2, "micro_task_plan should include at least two items");
  for (const task of chat.micro_task_plan) {
    assertRequiredString(task.label, "task.label");
    assert.equal(typeof task.duration_minutes, "number");
    assert.ok(task.duration_minutes > 0, "task.duration_minutes must be positive");
    assert.equal(typeof task.done, "boolean");
  }

  assert.deepEqual(chat.check_in_options, ["Done", "Partly done", "I got stuck"]);
  assert.match(chat.reply, /finance quiz/i);
  assert.match(chat.reply, /1\.|Gentle reset/i);
  assert.match([chat.reply, ...chat.micro_task].join(" "), /finance quiz/i);
  assert.ok(Array.isArray(chat.suggested_actions), "suggested_actions must be an array");
  assert.ok(chat.suggested_actions.length >= 2, "suggested_actions should include at least two items");
  assert.equal(typeof chat.teaching, "object", "teaching must exist");
  assert.equal(typeof chat.teaching.concept, "string", "teaching.concept must be a string");
  assert.ok(chat.memory);
  assertMemoryShape(chat.memory);
  assert.ok(Array.isArray(chat.trace));
  assert.ok(chat.trace.some((step) => step.status === "fallback"));
  assert.ok(chat.trace.every((step) => {
    assertRequiredString(step.step, "trace.step");
    assertRequiredString(step.summary, "trace.summary");
    return ["complete", "fallback"].includes(step.status);
  }));
  assert.equal(chat.fallback_used, true);

  return chat;
}

async function testGeneralStudySubjectPlanning(sessionId) {
  const chat = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "I need to study quantum mechanics",
    channel: "text",
    tone: "coach_like",
    use_case: "study",
    companion: {
      name: "Luma",
      type: "Desk Lamp Focus Buddy",
      default_object_label: "desk lamp",
      tone: "coach_like",
      use_case: "study",
      role: "study_companion",
    },
  });

  assert.equal(chat.session_id, sessionId);
  assert.equal(chat.mode, "Study Sprint Mode");
  const allText = [
    chat.reply,
    chat.goal_understanding,
    ...(chat.micro_task || []),
  ].join(" ");

  assert.match(allText, /quantum mechanics/i);
  assert.match(chat.reply, /1\.|First tiny sprint|Open your/i);
  assert.match(allText, /notes|slide|textbook|assignment|example/i);
  assert.doesNotMatch(allText, /write the exact task|tell me what|what are we working on/i);
  assert.ok(chat.memory.latest_memory_update.includes("quantum mechanics"));

  const followUp = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "why not you help me",
    channel: "text",
    tone: "coach_like",
    use_case: "study",
  });
  const followUpText = [
    followUp.reply,
    followUp.goal_understanding,
    ...(followUp.micro_task || []),
  ].join(" ");
  assert.equal(followUp.intent, "vague_help");
  assert.equal(followUp.mode, "Study Companion Mode");
  assert.match(followUpText, /quantum mechanics/i);
  assert.doesNotMatch(followUpText, /write the exact task|tell me what|what are we working on|choose one tiny slice|learn the simplest definition/i);
  assert.equal(followUp.memory.current_companion, "Luma");

  const algebra = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "you help me give concept of algebra",
    channel: "text",
    tone: "soft_supportive",
    use_case: "study",
    companion: {
      name: "Folio",
      type: "Open Book Focus Buddy",
      default_object_label: "open book",
      tone: "soft_supportive",
      use_case: "study",
      role: "study_companion",
    },
  });
  const algebraText = [
    algebra.answer,
    algebra.reply,
    algebra.teaching?.explanation,
    algebra.teaching?.example,
    ...(algebra.suggested_actions || []),
  ].join(" ");
  assert.equal(algebra.intent, "teach_concept");
  assert.match(algebra.reply, /algebra/i);
  assert.match(algebra.reply, /unknown|letter|symbol|x\s*\+/i);
  assert.match(algebraText, /algebra/i);
  assert.match(algebraText, /unknown|letter|symbol|x\s*\+/i);
  assert.doesNotMatch(algebraText, /open your .*notes|write the exact task|what are we working on/i);
}

async function testFlexibleIntentRouting(sessionId) {
  const tired = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "i am so tired tdy",
    channel: "text",
    tone: "cute_playful",
    use_case: "study",
  });
  assert.equal(tired.intent, "emotional_support");
  assert.equal(tired.mode, "Encourage Mode");
  assert.match(tired.reply, /tired|pressure|tiny|breath/i);
  assert.doesNotMatch(tired.reply, /start .* by opening|what are we working on/i);

  const base = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "i need to start learning quantum mechanics",
    channel: "text",
    tone: "cute_playful",
    use_case: "study",
  });
  assert.match(base.reply, /quantum mechanics/i);
  assert.match(base.reply, /1\.|First tiny sprint|Open your/i);
  assert.match([base.reply, ...base.micro_task].join(" "), /quantum mechanics/i);

  const algebraPlan = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "i want to study algebra",
    channel: "text",
    tone: "cute_playful",
    use_case: "study",
  });
  assert.equal(algebraPlan.intent, "plan_task");
  assert.match([algebraPlan.reply, ...algebraPlan.micro_task].join(" "), /algebra/i);

  const continuation = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "and algebra",
    channel: "text",
    tone: "cute_playful",
    use_case: "study",
  });
  assert.equal(continuation.intent, "continue_context");
  assert.match([continuation.reply, ...continuation.micro_task].join(" "), /algebra/i);
  assert.doesNotMatch(continuation.reply, /what are we working on|tell me what's on your plate/i);

  const vagueHelp = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "help me",
    channel: "text",
    tone: "cute_playful",
    use_case: "study",
  });
  assert.equal(vagueHelp.intent, "vague_help");
  assert.equal(vagueHelp.mode, "Study Companion Mode");
  assert.match(vagueHelp.reply, /algebra|equation|unknown|first step/i);
  assert.notEqual(vagueHelp.reply, algebraPlan.reply);
  assert.doesNotMatch(vagueHelp.reply, /choose one tiny slice|learn the simplest definition|worked example while looking|mark the first blocker/i);

  const steps = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "give me concrete steps to learn simultaneous equation",
    channel: "text",
    tone: "coach_like",
    use_case: "study",
  });
  assert.equal(steps.intent, "decompose_task");
  assert.match(steps.reply, /1\.|concrete steps|simultaneous equation/i);
  assert.match([steps.reply, ...steps.micro_task].join(" "), /simultaneous equation/i);
  assert.doesNotMatch(steps.reply, /start .* by opening the right material|make it concrete first/i);
}

async function testUnknownSubjectFallback(sessionId) {
  const periodic = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "give me concrete step to learn periodic table",
    channel: "text",
    tone: "cute_playful",
    use_case: "study",
  });

  assert.equal(periodic.fallback_used, true);
  assert.equal(periodic.intent, "decompose_task");
  assert.match(periodic.reply, /trouble reaching the AI engine|will not pretend/i);
  assert.match(periodic.reply, /periodic table/i);
  assert.doesNotMatch(periodic.reply, /open the most relevant material|name the first concrete part|do one small example, paragraph, question/i);
}

async function testMemoryPersistence(sessionId) {
  const secondChat = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "I am ready to focus now.",
    channel: "text",
  });

  assert.equal(secondChat.session_id, sessionId);
  assert.ok(secondChat.memory.recent_goals.length >= 2);
  assert.equal(secondChat.memory.last_goal, "I am ready to focus now.");

  const memory = await getJson(`/api/session/${sessionId}/memory`);
  assert.equal(memory.session_id, sessionId);
  assert.ok(memory.memory.latest_memory_update);
}

async function testCheckInMemory(sessionId) {
  const doneChat = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "Done with the first sprint.",
    channel: "text",
    check_in_result: "Done",
  });

  assert.ok(doneChat.memory.check_in_history.length >= 1);
  assert.equal(doneChat.memory.check_in_history[0].result, "done");
  assert.ok(doneChat.memory.completed_micro_tasks.length >= 1);

  const partlyChat = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "I partly finished the sprint.",
    channel: "text",
    check_in_result: "Partly done",
  });
  assert.equal(partlyChat.memory.check_in_history[0].result, "partly_done");

  const stuckChat = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "I got stuck during the sprint.",
    channel: "text",
    check_in_result: "I got stuck",
  });
  assert.equal(stuckChat.memory.check_in_history[0].result, "stuck");

  const historyCount = stuckChat.memory.check_in_history.length;
  const invalidChat = await postJson("/api/chat", {
    session_id: sessionId,
    scenario: "study",
    message: "This check-in value is invalid.",
    channel: "text",
    check_in_result: "banana",
  });
  assert.equal(invalidChat.memory.check_in_history.length, historyCount);
}

async function testImplicitSessionAndScenarioNormalization() {
  const chat = await postJson("/api/chat", {
    scenario: "work",
    message: "I need to start a report but I am stuck.",
    channel: "text",
  });

  assert.ok(chat.session_id);
  assert.ok(chat.reply);
  assert.ok(Array.isArray(chat.micro_task));

  const unknown = await postJson("/api/chat", {
    scenario: "unknown",
    message: "I need to start something but I am stuck.",
    channel: "text",
  });
  assert.ok(unknown.session_id);
  assert.ok(unknown.reply);
  assert.ok(Array.isArray(unknown.micro_task));
  assert.ok(VALID_MODES.has(unknown.mode));
}

async function testValidationErrors() {
  const missingMessage = await postJsonExpectStatus("/api/chat", { scenario: "study" }, 400);
  assert.match(missingMessage.error, /message/);

  const longMessage = await postJsonExpectStatus("/api/chat", {
    scenario: "study",
    message: "x".repeat(2001),
  }, 400);
  assert.match(longMessage.error, /2000/);

  const invalidJson = await rawPostExpectStatus("/api/chat", "{bad json", 400);
  assert.match(invalidJson.error, /Invalid JSON/);

  const wrongContentType = await rawPostExpectStatus("/api/chat", "{}", 415, "text/plain");
  assert.match(wrongContentType.error, /Content-Type/);

  const missingRoute = await getJsonExpectStatus("/api/not-real", 404);
  assert.equal(missingRoute.ok, false);
}

async function testOversizedBody() {
  const largeBody = JSON.stringify({
    scenario: "study",
    message: "x".repeat(1024 * 1024 + 10),
  });
  const tooLarge = await rawPostExpectStatus("/api/chat", largeBody, 413);
  assert.match(tooLarge.error, /too large/i);
}

async function testReset(sessionId) {
  const reset = await postJson(`/api/session/${sessionId}/reset`, {});
  assert.equal(reset.ok, true);

  const missingMemory = await getJsonExpectStatus(`/api/session/${sessionId}/memory`, 404);
  assert.equal(missingMemory.ok, false);
}

async function testMissingOpenAIKeyFallback() {
  const port = randomPort();
  const child = startServer(port, {
    USE_MOCK_AI: "false",
    OPENAI_API_KEY: "",
  });

  try {
    await waitForServer();
    const health = await getJson("/api/health");
    assert.equal(health.openai_configured, false);
    assert.equal(health.mock_forced, false);

    const chat = await postJson("/api/chat", {
      scenario: "study",
      message: "I have a finance quiz but I am tired and stuck.",
    });

    assert.equal(chat.fallback_used, true);
    assert.ok(chat.trace.some((step) => step.step === "openai_adapter" && step.status === "fallback"));
    assert.ok(chat.trace.every((step) => !String(step.summary).includes("OPENAI_API_KEY")));
  } finally {
    child.kill();
    baseUrl = `http://127.0.0.1:${PORT}`;
  }
}

async function testSessionLimit() {
  const port = randomPort();
  const child = startServer(port, {
    USE_MOCK_AI: "true",
    MAX_SESSIONS: "2",
  });

  try {
    await waitForServer();
    const one = await postJson("/api/session", { scenario: "study" });
    const two = await postJson("/api/session", { scenario: "study" });
    const three = await postJson("/api/session", { scenario: "study" });

    assert.ok(one.session_id);
    assert.ok(two.session_id);
    assert.ok(three.session_id);

    const evicted = await getJsonExpectStatus(`/api/session/${one.session_id}/memory`, 404);
    assert.equal(evicted.ok, false);

    const stillPresent = await getJson(`/api/session/${three.session_id}/memory`);
    assert.equal(stillPresent.session_id, three.session_id);
  } finally {
    child.kill();
    baseUrl = `http://127.0.0.1:${PORT}`;
  }
}

async function testSessionTtlExpiry() {
  const port = randomPort();
  const child = startServer(port, {
    USE_MOCK_AI: "true",
    SESSION_TTL_MS: "50",
  });

  try {
    await waitForServer();
    const session = await postJson("/api/session", { scenario: "study" });
    await new Promise((resolve) => setTimeout(resolve, 90));
    const expired = await getJsonExpectStatus(`/api/session/${session.session_id}/memory`, 404);
    assert.equal(expired.ok, false);
  } finally {
    child.kill();
    baseUrl = `http://127.0.0.1:${PORT}`;
  }
}

function testDotEnvLoader() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "nextstep-env-"));
  const envFile = path.join(tempDir, ".env");
  const oldQuoted = process.env.MART_TEST_QUOTED;
  const oldNoOverride = process.env.MART_TEST_NO_OVERRIDE;

  try {
    delete process.env.MART_TEST_QUOTED;
    process.env.MART_TEST_NO_OVERRIDE = "existing";
    fs.writeFileSync(envFile, "\uFEFFMART_TEST_QUOTED=\"loaded\"\nMART_TEST_NO_OVERRIDE=from_file\n", "utf8");
    loadDotEnv(envFile);

    assert.equal(process.env.MART_TEST_QUOTED, "loaded");
    assert.equal(process.env.MART_TEST_NO_OVERRIDE, "existing");
  } finally {
    if (oldQuoted === undefined) delete process.env.MART_TEST_QUOTED;
    else process.env.MART_TEST_QUOTED = oldQuoted;
    if (oldNoOverride === undefined) delete process.env.MART_TEST_NO_OVERRIDE;
    else process.env.MART_TEST_NO_OVERRIDE = oldNoOverride;
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function testSchemaNormalizationHelpers() {
  assert.equal(normalizeScenario("work"), "study");
  assert.equal(normalizeScenario("daily"), "pet");
  assert.equal(normalizeScenario("unknown"), "study");

  const normalized = normalizeRuntimeResult({
    reply: "ok",
    detected_state: "Neutral",
    companion_state: "invalid-state",
    mode: "Not a real mode",
    micro_task_plan: [
      { label: "Bad duration", duration_minutes: -10, done: false },
    ],
    check_in_options: ["Done", "Wrong", "I got stuck"],
  }, {
    session_id: "test-session",
    message: "test",
    defaultMode: "Check-in Mode",
  });

  assert.equal(normalized.mode, "Check-in Mode");
  assert.ok(VALID_COMPANION_STATES.has(normalized.companion_state));
  assert.ok(normalized.micro_task_plan.length >= 2);
  assert.ok(normalized.micro_task_plan[0].duration_minutes > 0);
  assert.deepEqual(normalized.check_in_options, ["Done", "Partly done", "I got stuck"]);
}

function assertRequiredString(value, label) {
  assert.equal(typeof value, "string", `${label} must be a string`);
  assert.ok(value.trim().length > 0, `${label} must be non-empty`);
}

function assertMemoryShape(memory) {
  assertRequiredString(memory.current_companion, "memory.current_companion");
  assert.equal(typeof memory.companion_settings, "object");
  assertRequiredString(memory.preferred_mode, "memory.preferred_mode");
  assertRequiredString(memory.preferred_task_length, "memory.preferred_task_length");
  assert.ok(Array.isArray(memory.recent_goals), "memory.recent_goals must be an array");
  assert.ok(Array.isArray(memory.completed_micro_tasks), "memory.completed_micro_tasks must be an array");
  assert.ok(Array.isArray(memory.check_in_history), "memory.check_in_history must be an array");
  assertRequiredString(memory.latest_memory_update, "memory.latest_memory_update");
  assert.ok(Array.isArray(memory.active_plan), "memory.active_plan must be an array");
  assertRequiredString(memory.last_reply, "memory.last_reply");
  assert.equal(typeof memory.turn_count, "number", "memory.turn_count must be a number");
  assertRequiredString(memory.updated_at, "memory.updated_at");
  assertRequiredString(memory.last_goal, "memory.last_goal");
  assertRequiredString(memory.recent_mode, "memory.recent_mode");
  assertRequiredString(memory.memory_update, "memory.memory_update");
}

function requestWithHost(pathname, host) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: "127.0.0.1",
      port: new URL(baseUrl).port,
      path: pathname,
      method: "GET",
      headers: { Host: host },
    }, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(raw) });
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function requestWithoutHost(pathname) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({
      host: "127.0.0.1",
      port: Number(new URL(baseUrl).port),
    });
    let raw = "";
    socket.setEncoding("utf8");
    socket.on("connect", () => {
      socket.write(`GET ${pathname} HTTP/1.0\r\nConnection: close\r\n\r\n`);
    });
    socket.on("data", (chunk) => { raw += chunk; });
    socket.on("end", () => {
      const match = raw.match(/^HTTP\/1\.\d\s+(\d+)/);
      resolve({ statusCode: match ? Number(match[1]) : 0, body: raw });
    });
    socket.on("error", reject);
  });
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
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`);
  return response.json();
}

async function postJson(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path} failed with ${response.status}: ${await response.text()}`);
  return response.json();
}

async function getJsonExpectStatus(path, status) {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.status, status);
  return response.json();
}

async function postJsonExpectStatus(path, body, status) {
  return rawPostExpectStatus(path, JSON.stringify(body), status);
}

async function rawPostExpectStatus(path, body, status, contentType = "application/json") {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
  assert.equal(response.status, status);
  return response.json();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
