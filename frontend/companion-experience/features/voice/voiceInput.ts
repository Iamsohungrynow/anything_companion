import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

// Push-to-talk voice input: hold to record, release to transcribe via POST /api/stt.
// Drop-in source mirror for the hook in frontend/static/nextstep-companion.html.
export function useVoiceInput(onTranscript: (text: string) => void): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';

  useEffect(() => () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const startListening = useCallback(() => {
    if (isListening || !isSupported) return;
    setError(null);
    chunksRef.current = [];

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';
        const recorder = new MediaRecorder(stream, { mimeType });
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          streamRef.current?.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunksRef.current, { type: mimeType });
          if (!blob.size) return;

          blob.arrayBuffer().then((buf) => {
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            return fetch('/api/stt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64, mimeType }),
            });
          })
            .then((r) => r.json())
            .then((data) => {
              setInterimTranscript('');
              if (data.text) onTranscript(data.text);
              else setError(data.error || 'Transcription failed.');
            })
            .catch(() => setError('STT request failed.'));
        };

        recorder.start();
        setIsListening(true);
        setInterimTranscript('Recording…');
      })
      .catch((e: Error) => {
        setError(
          e.name === 'NotAllowedError'
            ? 'Microphone access denied. Please allow and try again.'
            : 'Voice input failed. Please type your message.'
        );
      });
  }, [isListening, isSupported, onTranscript]);

  const stopListening = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
      setIsListening(false);
      setInterimTranscript('Transcribing…');
    }
  }, []);

  return { isListening, isSupported, interimTranscript, startListening, stopListening, error };
}
