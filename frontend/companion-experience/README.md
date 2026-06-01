# Person C Frontend Source

Person C owns the interaction-system source for the companion demo: onboarding, chat, voice input/output, video mode, companion previews, and the memory/result screen.

## Folder Map

```text
frontend/companion-experience/
  index.ts                     Public entrypoint and type exports
  app/                         App state machine and page routing
  shared/                      Shared TypeScript types and local React shim
  features/
    onboarding/                Scenario, setup, and image selection pages
    companion/                 Companion profile data and avatar preview
    chat/                      Chat UI, task panel, and local mock chat generator
    voice/                     Web Speech input and TTS/browser fallback output
    video/                     Video companion mode
    memory/                    Session result and memory summary UI
  docs/                        Source-local notes for Person C ownership
```

## Runtime Notes

- The production demo is currently served from `frontend/static/nextstep-companion.html`.
- This folder is the categorized Person C React source mirror used for implementation handoff and future extraction.
- Voice output must keep the `/api/tts` path and fall back to browser `speechSynthesis` when Fish Audio is unavailable or blocked.
- Shared response rendering must prefer model `answer` first, then `reply`, in the served static runtime.
