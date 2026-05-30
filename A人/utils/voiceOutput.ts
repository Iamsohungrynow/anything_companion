// ============================================================
// Voice Output (Text-to-Speech) Utilities
// ============================================================
// Session-locked voice: once selected, stays consistent
// Progressive enhancement - works without TTS support
// Person C owns voice interaction
// ============================================================

import { Scenario } from '../index';

interface VoiceConfig {
  rate: number;
  pitch: number;
  volume: number;
}

let lockedVoiceName: string | null = null;
let lockedScenario: Scenario | null = null;

const voiceSelectionPerScenario: Record<Scenario, { voiceName: string; config: VoiceConfig }> = {
  study: {
    voiceName: 'Samantha', // Warm, encouraging
    config: { rate: 0.95, pitch: 1.1, volume: 0.8 },
  },
  acg: {
    voiceName: 'Tanya', // Energetic, playful
    config: { rate: 1.0, pitch: 1.3, volume: 0.85 },
  },
  pet: {
    voiceName: 'Amber', // Gentle, caring
    config: { rate: 0.9, pitch: 1.2, volume: 0.8 },
  },
};

export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window;
}

export function initVoiceSession(scenario: Scenario) {
  lockedScenario = scenario;
  lockedVoiceName = voiceSelectionPerScenario[scenario].voiceName;
}

export function resetVoiceSession() {
  lockedVoiceName = null;
  lockedScenario = null;
  window.speechSynthesis.cancel();
}

export function getLockedVoiceName(): string {
  return lockedVoiceName ?? 'Default';
}

export function speakText(text: string, scenario: Scenario, onEnd?: () => void) {
  if (!isSpeechSynthesisSupported()) return;

  const synth = window.speechSynthesis;
  synth.cancel(); // Cancel any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  const config = voiceSelectionPerScenario[scenario].config;

  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  utterance.volume = config.volume;

  // Try to use locked voice if available
  if (lockedVoiceName) {
    const voices = synth.getVoices();
    const voice = voices.find(v => v.name.includes(lockedVoiceName));
    if (voice) utterance.voice = voice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  synth.speak(utterance);
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
