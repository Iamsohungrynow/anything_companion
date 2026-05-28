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
  "Study Sprint Mode",
  "Companion Mode",
  "Companion Presence Mode",
  "Routine Check-in Mode",
  "Check-in Mode",
  "Routine Mode",
]);
const VALID_COMPANION_STATES = new Set(["idle", "happy", "thinking", "encouraging", "focused", "resting", "concerned"]);

const DEFAULT_CHECK_IN_OPTIONS = ["Done", "Partly done", "I got stuck"];

const runtimeResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
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
        "Study Sprint Mode",
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
    "reply",
    "detected_state",
    "companion_state",
    "mode",
    "goal_understanding",
    "micro_task_plan",
    "start_button_label",
    "check_in_message",
    "check_in_options",
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
      companion: body.companion && typeof body.companion === "object" ? body.companion : undefined,
      history: normalizeHistory(body.history),
      image_url: normalizeOptionalString(body.image_url, 2000),
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
  if (mode === "Focus Mode" || mode === "Study Sprint Mode") return "focused";
  if (mode === "Routine Check-in Mode" || mode === "Routine Mode") return "happy";
  if (mode === "Companion Presence Mode") return "resting";
  return "idle";
}

function normalizeRuntimeResult(raw, context = {}) {
  const legacyTasks = Array.isArray(raw?.micro_task) ? raw.micro_task : undefined;
  const microTaskPlan = normalizeMicroTaskPlan(raw?.micro_task_plan, legacyTasks);
  const mode = VALID_MODES.has(raw?.mode) ? raw.mode : context.defaultMode || "Check-in Mode";

  const result = {
    session_id: context.session_id,
    reply: String(raw?.reply || "Let's start with one small step."),
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
    memory_update: String(raw?.memory_update || "User benefits from small, concrete next steps."),
    trace: normalizeTrace(raw?.trace, context.fallback_used),
    fallback_used: Boolean(context.fallback_used),
  };

  return result;
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
