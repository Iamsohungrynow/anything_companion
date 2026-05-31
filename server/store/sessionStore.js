const crypto = require("crypto");
const { MAX_SESSIONS, SESSION_TTL_MS } = require("../config");

const sessions = new Map();

function createSession({ scenario, companion, tone, use_case } = {}) {
  pruneExpiredSessions();
  enforceSessionLimit();

  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const memory = createInitialMemory({ companion, tone, use_case, now });

  const session = {
    id: sessionId,
    scenario: scenario || "study",
    companion: companion || null,
    tone: tone || "",
    use_case: use_case || "",
    history: [],
    memory,
    created_at: now,
    updated_at: now,
  };

  sessions.set(sessionId, session);
  return session;
}

function createInitialMemory({ companion, tone, use_case, now }) {
  return {
    user_name: "",
    current_companion: companion?.name || "Companion",
    companion_settings: companion || {},
    preferred_mode: "Check-in Mode",
    preferred_task_length: "10-minute sprint",
    recent_goals: [],
    completed_micro_tasks: [],
    check_in_history: [],
    latest_memory_update: "First session - building baseline.",
    active_plan: [],
    last_reply: "",
    turn_count: 0,
    tone: tone || "",
    use_case: use_case || "",
    updated_at: now,
    last_goal: "Starting a session",
    recent_mode: "Check-in Mode",
    memory_update: "First session - building baseline.",
  };
}

function getSession(sessionId) {
  pruneExpiredSessions();
  if (!sessionId) return null;
  const session = sessions.get(sessionId) || null;
  if (!session) return null;
  if (isExpired(session)) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

function ensureSession(input) {
  const existing = getSession(input.session_id);
  if (existing) return existing;
  return createSession(input);
}

function updateSessionAfterTurn(session, input, result) {
  const now = new Date().toISOString();
  const recentGoals = [input.message, ...(session.memory.recent_goals || [])]
    .filter(Boolean)
    .slice(0, 5);

  const completed = Array.isArray(session.memory.completed_micro_tasks)
    ? session.memory.completed_micro_tasks.slice(0, 10)
    : [];

  const checkInResult = normalizeCheckInResult(input.check_in_result);

  if (checkInResult === "done" && Array.isArray(result.micro_task)) {
    completed.unshift(...result.micro_task.slice(0, 2));
  }

  const checkIns = Array.isArray(session.memory.check_in_history)
    ? session.memory.check_in_history.slice(0, 10)
    : [];

  if (checkInResult) {
    checkIns.unshift({
      date: now,
      goal: input.message,
      result: checkInResult,
    });
  }

  if (input.companion) session.companion = input.companion;
  if (input.tone) session.tone = input.tone;
  if (input.use_case) session.use_case = input.use_case;

  session.memory = {
    ...session.memory,
    current_companion: input.companion?.name || session.memory.current_companion,
    companion_settings: input.companion || session.memory.companion_settings,
    preferred_mode: result.mode,
    preferred_task_length: inferPreferredTaskLength(result),
    recent_goals: recentGoals,
    completed_micro_tasks: completed.slice(0, 10),
    check_in_history: checkIns.slice(0, 10),
    latest_memory_update: result.memory_update,
    active_plan: Array.isArray(result.micro_task) ? result.micro_task.slice(0, 4) : [],
    last_reply: result.reply || "",
    turn_count: Number(session.memory.turn_count || 0) + 1,
    updated_at: now,
    last_goal: input.message,
    recent_mode: result.mode,
    memory_update: result.memory_update,
  };

  session.history.push({ role: "user", content: input.message, at: now });
  session.history.push({ role: "assistant", content: result.reply, at: now });
  session.history = session.history.slice(-12);
  session.updated_at = now;

  return session;
}

function inferPreferredTaskLength(result) {
  const durations = Array.isArray(result.micro_task_plan)
    ? result.micro_task_plan.map((task) => Number(task.duration_minutes || 0)).filter(Boolean)
    : [];
  const total = durations.reduce((sum, value) => sum + value, 0);
  if (result.mode === "Encourage Mode") return "10-minute sprint";
  if (total > 0 && total <= 15) return `${total}-minute sprint`;
  if (result.mode === "Routine Check-in Mode") return "Short breaks";
  return "Flexible";
}

function normalizeCheckInResult(value) {
  const normalized = String(value || "").toLowerCase().replace(/\s+/g, "_");
  if (normalized.includes("partly")) return "partly_done";
  if (normalized.includes("stuck")) return "stuck";
  if (normalized === "done") return "done";
  return null;
}

function resetSession(sessionId) {
  return sessions.delete(sessionId);
}

function pruneExpiredSessions() {
  if (!SESSION_TTL_MS) return;
  for (const [sessionId, session] of sessions.entries()) {
    if (isExpired(session)) sessions.delete(sessionId);
  }
}

function enforceSessionLimit() {
  while (sessions.size >= MAX_SESSIONS) {
    const oldest = sessions.keys().next().value;
    if (!oldest) return;
    sessions.delete(oldest);
  }
}

function isExpired(session) {
  if (!SESSION_TTL_MS || !session?.updated_at) return false;
  return Date.now() - Date.parse(session.updated_at) > SESSION_TTL_MS;
}

module.exports = {
  createSession,
  ensureSession,
  getSession,
  resetSession,
  updateSessionAfterTurn,
};
