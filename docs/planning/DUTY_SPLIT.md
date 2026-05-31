# Duty Split

## Team Principle

Build in parallel with clear ownership.

The project is frontend/demo-heavy. The split should keep product flow and integration under one lead, backend/API behind one stable contract, and the remaining implementation split between adaptive interaction and demo reliability.

Ownership map:

- Person A owns the largest slice: product direction, main flow, integration, and pitch.
- Mart owns a major critical slice: the backend/API runtime boundary.
- Person C owns a major implementation slice: interaction system and adaptive UX.
- Person D owns a major delivery slice: rapid build support, QA, fallback, and deployment reliability.

No one should make broad cross-file rewrites during the hackathon. Work through stable interfaces:

- frontend calls `generateChatResultAsync`
- backend owns `/api/chat`
- root route state is controlled by Person A
- runtime interaction states are controlled by Person C
- fallback/demo reliability is controlled by Person D

## Person A - Lead / Runtime Logic / Frontend Flow / Pitch

Owns:

- product thesis
- prompt system direction
- adaptive logic concept
- companion generation flow
- homepage
- upload flow
- runtime panel integration
- memory page story
- orchestration trace UI concept
- final demo narrative
- integration oversight
- final scope cuts

Primary files or modules:

- `App`
- `ScenarioSelector`
- `ImageUpload`
- `CompanionCardPage`
- `MemoryResult`
- pitch script

Concrete tasks:

1. Freeze the study-first demo story.
2. Rework Page 1 around the companion hero and one-sentence product explanation.
3. Add tone/use-case state into the setup flow.
4. Ensure companion profile passes selected tone, use case, role, and image through the app.
5. Own route transitions across the five pages.
6. Make sure runtime output connects cleanly into chat, memory, and display mode.
7. Add or coordinate orchestration trace display.
8. Shape the memory page so it proves continuity, not just a session summary.
9. Write the final demo script.
10. Decide what gets cut when time is low.
11. Run final integration review before rehearsal.

Deliverables:

- five-page flow works end to end
- study-first story is clear
- pitch is under control
- final integration decisions are made quickly
- memory and orchestration story are easy to explain

Rules:

- Person A is the only person changing root step names or the main demo path.
- Person A coordinates backend and interaction boundaries, but backend internals stay with Mart.

## Mart - Backend Runtime + Reliability

This role owns a major critical system boundary: the backend/API engine.

Owns:

- runtime response contract
- `/api/chat` endpoint
- OpenAI API adapter
- session memory update
- mock fallback path

Primary modules:

- `server/index.js`
- `server/schemas.js`
- `server/engines/runtime/orchestrator.js`
- `server/engines/openai/client.js`
- `server/store/sessionStore.js`
- `server/engines/mock/mockEngine.js`

Concrete tasks:

1. Define and freeze the runtime response schema with Person A and Person C.
2. Build `/api/health`, `/api/session`, and `/api/chat`.
3. Add in-memory session state and memory update handling.
4. Add mock fallback and `fallback_used` handling.
5. Add OpenAI Responses API adapter if key/time is available.
6. Validate output before returning it to the frontend.

Deliverables:

- stable runtime API
- schema-valid runtime responses
- mock fallback path
- optional OpenAI structured output path
- memory fields returned with each chat result

Rules:

- Mart keeps the response contract stable.
- Mart coordinates API changes with Person A and Person C before the frontend depends on them.
- UI layout, voice, Live2D, animation, page transitions, and visual assets stay with the frontend/QA owners.

Verification:

- Backend/API scope verified by Mart with `npm run test:mart`.

Backend contract:

```ts
type RuntimeResponse = {
  session_id: string;
  reply: string;
  detected_state: string;
  companion_state: string;
  mode: string;
  goal_understanding: string;
  micro_task_plan: Array<{
    label: string;
    duration_minutes: number;
    done: boolean;
  }>;
  start_button_label: string;
  check_in_message: string;
  check_in_options: ["Done", "Partly done", "I got stuck"];
  memory_update: string;
  memory: object;
  trace: Array<{
    step: string;
    status: "complete" | "fallback";
    summary: string;
  }>;
  fallback_used: boolean;
};
```

## Person C - Interaction System + Adaptive UX

This is a major implementation-heavy role.

Owns:

- chat system
- adaptive UI transitions
- companion visual behavior
- voice input
- voice output
- loading states
- animations
- multimodal interactions
- runtime visual reactions
- state synchronization
- responsive interaction flow

Primary files or modules:

- `ChatInterface`
- `TaskSupportPanel`
- `useVoiceInput`
- `VideoCompanionMode`
- timer/check-in components

Concrete tasks:

