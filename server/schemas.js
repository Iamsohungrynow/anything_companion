const VALID_SCENARIOS = new Set(["study", "acg", "pet", "work", "daily"]);
const SCENARIO_ALIASES = {
  work: "study",
  daily: "pet",
};
const VALID_CHANNELS = new Set(["text", "voice", "stage"]);
const VALID_TONES = new Set(["soft_supportive", "short_direct", "cute_playful", "coach_like", "friend_like"]);
const VALID_USE_CASES = new Set(["study", "work", "light_support", "pet_companionship", "routine"]);
const VALID_CHECK_IN_RESULTS = new Set(["Done", "Partly done", "I got stuck"]);
const VALID_HISTORY_ROLES = new Set(["user", "assistant"]);
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 6;
const MAX_HISTORY_CONTENT_LENGTH = 500;

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
const VALID_INTENTS = new Set([
  "teach_concept",
  "decompose_task",
  "plan_task",
  "continue_context",
  "vague_help",
  "emotional_support",
  "quiz",
  "routine",
  "check_in",
  "general_chat",
]);

const DEFAULT_CHECK_IN_OPTIONS = ["Done", "Partly done", "I got stuck"];

const runtimeResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    intent: {
      type: "string",
      enum: [
        "teach_concept",
        "decompose_task",
        "plan_task",
        "continue_context",
        "vague_help",
        "emotional_support",
        "quiz",
        "routine",
        "check_in",
        "general_chat",
      ],
    },
    answer: { type: "string" },
    reply: { type: "string" },
    detected_state: { type: "string" },
    companion_state: {
      type: "string",
      enum: ["idle", "happy", "thinking", "encouraging", "focused", "resting", "concerned"],
    },
    mode: {
      type: "string",
      enum: [
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
      ],
    },
    goal_understanding: { type: "string" },
    micro_task_plan: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          duration_minutes: { type: "number", minimum: 1 },
          done: { type: "boolean" },
        },
        required: ["label", "duration_minutes", "done"],
      },
    },
    start_button_label: { type: "string" },
    check_in_message: { type: "string" },
    check_in_options: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string", enum: DEFAULT_CHECK_IN_OPTIONS },
    },
    suggested_actions: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string" },
    },
    teaching: {
      type: "object",
      additionalProperties: false,
      properties: {
        concept: { type: "string" },
        explanation: { type: "string" },
        example: { type: "string" },
        check_question: { type: "string" },
      },
      required: ["concept", "explanation", "example", "check_question"],
    },
    memory_update: { type: "string" },
    trace: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          step: { type: "string" },
          status: { type: "string", enum: ["complete", "fallback"] },
          summary: { type: "string" },
        },
        required: ["step", "status", "summary"],
      },
    },
  },
  required: [
    "intent",
    "answer",
    "reply",
    "detected_state",
    "companion_state",
    "mode",
    "goal_understanding",
    "micro_task_plan",
    "start_button_label",
    "check_in_message",
    "check_in_options",
    "suggested_actions",
    "teaching",
    "memory_update",
    "trace",
  ],
};

function normalizeScenario(value) {
  const scenario = String(value || "study").toLowerCase();
  if (!VALID_SCENARIOS.has(scenario)) return "study";
  return SCENARIO_ALIASES[scenario] || scenario;
}

function validateChatRequest(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "JSON body is required." };
  }

  const message = String(body.message || "").trim();
  if (!message) {
    return { ok: false, error: "`message` is required." };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "`message` must be 2000 characters or fewer." };
  }

  return {
    ok: true,
    value: {
      session_id: normalizeOptionalString(body.session_id, 120),
      scenario: normalizeScenario(body.scenario),
      message,
      channel: normalizeChoice(body.channel, VALID_CHANNELS, "text"),
      tone: normalizeChoice(body.tone, VALID_TONES, ""),
      use_case: normalizeChoice(body.use_case, VALID_USE_CASES, ""),
      role: normalizeOptionalString(body.role, 80),
      companion: body.companion && typeof body.companion === "object" ? body.companion : undefined,
      history: normalizeHistory(body.history),
      image_url: normalizeOptionalString(body.image_url, 2000),
      image_metadata: body.image_metadata && typeof body.image_metadata === "object" ? body.image_metadata : undefined,
      selected_mode: normalizeOptionalString(body.selected_mode, 80),
      check_in_result: VALID_CHECK_IN_RESULTS.has(body.check_in_result) ? body.check_in_result : undefined,
    },
  };
}

