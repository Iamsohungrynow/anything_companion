"use client";

// ============================================================
// PAGE 4: CHAT INTERFACE
// ============================================================
// Live runtime call: components/demo/lib/runtimeClient.ts
//   (POST /api/chat, automatic local mock fallback)
// Voice input:  ../voice/useVoiceInput (browser SpeechRecognition primary)
// Voice output: ../voice/voiceOutput   (POST /api/tts, speechSynthesis fallback)
// ============================================================
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ChatMessage,
  ChatResult,
  CompanionCard,
  CompanionRole,
  Scenario,
  Tone,
  UseCase,
} from "../shared/types";
import { sendChatTurn } from "../lib/runtimeClient";
import {
  getLockedVoiceName,
  isSpeechSynthesisSupported,
  setSpeechLocale,
  speakText,
  stopSpeaking,
} from "../voice/voiceOutput";
import { useVoiceInput } from "../voice/useVoiceInput";
import Pseudo3DPreview from "../companion/Pseudo3DPreview";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { demoCopy, type DemoCopy } from "@/lib/i18n/demo";

interface Props {
  companion: CompanionCard;
  scenario: Scenario;
  tone: Tone | null;
  useCase: UseCase | null;
  role: CompanionRole | null;
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onChatResult: (result: ChatResult, userMessage: string) => void;
  lastResult: ChatResult | null;
  sessionId: string | null;
  onSessionId: (id: string) => void;
  onViewMemory: () => void;
  onVideoMode?: () => void;
}

const accentMap: Record<
  Scenario,
  { bubble: string; ring: string; gradient: string }
> = {
  study: {
    bubble: "bg-peach-100 border-peach-200",
    ring: "focus:ring-coral-soft",
    gradient: "linear-gradient(135deg,#e0714a,#eb9a70)",
  },
  acg: {
    bubble: "bg-rose-soft/50 border-rose-soft",
    ring: "focus:ring-rose",
    gradient: "linear-gradient(135deg,#eea79c,#f6cabf)",
  },
  pet: {
    bubble: "bg-peach-100 border-peach-200",
    ring: "focus:ring-coral-soft",
    gradient: "linear-gradient(135deg,#eb9a70,#eea79c)",
  },
};

const modeColors: Record<string, { bg: string; text: string; dot: string }> = {
  "Encourage Mode": { bg: "bg-peach-100 border-peach-200", text: "text-coral-deep", dot: "bg-coral" },
  "Focus Mode": { bg: "bg-peach-100 border-peach-200", text: "text-coral-deep", dot: "bg-coral-deep" },
  "Companion Mode": { bg: "bg-rose-soft/40 border-rose-soft", text: "text-coral-deep", dot: "bg-rose" },
  "Companion Presence Mode": { bg: "bg-rose-soft/40 border-rose-soft", text: "text-coral-deep", dot: "bg-rose" },
  "Routine Mode": { bg: "bg-peach-100 border-peach-200", text: "text-coral-deep", dot: "bg-coral-soft" },
  "Study Sprint Mode": { bg: "bg-peach-100 border-peach-200", text: "text-coral-deep", dot: "bg-coral" },
  "Check-in Mode": { bg: "bg-peach-100 border-peach-200", text: "text-coral-deep", dot: "bg-coral-soft" },
};
const defaultModeStyle = {
  bg: "bg-peach-100 border-peach-200",
  text: "text-plum-soft",
  dot: "bg-plum-faint",
};

const scenarioDefaultMode: Record<Scenario, string> = {
  study: "Check-in Mode",
  acg: "Companion Mode",
  pet: "Routine Mode",
};

const stateVisual: Record<string, { emoji: string; bg: string }> = {
  idle: { emoji: "😊", bg: "bg-peach-100" },
  happy: { emoji: "😄", bg: "bg-peach-200" },
  thinking: { emoji: "🤔", bg: "bg-peach-100" },
  encouraging: { emoji: "💪", bg: "bg-rose-soft/50" },
  focused: { emoji: "🎯", bg: "bg-peach-200" },
  resting: { emoji: "😌", bg: "bg-rose-soft/40" },
  concerned: { emoji: "😟", bg: "bg-rose-soft/60" },
};

