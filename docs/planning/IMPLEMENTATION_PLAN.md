# Implementation Plan

## 1. Product Direction

Yorimi / Compagnon Eveil is an AI character presence platform.

The product identity is broader than study support. It should support:

- study-start and low-motivation action support
- work and routine companionship
- creator-owned characters and original IP interaction
- VTuber / ACGN / indie-game character presence
- later display, projection, or desktop-presence experiences

Study remains the strongest near-term demo path, but it is no longer the whole product identity.

Do not frame the product as:

- a generic chatbot
- a pure productivity coach
- a hardware-first business
- a full creator marketplace on day one

## 2. Current Technical Baseline

The current repo already has a live runtime baseline.

- The live demo surface is `frontend/static/nextstep-companion.html`.
- The backend seam is `server/http/runtimeHandlers.js`.
- Normal chat should use OpenAI when `OPENAI_API_KEY` is configured.
- Mock behavior is fallback only.
- The visible assistant message must render `answer || reply`.
- Voice is progressive enhancement and must always preserve typed-input fallback.

This means the safest implementation strategy is not a full rewrite. It is a controlled frontend replacement while preserving the current runtime contract.

## 3. Product Surfaces To Build

### 3.1 Character Setup

The setup flow should support more than object scan.

Supported entry paths:

- study companion
- creator-owned character
- VTuber / fandom character
- original character / indie IP
- object-based or desktop companion

The output is a `CharacterProfile` that defines:

- name
- role
- tone
- use case
- core persona
- creator boundaries
- linked visual and voice assets

### 3.2 Runtime

The runtime should prove three things:

- the character responds in a stable voice
- the character can guide action when the use case calls for it
- the character feels present through voice, state, and visual feedback

Study Sprint Mode remains a key mode, but only one mode among several.

### 3.3 Memory

Memory should be split conceptually into:

- canon memory: fixed character facts and creator-defined boundaries
- relationship memory: user preferences, naming, and recurring interaction style
- session memory: current thread context
- task memory: recent goals, check-ins, and action history when relevant
- safety memory: moderation or age-mode handling

### 3.4 Presence Layer

The presence layer covers:

- avatar state changes
- voice playback and interruption
- stage / display mode
- projection or desktop device sync later

Hardware remains an enhancement layer, not a phase-1 dependency.

## 4. AIRI Frontend Donor Strategy

`moeru-ai/airi` is a frontend donor and reference architecture, not Yorimi's new platform base.

Rules:

1. Reuse AIRI ideas and selected frontend patterns, especially around presence, voice UX, and avatar stage.
2. Keep Yorimi's backend contract as the source of truth.
3. Do not adopt AIRI auth, billing, WebSocket sync server, Postgres, or Redis as phase-1 dependencies.
4. Keep same-origin deployment and the current static HTML fallback until the new frontend reaches parity.

Recommended shape:

- keep the current runtime live
- build a new frontend app in parallel
- connect that frontend to Yorimi's existing APIs
- cut over only after parity is verified

## 5. Target Architecture

```text
Frontend
  - new AIRI-derived web app
  - character setup
  - chat / voice / avatar runtime
  - memory and presence views
  - stage / display mode

Frontend adapter
  - maps UI state to Yorimi API requests
  - preserves fallback behavior

Backend
  - /api/chat
  - /api/tts
  - /api/stt
  - optional session endpoints
  - orchestration
  - memory update
  - OpenAI primary runtime
  - mock fallback
```

The backend remains centered on `server/http/runtimeHandlers.js` and `server/engines/runtime/orchestrator.js`.

## 6. Runtime Contract To Preserve

### Request

The new frontend should preserve the current backend seam and request shape, including:

- `session_id`
- `scenario`
- `message`
- `channel`
- `tone`
- `role`
- `use_case`
- `companion`
- `recent_messages`
- `image_url`
- `image_metadata`

### Response

The new frontend must handle:

- `answer`
- `reply`
- `runtime_source`
- `fallback_used`
- `mode`
- `detected_state`
- `companion_state`
- `micro_task_plan`
- `memory`
- `trace`

Rendering rule:

- visible assistant text uses `answer || reply`

## 7. Frontend Migration Strategy

### Phase 0 - Planning and Contract Freeze

- freeze the runtime contract
- define the new character schema
- define the AIRI adoption boundaries
- leave the current static HTML path intact

### Phase 1 - Parallel Frontend Scaffold

- create a new web frontend surface
- strip AIRI-only server coupling
- keep the UI focused on setup, runtime, memory, and stage mode
- do not block on Live2D or advanced 3D

### Phase 2 - Adapter Integration

- implement the frontend adapter for `/api/chat`, `/api/tts`, and `/api/stt`
- preserve browser speech and typed-input fallback
- verify `answer || reply` rendering
- verify visible fallback state

### Phase 3 - Character Platform Core

- implement `CharacterProfile`
- implement canon / relationship / session / task memory boundaries
- support creator-owned persona configuration
- support study plus at least one non-study use case

### Phase 4 - Voice and Interaction Polish

- listening / thinking / speaking states
- playback controls and interruption
- timer / check-in only where relevant
- stage and display polish

### Phase 5 - Creator and Presence Expansion

- creator whitelist tools
- asset registry for voices, skins, and states
- display or projection bridge
- persistent storage hardening before external pilots

## 8. Fastest Path In This Repo

Do not replace the current runtime first.

Fastest safe path:

1. Keep `frontend/static/nextstep-companion.html` working as fallback.
2. Build the next frontend in parallel.
3. Point the new frontend at the current backend.
4. Preserve same-origin deployment at first.
5. Switch the primary surface only after parity checks pass.

Do not start with:

- a React/Vite rewrite of the current HTML only for its own sake
- AIRI server adoption
- auth and billing as phase-1 blockers
- hardware sync as a dependency for chat quality

## 9. Acceptance Criteria

The next implementation phase is ready when this path works cleanly:

```text
home -> character setup -> runtime -> memory -> display / presence
```

Required checks:

- study remains a strong demo path
- at least one non-study use case also works
- the runtime keeps character voice and boundaries stable
- `answer || reply` rendering is preserved
- fallback state is visible when used
- typed input still works if voice fails
- browser speech fallback still works if API voice fails
- the current static HTML demo remains usable until cutover

## 10. Demo Inputs

Study:

```text
I have a finance quiz but I am tired and stuck.
```

Creator / character:

```text
I want this character to greet fans gently and remember their preferred nickname.
```

Daily routine:

```text
Help me start a 10-minute reset before I work again.
```

## 11. Implementation Scope Split

Core platform scope:

- architecture and migration sequencing
- backend contracts and runtime behavior
- character profile and memory boundaries
- deployment, storage, and test hardening
- AIRI adoption boundaries and frontend cutover plan

Voice and interaction scope:

- mic flow and voice controls
- playback and interruption behavior
- avatar state transitions
- stage and presence polish
- interaction validation against the runtime contract

Joint execution rules:

- keep the backend contract stable during frontend migration
- keep fallback behavior intact during voice and UI work
- keep the current static HTML runtime available until the new frontend reaches parity

See `docs/planning/DUTY_SPLIT.md` for the detailed work split.
