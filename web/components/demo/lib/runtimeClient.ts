// ============================================================
// Runtime client: calls the live Yorimi runtime (POST /api/chat)
// with an automatic fall back to the local mock generator.
// Same-origin: next.config.mjs rewrites /api/* to the 3017 server.
// Pure module (no browser globals at import time).
// ============================================================

import {
  ChatMessage,
  ChatResult,
  CompanionCard,
  CompanionRole,
  CompanionState,
  MicroTask,
  Scenario,
  Tone,
  UseCase,
} from "../shared/types";
import { generateChatResult } from "../chat/chatResultGenerator";

export interface SendChatTurnInput {
  sessionId?: string | null;
  scenario: Scenario;
  message: string;
  channel: "text" | "voice";
  tone?: Tone | null;
  use_case?: UseCase | null;
  role?: CompanionRole | null;
  companion: CompanionCard;
  /** Full message history; only the last 6 turns are sent. */
  history: ChatMessage[];
}

const COMPANION_STATES: CompanionState[] = [
  "idle",
  "happy",
  "thinking",
  "encouraging",
  "focused",
  "resting",
  "concerned",
];

function normalizeCompanionState(value: unknown): CompanionState {
  const raw = String(value ?? "").toLowerCase().trim();
  return (COMPANION_STATES as string[]).includes(raw)
    ? (raw as CompanionState)
    : "idle";
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toMicroTaskPlan(value: unknown): MicroTask[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const task = item as Record<string, unknown>;
      const label = asString(task?.label).trim();
      if (!label) return null;
      const minutes = Number(task?.duration_minutes);
      return {
        label,
        duration_minutes: Number.isFinite(minutes) ? minutes : 0,
        done: Boolean(task?.done),
      } satisfies MicroTask;
    })
    .filter((task): task is MicroTask => task !== null);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

/**
 * Map an arbitrary runtime JSON payload into the app's ChatResult shape.
 * The runtime response is a superset of ChatResult, so we reuse fields and
 * guarantee both `micro_task_plan` and `micro_task` are populated.
 */
function mapRuntimeResponse(raw: Record<string, unknown>): ChatResult {
  const plan = toMicroTaskPlan(raw.micro_task_plan);
  let microTask = toStringArray(raw.micro_task);
  if (microTask.length === 0 && plan.length > 0) {
    microTask = plan.map((task) => task.label);
  }
  const planFromTask =
    plan.length === 0 && microTask.length > 0
      ? microTask.map((label) => ({ label, duration_minutes: 0, done: false }))
      : plan;

  const checkInOptions = toStringArray(raw.check_in_options);
  const memory =
    raw.memory && typeof raw.memory === "object"
      ? (raw.memory as ChatResult["memory"])
      : {};
  const trace = Array.isArray(raw.trace)
    ? (raw.trace as ChatResult["trace"])
    : [];

  return {
    session_id: asString(raw.session_id) || undefined,
    // Render `answer` first (the runtime's primary field), fall back to `reply`.
    reply: asString(raw.answer) || asString(raw.reply),
    detected_state: asString(raw.detected_state, "neutral"),
    companion_state: normalizeCompanionState(raw.companion_state),
    mode: asString(raw.mode, "Check-in Mode"),
    goal_understanding: asString(raw.goal_understanding),
    micro_task_plan: planFromTask,
    start_button_label: asString(raw.start_button_label, "Start Session"),
    check_in_message: asString(raw.check_in_message),
    check_in_options:
      checkInOptions.length > 0
        ? checkInOptions
        : ["Done", "Partly done", "I got stuck"],
    memory_update: asString(raw.memory_update),
    memory,
    trace,
    fallback_used: Boolean(raw.fallback_used),
    runtime_source: asString(raw.runtime_source) || "openai",
    micro_task: microTask,
  };
}

function buildLocalFallback(input: SendChatTurnInput): ChatResult {
  const result = generateChatResult(input.scenario, input.message);
  // Keep session continuity + mark that the local mock produced this turn.
  return {
    ...result,
    session_id: input.sessionId ?? result.session_id,
    fallback_used: true,
    runtime_source: "mock",
  };
}

/**
 * Send one chat turn to the live runtime, with the local mock as an automatic
 * fallback on ANY failure (network error, non-2xx, or parse error). The backend
 * being offline is an expected condition, not an error the user should ever see.
 */
export async function sendChatTurn(
  input: SendChatTurnInput,
): Promise<ChatResult> {
  const history = input.history
    .slice(-6)
    .map((msg) => ({
      role: msg.role === "companion" ? ("assistant" as const) : ("user" as const),
      content: msg.content.slice(0, 500),
    }));

  const body = {
    ...(input.sessionId ? { session_id: input.sessionId } : {}),
    scenario: input.scenario,
    message: input.message,
    channel: input.channel,
    tone: input.tone ?? undefined,
    use_case: input.use_case ?? undefined,
    role: input.role ?? undefined,
    companion: input.companion,
    history,
  };

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Runtime responded ${response.status}`);
    const data = (await response.json()) as Record<string, unknown>;
    const mapped = mapRuntimeResponse(data);
    // A completely empty reply is treated as a failure so the demo never
    // renders a blank companion turn.
    if (!mapped.reply.trim()) throw new Error("Runtime returned an empty reply");
    return mapped;
  } catch {
    return buildLocalFallback(input);
  }
}
