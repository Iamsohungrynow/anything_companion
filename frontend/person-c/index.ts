// ============================================================
// Core type definitions for NextStep Companion
// ============================================================

export type Scenario = 'study' | 'acg' | 'pet';

export type AppStep = 'scenario' | 'setup' | 'upload' | 'companion' | 'chat' | 'video' | 'result';

// ------ Setup: Tone & Use Case -----------------------------------------------

export type Tone =
  | 'soft_supportive'   // 温柔支持型
  | 'short_direct'      // 简短直接型
  | 'cute_playful'      // 可爱活泼型
  | 'coach_like'        // 教练型
  | 'friend_like';      // 朋友型

export type UseCase =
  | 'study'             // 帮我学习
  | 'work'              // 帮我工作
  | 'light_support'     // 轻情绪支持
  | 'pet_companionship' // 宠物陪伴
  | 'routine';          // 提醒与日程

export type CompanionRole =
  | 'study_companion'        // Study companion
  | 'emotional_support'      // Emotional support buddy
  | 'memory_keeper'          // Memory keeper
  | 'daily_reminder';        // Daily reminder pet

export interface SetupProfile {
  tone: Tone;
  use_case: UseCase;
  role: CompanionRole;
}

// ------ Companion Card -------------------------------------------------------
// Modify companion profiles in: src/data/companions.ts
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
  emoji?: string;        // visual avatar fallback
  accentColor?: string;  // tailwind color class
  bgGradient?: string;   // tailwind gradient class
}

// ------ Chat -----------------------------------------------------------------
export interface ChatMessage {
  id: string;
  role: 'user' | 'companion';
  content: string;
  timestamp: Date;
}

// ------ Chat Result (matches B's RuntimeResponse contract) -------------------
// Modify mock in: src/utils/generateChatResult.ts
// Replace with real API call when B's backend is ready
export interface MicroTask {
  label: string;
  duration_minutes: number;
  done: boolean;
}

export interface TraceStep {
  step: string;
  status: 'complete' | 'fallback';
  summary: string;
}

export interface ChatResult {
  session_id?: string;
  reply: string;
  detected_state: 'avoidance' | 'overwhelmed' | 'low_motivation' | 'ready_to_focus' | 'stuck' | 'recovery_break_needed' | 'neutral';
  companion_state: 'idle' | 'happy' | 'thinking' | 'encouraging' | 'focused' | 'resting' | 'concerned';
  mode: 'Encourage Mode' | 'Study Sprint Mode' | 'Check-in Mode' | 'Routine Mode' | 'Companion Mode' | 'Focus Mode';
  goal_understanding: string;
  micro_task_plan: MicroTask[];
  start_button_label: string;
  check_in_message: string;
  check_in_options: ['Done', 'Partly done', 'I got stuck'];
  memory_update: string;
  memory: Partial<MemorySnapshot>;
  trace: TraceStep[];
  fallback_used: boolean;
  // legacy compat
  micro_task?: string[];
}

// ------ Memory ---------------------------------------------------------------
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
    result: 'done' | 'partly_done' | 'stuck';
  }>;
  latest_memory_update: string;
  updated_at: string;
}

// ------ Scenario Meta --------------------------------------------------------
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
