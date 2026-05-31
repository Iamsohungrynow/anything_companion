const { normalizeRuntimeResult } = require("../schemas");

const LOW_KEYWORDS = [
  "tired",
  "procrastinat",
  "boring",
  "hard",
  "difficult",
  "can't",
  "cannot",
  "stressed",
  "overwhelm",
  "lazy",
  "stuck",
  "hate",
  "ugh",
  "not feeling",
  "don't feel",
  "don't want",
  "do not want",
];

const FOCUS_KEYWORDS = ["focus", "concentrate", "ready", "let's go", "start", "begin", "work"];

function runMockEngine(input, companionData) {
  const scenario = input.scenario || "study";
  const responses = companionData.mock_responses || {};
  const scenarioResponses = responses[scenario] || responses.study || {};
  const message = String(input.message || "").toLowerCase();

  let raw = scenarioResponses.default;
  if (scenario === "study") {
    if (LOW_KEYWORDS.some((keyword) => message.includes(keyword))) raw = scenarioResponses.low_motivation;
    else if (FOCUS_KEYWORDS.some((keyword) => message.includes(keyword))) raw = scenarioResponses.focus;
  }

  const result = normalizeRuntimeResult(
    {
      ...raw,
      goal_understanding: buildGoalUnderstanding(input.message, raw?.mode),
      start_button_label: raw?.mode === "Focus Mode" ? "Start 25-min Focus Block" : "Start 10-min Sprint",
      check_in_options: ["Done", "Partly done", "I got stuck"],
      trace: [
        { step: "input", status: "complete", summary: "User message received." },
        { step: "state_detector", status: "fallback", summary: `Detected ${raw?.detected_state || "neutral state"} using mock rules.` },
        { step: "mode_router", status: "fallback", summary: `Selected ${raw?.mode || "Check-in Mode"}.` },
        { step: "action_planner", status: "fallback", summary: "Generated a small next-step plan from local fallback data." },
        { step: "memory_writer", status: "fallback", summary: raw?.memory_update || "Updated session memory." },
      ],
    },
    {
      fallback_used: true,
      message: input.message,
      defaultMode: raw?.mode,
    }
  );

  return result;
}

function buildGoalUnderstanding(message, mode) {
  if (mode === "Focus Mode") {
    return "You are ready to focus, so the best next step is to turn that energy into a structured block.";
  }

  if (mode === "Encourage Mode") {
    return `You want to make progress on "${message}", but it feels too large right now. We will make the first step small enough to start.`;
  }

  return `You want support with "${message}". We will choose one small next action and check back after.`;
}

module.exports = {
  runMockEngine,
};
