// ============================================================
// APP.TSX — Main state machine & page router
// ============================================================
// App state (no external library needed):
//   step:              which page is active
//   selectedScenario:  'study' | 'acg' | 'pet'
//   selectedImage:     uploaded image as base64 data URL
//   currentCompanion:  generated companion profile
//   chatMessages:      chat history
//   lastChatResult:    last AI-generated chat result
//   memory:            derived memory summary
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  AppStep,
  Scenario,
  Tone,
  UseCase,
  CompanionRole,
  SetupProfile,
  CompanionCard,
  ChatMessage,
  ChatResult,
  Memory,
} from './index';
import { generateCompanionAsync } from './generateCompanion';
import { initVoiceSession, resetVoiceSession } from './utils/voiceOutput';
import ScenarioSelector from './ScenarioSelector';
import SetupPage from './SetupPage';
import ImageUpload from './ImageUpload';
import CompanionCardPage from './CompanionCard';
import ChatInterface from './ChatInterface';
import VideoCompanionMode from './components/VideoCompanionMode';
import MemoryResult from './MemoryResult';

export default function App() {
  // ------ App State -------------------------------------------------------
  const [step, setStep] = useState<AppStep>('scenario');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [selectedRole, setSelectedRole] = useState<CompanionRole | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentCompanion, setCurrentCompanion] = useState<CompanionCard | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lastChatResult, setLastChatResult] = useState<ChatResult | null>(null);
  const [memory, setMemory] = useState<Memory | null>(null);

  // ------ Voice Session Lifecycle -----------------------------------------
  // Lock the TTS voice once when a scenario is selected, reset on home
  useEffect(() => {
    if (selectedScenario) {
      initVoiceSession(selectedScenario);
    } else {
      resetVoiceSession();
    }
  }, [selectedScenario]);

  // ------ Handlers --------------------------------------------------------

  const handleScenarioSelect = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setStep('setup');
  }, []);

  const handleSetupComplete = useCallback((profile: SetupProfile) => {
    setSelectedTone(profile.tone);
    setSelectedUseCase(profile.use_case);
    setSelectedRole(profile.role);
    setStep('upload');
  }, []);

  // Fix: include selectedTone and selectedUseCase in deps to avoid stale closure
  const handleImageAndGenerate = useCallback(async (imageUrl: string | null) => {
    if (!selectedScenario) return;
    setSelectedImage(imageUrl);
    const companion = await generateCompanionAsync(selectedScenario, imageUrl ?? undefined);
    // Stamp the setup profile onto the companion card
    if (selectedTone)    companion.tone     = selectedTone;
    if (selectedUseCase) companion.use_case = selectedUseCase;
    if (selectedRole)    companion.role     = selectedRole;
    setCurrentCompanion(companion);
    setChatMessages([]);
    setLastChatResult(null);
    setMemory(null);
    setStep('companion');
  }, [selectedScenario, selectedTone, selectedUseCase, selectedRole]);

  const handleStartChat = useCallback(() => {
    setStep('chat');
  }, []);

  const handleAddMessage = useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  }, []);

  // Fix: accept userMessage directly — do not rely on async chatMessages state
  const handleChatResult = useCallback((result: ChatResult, userMessage: string) => {
    setLastChatResult(result);
    setMemory({
      current_companion: currentCompanion?.name ?? '',
      last_goal: userMessage || result.memory?.recent_goals?.[0] || 'Start a session',
      preferred_task_length:
        result.mode === 'Encourage Mode'
          ? '10-minute sprint'
          : result.mode === 'Study Sprint Mode'
          ? '25-minute Pomodoro'
          : result.mode === 'Routine Mode'
          ? 'Short break'
          : 'Flexible',
      recent_mode: result.mode,
      memory_update: result.memory_update,
    });
  }, [currentCompanion]);

  const handleViewMemory = useCallback(() => {
    setStep('result');
  }, []);

  const handleVideoMode = useCallback(() => {
    setStep('video');
  }, []);

  const handleChatMode = useCallback(() => {
    setStep('chat');
  }, []);

  const handleHome = useCallback(() => {
    setSelectedScenario(null);
    setSelectedTone(null);
    setSelectedUseCase(null);
    setSelectedRole(null);
    setSelectedImage(null);
    setCurrentCompanion(null);
    setChatMessages([]);
    setLastChatResult(null);
    setMemory(null);
    setStep('scenario');
  }, []);

  const handleTryAnother = useCallback(() => {
    setSelectedScenario(null);
    setSelectedTone(null);
    setSelectedUseCase(null);
    setSelectedRole(null);
    setSelectedImage(null);
    setCurrentCompanion(null);
    setChatMessages([]);
    setLastChatResult(null);
    setMemory(null);
    setStep('scenario');
  }, []);

  // Fallback memory when viewing result page without a full session
  const safeMemory: Memory = memory ?? {
    current_companion: currentCompanion?.name ?? 'Companion',
    last_goal: 'Starting a session',
    preferred_task_length: '10-minute sprint',
    recent_mode: lastChatResult?.mode ?? 'Check-in Mode',
    memory_update: lastChatResult?.memory_update ?? 'First session — building baseline.',
  };

  const safeChatResult: ChatResult = lastChatResult ?? {
    reply: '',
    detected_state: 'neutral',
    companion_state: 'idle',
    mode: 'Check-in Mode',
    goal_understanding: '',
    micro_task_plan: [],
    start_button_label: 'Start Session',
    check_in_message: 'Let me know how it goes!',
    check_in_options: ['Done', 'Partly done', 'I got stuck'],
    memory_update: 'First session — building baseline.',
    memory: {},
    trace: [],
    fallback_used: false,
    micro_task: ['Start your session', 'Take it one step at a time'],
  };

  // ------ Render ----------------------------------------------------------
  return (
    <div className="min-h-screen">
      {/* Progress Indicator (top bar) — hidden in video mode */}
      {step !== 'scenario' && step !== 'video' && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 transition-all duration-500"
            style={{
              width:
                step === 'setup'     ? '15%' :
                step === 'upload'    ? '30%' :
                step === 'companion' ? '50%' :
                step === 'chat'      ? '70%' :
                step === 'result'    ? '100%' : '0%',
            }}
          />
        </div>
      )}

      {/* Pages */}
      {step === 'scenario' && (
        <ScenarioSelector onSelect={handleScenarioSelect} />
      )}

      {step === 'setup' && selectedScenario && (
        <SetupPage
          scenario={selectedScenario}
          onComplete={handleSetupComplete}
          onBack={() => setStep('scenario')}
        />
      )}

      {step === 'upload' && selectedScenario && (
        <ImageUpload
          scenario={selectedScenario}
          onGenerate={handleImageAndGenerate}
          onBack={() => setStep('setup')}
        />
      )}

      {step === 'companion' && currentCompanion && (
        <CompanionCardPage
          companion={currentCompanion}
          onStartChat={handleStartChat}
          onBack={() => setStep('upload')}
        />
      )}

      {step === 'chat' && currentCompanion && selectedScenario && (
        <ChatInterface
          companion={currentCompanion}
          scenario={selectedScenario}
          messages={chatMessages}
          onAddMessage={handleAddMessage}
          onChatResult={handleChatResult}
          lastResult={lastChatResult}
          onViewMemory={handleViewMemory}
          onVideoMode={handleVideoMode}
        />
      )}

      {step === 'video' && currentCompanion && selectedScenario && (
        <VideoCompanionMode
          companion={currentCompanion}
          scenario={selectedScenario}
          messages={chatMessages}
          onAddMessage={handleAddMessage}
          onChatResult={handleChatResult}
          lastResult={lastChatResult}
          onChatMode={handleChatMode}
          onViewMemory={handleViewMemory}
        />
      )}

      {step === 'result' && currentCompanion && selectedScenario && (
        <MemoryResult
          companion={currentCompanion}
          scenario={selectedScenario}
          lastResult={safeChatResult}
          memory={safeMemory}
          onHome={handleHome}
          onTryAnother={handleTryAnother}
        />
      )}

      {/* Fallback: should never render, but safety net */}
      {!['scenario', 'setup', 'upload', 'companion', 'chat', 'video', 'result'].includes(step) && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Something went wrong. Let's start over.</p>
            <button
              onClick={handleHome}
              className="px-6 py-3 bg-amber-400 text-white rounded-xl font-bold"
            >
              Go Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
