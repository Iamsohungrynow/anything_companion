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
    assert.ok(chat.intent);
    assert.ok(chat.answer);
    assert.ok(chat.mode);
    assert.ok(Array.isArray(chat.micro_task_plan));
    assert.ok(Array.isArray(chat.suggested_actions));
    assert.equal(typeof chat.teaching, "object");
    assert.deepEqual(chat.check_in_options, ["Done", "Partly done", "I got stuck"]);
    assert.match(chat.reply, /finance/i);
    assert.match(chat.reply, /1\.|Gentle reset/i);
    assert.match([chat.reply, ...chat.micro_task].join(" "), /finance/i);

    const quantum = await postJson("/api/chat", {
      scenario: "study",
      message: "I need to study quantum mechanics",
      channel: "text",
      tone: "coach_like",
      use_case: "study",
      companion: {
        name: "Luma",
        type: "Desk Lamp Focus Buddy",
        default_object_label: "desk lamp",
      },
    });
    const quantumText = [
      quantum.reply,
      quantum.goal_understanding,
      ...quantum.micro_task_plan.map((task) => task.label),
    ].join(" ");
    assert.match(quantumText, /quantum mechanics/i);
    assert.match(quantum.reply, /1\.|First tiny sprint|Open your/i);
    assert.doesNotMatch(quantumText, /write the exact task|tell me what|what are we working on/i);

    const followUp = await postJson("/api/chat", {
      session_id: quantum.session_id,
      scenario: "study",
      message: "why not you help me",
      channel: "text",
      tone: "coach_like",
      use_case: "study",
    });
    assert.equal(followUp.intent, "vague_help");
    assert.equal(followUp.mode, "Study Companion Mode");
    assert.match([followUp.reply, ...followUp.micro_task].join(" "), /quantum mechanics/i);
    assert.doesNotMatch(followUp.reply, /what are we working on|tell me what|choose one tiny slice|learn the simplest definition/i);

    const algebraPlan = await postJson("/api/chat", {
      scenario: "study",
      message: "i want to study algebra",
      channel: "text",
      tone: "cute_playful",
      use_case: "study",
    });
    const vagueHelp = await postJson("/api/chat", {
      session_id: algebraPlan.session_id,
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

    const algebra = await postJson("/api/chat", {
      scenario: "study",
      message: "you help me give concept of algebra",
      channel: "text",
      tone: "soft_supportive",
      use_case: "study",
      companion: {
        name: "Folio",
        type: "Open Book Focus Buddy",
        default_object_label: "open book",
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

    const steps = await postJson("/api/chat", {
      scenario: "study",
      message: "give me concrete steps to learn simultaneous equation",
      channel: "text",
      tone: "coach_like",
      use_case: "study",
    });
    assert.equal(steps.intent, "decompose_task");
    assert.match([steps.reply, ...steps.micro_task].join(" "), /simultaneous equation/i);
    assert.doesNotMatch(steps.reply, /start .* by opening the right material|make it concrete first/i);

    const periodic = await postJson("/api/chat", {
      scenario: "study",
      message: "give me concrete step to learn periodic table",
      channel: "text",
      tone: "cute_playful",
      use_case: "study",
    });
    const periodicText = [
      periodic.reply,
      periodic.answer,
      periodic.teaching?.explanation,
      periodic.teaching?.example,
      ...periodic.micro_task,
    ].join(" ");
    assert.equal(periodic.fallback_used, false);
    assert.equal(periodic.intent, "decompose_task");
    assert.match(periodicText, /periodic table|periods|groups|element|atomic|metal|nonmetal|noble gas/i);
    assert.doesNotMatch(periodicText, /open the most relevant material|name the first concrete part|do one small example, paragraph, question|will not pretend/i);

    const periodicHelp = await postJson("/api/chat", {
      session_id: periodic.session_id,
      scenario: "study",
      message: "help me",
      channel: "text",
      tone: "cute_playful",
      use_case: "study",
    });
    assert.equal(periodicHelp.fallback_used, false);
    assert.equal(periodicHelp.intent, "vague_help");
    assert.equal(periodicHelp.mode, "Study Companion Mode");
    assert.match([periodicHelp.reply, ...periodicHelp.micro_task].join(" "), /periodic table|period|group|element|atomic|metal|nonmetal|noble gas/i);
    assert.doesNotMatch(periodicHelp.reply, /will not pretend|trouble reaching the AI engine|open the most relevant material|name the first concrete part/i);

    console.log("Live OpenAI API test passed.");
    console.log(`model=${health.model}`);
    console.log(`mode=${chat.mode}`);
    console.log(`first_task=${chat.micro_task_plan[0]?.label || ""}`);
    console.log(`quantum_first_task=${quantum.micro_task_plan[0]?.label || ""}`);
    console.log(`algebra_intent=${algebra.intent}`);
    console.log(`steps_intent=${steps.intent}`);
    console.log(`periodic_intent=${periodic.intent}`);
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