function getSprintDurationMinutes(result: ChatResult): number {
  const labelMatch = result.start_button_label.match(/(\d+)\s*-\s*min|(\d+)\s*min/i);
  const labelMinutes = Number(labelMatch?.[1] ?? labelMatch?.[2]);
  if (Number.isFinite(labelMinutes) && labelMinutes > 0) return labelMinutes;
  const taskTotal = result.micro_task_plan.reduce(
    (sum, task) => sum + Math.max(0, task.duration_minutes),
    0,
  );
  return taskTotal > 0 ? taskTotal : 10;
}

// ── Countdown Timer ─────────────────────────────────────────────────────────
function CountdownTimer({
  durationMinutes,
  onComplete,
  t,
}: {
  durationMinutes: number;
  onComplete: () => void;
  t: DemoCopy;
}) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          onComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onComplete]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="mt-4 rounded-card border border-peach-200 bg-peach-100 p-4 text-center">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-coral-deep">
        ⏱️ {t.task.sprintTimer}
      </p>
      <div className="mb-3 font-display text-5xl font-bold text-coral-deep">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-peach-200">
        <div
          className="h-full bg-coral transition-all"
          style={{ width: `${(secondsLeft / (durationMinutes * 60)) * 100}%` }}
        />
      </div>
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="mt-3 text-xs font-bold text-coral-deep hover:text-coral"
      >
        {isRunning ? `⏸ ${t.task.pause}` : `▶ ${t.task.resume}`}
      </button>
    </div>
  );
}

