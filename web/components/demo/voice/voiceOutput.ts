// ============================================================
// Voice Output (Text-to-Speech) Utilities
// ============================================================
// Session-locked voice: once selected, stays consistent.
// Primary path: POST /api/tts (MP3 bytes). Fallback: browser
// speechSynthesis. Progressive enhancement, works without TTS.
//
// SSR safety: no window/AudioContext access at module load. The
// global unlock listeners are registered lazily via
// initTtsAudioUnlock(), called from a client effect.
// ============================================================

import { Scenario } from "../shared/types";

type SpeechLocale = "zh" | "en";

interface VoiceConfig {
  rate: number;
  pitch: number;
  volume: number;
}

let lockedVoiceName: string | null = null;
let lockedScenario: Scenario | null = null;
let speechRunId = 0;
let lockedSpeechVoice: SpeechSynthesisVoice | null | undefined;
let ttsAudioContext: AudioContext | null = null;
let activeTtsSource: AudioBufferSourceNode | null = null;
let currentLocale: SpeechLocale = "zh";
let unlockListenersRegistered = false;

const voiceSelectionPerScenario: Record<
  Scenario,
  { voiceName: string; config: VoiceConfig }
> = {
  study: { voiceName: "Samantha", config: { rate: 0.8, pitch: 0.9, volume: 0.9 } },
  acg: { voiceName: "Samantha", config: { rate: 0.8, pitch: 0.9, volume: 0.9 } },
  pet: { voiceName: "Samantha", config: { rate: 0.8, pitch: 0.9, volume: 0.9 } },
};

const preferredNaturalVoices = [
  "Samantha",
  "Karen",
  "Moira",
  "Tessa",
  "Serena",
  "Microsoft Jenny",
  "Microsoft Sonia",
  "Microsoft Ava",
  "Google UK English Female",
];

const preferredChineseVoices = [
  "Tingting",
  "Sinji",
  "Meijia",
  "Microsoft Xiaoxiao",
  "Microsoft Yaoyao",
  "Microsoft Huihui",
  "Google 普通话",
  "Google 國語",
];

function speechLangTag(): string {
  return currentLocale === "zh" ? "zh-CN" : "en-US";
}

