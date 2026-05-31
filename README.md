# NextStep Companion

NextStep Companion is an adaptive AI companion demo that helps users move from vague goals to small, timed actions.

The core demo problem is:

```text
I need to study, but I cannot start.
```

The product is not just a chatbot with a cute avatar. It is an action-oriented companion runtime:

1. Understand the latest user message.
2. Respect the selected tone, role, use case, mode, companion profile, memory, and recent history.
3. Route the turn to the right support shape.
4. Generate natural guidance, teaching, task breakdowns, check-ins, or quiz prompts.
5. Start a short sprint when useful.
6. Remember what helped.

## Hackathon Positioning

Short description:

```text
An adaptive AI companion that turns vague study and work goals into small, timed actions, then remembers what helped the user start.
```

Product line:

```text
Your adaptive AI companion for study, work, daily check-ins, and small actionable steps.
```

Main judging claim:

```text
Most AI companions keep users talking. NextStep Companion helps users start.
```

## Why It Fits Sea x OpenAI Codex Hackathon

### Autonomous And Adaptive AI

The system adapts from user input without requiring manual setup every turn:

```text
message -> intent -> mode -> answer -> optional micro-task plan -> check-in -> memory update
```

### AI-Native Products And Operations

The UI is driven by structured AI output, not only a chat bubble:

- answer
- current mode
- companion state
- suggested actions
- optional micro-task checklist
- timer
- check-in
- memory update
- orchestration trace

### Deep Domain AI

The focused domain is study initiation and procrastination. The value is helping the user begin, not maximizing conversation length.

## Repo Layout

Root stays operational: package/env/deploy files, `README.md`, and `AGENTS.md`.

```text
frontend/static/          Served standalone demo and companion data JSON
frontend/person-c/        Person C interaction-system React deliverable
server/                   Node backend runtime
server/engines/openai/    OpenAI Responses API adapter
server/engines/mock/      Emergency fallback engine only
server/engines/runtime/   Orchestration layer and runtime guards
server/tests/             Agent, API, Mart, Person D, and live OpenAI tests
assets/companions/        Cappu, Folio, and Luma companion images
docs/planning/            Implementation plan and duty split
docs/testing/             Backend/API test matrix
docs/deliverables/        Person C/D deliverables and QA notes
docs/pitch/               Pitch and final narrative documents
```

Important code anchors:

- `frontend/static/nextstep-companion.html` - served demo UI.
- `frontend/static/nextstep-companion-data.json` - companion config and schema notes.
- `frontend/person-c/ChatInterface.tsx` - Person C chat interaction source.
- `frontend/person-c/utils/voiceOutput.ts` - Person C voice output helper.
- `server/index.js` - HTTP API and static-file server.
- `server/engines/runtime/orchestrator.js` - Mart runtime orchestration.
- `server/engines/openai/client.js` - OpenAI runtime adapter.
- `server/engines/mock/mockEngine.js` - fallback runtime.
- `server/schemas.js` - request/response validation and normalization.
- `server/store/sessionStore.js` - in-memory session and memory state.

## Agent Rules

Read `AGENTS.md` before changing runtime, frontend rendering, voice, env, or assets.

Non-negotiable rules:

- The model is the brain.
- Code provides context, schema, routing hints, session memory, rendering, and fallback handling.
- Normal chat uses OpenAI when `OPENAI_API_KEY` is configured.
- Mock is fallback only, unless `USE_MOCK_AI=true`.
- The visible chat bubble uses `answer || reply`.
- Never build the main assistant message from `micro_task_plan`.
- Do not reintroduce generic all-purpose study templates as the main answer.
- `.env` must never be committed.

## Quick Start

## Live Deployment

Production demo:

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
  "mock_forced": false
}
```

Current production branch:

```text
main
```

Vercel `*.vercel.app` hosts are accepted automatically. If a deployment returns `Host not allowed`, remove stale local-only `ALLOWED_HOSTS` values from the Vercel dashboard or set it to the actual custom domain.

## Local Quick Start

Copy the environment template:

```powershell
Copy-Item .env.example .env
```

Edit `.env` for live AI:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-mini
OPENAI_SEARCH_MODEL=gpt-5.5
PORT=3017
USE_MOCK_AI=false
```

Run the app and API:

```powershell
npm run dev
```

Open:

```text
http://127.0.0.1:3017/nextstep-companion.html
```

If the browser is stale, use a cache-busting URL:

```text
http://127.0.0.1:3017/nextstep-companion.html?v=latest
```

## API Endpoints

```text
GET  /api/health
GET  /api/scenarios
POST /api/session
POST /api/chat
POST /api/tts
GET  /api/session/:id/memory
POST /api/session/:id/reset
```

Runtime behavior:

- If OpenAI works, `/api/chat` returns `fallback_used: false` and `runtime_source: "openai"`.
- If OpenAI is missing or fails, `/api/chat` returns schema-compatible fallback with `fallback_used: true`.
- If `USE_MOCK_AI=true`, mock runtime is forced for rehearsal/offline testing.
- `/api/tts` uses Fish Audio when `FISH_AUDIO_API_KEY` and `FISH_AUDIO_REFERENCE_ID` are configured.
- Chat voice falls back to browser `speechSynthesis` when Fish Audio is unavailable.

