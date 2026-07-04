// ============================================================
// Core type definitions for the Yorimi companion demo
// (ported from frontend/companion-experience/shared/types.ts)
// Pure module: no "use client" directive needed.
// ============================================================

export type Scenario = "study" | "acg" | "pet";

export type AppStep =
  | "scenario"
  | "setup"
  | "upload"
  | "companion"
  | "chat"
  | "video"
  | "result";

// ------ Setup: Tone & Use Case ----------------------------------------------

export type Tone =
  | "soft_supportive"
  | "short_direct"
  | "cute_playful"
  | "coach_like"
  | "friend_like";

export type UseCase =
  | "study"
  | "work"
  | "light_support"
  | "pet_companionship"
  | "routine";

export type CompanionRole =
  | "study_companion"
  | "emotional_support"
  | "memory_keeper"
  | "daily_reminder";

export interface SetupProfile {
  tone: Tone;
  use_case: UseCase;
  role: CompanionRole;
}

// ------ Companion Card ------------------------------------------------------
export interface CompanionCard {
  name: string;
  type: string;
  personality: string[];
  tone: Tone;
  use_case: UseCase;
  role?: CompanionRole;
  backstory: string;
  visual_style: string;
  interaction_style: string;
  scenario: Scenario;
  imageUrl?: string;
  emoji?: string;
  accentColor?: string;
  bgGradient?: string;
}

// ------ Chat ----------------------------------------------------------------
export interface ChatMessage {
  id: string;
  role: "user" | "companion";
  content: string;
  timestamp: Date;
}

// ------ Chat Result (matches the runtime RuntimeResponse contract) ----------
export interface MicroTask {
  label: string;
  duration_minutes: number;
  done: boolean;
}

export interface TraceStep {
  step: string;
  status: "complete" | "fallback" | string;
  summary: string;
}

// The set of avatar/companion reaction states the UI knows how to render.
export type CompanionState =
  | "idle"
  | "happy"
  | "thinking"
  | "encouraging"
  | "focused"
  | "resting"
  | "concerned";

// Known modes kept for autocomplete; the runtime may emit other mode strings,
// so the `(string & {})` member keeps the type open while preserving literals.
export type ChatMode =
  | "Encourage Mode"
  | "Study Sprint Mode"
  | "Check-in Mode"
  | "Routine Mode"
  | "Companion Mode"
  | "Focus Mode"
  | (string & {});

export type DetectedState =
  | "avoidance"
  | "overwhelmed"
  | "low_motivation"
  | "ready_to_focus"
  | "stuck"
  | "recovery_break_needed"
  | "neutral"
  | (string & {});

export interface ChatResult {
  session_id?: string;
  reply: string;
  detected_state: DetectedState;
  companion_state: CompanionState;
  mode: ChatMode;
  goal_understanding: string;
  micro_task_plan: MicroTask[];
  start_button_label: string;
  check_in_message: string;
  check_in_options: string[];
  memory_update: string;
  memory: Partial<MemorySnapshot>;
  trace: TraceStep[];
  fallback_used: boolean;
  runtime_source?: string;
  // legacy compat
  micro_task?: string[];
}

// ------ Memory --------------------------------------------------------------
export interface Memory {
  current_companion: string;
  last_goal: string;
  preferred_task_length: string;
  recent_mode: string;
  memory_update: string;
}

export interface MemorySnapshot {
  user_name?: string;
  current_companion: string;
  companion_settings?: CompanionCard;
  preferred_mode: string;
  preferred_task_length: string;
  recent_goals: string[];
  completed_micro_tasks: string[];
  check_in_history: Array<{
    date: string;
    goal: string;
    result: "done" | "partly_done" | "stuck";
  }>;
  latest_memory_update: string;
  updated_at: string;
}

// ------ Scenario Meta -------------------------------------------------------
export interface ScenarioMeta {
  id: Scenario;
  title: string;
  description: string;
  icon: string;
  defaultImages: DefaultImageOption[];
}

export interface DefaultImageOption {
  id: string;
  label: string;
  emoji: string;
  url: string;
}