function cleanSpeechText(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[—–]/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSpeechText(text: string): string[] {
  const cleaned = cleanSpeechText(text);
  if (!cleaned) return [];

  const chunks: string[] = [];
  cleaned
    .split(/(?<=[.!?。！？])\s+|(?<=[。！？])|[,，;；]\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      if (part.length <= 115) {
        chunks.push(part);
        return;
      }
      const words = part.split(/\s+/);
      if (words.length === 1) {
        for (let i = 0; i < part.length; i += 95) chunks.push(part.slice(i, i + 95));
        return;
      }
      let line = "";
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

function buildFishTtsChunks(text: string): string[] {
  const speechChunks = splitSpeechText(text);
  const chunks = speechChunks.length ? speechChunks : [text];
  const batches: string[] = [];
  let current = "";

  chunks.forEach((chunk) => {
    const next = current ? `${current} ${chunk}` : chunk;
    if (next.length > 180 && current) {
      batches.push(current);
      current = chunk;
    } else {
      current = next;
    }
  });

  if (current) batches.push(current);
  return batches;
}

function pauseForChunk(chunk: string, index: number, total: number): number {
  if (index >= total - 1) return 0;
  return /[.!?]$/.test(chunk) ? 420 : 260;
}

function chooseNaturalVoice(
  voices: SpeechSynthesisVoice[],
  lockedName: string | null,
): SpeechSynthesisVoice | null {
  if (lockedSpeechVoice !== undefined) return lockedSpeechVoice;

  if (currentLocale === "zh") {
    const zhVoices = voices.filter((voice) =>
      voice.lang?.toLowerCase().startsWith("zh"),
    );
    const zhMatch = preferredChineseVoices
      .map((name) => zhVoices.find((voice) => voice.name.includes(name)))
      .find(Boolean);
    lockedSpeechVoice = zhMatch ?? zhVoices[0] ?? null;
    return lockedSpeechVoice;
  }

  const englishVoices = voices.filter((voice) =>
    voice.lang?.toLowerCase().startsWith("en"),
  );
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
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Pick zh-CN vs en-US voices to match the active locale. */
export function setSpeechLocale(locale: SpeechLocale): void {
  if (currentLocale === locale) return;
  currentLocale = locale;
  lockedSpeechVoice = undefined; // force a re-pick for the new locale
}

export function initVoiceSession(scenario: Scenario): void {
  lockedScenario = scenario;
  lockedVoiceName = voiceSelectionPerScenario[scenario].voiceName;
}

export function resetVoiceSession(): void {
  lockedVoiceName = null;
  lockedScenario = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function getLockedVoiceName(): string {
  return lockedVoiceName ?? "Default";
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const audioWindow = window as Window &
    typeof globalThis & { webkitAudioContext?: typeof AudioContext };
  const AudioCtx = audioWindow.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ttsAudioContext) ttsAudioContext = new AudioCtx();
  return ttsAudioContext;
}

async function unlockTtsAudio(): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    /* ignore unlock errors */
  }
}

/**
 * Register the one-time gesture listeners that unlock Web Audio playback.
 * Idempotent and SSR-safe. Call from a client effect.
 */
export function initTtsAudioUnlock(): void {
  if (unlockListenersRegistered || typeof window === "undefined") return;
  unlockListenersRegistered = true;
  const handler = () => {
    void unlockTtsAudio();
  };
  window.addEventListener("pointerdown", handler, { capture: true });
  window.addEventListener("keydown", handler, { capture: true });
}

export async function speakText(
  text: string,
  scenario: Scenario,
  onEnd?: () => void,
  voiceWaits = 0,
): Promise<void> {
  const spokenText = cleanSpeechText(text);
  if (!spokenText) {
    onEnd?.();
    return;
  }

  const runId = ++speechRunId;
  try {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (activeTtsSource) {
      try {
        activeTtsSource.stop(0);
      } catch {
        /* already stopped */
      }
      activeTtsSource = null;
    }

    const ctx = getAudioContext();
    if (!ctx) throw new Error("Web Audio unavailable");
    if (ctx.state === "suspended") await ctx.resume();

    const playAudioBytes = async (audioBytes: ArrayBuffer) => {
      const decoded = await ctx.decodeAudioData(audioBytes.slice(0));
      if (runId !== speechRunId) return;
      await new Promise<void>((resolve) => {
        const source = ctx.createBufferSource();
        activeTtsSource = source;
        source.buffer = decoded;
        source.connect(ctx.destination);
        source.onended = () => {
          activeTtsSource = null;
          resolve();
        };
        source.start(0);
      });
    };

    for (const chunk of buildFishTtsChunks(spokenText)) {
      if (runId !== speechRunId) return;
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chunk, lang: speechLangTag() }),
      });
      if (!response.ok) throw new Error("TTS proxy failed");
      await playAudioBytes(await response.arrayBuffer());
    }

    onEnd?.();
  } catch {
    console.warn(
      "[yorimi_tts]",
      "/api/tts failed or was blocked. Falling back to browser speechSynthesis.",
    );
    speakBrowserText(spokenText, scenario, onEnd, voiceWaits);
  }
}

function speakBrowserText(
  text: string,
  scenario: Scenario,
  onEnd?: () => void,
  voiceWaits = 0,
  runId = ++speechRunId,
): void {
  if (!isSpeechSynthesisSupported()) {
    onEnd?.();
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const chunks = splitSpeechText(text);
  if (chunks.length === 0) {
    onEnd?.();
    return;
  }

  const config = voiceSelectionPerScenario[scenario].config;
  const voice = chooseNaturalVoice(synth.getVoices(), lockedVoiceName);
  if (!voice && voiceWaits < 12) {
    window.setTimeout(
      () => speakBrowserText(text, scenario, onEnd, voiceWaits + 1, runId),
      150,
    );
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
    utterance.lang = speechLangTag();
    if (voice) utterance.voice = voice;

    const next = () => {
      window.setTimeout(
        () => speakChunk(index + 1),
        pauseForChunk(chunks[index], index, chunks.length),
      );
    };
    utterance.onend = next;
    utterance.onerror = next;
    synth.speak(utterance);
  };

  speakChunk(0);
}

export function stopSpeaking(): void {
  speechRunId++;
  if (activeTtsSource) {
    try {
      activeTtsSource.stop(0);
    } catch {
      /* already stopped */
    }
    activeTtsSource = null;
  }
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

// Referenced to keep the locked scenario meaningful for future tuning.
export function getLockedScenario(): Scenario | null {
  return lockedScenario;
}