1. Make mode switching visible and understandable.
2. Add companion state reactions:
   - Idle
   - Happy
   - Thinking
   - Encouraging
   - Focused
   - Resting
   - Concerned
3. Add micro-task checklist interaction.
4. Add Start 10-min Sprint button.
5. Add countdown timer.
6. Add check-in buttons:
   - Done
   - Partly done
   - I got stuck
7. Keep voice input/output as progressive enhancement.
8. Keep manual input always available.
9. Make stage mode feel stable for judging.

Deliverables:

- clear mode change from Encourage Mode to Study Sprint Mode
- task checklist
- countdown
- check-in loop
- voice/manual fallback
- state-driven companion reactions

Rules:

- All AI text must come through Mart's engine boundary.
- Person C does not own memory persistence.
- Person C calls `onChatResult(result)` and lets Person A's app state handle memory.

## Person D - Rapid Builder / QA / Fallback

Owns:

- reusable UI components
- upload helpers
- mock data
- fallback responses
- testing
- bug fixing
- emergency integration
- deployment assistance
- visual reliability

Primary files or modules:

- `Pseudo3DPreview`
- `Live2DStage`
- `AnimatedSvgFallback`
- `SimpleCharacterDisplay`
- fallback data
- QA checklist

Concrete tasks:

1. Make the app work without Peter's model assets.
2. Make the app work without mic permission.
3. Make the app work without TTS.
4. Make the app work without OpenAI API.
5. Make the app work with default image choices.
6. Prepare known-good demo inputs.
7. Run desktop and mobile smoke checks.
8. Remove unstable visual features from the judged path.
9. Help with last-mile deployment.

Deliverables:

- visual fallback path
- upload fallback path
- mock response fallback path
- QA checklist
- demo-safe input list
- deployment sanity check

Rules:

- Person D protects reliability over visual ambition.
- If a fancy asset is unstable, remove it from the judged path.

## Build Timeline

### 0:00-0:20 - Freeze Story And Contracts

Person A:

- pick Study as main path
- freeze five-page story
- confirm page ownership and integration order
- define what gets cut if time is tight

Mart:

- freeze `RuntimeResponse` schema
- confirm mock fallback

Person C:

- confirm runtime interaction path

Person D:

- run baseline smoke test
- list broken external dependencies

### 0:20-1:30 - Parallel Build 1

Person A:

- homepage and builder flow
- companion profile contract
- root route transitions
- memory story shape

Mart:

- backend skeleton and `/api/chat`
- fallback engine

Person C:

- runtime panel
- mode transition
- timer/check-in loop

Person D:

- visual fallback
- upload fallback
- QA checklist

Checkpoint:

```text
home -> scan/setup -> runtime -> memory -> display
```

must run with mock data.

### 1:30-2:30 - Parallel Build 2

Person A:

- pitch copy and demo script
- trim low-value UI
- integration pass across runtime, memory, and display
- final demo path lock

Mart:

- OpenAI adapter if feasible
- schema validation
- memory fields in chat response

Person C:

- polish runtime states
- voice/manual fallback
- display mode reaction

Person D:

- browser testing
- fallback path
- deployment prep

Checkpoint demo input:

```text
I have a finance quiz but I am tired and stuck.
```

Expected behavior:

- detected state: Low motivation / Avoidance
- mode: Encourage Mode
- micro-task plan appears
- timer can start
- memory update appears

### 2:30-3:15 - Bug Fix Only

No new feature starts.

Fix only:

- broken route transitions
- unreadable UI
- schema mismatch
- missing fallback
- mobile/desktop layout issues

### 3:15-3:45 - Rehearsal

Run the demo twice:

1. Best path.
2. Fallback path.

### Final Freeze

Keep one browser tab loaded on the happy path.

Do not make last-minute feature changes.

## Integration Rules

- Person A controls root flow and demo path.
- Mart controls API contract.
- Person C controls runtime interaction state.
- Person D controls fallback and QA.
- If the API fails, use mock data.
- If Live2D fails, use SVG/simple avatar.
- If mic fails, use manual input.
- If upload fails, use default image.
- If time is low, cut polish before cutting the micro-task loop.

## Demo Responsibilities

Person A:

- narrates product thesis
- controls primary click path
- explains why the product is not a normal chatbot

Mart:

- explains backend in one sentence:

```text
The frontend calls one runtime endpoint; it returns structured state, mode, actions, memory, and trace, with mock fallback if OpenAI is unavailable.
```

Person C:

- demonstrates adaptive mode switch using:

```text
I have a finance quiz but I am tired and stuck.
```

Person D:

- keeps fallback path ready:
  - default image
  - chat mode
  - memory page
  - no mic dependency
