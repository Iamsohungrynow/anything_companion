// ============================================================
// CHAT RESULT GENERATION (Local mock AI, used as fallback)
// ============================================================
// Returns the full RuntimeResponse shape so the UI can render
// goal understanding, micro-task plan, trace, etc.
// The live runtime is called first (see lib/runtimeClient.ts);
// this local generator is the automatic offline fallback.
// Pure module: no "use client" directive needed.
// ============================================================

import { ChatResult, Scenario } from "../shared/types";

// ------ Study: Low motivation / stuck ---------------------------------------

const studyLowMotivationResult: ChatResult = {
  reply:
    "I can tell you're tired and stuck right now, and that's completely okay. " +
    "You don't need to finish everything tonight. " +
    "I'll stay with you for just 10 minutes. " +
    "Let's start with one tiny step together. ☕",
  detected_state: "low_motivation",
  companion_state: "encouraging",
  mode: "Encourage Mode",
  goal_understanding:
    "You want to prepare for your finance quiz, but the task feels too big and you're low on energy right now.",
  micro_task_plan: [
    { label: "Open your notes and find the first page", duration_minutes: 2, done: false },
    { label: "Review 3 key formulas, just read, no memorising", duration_minutes: 5, done: false },
    { label: "Try 1 practice question", duration_minutes: 3, done: false },
  ],
  start_button_label: "Start 10-min Sprint",
  check_in_message:
    "Come back after 10 minutes. Even if you only did one step, that counts.",
  check_in_options: ["Done", "Partly done", "I got stuck"],
  memory_update:
    "User starts better with short, gentle 10-minute sprints when feeling stuck.",
  memory: {
    preferred_mode: "Encourage Mode",
    preferred_task_length: "10-minute sprint",
    recent_goals: ["Finance quiz preparation"],
    latest_memory_update:
      "User starts better with short, gentle 10-minute sprints when feeling stuck.",
    updated_at: new Date().toISOString(),
  },
  trace: [
    { step: "Input received", status: "complete", summary: '"I have a finance quiz but I am tired and stuck."' },
    { step: "State detected", status: "complete", summary: "Low motivation plus difficulty starting" },
    { step: "Mode selected", status: "complete", summary: "Encourage Mode, small start over big plan" },
    { step: "Micro-tasks generated", status: "complete", summary: "3 steps, 10 minutes total" },
    { step: "Memory queued", status: "complete", summary: "Preference: short sprints when stuck" },
  ],
  fallback_used: false,
  micro_task: ["Open notes", "Review 3 formulas", "Try 1 practice question"],
};

// ------ Study: Overwhelmed --------------------------------------------------

const studyOverwhelmedResult: ChatResult = {
  reply:
    "Hey, it sounds like a lot is sitting on your shoulders right now. " +
    "That feeling of overwhelm is real, and I hear you. " +
    "Let's not try to fix everything at once. " +
    "One tiny step, that's all we need right now. I'll be here with you. 🌸",
  detected_state: "overwhelmed",
  companion_state: "concerned",
  mode: "Encourage Mode",
  goal_understanding:
    "You have a lot on your plate and the size of the task is making it hard to start anything.",
  micro_task_plan: [
    { label: "Write down the one most important thing to do today", duration_minutes: 2, done: false },
    { label: "Open only that one thing, nothing else", duration_minutes: 3, done: false },
    { label: "Work on it for 5 minutes, set a timer", duration_minutes: 5, done: false },
  ],
  start_button_label: "Start 5-min Focus",
  check_in_message: "Check back in 10 minutes. Even starting is a win.",
  check_in_options: ["Done", "Partly done", "I got stuck"],
  memory_update:
    "User prefers 5-minute starts when feeling overwhelmed, smaller entry points.",
  memory: {
    preferred_mode: "Encourage Mode",
    preferred_task_length: "5-minute start",
    latest_memory_update: "User prefers 5-minute starts when feeling overwhelmed.",
    updated_at: new Date().toISOString(),
  },
  trace: [
    { step: "Input received", status: "complete", summary: "Overwhelm signals detected" },
    { step: "State detected", status: "complete", summary: "Overwhelmed" },
    { step: "Mode selected", status: "complete", summary: "Encourage Mode, smallest possible entry" },
    { step: "Memory queued", status: "complete", summary: "Preference: short starts" },
  ],
  fallback_used: false,
  micro_task: ["Write the one task", "Open it", "Work 5 minutes"],
};

