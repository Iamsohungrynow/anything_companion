import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

function getSpeechRecognitionAPI(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition ||
    null
  );
}

export function useVoiceInput(
  onTranscript: (text: string) => void,
  lang = 'zh-CN',
): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Web Speech API path
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // MediaRecorder fallback path
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const hasSpeechAPI = !!getSpeechRecognitionAPI();
  const hasMediaRecorder =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';

  const isSupported = hasSpeechAPI || hasMediaRecorder;

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
      if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  // ── Web Speech API path ────────────────────────────────────────────────────

  const startWithSpeechAPI = useCallback(
    (SpeechAPI: new () => SpeechRecognition) => {
      const recognition = new SpeechAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognitionRef.current = recognition;

      let finalSent = false;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('Listening…');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) final += r[0].transcript;
          else interim += r[0].transcript;
        }
        setInterimTranscript(interim || final);
        if (final && !finalSent) {
          finalSent = true;
          onTranscript(final.trim());
        }
      };

      recognition.onerror = (event) => {
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
    },
    [lang, onTranscript],
  );

  // ── MediaRecorder + backend fallback ──────────────────────────────────────

  const startWithMediaRecorder = useCallback(() => {
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
          blob
            .arrayBuffer()
            .then((buf) => {
              const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
              return fetch('/api/stt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64, mimeType, lang }),
              });
            })
            .then((r) => r.json())
            .then((data) => {
              setInterimTranscript('');
              if (data.text) onTranscript(data.text);
              else {
                const details = [
                  data?.provider ? `provider=${data.provider}` : null,
                  data?.model ? `model=${data.model}` : null,
                  typeof data?.provider_status === 'number'
                    ? `provider_status=${data.provider_status}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' ');
                const suffix = details ? ` (${details})` : '';
                setError(`${data.error || 'Transcription failed.'}${suffix}`);
              }
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
            : 'Voice input failed. Please type your message.',
        );
      });
  }, [lang, onTranscript]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (isListening || !isSupported) return;
    setError(null);
    const SpeechAPI = getSpeechRecognitionAPI();
    if (SpeechAPI) {
      startWithSpeechAPI(SpeechAPI);
    } else {
      startWithMediaRecorder();
    }
  }, [isListening, isSupported, startWithSpeechAPI, startWithMediaRecorder]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
      setIsListening(false);
      setInterimTranscript('Transcribing…');
    }
  }, []);

  return { isListening, isSupported, interimTranscript, startListening, stopListening, error };
}
