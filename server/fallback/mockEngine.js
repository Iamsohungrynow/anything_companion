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

const ACTION_KEYWORDS = [
  "study",
  "learn",
  "review",
  "prepare",
  "practice",
  "understand",
  "finish",
  "write",
  "work",
  "start",
  "begin",
  "quiz",
  "exam",
  "homework",
  "essay",
  "report",
  "internship",
  "application",
];

const FOCUS_KEYWORDS = ["focus", "concentrate", "ready", "let's go", "continue", "deep work", "pomodoro"];
const FOLLOW_UP_KEYWORDS = ["help me", "why not", "what should i do", "next", "continue", "guide me", "show me"];
const TEACH_KEYWORDS = ["concept", "explain", "what is", "what are", "teach me", "define", "meaning of", "give concept"];
const STEP_KEYWORDS = ["concrete step", "concrete steps", "first step", "steps to", "step by step", "break down", "decompose", "plan for", "how do i start", "how to start", "show me how to"];

const TONE_OPENERS = {
  soft_supportive: "I am here with you.",
  short_direct: "Got it.",
  cute_playful: "Okay, tiny step time.",
  coach_like: "Good. We will turn this into action.",
  friend_like: "I got you.",
};

function runMockEngine(input, companionData, session = {}) {
  const scenario = input.scenario || "study";
  const responses = companionData.mock_responses || {};
  const scenarioResponses = responses[scenario] || responses.study || {};
  const message = String(input.message || "").toLowerCase();
  const planContext = buildPlanningContext(input, session);

  let raw = scenarioResponses.default;
  if (scenario === "study") {
    const intent = detectIntent(message);
    if (input.check_in_result) raw = buildCheckInResponse(planContext);
    else if (intent === "teach_concept") raw = buildTeachingResponse(planContext);
    else if (intent === "emotional_support") raw = buildSupportResponse(planContext);
    else if (intent === "vague_help") raw = buildVagueHelpResponse(planContext);
    else if (intent === "decompose_task" || intent === "continue_context") raw = buildStepResponse(planContext, intent);
    else if (
      hasActionableGoal(message) ||
      FOCUS_KEYWORDS.some((keyword) => message.includes(keyword)) ||
      (planContext.subject && FOLLOW_UP_KEYWORDS.some((keyword) => message.includes(keyword)))
    ) {
      raw = buildStepResponse(planContext, "plan_task");
    }
  }

  const result = normalizeRuntimeResult(
    {
      ...raw,
      goal_understanding: raw?.goal_understanding || buildGoalUnderstanding(input.message, raw?.mode),
      start_button_label: raw?.start_button_label || (raw?.mode === "Focus Mode" ? "Start 25-min Focus Block" : "Start 10-min Sprint"),
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