// ------ Study: Ready to focus -----------------------------------------------

const studyFocusResult: ChatResult = {
  reply:
    "I love this energy, you're ready, and I'm here with you. " +
    "Let's make the most of this focused moment. " +
    "Pick your top topic and we'll build real momentum together. 🔥",
  detected_state: "ready_to_focus",
  companion_state: "focused",
  mode: "Study Sprint Mode",
  goal_understanding:
    "You are in a focused state and ready to do meaningful study work.",
  micro_task_plan: [
    { label: "Pick one topic to deep-dive", duration_minutes: 2, done: false },
    { label: "Set a 25-minute Pomodoro", duration_minutes: 25, done: false },
    { label: "Write 3 things you want to learn", duration_minutes: 3, done: false },
  ],
  start_button_label: "Start 25-min Sprint",
  check_in_message: "After your session, come back and tell me what clicked.",
  check_in_options: ["Done", "Partly done", "I got stuck"],
  memory_update:
    "User enters deep focus well with structured 25-minute Pomodoro sessions.",
  memory: {
    preferred_mode: "Study Sprint Mode",
    preferred_task_length: "25-minute Pomodoro",
    latest_memory_update: "Enters focus well with structured Pomodoro sessions.",
    updated_at: new Date().toISOString(),
  },
  trace: [
    { step: "Input received", status: "complete", summary: "Focus intent detected" },
    { step: "State detected", status: "complete", summary: "Ready to focus" },
    { step: "Mode selected", status: "complete", summary: "Study Sprint Mode" },
    { step: "Memory queued", status: "complete", summary: "Preference: Pomodoro sessions" },
  ],
  fallback_used: false,
  micro_task: ["Pick a topic", "Set Pomodoro timer", "Write learning goals"],
};

// ------ Study: Default / Neutral --------------------------------------------

const studyDefaultResult: ChatResult = {
  reply:
    "Hey, I'm here with you. What's on your plate today? " +
    "Tell me what you're working on and we'll figure out a tiny first step together. ☕",
  detected_state: "neutral",
  companion_state: "idle",
  mode: "Check-in Mode",
  goal_understanding:
    "Starting a new session, checking in to understand what you need.",
  micro_task_plan: [
    { label: "Write today's one most important task", duration_minutes: 2, done: false },
    { label: "Open the right materials", duration_minutes: 2, done: false },
    { label: "Start with 5 minutes, just begin", duration_minutes: 5, done: false },
  ],
  start_button_label: "Start Session",
  check_in_message: "Tell me how it went, even a tiny update helps.",
  check_in_options: ["Done", "Partly done", "I got stuck"],
  memory_update: "User is beginning a new study session.",
  memory: {
    preferred_mode: "Check-in Mode",
    latest_memory_update: "New session started.",
    updated_at: new Date().toISOString(),
  },
  trace: [
    { step: "Input received", status: "complete", summary: "Neutral state" },
    { step: "State detected", status: "complete", summary: "Neutral / Ready" },
    { step: "Mode selected", status: "complete", summary: "Check-in Mode" },
  ],
  fallback_used: false,
  micro_task: ["Write the main task", "Open materials", "Start 5 minutes"],
};

// ------ ACG: Gentle companion -----------------------------------------------

