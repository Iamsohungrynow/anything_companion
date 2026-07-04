"use client";

// ============================================================
// VIDEO COMPANION MODE - light animated display
// ============================================================
import { useEffect, useState } from "react";
import {
  ChatMessage,
  ChatResult,
  CompanionCard,
  Scenario,
} from "../shared/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { demoCopy } from "@/lib/i18n/demo";

interface Props {
  companion: CompanionCard;
  scenario?: Scenario;
  messages: ChatMessage[];
  lastResult: ChatResult | null;
  onChatMode?: () => void;
  onBackToChat?: () => void;
  onViewMemory?: () => void;
  onAddMessage?: (msg: ChatMessage) => void;
  onChatResult?: (result: ChatResult, userMessage: string) => void;
}

const stateEmojis: Record<string, string> = {
  idle: "😊",
  happy: "😄",
  thinking: "🤔",
  encouraging: "💪",
  focused: "🎯",
  resting: "😌",
  concerned: "😟",
};

const stateBackgrounds: Record<string, string> = {
  idle: "from-peach-100 to-peach-200",
  happy: "from-peach-200 to-peach-300",
  thinking: "from-peach-100 to-rose-soft",
  encouraging: "from-rose-soft to-peach-200",
  focused: "from-peach-200 to-peach-300",
  resting: "from-rose-soft to-peach-100",
  concerned: "from-rose-soft to-peach-200",
};

export default function VideoCompanionMode({
  companion,
  messages,
  lastResult,
  onChatMode,
  onBackToChat,
  onViewMemory,
}: Props) {
  const { locale } = useLocale();
  const t = demoCopy[locale];
  const [pulseScale, setPulseScale] = useState(1);
  const companionState = lastResult?.companion_state ?? "idle";
  const bgClass = stateBackgrounds[companionState] ?? "from-peach-100 to-peach-200";
  const handleBackToChat = onChatMode ?? onBackToChat;
  const stateLabel = t.states[companionState]?.label ?? companionState;
  const modeLabel = lastResult ? t.modes[lastResult.mode] ?? lastResult.mode : "";

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.1 : 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`flex min-h-[80vh] flex-col items-center justify-center bg-gradient-to-br ${bgClass} p-6 transition-all duration-500`}
    >
      {/* Header */}
      <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-plum">
          {companion.name}
        </h1>
        <button
          onClick={handleBackToChat}
          className="rounded-card border border-peach-200 bg-white/70 px-4 py-2 text-sm font-bold text-plum shadow-md transition-all hover:bg-white"
        >
          ← {t.video.backToChat}
        </button>
      </div>

      {/* Main companion display */}
      <div className="flex flex-col items-center gap-8">
        <div
          className="text-9xl transition-transform duration-500 ease-in-out"
          style={{ transform: `scale(${pulseScale})` }}
        >
          {stateEmojis[companionState] ?? "😊"}
        </div>

        <div className="space-y-2 text-center">
          <p className="font-display text-3xl font-bold text-plum">
            {companion.name}
          </p>
          <p className="text-lg italic text-plum-soft">
            &quot;{companion.personality.join(", ")}&quot;
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-plum">
              {stateLabel}
            </span>
            {lastResult && (
              <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-coral-deep">
                {modeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Latest message */}
        {messages.length > 0 && (
          <div className="max-w-md rounded-blob border border-white/60 bg-white/80 p-6 text-center shadow-lg">
            <p className="text-lg font-medium leading-relaxed text-plum">
              &quot;{messages[messages.length - 1].content}&quot;
            </p>
          </div>
        )}

        {/* Goal preview */}
        {lastResult?.goal_understanding && (
          <div className="max-w-md rounded-blob border-2 border-peach-200 bg-peach-100 p-6 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-coral-deep">
              🎯 {t.video.goal}
            </p>
            <p className="text-sm font-medium text-plum">
              {lastResult.goal_understanding}
            </p>
          </div>
        )}

        {/* Micro-task preview */}
        {lastResult?.micro_task_plan && lastResult.micro_task_plan.length > 0 && (
          <div className="max-w-md rounded-blob border border-peach-200 bg-white/80 p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-plum-faint">
              📋 {t.video.nextSteps}
            </p>
            <div className="space-y-2">
              {lastResult.micro_task_plan.slice(0, 3).map((task, i) => (
                <div key={task.label} className="flex items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-coral font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="font-medium text-plum">{task.label}</span>
                  {task.duration_minutes > 0 && (
                    <span className="ml-auto text-xs text-plum-soft">
                      {task.duration_minutes} {t.task.min}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Memory badge */}
      {lastResult?.memory_update && (
        <div className="absolute bottom-6 left-6 right-6 mx-auto max-w-md rounded-blob border border-rose-soft bg-rose-soft/60 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-coral-deep">
            🧠 {t.video.memory}
          </p>
          <p className="text-sm font-medium italic text-plum">
            &quot;{lastResult.memory_update}&quot;
          </p>
          {onViewMemory && (
            <button
              onClick={onViewMemory}
              className="mt-3 w-full rounded-card bg-coral py-2 text-xs font-bold text-[#3a1f16] shadow-sm transition-colors hover:bg-coral-deep"
            >
              {t.video.viewMemory}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
