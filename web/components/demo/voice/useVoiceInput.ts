"use client";

// ============================================================
// useVoiceInput Hook
// ============================================================
// Web Speech API (SpeechRecognition) is the PRIMARY path.
// The server /api/stt fallback (via MediaRecorder) is kept but
// is unreliable and should not be relied upon.
// Progressive enhancement, degrades gracefully if unsupported.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";

// ------ Minimal typings for the (untyped) Web Speech API --------------------
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export function useVoiceInput(
  onTranscript: (text: string) => void,
  lang: string = "en-US",
): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const langRef = useRef(lang);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  const getSpeechRecognition = useCallback((): SpeechRecognitionCtor | null => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }, []);

  const isSupported =
    Boolean(getSpeechRecognition()) ||
    (typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined");

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const startWithSpeechRecognition = useCallback(
    (Ctor: SpeechRecognitionCtor) => {
      const recognition = new Ctor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = langRef.current;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setInterimTranscript("");
      };

      recognition.onresult = (event) => {
        let interim = "";
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += transcript;
          else interim += transcript;
        }
        setInterimTranscript(interim || finalText);
        if (finalText.trim()) onTranscript(finalText.trim());
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        setInterimTranscript("");
        if (event.error !== "aborted" && event.error !== "no-speech") {
          setError(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
        recognitionRef.current = null;
      };

      recognition.start();
    },
    [onTranscript],
  );

  const blobToBase64 = useCallback(
    (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || "");
          const [, base64 = ""] = result.split(",");
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("Audio encoding failed."));
        reader.readAsDataURL(blob);
      }),
    [],
  );

  const startWithMediaRecorder = useCallback(() => {
    chunksRef.current = [];
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";
        const recorder = new MediaRecorder(stream, { mimeType });
        recorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;

          const blob = new Blob(chunksRef.current, { type: mimeType });
          if (!blob.size) {
            setInterimTranscript("");
            return;
          }

          try {
            const audio = await blobToBase64(blob);
            const response = await fetch("/api/stt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio, mimeType, lang: langRef.current }),
            });
            const data = (await response.json()) as {
              text?: string;
              error?: string;
            };
            setInterimTranscript("");
            if (!response.ok || !data.text) {
              setError(data.error || "Voice input failed. Please type your message.");
              return;
            }
            onTranscript(String(data.text).trim());
          } catch {
            setInterimTranscript("");
            setError("Voice input failed. Please type your message.");
          }
        };

        recorder.start();
        setIsListening(true);
        setError(null);
        setInterimTranscript("Recording");
      })
      .catch((err: unknown) => {
        const name = err instanceof Error ? err.name : "";
        setError(
          name === "NotAllowedError"
            ? "Microphone access denied. Please allow and try again."
            : "Voice input failed. Please type your message.",
        );
      });
  }, [blobToBase64, onTranscript]);

  const startListening = useCallback(() => {
    if (isListening || !isSupported) return;
    const Ctor = getSpeechRecognition();
    setError(null);
    if (Ctor) {
      try {
        startWithSpeechRecognition(Ctor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Voice input failed.");
      }
      return;
    }
    startWithMediaRecorder();
  }, [
    getSpeechRecognition,
    isListening,
    isSupported,
    startWithMediaRecorder,
    startWithSpeechRecognition,
  ]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      setIsListening(false);
      setInterimTranscript("Transcribing");
    }
  }, []);

  return {
    isListening,
    isSupported,
    interimTranscript,
    startListening,
    stopListening,
    error,
  };
}