const acgResult: ChatResult = {
  reply:
    "You don't need to finish everything at once. " +
    "I'll quietly stay with you while you begin. " +
    "One small step, just one. That's enough for now. 🌸",
  detected_state: "neutral",
  companion_state: "encouraging",
  mode: "Companion Mode",
  goal_understanding: "You want gentle support to get started on something.",
  micro_task_plan: [
    { label: "Choose one small task", duration_minutes: 2, done: false },
    { label: "Work quietly for 5 minutes", duration_minutes: 5, done: false },
    { label: "Take a short break after you begin", duration_minutes: 3, done: false },
  ],
  start_button_label: "Start Quietly",
  check_in_message: "Start with one small task and take a short break after.",
  check_in_options: ["Done", "Partly done", "I got stuck"],
  memory_update:
    "User prefers calm, gentle encouragement and quiet companionship.",
  memory: {
    preferred_mode: "Companion Mode",
    latest_memory_update: "User prefers gentle, quiet support.",
    updated_at: new Date().toISOString(),
  },
  trace: [
    { step: "Input received", status: "complete", summary: "Companionship request" },
    { step: "Mode selected", status: "complete", summary: "Companion Mode, gentle presence" },
  ],
  fallback_used: false,
  micro_task: ["Choose one task", "Work 5 minutes", "Short break"],
};

// ------ Pet: Routine check-in -----------------------------------------------

const petResult: ChatResult = {
  reply:
    "Hey! 🐾 You've been going for a while, time for a small break. " +
    "Stand up, get some water, and stretch. " +
    "I'll be right here when you come back.",
  detected_state: "neutral",
  companion_state: "happy",
  mode: "Routine Mode",
  goal_understanding:
    "Routine wellness check-in, a short reset before continuing.",
  micro_task_plan: [
    { label: "Stand up", duration_minutes: 1, done: false },
    { label: "Drink a glass of water", duration_minutes: 1, done: false },
    { label: "Stretch for 1 minute", duration_minutes: 1, done: false },
  ],
  start_button_label: "Start Break",
  check_in_message: "Drink water and stretch, then come back refreshed.",
  check_in_options: ["Done", "Partly done", "I got stuck"],
  memory_update: "User responds well to playful, short routine reminders.",
  memory: {
    preferred_mode: "Routine Mode",
    preferred_task_length: "3-minute break",
    latest_memory_update: "Responds well to short routine reminders.",
    updated_at: new Date().toISOString(),
  },
  trace: [
    { step: "Input received", status: "complete", summary: "Routine check-in" },
    { step: "Mode selected", status: "complete", summary: "Routine Mode" },
  ],
  fallback_used: false,
  micro_task: ["Stand up", "Drink water", "Stretch"],
};

// ------ Intent Detection ----------------------------------------------------

const LOW_MOTIVATION_KEYWORDS = [
  "don't want", "dont want", "do not want",
  "tired", "procrastinat",
  "study", "exam", "finance", "quiz",
  "boring", "hard", "difficult",
  "can't", "cannot",
  "stressed", "overwhelm",
  "lazy", "stuck",
  "hate", "ugh",
  "not feeling", "don't feel",
];

const OVERWHELM_KEYWORDS = [
  "overwhelm", "too much", "too many", "don't know where to start",
  "so much", "everything at once",
];

const FOCUS_KEYWORDS = [
  "focus", "concentrate", "ready", "let's go", "let go", "start", "begin", "work",
];

function detectStudyIntent(
  message: string,
): "overwhelmed" | "low_motivation" | "focus" | "default" {
  const lower = message.toLowerCase();
  if (OVERWHELM_KEYWORDS.some((kw) => lower.includes(kw))) return "overwhelmed";
  if (LOW_MOTIVATION_KEYWORDS.some((kw) => lower.includes(kw))) return "low_motivation";
  if (FOCUS_KEYWORDS.some((kw) => lower.includes(kw))) return "focus";
  return "default";
}

// ------ Main Export ---------------------------------------------------------

export function generateChatResult(
  scenario: Scenario,
  userMessage: string,
): ChatResult {
  if (scenario === "study") {
    const intent = detectStudyIntent(userMessage);
    if (intent === "overwhelmed") return studyOverwhelmedResult;
    if (intent === "low_motivation") return studyLowMotivationResult;
    if (intent === "focus") return studyFocusResult;
    return studyDefaultResult;
  }
  if (scenario === "acg") return acgResult;
  if (scenario === "pet") return petResult;
  return studyDefaultResult;
}

// Async version, simulates network delay for the local-only path.
export async function generateChatResultAsync(
  scenario: Scenario,
  userMessage: string,
  delayMs = 900,
): Promise<ChatResult> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return generateChatResult(scenario, userMessage);
}
