// ============================================================
// useVoiceInput Hook
// ============================================================
// Handles Web Speech API for voice input
// Progressive enhancement - gracefully degrades if not supported
// Person C owns voice interaction
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export function useVoiceInput(onTranscript: (text: string) => void): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setInterimTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          onTranscript(transcript);
        } else {
          interim += transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      setError(`Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
  }, [onTranscript]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        setError(e.message);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    interimTranscript,
    startListening,
    stopListening,
    error,
  };
}
