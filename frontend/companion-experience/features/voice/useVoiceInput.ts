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
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const getSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  }, []);

  const isSupported = Boolean(getSpeechRecognition()) || (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  );

  useEffect(() => () => {
    recognitionRef.current?.abort?.();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const startWithSpeechRecognition = useCallback((SpeechRecognition: any) => {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setInterimTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript;
        else interim += transcript;
      }
      setInterimTranscript(interim || finalText);
      if (finalText.trim()) onTranscript(finalText.trim());
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setInterimTranscript('');
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      recognitionRef.current = null;
    };

    recognition.start();
  }, [onTranscript]);

  const blobToBase64 = useCallback((blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const [, base64 = ''] = result.split(',');
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Audio encoding failed.'));
    reader.readAsDataURL(blob);
  }), []);

  const startWithMediaRecorder = useCallback(() => {
    chunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
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
            setInterimTranscript('');
            return;
          }

          try {
            const audio = await blobToBase64(blob);
            const response = await fetch('/api/stt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio, mimeType, lang: 'en-US' }),
            });
            const data = await response.json();
            setInterimTranscript('');
            if (!response.ok || !data.text) {
              setError(data.error || 'Voice input failed. Please type your message.');
              return;
            }
            onTranscript(String(data.text).trim());
          } catch {
            setInterimTranscript('');
            setError('Voice input failed. Please type your message.');
          }
        };

        recorder.start();
        setIsListening(true);
        setError(null);
        setInterimTranscript('Recording');
      })
      .catch((err: any) => {
        setError(err?.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow and try again.'
          : 'Voice input failed. Please type your message.');
      });
  }, [blobToBase64, onTranscript]);

  const startListening = useCallback(() => {
    if (isListening || !isSupported) return;
    const SpeechRecognition = getSpeechRecognition();
    setError(null);
    if (SpeechRecognition) {
      try {
        startWithSpeechRecognition(SpeechRecognition);
      } catch (e: any) {
        setError(e.message);
      }
      return;
    }
    startWithMediaRecorder();
  }, [getSpeechRecognition, isListening, isSupported, startWithMediaRecorder, startWithSpeechRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
      setIsListening(false);
      setInterimTranscript('Transcribing');
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