// ── Companion State Indicator ───────────────────────────────────────────────
function CompanionStateIndicator({ state, t }: { state: string; t: DemoCopy }) {
  const visual = stateVisual[state] ?? stateVisual.idle;
  const copy = t.states[state as keyof DemoCopy["states"]] ?? t.states.idle;
  return (
    <div className={`rounded-card border border-peach-200 p-3 ${visual.bg}`}>
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl">{visual.emoji}</span>
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-plum">
            {copy.label}
          </p>
          <p className="text-xs text-plum-soft">{copy.desc}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-24 flex-shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-plum-faint">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

// ── Right-side task panel ───────────────────────────────────────────────────
function TaskSupportPanel({
  result,
  scenario,
  isTyping,
  t,
}: {
  result: ChatResult | null;
  scenario: Scenario;
  isTyping: boolean;
  t: DemoCopy;
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [sprintActive, setSprintActive] = useState(false);
  const [checkInDone, setCheckInDone] = useState<string | null>(null);
  const [timerComplete, setTimerComplete] = useState(false);
  const toggle = (i: number) => setChecked((p) => ({ ...p, [i]: !p[i] }));

  useEffect(() => {
    setChecked({});
    setSprintActive(false);
    setCheckInDone(null);
    setTimerComplete(false);
  }, [result?.reply]);

  const data: ChatResult = result ?? {
    reply: "",
    detected_state: "neutral",
    companion_state: "idle",
    mode: scenarioDefaultMode[scenario],
    goal_understanding: "",
    micro_task_plan: [],
    start_button_label: "Start Session",
    check_in_message: "",
    check_in_options: ["Done", "Partly done", "I got stuck"],
    memory_update: "",
    memory: {},
    trace: [],
    fallback_used: false,
  };
  const ms = modeColors[data.mode] ?? defaultModeStyle;
  const modeLabel = t.modes[data.mode] ?? data.mode;
  const tasks = data.micro_task_plan ?? [];
  const doneCount = Object.values(checked).filter(Boolean).length;
  const sprintMinutes = getSprintDurationMinutes(data);
  const checkInLabels = t.checkInOptions as Record<string, string>;

  return (
    <div className="space-y-3">
      {/* Companion state */}
      {data.companion_state && !isTyping && (
        <CompanionStateIndicator state={data.companion_state} t={t} />
      )}

      {/* Adaptive mode panel */}
      <div className={`rounded-card border ${ms.bg} p-4 shadow-sm`}>
        <p className="mb-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-plum-faint">
          <span>⚡</span> {t.task.adaptiveMode}
        </p>
        <div className="space-y-2.5">
          <Row label={t.task.detectedState}>
            <span
              className={`h-2 w-2 flex-shrink-0 rounded-full ${isTyping ? "animate-pulse" : ""} ${ms.dot}`}
            />
            <span className="text-sm font-semibold text-plum">
              {isTyping ? t.task.analyzing : data.detected_state.replace(/_/g, " ")}
            </span>
          </Row>
          <Row label={t.task.activeMode}>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-bold ${ms.bg} ${ms.text}`}
            >
              {isTyping ? "…" : modeLabel}
            </span>
          </Row>
          {tasks.length > 0 && !isTyping && (
            <Row label={t.task.nextAction}>
              <span className="text-sm font-medium leading-snug text-plum-soft">
                {tasks[0].label}
              </span>
            </Row>
          )}
        </div>
      </div>

      {/* Goal understanding */}
      {data.goal_understanding && !isTyping && (
        <div className="rounded-card border border-peach-200 bg-peach-100 p-4 shadow-sm">
          <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-coral-deep">
            <span>🎯</span> {t.task.goalUnderstanding}
          </p>
          <p className="text-sm font-medium leading-relaxed text-plum">
            {data.goal_understanding}
          </p>
        </div>
      )}

      {/* Micro-task plan + sprint */}
      {tasks.length > 0 && (
        <div className="rounded-card border border-peach-200 bg-white p-4 shadow-sm">
          <p className="mb-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-plum-faint">
            <span>📋</span> {t.task.microTaskPlan}
            {doneCount > 0 && (
              <span className="ml-auto rounded-full border border-peach-300 bg-peach-200 px-2 py-0.5 text-[10px] font-bold text-coral-deep">
                {doneCount}/{tasks.length}
              </span>
            )}
          </p>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <button
                key={task.label}
                onClick={() => toggle(i)}
                className={`flex w-full items-center gap-3 rounded-soft p-2.5 text-left transition-all ${
                  checked[i]
                    ? "border border-peach-300 bg-peach-100"
                    : "border border-transparent bg-peach-50 hover:bg-peach-100"
                }`}
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                    checked[i]
                      ? "border-coral bg-coral"
                      : "border-peach-300 bg-white"
                  }`}
                >
                  {checked[i] && (
                    <span className="text-xs font-bold text-white">✓</span>
                  )}
                </span>
                <div className="flex-1">
                  <span
                    className={`text-sm font-medium leading-snug ${
                      checked[i]
                        ? "text-coral-deep line-through"
                        : "text-plum"
                    }`}
                  >
                    {task.label}
                  </span>
                  {task.duration_minutes > 0 && (
                    <span className="ml-2 text-xs text-plum-faint">
                      {task.duration_minutes} {t.task.min}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Sprint button & timer */}
          {!sprintActive ? (
            <button
              onClick={() => setSprintActive(true)}
              className="mt-3 w-full rounded-soft py-2.5 text-sm font-bold text-[#3a1f16] shadow transition-all hover:shadow-md active:scale-95"
              style={{ background: "linear-gradient(135deg,#e0714a,#eb9a70)" }}
            >
              ▶ {data.start_button_label || t.task.startSessionDefault}
            </button>
          ) : timerComplete ? (
            <div className="mt-3 w-full rounded-soft border-2 border-peach-300 bg-peach-100 py-3 text-center">
              <p className="text-sm font-bold text-coral-deep">
                ✓ {t.task.timesUp}
              </p>
              <button
                onClick={() => {
                  setSprintActive(false);
                  setTimerComplete(false);
                }}
                className="mt-2 text-xs font-semibold text-coral-deep hover:text-coral"
              >
                ← {t.task.anotherSprint}
              </button>
            </div>
          ) : (
            <>
              <CountdownTimer
                durationMinutes={sprintMinutes}
                onComplete={() => setTimerComplete(true)}
                t={t}
              />
              <button
                onClick={() => setSprintActive(false)}
                className="mt-3 w-full rounded-soft border border-peach-200 py-2 text-sm font-semibold text-plum-soft transition-colors hover:bg-peach-50"
              >
                ⏹ {t.task.stopSprint}
              </button>
            </>
          )}
        </div>
      )}

      {/* Check-in */}
      {data.check_in_message && (
        <div className="rounded-card border border-peach-200 bg-peach-100 p-4 shadow-sm">
          <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-coral-deep">
            <span>💌</span> {t.task.checkIn}
          </p>
          <p className="mb-3 text-sm font-medium leading-relaxed text-plum">
            {data.check_in_message}
          </p>
          {checkInDone ? (
            <p className="py-1 text-center text-xs font-semibold text-coral-deep">
              {t.task.noted}{" "}
              <span className="italic">
                &quot;{checkInLabels[checkInDone] ?? checkInDone}&quot;
              </span>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(data.check_in_options ?? ["Done", "Partly done", "I got stuck"]).map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() => setCheckInDone(opt)}
                    className="min-w-[70px] flex-1 rounded-soft border border-peach-300 bg-white/70 py-2 text-xs font-bold text-coral-deep transition-colors hover:bg-peach-200"
                  >
                    {checkInLabels[opt] ?? opt}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      )}

      {/* Memory updated */}
      {data.memory_update && result && (
        <div className="rounded-card border border-rose-soft bg-rose-soft/40 p-4 shadow-sm">
          <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-coral-deep">
            <span>🧠</span> {t.task.memoryUpdated}
          </p>
          <p className="text-sm font-medium italic leading-relaxed text-plum">
            &quot;{data.memory_update}&quot;
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ChatInterface({
  companion,
  scenario,
  tone,
  useCase,
  role,
  messages,
  onAddMessage,
  onChatResult,
  lastResult,
  sessionId,
  onSessionId,
  onViewMemory,
  onVideoMode,
}: Props) {
  const { locale } = useLocale();
  const t = demoCopy[locale];
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showDbg, setShowDbg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<"text" | "voice">("text");
  const colors = accentMap[scenario];
  const speechLang = locale === "zh" ? "zh-CN" : "en-US";

  // Gate browser-capability checks behind mount so the first client render
  // matches the server render (avoids hydration mismatches).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleTranscript = (text: string) => {
    channelRef.current = "voice";
    setInputText(text);
  };
  const {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    error: voiceError,
    isSupported: voiceSupportedRaw,
  } = useVoiceInput(handleTranscript, speechLang);

  const ttsSupported = mounted && isSpeechSynthesisSupported();
  const voiceSupported = mounted && voiceSupportedRaw;

  useEffect(() => {
    setSpeechLocale(locale);
  }, [locale]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Seed the welcome message once, in the active locale.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || messages.length > 0) return;
    seededRef.current = true;
    onAddMessage({
      id: "c-welcome",
      role: "companion",
      content: t.chat.welcome[scenario].replace("{name}", companion.name),
      timestamp: new Date(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMessage = text.trim();
    const channel = channelRef.current;
    channelRef.current = "text";
    onAddMessage({
      id: `u-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    });
    setInputText("");
    setIsTyping(true);

    const result = await sendChatTurn({
      sessionId,
      scenario,
      message: userMessage,
      channel,
      tone,
      use_case: useCase,
      role,
      companion,
      history: messages,
    });

    setIsTyping(false);
    if (result.session_id) onSessionId(result.session_id);
    onAddMessage({
      id: `c-${Date.now()}`,
      role: "companion",
      content: result.reply,
      timestamp: new Date(),
    });
    onChatResult(result, userMessage);
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (speakingId === msgId) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      void speakText(text, scenario, () => setSpeakingId(null));
      setSpeakingId(msgId);
    }
  };

  const companionState = lastResult?.companion_state ?? "idle";
  const modeStyle = modeColors[lastResult?.mode ?? ""] ?? defaultModeStyle;
  const headerModeLabel = lastResult
    ? t.modes[lastResult.mode] ?? lastResult.mode
    : "";

  return (
    <div className="flex min-h-[80vh] flex-col lg:flex-row">
      {/* ── Chat column ─────────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-4 py-6">
        {/* Header */}
        <div className="mb-5 flex flex-shrink-0 items-center gap-3 rounded-card border border-peach-200 bg-white/70 p-4 shadow-sm">
          <div className="relative flex-shrink-0">
            <Pseudo3DPreview companion={companion} size="sm" />
            <div
              className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-sm shadow-md ${stateVisual[companionState]?.bg ?? "bg-peach-100"}`}
            >
              {stateVisual[companionState]?.emoji ?? "😊"}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-bold text-plum">
              {companion.name}
            </h2>
            <p className="truncate text-xs text-plum-soft">{companion.type}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="yo-pulse h-2 w-2 rounded-full bg-coral" />
              <span className="text-xs font-semibold text-coral-deep">
                {t.chat.online}
              </span>
              {lastResult && (
                <>
                  <span className="text-plum-faint">·</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${modeStyle.text}`}
                  >
                    {headerModeLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Video mode button */}
          {onVideoMode && (
            <button
              onClick={onVideoMode}
              className={`flex-shrink-0 rounded-soft px-3 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 ${
                scenario === "acg"
                  ? "text-[#3a1f16]"
                  : "border border-peach-200 text-plum-soft hover:bg-peach-50"
              }`}
              style={
                scenario === "acg"
                  ? { background: "linear-gradient(135deg,#eea79c,#f6cabf)" }
                  : undefined
              }
              title={t.chat.video}
            >
              🎬 {t.chat.video}
            </button>
          )}

          <button
            onClick={onViewMemory}
            className="flex-shrink-0 rounded-soft border border-peach-200 px-3 py-2 text-xs font-bold text-plum-faint transition-colors hover:bg-peach-50 hover:text-plum"
            title={t.chat.memoryButton}
          >
            💾
          </button>
        </div>

        {/* Messages */}
        <div className="mb-4 max-h-[440px] min-h-[320px] flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((msg, idx) => {
            const shouldShowModeChange =
              msg.role === "companion" && lastResult && idx > 0;
            return (
              <Fragment key={msg.id}>
                {shouldShowModeChange &&
                  messages[idx - 1]?.role === "user" &&
                  lastResult?.mode && (
                    <div
                      className={`mx-auto rounded-card px-3 py-2 text-center text-xs font-bold ${modeColors[lastResult.mode]?.bg ?? "bg-peach-100"} ${modeColors[lastResult.mode]?.text ?? "text-plum-soft"}`}
                    >
                      🔄 {t.chat.modeChanged}:{" "}
                      {t.modes[lastResult.mode] ?? lastResult.mode}
                    </div>
                  )}
                <div
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  {msg.role === "companion" && (
                    <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 select-none items-center justify-center rounded-full text-sm">
                      {companion.emoji}
                    </div>
                  )}
                  <div
                    className={`flex max-w-[80%] flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-card px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "rounded-tr-sm bg-plum text-white"
                          : `${colors.bubble} rounded-tl-sm border text-plum`
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "companion" && ttsSupported && (
                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
                          speakingId === msg.id
                            ? "bg-peach-200 font-bold text-coral-deep"
                            : "text-plum-faint hover:bg-peach-100 hover:text-plum"
                        }`}
                      >
                        {speakingId === msg.id
                          ? `⏹ ${t.chat.stop}`
                          : `🔊 ${t.chat.play}`}
                      </button>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
          {isTyping && (
            <div className="flex animate-fade-in justify-start">
              <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm">
                {companion.emoji}
              </div>
              <div className={`rounded-card ${colors.bubble} border px-4 py-3 shadow-sm`}>
                <div className="flex h-4 items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 animate-bounce rounded-full bg-plum-faint"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error & interim display */}
        {voiceError && (
          <div className="mb-3 flex animate-pulse items-center gap-2 rounded-soft border border-rose-soft bg-rose-soft/50 px-4 py-2 text-xs text-coral-deep">
            <span>⚠️</span>
            <span>{voiceError}</span>
          </div>
        )}
        {interimTranscript && (
          <div className="mb-2 flex items-center gap-2 rounded-soft border border-peach-200 bg-peach-100 px-3 py-2 text-xs italic text-plum-soft">
            <span className="animate-pulse">🎤</span>
            <span className="flex-1">{interimTranscript}…</span>
          </div>
        )}

        {/* Input area */}
        <div className="flex flex-shrink-0 items-end gap-2">
          {voiceSupported ? (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isTyping}
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-card shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                isListening
                  ? "animate-pulse bg-coral-deep text-white"
                  : "border-2 border-peach-200 bg-white text-plum-soft hover:bg-peach-50"
              }`}
              title={
                isTyping
                  ? t.chat.micWait
                  : isListening
                    ? t.chat.micStop
                    : t.chat.micStart
              }
            >
              {isListening ? "⏹" : "🎤"}
            </button>
          ) : (
            <button
              disabled
              className="flex h-11 w-11 flex-shrink-0 cursor-not-allowed items-center justify-center rounded-card border-2 border-peach-200 bg-peach-100 text-plum-faint"
              title={t.chat.micUnavailable}
            >
              🎤
            </button>
          )}

          <textarea
            value={inputText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              channelRef.current = "text";
              setInputText(e.target.value);
            }}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey && !isTyping) {
                e.preventDefault();
                void sendMessage(inputText);
              }
            }}
            placeholder={t.chat.messagePlaceholderTemplate.replace(
              "{name}",
              companion.name,
            )}
            rows={2}
            disabled={isTyping}
            className={`flex-1 resize-none rounded-card border-2 border-peach-200 bg-white/80 px-4 py-3 text-sm text-plum placeholder-plum-faint transition-all focus:outline-none focus:ring-2 ${colors.ring} disabled:cursor-not-allowed disabled:opacity-50`}
          />

          <button
            onClick={() => void sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-card shadow-md transition-all active:scale-95 ${
              inputText.trim() && !isTyping
                ? "text-[#3a1f16] hover:shadow-lg"
                : "cursor-not-allowed bg-peach-200 text-plum-faint"
            }`}
            style={
              inputText.trim() && !isTyping
                ? { background: colors.gradient }
                : undefined
            }
            title={
              isTyping
                ? t.chat.waitingResponse
                : inputText.trim()
                  ? t.chat.sendMessage
                  : t.chat.typeFirst
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {showDbg && (
          <div className="mt-3 space-y-1 rounded-soft bg-peach-50 p-2 text-center text-[10px] text-plum-faint">
            <p>
              {t.chat.voiceLocked}: {getLockedVoiceName()}
            </p>
            <p>
              {t.chat.messagesLabel}: {messages.length} | {t.chat.typingLabel}:{" "}
              {isTyping ? t.chat.yes : t.chat.no}
            </p>
            <p>
              {t.chat.companionStateLabel}:{" "}
              {lastResult?.companion_state || "idle"}
            </p>
          </div>
        )}
        <button
          onClick={() => setShowDbg((d) => !d)}
          className="mt-1 w-full text-center text-[10px] text-plum-faint transition-colors hover:text-plum-soft"
        >
          {showDbg ? t.chat.hideDebug : `🔍 ${t.chat.debug}`}
        </button>
      </div>

      {/* ── Right sidebar ───────────────────────────────────────────── */}
      <div className="max-h-[600px] flex-shrink-0 space-y-3 overflow-y-auto px-4 pb-6 lg:w-80 lg:overflow-visible lg:pt-6 xl:w-96">
        <TaskSupportPanel
          result={lastResult}
          scenario={scenario}
          isTyping={isTyping}
          t={t}
        />
        {lastResult && (
          <button
            onClick={onViewMemory}
            className="w-full rounded-card py-3 text-sm font-bold text-[#3a1f16] shadow-lg transition-all active:scale-95"
            style={{ background: colors.gradient }}
          >
            📊 {t.chat.memoryButton}
          </button>
        )}
      </div>
    </div>
  );
}
