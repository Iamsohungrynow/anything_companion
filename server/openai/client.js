const { OPENAI_MODEL, OPENAI_TIMEOUT_MS } = require("../config");
const { runtimeResponseJsonSchema } = require("../schemas");

async function runOpenAI({ input, session }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: buildSystemPrompt(),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(buildRuntimePayload(input, session)),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "nextstep_runtime_response",
            schema: runtimeResponseJsonSchema,
            strict: true,
          },
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${body.slice(0, 300)}`);
    }

    const data = await response.json();
    return JSON.parse(extractOutputText(data));
  } finally {
    clearTimeout(timeout);
  }
}

function buildSystemPrompt() {
  return [
    "You are the runtime engine for NextStep Companion, an adaptive study-start companion.",
    "Help the user start action; do not maximize conversation length.",
    "Use short supportive copy and 2-4 concrete micro-tasks.",
    "Prefer 5-10 minute starts when the user is stuck, tired, overwhelmed, or procrastinating.",
    "Avoid diagnosis, therapy claims, or medical framing.",
    "Respect the selected tone and companion role.",
    "Return only schema-valid JSON.",
  ].join("\n");
}

function buildRuntimePayload(input, session) {
  return {
    scenario: input.scenario,
    message: input.message,
    channel: input.channel,
    tone: input.tone,
    use_case: input.use_case,
    companion: input.companion || session.companion,
    memory: session.memory,
    recent_history: session.history.slice(-6),
  };
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  for (const output of data.output || []) {
    for (const content of output.content || []) {
      if (typeof content.text === "string" && content.text.trim()) return content.text;
      if (typeof content.json === "object") return JSON.stringify(content.json);
    }
  }

  throw new Error("OpenAI response did not contain parseable output text.");
}

module.exports = {
  runOpenAI,
};
