# NextStep Companion

NextStep Companion is an adaptive AI companion demo for study, work, emotional check-ins, routines, and object-based companions.

The main demo problem is simple:

```text
I need to study, but I cannot start.
```

The product is not just a chatbot with an avatar. It is a companion runtime that understands the user's current state, responds naturally, gives one small next step, starts a timed sprint when useful, and remembers what helped.

## Live Demo

Production:

```text
https://compagnon-eveil.vercel.app/
```

Health check:

```text
https://compagnon-eveil.vercel.app/api/health
```

Expected production health:

```json
{
  "ok": true,
  "service": "nextstep-runtime",
  "openai_configured": true,
  "fish_audio_configured": true,
  "mock_forced": false
}
```

Production deploys from:

```text
main
```

## Product Behavior

For each turn, the companion uses:

- the latest user message
- selected tone
- selected role
- selected use case
- current mode
- recent chat history
- companion profile
- session memory

The runtime returns structured output for the frontend:

- `answer` and `reply`
- detected user state
- active companion mode
- companion emotional state
- suggested actions
- optional micro-task plan
- sprint/check-in controls
- memory update
- orchestration trace
- fallback status

The visible assistant bubble must render `answer || reply`. The micro-task plan is supporting UI, not the main answer.

## Repository Layout

```text
api/                         Vercel Serverless Function wrappers
assets/                      Companion images and video states
docs/                        Planning, testing, pitch, and deliverables
frontend/static/             Served standalone demo and companion data
frontend/companion-experience/
                             Categorized React source mirror for the companion UI
server/                      Local Node runtime and shared API handlers
server/engines/openai/       OpenAI runtime adapter
server/engines/mock/         Emergency fallback engine only
server/engines/runtime/      Turn orchestration and runtime guards
server/tests/                Contract, smoke, live, and reliability tests
```

Important files:

- `frontend/static/nextstep-companion.html` - deployed standalone demo UI.
- `frontend/static/nextstep-companion-data.json` - companion data and schema notes.
- `frontend/companion-experience/features/chat/ChatInterface.tsx` - companion chat source mirror.
- `frontend/companion-experience/features/voice/voiceOutput.ts` - source mirror for voice output behavior.
- `server/http/runtimeHandlers.js` - shared handlers for local server and Vercel API wrappers.
- `server/engines/runtime/orchestrator.js` - turn orchestration.
- `server/engines/openai/client.js` - OpenAI API adapter.
- `server/engines/mock/mockEngine.js` - schema-compatible fallback.
- `server/store/sessionStore.js` - in-memory session and memory state.
- `api/*.mjs` - thin Vercel wrappers around shared handlers.

## Companion UI Source

The served demo is currently the standalone file under `frontend/static/`.

The categorized source mirror lives under `frontend/companion-experience/`:

```text
frontend/companion-experience/
  app/                         App state machine and page routing
  shared/                      Shared types and local shims
  features/onboarding/         Scenario, setup, and image selection
  features/companion/          Companion profiles and avatar preview
  features/chat/               Chat UI, task panel, local mock generator
  features/voice/              Voice input and Fish/browser voice output
  features/video/              Video companion mode
  features/memory/             Session summary and memory UI
```

When changing deployed UI behavior, update `frontend/static/nextstep-companion.html`. When changing the maintainable React source mirror, update `frontend/companion-experience/` as well.

## Runtime Flow

```text
browser
  -> /api/chat
  -> runtime orchestrator
  -> OpenAI adapter when OPENAI_API_KEY is configured
  -> schema validation and normalization
  -> session memory update
  -> frontend renders answer, mode, tasks, timer, check-in, memory
```

Fallback rules:

- OpenAI is the normal runtime when `OPENAI_API_KEY` is configured.
- Mock is fallback only, unless `USE_MOCK_AI=true`.
- Mock fallback must never pretend to be GPT tutoring.
- Current user message wins over stale mode, stale memory, or previous fallback state.

## Voice Behavior

Voice is progressive enhancement. Typing and reading must always work.

Flow:

```text
Play button
  -> POST /api/tts
  -> Fish Audio when configured
  -> browser speechSynthesis fallback if Fish is missing, blocked, or fails
```

Long Fish Audio input is chunked before TTS calls so deployed Vercel functions do not time out on long English or Chinese replies.

Required voice behavior:

- The Play button stays visible even when Fish Audio is not configured.
- `/api/tts` may return `503` if Fish env vars are missing.
- Fish failure must not block normal chat.
- Browser autoplay restrictions must be handled through user-triggered playback.

## Local Development

Install dependencies:

```powershell
npm install
```

Create local env:

```powershell
Copy-Item .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-mini
OPENAI_SEARCH_MODEL=gpt-5.5
PORT=3017
USE_MOCK_AI=false
```

Start the local app:

```powershell
npm run dev
```

Open:

```text
http://127.0.0.1:3017/nextstep-companion.html
```

If the browser has stale state:

```text
http://127.0.0.1:3017/nextstep-companion.html?clearState=1
```

