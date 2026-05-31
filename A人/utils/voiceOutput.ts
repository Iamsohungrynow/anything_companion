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
let speechRunId = 0;
let lockedSpeechVoice: SpeechSynthesisVoice | null | undefined;
let activeTtsAudio: HTMLAudioElement | null = null;
let activeTtsSource: AudioBufferSourceNode | null = null;
let ttsAudioContext: AudioContext | null = null;

const voiceSelectionPerScenario: Record<Scenario, { voiceName: string; config: VoiceConfig }> = {
  study: {
    voiceName: 'Samantha', // Natural female voice on macOS when available
    config: { rate: 0.8, pitch: 0.9, volume: 0.9 },
  },
  acg: {
    voiceName: 'Samantha',
    config: { rate: 0.8, pitch: 0.9, volume: 0.9 },
  },
  pet: {
    voiceName: 'Samantha',
    config: { rate: 0.8, pitch: 0.9, volume: 0.9 },
  },
};

const preferredNaturalVoices = [
  'Samantha',
  'Karen',
  'Moira',
  'Tessa',
  'Serena',
  'Microsoft Jenny',
  'Microsoft Sonia',
  'Microsoft Ava',
  'Google UK English Female',
];

function cleanSpeechText(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[—–]/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSpeechText(text: string): string[] {
  const cleaned = cleanSpeechText(text);
  if (!cleaned) return [];

  const chunks: string[] = [];
  cleaned
    .split(/(?<=[.!?])\s+|,\s+|;\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      if (part.length <= 115) {
        chunks.push(part);
        return;
      }

      const words = part.split(/\s+/);
      let line = '';
      words.forEach((word) => {
        if (`${line} ${word}`.trim().length > 95) {
          if (line) chunks.push(line.trim());
          line = word;
        } else {
          line = `${line} ${word}`.trim();
        }
      });
      if (line) chunks.push(line.trim());
    });

  return chunks;
}

function pauseForChunk(chunk: string, index: number, total: number): number {
  if (index >= total - 1) return 0;
  return /[.!?]$/.test(chunk) ? 420 : 260;
}

function chooseNaturalVoice(voices: SpeechSynthesisVoice[], lockedName: string | null) {
  if (lockedSpeechVoice !== undefined) return lockedSpeechVoice;

  const englishVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('en'));
  if (lockedName) {
    const locked = englishVoices.find((voice) => voice.name.includes(lockedName));
    if (locked) {
      lockedSpeechVoice = locked;
      return lockedSpeechVoice;
    }
  }

  const femaleVoice = preferredNaturalVoices
    .map((name) => englishVoices.find((voice) => voice.name.includes(name)))
    .find(Boolean);
  if (femaleVoice) {
    lockedSpeechVoice = femaleVoice;
    return lockedSpeechVoice;
  }

  return null;
}

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

async function unlockTtsAudio(): Promise<AudioContext | null> {
  try {
    const audioWindow = window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
    const AudioCtx = audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ttsAudioContext) ttsAudioContext = new AudioCtx();
    if (ttsAudioContext.state === 'suspended') await ttsAudioContext.resume();

    const buffer = ttsAudioContext.createBuffer(1, 1, 22050);
    const source = ttsAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(ttsAudioContext.destination);
    source.start(0);
    return ttsAudioContext;
  } catch {
    return null;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlockTtsAudio, { capture: true });
  window.addEventListener('keydown', unlockTtsAudio, { capture: true });
}

export async function speakText(text: string, scenario: Scenario, onEnd?: () => void, voiceWaits = 0) {
  const spokenText = cleanSpeechText(text);
  if (!spokenText) {
    onEnd?.();
    return;
  }

  const runId = ++speechRunId;
  try {
    window.speechSynthesis?.cancel();
    if (activeTtsAudio) {
      activeTtsAudio.pause();
      activeTtsAudio.src = '';
      activeTtsAudio = null;
    }
    if (activeTtsSource) {
      try {
        activeTtsSource.stop(0);
      } catch {
        // Already stopped.
      }
      activeTtsSource = null;
    }

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: spokenText }),
    });
    if (!response.ok) throw new Error('TTS proxy failed');

    const audioWindow = window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
    const AudioCtx = audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio unavailable');
    if (!ttsAudioContext) ttsAudioContext = new AudioCtx();
    if (ttsAudioContext.state === 'suspended') await ttsAudioContext.resume();

    const audioBytes = await response.arrayBuffer();
    const decoded = await ttsAudioContext.decodeAudioData(audioBytes.slice(0));
    if (runId !== speechRunId) return;

    const source = ttsAudioContext.createBufferSource();
    activeTtsSource = source;
    source.buffer = decoded;
    source.connect(ttsAudioContext.destination);
    source.onended = () => {
      if (runId !== speechRunId) return;
      activeTtsSource = null;
      onEnd?.();
    };
    source.start(0);
  } catch {
    onEnd?.();
  }
}

function speakBrowserText(text: string, scenario: Scenario, onEnd?: () => void, voiceWaits = 0, runId = ++speechRunId) {
  if (!isSpeechSynthesisSupported()) return;

  const synth = window.speechSynthesis;
  synth.cancel(); // Cancel any ongoing speech

  const chunks = splitSpeechText(text);
  if (chunks.length === 0) {
    onEnd?.();
    return;
  }

  const config = voiceSelectionPerScenario[scenario].config;
  const voice = chooseNaturalVoice(synth.getVoices(), lockedVoiceName);
  if (!voice && voiceWaits < 12) {
    window.setTimeout(() => speakBrowserText(text, scenario, onEnd, voiceWaits + 1, runId), 150);
    return;
  }

  const speakChunk = (index: number) => {
    if (runId !== speechRunId) return;
    if (index >= chunks.length) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = config.rate;
    utterance.pitch = voice ? config.pitch : 1.04;
    utterance.volume = config.volume;
    if (voice) utterance.voice = voice;

    const next = () => {
      window.setTimeout(() => speakChunk(index + 1), pauseForChunk(chunks[index], index, chunks.length));
    };
    utterance.onend = next;
    utterance.onerror = next;
    synth.speak(utterance);
  };

  speakChunk(0);
}

export function stopSpeaking() {
  speechRunId++;
  if (activeTtsSource) {
    try {
      activeTtsSource.stop(0);
    } catch {
      // Already stopped.
    }
    activeTtsSource = null;
  }
  if (activeTtsAudio) {
    activeTtsAudio.pause();
    activeTtsAudio.src = '';
    activeTtsAudio = null;
  }
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