function normalizeChoice(value, validValues, fallback) {
  const normalized = String(value || "").trim();
  return validValues.has(normalized) ? normalized : fallback;
}

function normalizeOptionalString(value, maxLength) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  return normalized.slice(0, maxLength);
}

function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_HISTORY_ITEMS).map((item) => ({
    role: normalizeChoice(item?.role, VALID_HISTORY_ROLES, "user"),
    content: String(item?.content || "").slice(0, MAX_HISTORY_CONTENT_LENGTH),
  })).filter((item) => item.content.trim());
}

function normalizeMicroTaskPlan(value, legacyTasks) {
  let tasks;
  if (Array.isArray(value) && value.length > 0) {
    tasks = value.slice(0, 4).map((item, index) => ({
      label: String(item.label || item.task || legacyTasks?.[index] || `Task ${index + 1}`),
      duration_minutes: normalizeDuration(item.duration_minutes || item.minutes, index),
      done: Boolean(item.done),
    }));
  } else {
    const fallbackTasks = Array.isArray(legacyTasks) && legacyTasks.length > 0
      ? legacyTasks
      : ["Open the relevant materials", "Work on the first small step"];

    tasks = fallbackTasks.slice(0, 4).map((label, index) => ({
      label: String(label),
      duration_minutes: defaultDuration(index),
      done: false,
    }));
  }

  while (tasks.length < 2) {
    const index = tasks.length;
    tasks.push({
      label: index === 0 ? "Open the relevant materials" : "Work on the first small step",
      duration_minutes: defaultDuration(index),
      done: false,
    });
  }

  return tasks;
}

function defaultDuration(index) {
  return [2, 8, 10, 3][index] || 5;
}

function normalizeDuration(value, index) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultDuration(index);
  return Math.min(60, Math.max(1, Math.round(parsed)));
}

function modeToCompanionState(mode, detectedState) {
  const state = String(detectedState || "").toLowerCase();
  if (state.includes("stuck") || state.includes("overwhelm") || state.includes("low")) return "concerned";
  if (mode === "Encourage Mode") return "encouraging";
  if (mode === "Study Companion Mode") return "thinking";
  if (mode === "Focus Mode" || mode === "Study Sprint Mode" || mode === "Quiz Mode") return "focused";
  if (mode === "Routine Check-in Mode" || mode === "Routine Mode") return "happy";
  if (mode === "Companion Presence Mode") return "resting";
  return "idle";
}

function normalizeRuntimeResult(raw, context = {}) {
  const legacyTasks = Array.isArray(raw?.micro_task) ? raw.micro_task : undefined;
  const microTaskPlan = normalizeMicroTaskPlan(raw?.micro_task_plan, legacyTasks);
  const mode = VALID_MODES.has(raw?.mode) ? raw.mode : context.defaultMode || "Check-in Mode";
  const intent = normalizeIntent(raw?.intent, mode, context.message);
  const answer = String(raw?.answer || raw?.reply || "Let's start with one small step.");
  const reply = intent === "teach_concept" ? answer : String(raw?.reply || answer);

  const result = {
    session_id: context.session_id,
    intent,
    answer,
    reply,
    detected_state: String(raw?.detected_state || "Neutral"),
    companion_state: VALID_COMPANION_STATES.has(raw?.companion_state)
      ? raw.companion_state
      : modeToCompanionState(mode, raw?.detected_state),
    mode,
    goal_understanding: String(
      raw?.goal_understanding ||
      `You want to work on: ${context.message || "your next task"}. We will make it small enough to begin.`
    ),
    micro_task_plan: microTaskPlan,
    micro_task: microTaskPlan.map((task) => task.label),
    start_button_label: String(raw?.start_button_label || "Start 10-min Sprint"),
    check_in_message: String(raw?.check_in_message || "How did it go?"),
    check_in_options: normalizeCheckInOptions(raw?.check_in_options),
    suggested_actions: normalizeSuggestedActions(raw?.suggested_actions, microTaskPlan, intent),
    teaching: normalizeTeaching(raw?.teaching, intent, answer),
    memory_update: String(raw?.memory_update || "User benefits from small, concrete next steps."),
    trace: normalizeTrace(raw?.trace, context.fallback_used),
    fallback_used: Boolean(context.fallback_used),
  };

  return result;
}

