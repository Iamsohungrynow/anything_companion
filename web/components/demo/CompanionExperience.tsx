"use client";

// ============================================================
// COMPANION EXPERIENCE - main state machine & page router
// (ported from frontend/companion-experience/app/App.tsx)
// step: scenario -> setup -> upload -> companion -> chat|video -> result
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  AppStep,
  ChatMessage,
  ChatResult,
  CompanionCard,
  CompanionRole,
  Memory,
  Scenario,
  SetupProfile,
  Tone,
  UseCase,
} from "./shared/types";
import { generateCompanionAsync } from "./companion/companionProfiles";
import {
  initTtsAudioUnlock,
  initVoiceSession,
  resetVoiceSession,
} from "./voice/voiceOutput";
import ScenarioSelector from "./onboarding/ScenarioSelector";
import SetupPage from "./onboarding/SetupPage";
import ImageUpload from "./onboarding/ImageUpload";
import CompanionCardPage from "./companion/CompanionCardPage";
import ChatInterface from "./chat/ChatInterface";
import VideoCompanionMode from "./video/VideoCompanionMode";
import MemoryResult from "./memory/MemoryResult";

export default function CompanionExperience() {
  const [step, setStep] = useState<AppStep>("scenario");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [selectedRole, setSelectedRole] = useState<CompanionRole | null>(null);
  const [currentCompanion, setCurrentCompanion] = useState<CompanionCard | null>(
    null,
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lastChatResult, setLastChatResult] = useState<ChatResult | null>(null);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Register the one-time gesture listeners that unlock Web Audio playback.
  useEffect(() => {
    initTtsAudioUnlock();
  }, []);

  // Lock the TTS voice when a scenario is chosen; reset on home.
  useEffect(() => {
    if (selectedScenario) initVoiceSession(selectedScenario);
    else resetVoiceSession();
  }, [selectedScenario]);

  const handleScenarioSelect = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setStep("setup");
  }, []);

  const handleSetupComplete = useCallback((profile: SetupProfile) => {
    setSelectedTone(profile.tone);
    setSelectedUseCase(profile.use_case);
    setSelectedRole(profile.role);
    setStep("upload");
  }, []);

  const handleImageAndGenerate = useCallback(
    async (imageUrl: string | null) => {
      if (!selectedScenario) return;
      const companion = await generateCompanionAsync(
        selectedScenario,
        imageUrl ?? undefined,
      );
      if (selectedTone) companion.tone = selectedTone;
      if (selectedUseCase) companion.use_case = selectedUseCase;
      if (selectedRole) companion.role = selectedRole;
      setCurrentCompanion(companion);
      setChatMessages([]);
      setLastChatResult(null);
      setMemory(null);
      setSessionId(null);
      setStep("companion");
    },
    [selectedScenario, selectedTone, selectedUseCase, selectedRole],
  );

  const handleStartChat = useCallback(() => setStep("chat"), []);

  const handleAddMessage = useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  }, []);

  const handleChatResult = useCallback(
    (result: ChatResult, userMessage: string) => {
      setLastChatResult(result);
      setMemory({
        current_companion: currentCompanion?.name ?? "",
        last_goal:
          userMessage || result.memory?.recent_goals?.[0] || "Start a session",
        preferred_task_length:
          result.mode === "Encourage Mode"
            ? "10-minute sprint"
            : result.mode === "Study Sprint Mode"
              ? "25-minute Pomodoro"
              : result.mode === "Routine Mode"
                ? "Short break"
                : "Flexible",
        recent_mode: result.mode,
        memory_update: result.memory_update,
      });
    },
    [currentCompanion],
  );

  const handleSessionId = useCallback((id: string) => setSessionId(id), []);
  const handleViewMemory = useCallback(() => setStep("result"), []);
  const handleVideoMode = useCallback(() => setStep("video"), []);
  const handleChatMode = useCallback(() => setStep("chat"), []);

  const resetAll = useCallback(() => {
    setSelectedScenario(null);
    setSelectedTone(null);
    setSelectedUseCase(null);
    setSelectedRole(null);
    setCurrentCompanion(null);
    setChatMessages([]);
    setLastChatResult(null);
    setMemory(null);
    setSessionId(null);
    setStep("scenario");
  }, []);

  const safeMemory: Memory = memory ?? {
    current_companion: currentCompanion?.name ?? "Companion",
    last_goal: "Starting a session",
    preferred_task_length: "10-minute sprint",
    recent_mode: lastChatResult?.mode ?? "Check-in Mode",
    memory_update:
      lastChatResult?.memory_update ?? "First session, building baseline.",
  };

  const safeChatResult: ChatResult = lastChatResult ?? {
    reply: "",
    detected_state: "neutral",
    companion_state: "idle",
    mode: "Check-in Mode",
    goal_understanding: "",
    micro_task_plan: [],
    start_button_label: "Start Session",
    check_in_message: "Let me know how it goes!",
    check_in_options: ["Done", "Partly done", "I got stuck"],
    memory_update: "First session, building baseline.",
    memory: {},
    trace: [],
    fallback_used: false,
    micro_task: ["Start your session", "Take it one step at a time"],
  };

  const progressWidth =
    step === "setup"
      ? "15%"
      : step === "upload"
        ? "30%"
        : step === "companion"
          ? "50%"
          : step === "chat"
            ? "70%"
            : step === "result"
              ? "100%"
              : "0%";

  return (
    <div className="min-h-[80vh]">
      {/* Progress bar (hidden on scenario + video) */}
      {step !== "scenario" && step !== "video" && (
        <div className="fixed left-0 right-0 top-[60px] z-40 h-1 bg-peach-100">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: progressWidth,
              background: "linear-gradient(90deg,#c9572f,#e0714a,#eea79c)",
            }}
          />
        </div>
      )}

      {step === "scenario" && (
        <ScenarioSelector onSelect={handleScenarioSelect} />
      )}

      {step === "setup" && selectedScenario && (
        <SetupPage
          scenario={selectedScenario}
          onComplete={handleSetupComplete}
          onBack={() => setStep("scenario")}
        />
      )}

      {step === "upload" && selectedScenario && (
        <ImageUpload
          scenario={selectedScenario}
          onImageSelected={handleImageAndGenerate}
          onBack={() => setStep("setup")}
        />
      )}

      {step === "companion" && currentCompanion && (
        <CompanionCardPage
          companion={currentCompanion}
          onStartChat={handleStartChat}
          onBack={() => setStep("upload")}
        />
      )}

      {step === "chat" && currentCompanion && selectedScenario && (
        <ChatInterface
          companion={currentCompanion}
          scenario={selectedScenario}
          tone={selectedTone}
          useCase={selectedUseCase}
          role={selectedRole}
          messages={chatMessages}
          onAddMessage={handleAddMessage}
          onChatResult={handleChatResult}
          lastResult={lastChatResult}
          sessionId={sessionId}
          onSessionId={handleSessionId}
          onViewMemory={handleViewMemory}
          onVideoMode={handleVideoMode}
        />
      )}

      {step === "video" && currentCompanion && selectedScenario && (
        <VideoCompanionMode
          companion={currentCompanion}
          scenario={selectedScenario}
          messages={chatMessages}
          lastResult={lastChatResult}
          onChatMode={handleChatMode}
          onViewMemory={handleViewMemory}
        />
      )}

      {step === "result" && currentCompanion && selectedScenario && (
        <MemoryResult
          companion={currentCompanion}
          scenario={selectedScenario}
          lastResult={safeChatResult}
          memory={safeMemory}
          onHome={resetAll}
          onTryAnother={resetAll}
        />
      )}
    </div>
  );
}