## Environment Variables

See `.env.example` for the canonical template.

Required for live AI:

```env
OPENAI_API_KEY=
```

Common runtime config:

```env
OPENAI_MODEL=gpt-5.4-mini
OPENAI_SEARCH_MODEL=gpt-5.5
OPENAI_TIMEOUT_MS=12000
USE_MOCK_AI=false
PORT=3017
HOST=127.0.0.1
```

Optional voice config:

```env
FISH_AUDIO_API_KEY=
FISH_AUDIO_REFERENCE_ID=
FISH_AUDIO_TIMEOUT_MS=20000
```

Host/origin config:

```env
ALLOWED_ORIGINS=http://localhost:3017,http://127.0.0.1:3017
ALLOWED_HOSTS=127.0.0.1,localhost,::1
```

Session config:

```env
MAX_SESSIONS=250
SESSION_TTL_MS=28800000
```

Never commit `.env` or real API keys.

## API

```text
GET  /api/health
GET  /api/scenarios
POST /api/session
POST /api/chat
POST /api/tts
GET  /api/session/:id/memory
POST /api/session/:id/reset
```

Runtime expectations:

- Live chat returns `fallback_used: false` when OpenAI is configured and working.
- Fallback returns schema-compatible responses when OpenAI is missing, failing, or explicitly forced.
- `/api/tts` returns Fish Audio when configured.
- Missing Fish Audio config returns a clear `503` without breaking chat.

## Vercel Deployment

Vercel uses `.mjs` wrappers because the package remains `type: commonjs`.

```text
api/health.mjs                   -> GET /api/health
api/scenarios.mjs                -> GET /api/scenarios
api/session.mjs                  -> POST /api/session
api/chat.mjs                     -> POST /api/chat
api/tts.mjs                      -> POST /api/tts
api/session/[id]/memory.mjs      -> GET /api/session/:id/memory
api/session/[id]/reset.mjs       -> POST /api/session/:id/reset
```

Static rewrites:

```text
/                              -> frontend/static/nextstep-companion.html
/nextstep-companion.html        -> frontend/static/nextstep-companion.html
/nextstep-companion-data.json   -> frontend/static/nextstep-companion-data.json
/assets/*                      -> assets/*
/models/*                      -> models/*
```

Set these in Vercel:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-mini
OPENAI_SEARCH_MODEL=gpt-5.5
USE_MOCK_AI=false
```

Optional Fish Audio:

```env
FISH_AUDIO_API_KEY=your_fish_key
FISH_AUDIO_REFERENCE_ID=your_reference_id
FISH_AUDIO_TIMEOUT_MS=20000
```

For custom domains:

```env
ALLOWED_HOSTS=your-domain.example
ALLOWED_ORIGINS=https://your-domain.example
```

Vercel preview and production `*.vercel.app` hosts are accepted automatically.

## Verification

Run the normal gate:

```powershell
npm run test:all
```

This runs:

```powershell
npm run test:agents
npm run test:vercel
npm run test:mart
npm run test:api
npm run test:d
```

Run the live OpenAI gate when `OPENAI_API_KEY` is configured:

```powershell
npm run test:openai
```

Before pushing:

```powershell
git diff --check HEAD
git status --short --branch
git ls-files .env
```

`git ls-files .env` must print nothing.

## Demo Flow

Five-page story:

1. Home: product framing and companion promise.
2. Personalization: choose scenario, tone, role, use case, and image.
3. Runtime panel: answer, mode, companion state, micro-tasks, timer, check-in.
4. Memory layer: what helped and what the companion learned.
5. Display mode: large companion view with current reply and state.

Good judging input:

```text
I have a finance quiz but I am tired and stuck.
```

Expected behavior:

- The answer validates the user's state first.
- The companion gives a small concrete start.
- Micro-task support appears as optional structured UI.
- The timer can start a useful sprint.
- Memory updates with what helped the user start.

Subject-specific decomposition input:

```text
give me concrete steps to learn periodic table
```

Expected behavior:

- The assistant talks about the actual subject.
- It should mention useful concepts like periods, groups, atomic number, symbols, metals/non-metals, or noble gases.
- It must not collapse into a generic all-purpose study template.

Vague follow-up input:

```text
help me
```

Expected behavior after prior context:

- The assistant uses recent history.
- It starts the first useful step instead of repeating a stale generic plan.

## Documentation

```text
docs/planning/IMPLEMENTATION_PLAN.md       Architecture and build plan
docs/planning/DUTY_SPLIT.md                Team ownership and timeline
docs/testing/MART_BACKEND_TEST_CASES.md    Backend/API test matrix
docs/deliverables/person-c/                Archived interaction deliverables
docs/deliverables/person-d/                Reliability and QA deliverables
docs/pitch/                                Pitch and final narrative documents
```

## Architecture References

- OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses
- OpenAI Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs
- OpenAI Agents SDK: https://platform.openai.com/docs/guides/agents-sdk
- OpenAI Realtime API: https://platform.openai.com/docs/guides/realtime/overview