function normalizeIntent(value, mode, message) {
  const normalized = String(value || "").trim();
  if (VALID_INTENTS.has(normalized)) return normalized;
  const lower = String(message || "").toLowerCase();
  if (lower.match(/^\s*(and|also|then|next)\s+[\w\s-]{2,80}$/)) return "continue_context";
  if (lower.match(/\b(help me|i need help|what should i do|guide me|show me)\b/)) return "vague_help";
  if (lower.match(/\b(concept|explain|what is|what are|teach me|define|meaning of|give concept)\b/)) return "teach_concept";
  if (lower.match(/\b(concrete step|concrete steps|first step|steps to|step by step|break down|decompose|plan for|how do i start|how to start|show me how to)\b/)) return "decompose_task";
  if (mode === "Encourage Mode" || lower.match(/\b(sad|tired|overwhelmed|stressed|don't want|dont want|stuck)\b/)) return "emotional_support";
  if (mode === "Routine Check-in Mode" || mode === "Routine Mode") return "routine";
  if (mode === "Check-in Mode") return "check_in";
  if (lower.match(/\b(quiz me|test me|question me)\b/)) return "quiz";
  if (mode === "Study Sprint Mode" || mode === "Focus Mode") return "plan_task";
  return "general_chat";
}

function normalizeSuggestedActions(value, microTaskPlan, intent) {
  if (Array.isArray(value) && value.length > 0) {
    return value.slice(0, 4).map((item) => String(item)).filter((item) => item.trim());
  }
  if (intent === "teach_concept") {
    return ["Explain simpler", "Give another example", "Quiz me"];
  }
  const fromTasks = microTaskPlan.map((task) => task.label).slice(0, 3);
  return fromTasks.length >= 2 ? fromTasks : ["Start one small step", "Check in after"];
}

function normalizeTeaching(value, intent, answer) {
  const teaching = value && typeof value === "object" ? value : {};
  if (intent !== "teach_concept") {
    return {
      concept: String(teaching.concept || ""),
      explanation: String(teaching.explanation || ""),
      example: String(teaching.example || ""),
      check_question: String(teaching.check_question || ""),
    };
  }
  return {
    concept: String(teaching.concept || "Requested concept"),
    explanation: String(teaching.explanation || answer),
    example: String(teaching.example || "Use one tiny example to test the idea."),
    check_question: String(teaching.check_question || "Can you explain it back in one sentence?"),
  };
}

function normalizeCheckInOptions(value) {
  if (!Array.isArray(value)) return DEFAULT_CHECK_IN_OPTIONS;
  const exact = DEFAULT_CHECK_IN_OPTIONS.every((option, index) => value[index] === option);
  return exact && value.length === DEFAULT_CHECK_IN_OPTIONS.length ? value : DEFAULT_CHECK_IN_OPTIONS;
}

function normalizeTrace(value, fallbackUsed) {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((item) => ({
      step: String(item.step || "runtime"),
      status: item.status === "fallback" ? "fallback" : "complete",
      summary: String(item.summary || "Runtime step completed."),
    }));
  }

  return [
    { step: "input", status: "complete", summary: "User message received." },
    {
      step: "runtime",
      status: fallbackUsed ? "fallback" : "complete",
      summary: fallbackUsed ? "Used deterministic fallback engine." : "Generated structured runtime response.",
    },
  ];
}

module.exports = {
  DEFAULT_CHECK_IN_OPTIONS,
  normalizeRuntimeResult,
  normalizeScenario,
  runtimeResponseJsonSchema,
  validateChatRequest,
};