## Vercel Deployment

This repo supports Vercel through thin API wrappers in `api/` and shared runtime handlers in `server/http/runtimeHandlers.js`.

Vercel path:

```text
api/health.mjs                   -> GET /api/health
api/scenarios.mjs                -> GET /api/scenarios
api/session.mjs                  -> POST /api/session
api/chat.mjs                     -> POST /api/chat
api/tts.mjs                      -> POST /api/tts
api/session/[id]/memory.mjs      -> GET /api/session/:id/memory
api/session/[id]/reset.mjs       -> POST /api/session/:id/reset
vercel.json                      -> static rewrites and function runtime config
```

The function wrappers use `.mjs` because this package remains `type: commonjs` for the local Node server.

Static rewrites keep the existing demo URLs:

```text
/                              -> frontend/static/nextstep-companion.html
/nextstep-companion.html        -> frontend/static/nextstep-companion.html
/nextstep-companion-data.json   -> frontend/static/nextstep-companion-data.json
/assets/*                      -> assets/*
```

Set these in the Vercel dashboard:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-mini
OPENAI_SEARCH_MODEL=gpt-5.5
USE_MOCK_AI=false
```

Optional voice env:

```env
FISH_AUDIO_API_KEY=your_fish_key
FISH_AUDIO_REFERENCE_ID=your_reference_id
```

For Vercel custom domains, also set:

```env
ALLOWED_HOSTS=your-domain.example
ALLOWED_ORIGINS=https://your-domain.example
```

Vercel preview/production URLs are auto-detected from Vercel's own environment variables when available.
Vercel `*.vercel.app` hosts are accepted automatically on Vercel. If `/api/health` returns `Host not allowed`, remove any stale `ALLOWED_HOSTS` value from the Vercel dashboard or set it to your actual custom domain.

Important memory caveat:

The current session store is in-memory. On Vercel Serverless Functions, memory can disappear between invocations or not be shared across function instances. This is acceptable for a short demo, but production memory should move to Vercel KV, Supabase Postgres, or Upstash Redis.

## Environment Variables

See `.env.example` for the current local template.

Key variables:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4-mini
OPENAI_SEARCH_MODEL=gpt-5.5
PORT=3017
HOST=127.0.0.1
ALLOWED_ORIGINS=http://localhost:3017,http://127.0.0.1:3017
ALLOWED_HOSTS=127.0.0.1,localhost,::1
USE_MOCK_AI=false
OPENAI_TIMEOUT_MS=12000
FISH_AUDIO_API_KEY=
FISH_AUDIO_REFERENCE_ID=
FISH_AUDIO_TIMEOUT_MS=20000
MAX_SESSIONS=250
SESSION_TTL_MS=28800000
```

## Verification

Run the normal local gate:

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

Run live OpenAI verification when `OPENAI_API_KEY` is configured:

```powershell
npm run test:openai
```

Before pushing, check:

```powershell
git diff --check HEAD
git status --short --branch
git ls-files .env
```

`git ls-files .env` must print nothing.

## Five-Page Demo

1. Home: companion hero plus product explanation.
2. Personalization and Scan-to-Companion: upload object/pet/toy and choose tone/use case.
3. Runtime Panel: companion state, current mode, answer, micro-task support, timer, check-in.
4. Memory Layer: preferences, recent goals, completed tasks, check-in history.
5. Display Mode: large companion, current mode, reply bubble, current task.

## Known-Good Demo Inputs

Use these during judging:

```text
I have a finance quiz but I am tired and stuck.
```

Expected:

- `intent` is emotional/support or study-start related.
- `mode` is Encourage Mode or a low-pressure study mode.
- Answer validates the user first.
- Micro-task support appears.
- Memory updates.

```text
give me concrete steps to learn periodic table
```

Expected:

- `intent` is `decompose_task`.
- Answer mentions subject-specific ideas such as periods, groups, atomic number, symbols, metals/non-metals, or noble gases.
- Answer must not collapse into a generic "open material, name one concept, do one example, mark blocker" template.

```text
help me
```

Expected after a previous topic:

- `intent` is `vague_help`.
- The assistant uses recent history.
- The assistant starts the first useful step instead of repeating the previous plan.

## Docs

- `docs/planning/IMPLEMENTATION_PLAN.md` - architecture and build plan.
- `docs/planning/DUTY_SPLIT.md` - four-person ownership and timeline.
- `docs/testing/MART_BACKEND_TEST_CASES.md` - Mart/backend test cases.
- `docs/deliverables/person-c/` - Person C interaction deliverables.
- `docs/deliverables/person-d/` - Person D reliability deliverables.
- `docs/pitch/` - pitch and final narrative docs.

## OpenAI Architecture References

- Responses API: https://platform.openai.com/docs/api-reference/responses
- Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs
- Agents SDK: https://platform.openai.com/docs/guides/agents-sdk
- Realtime API: https://platform.openai.com/docs/guides/realtime/overview
