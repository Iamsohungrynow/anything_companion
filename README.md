# NextStep Companion

NextStep Companion is an adaptive AI companion that helps users move from vague goals to small, timed actions.

The hackathon demo focuses on one sharp use case:

> I need to study, but I cannot start.

The product is not just a chatbot with a cute avatar. It is an action-oriented companion runtime:

1. Detect the user's state.
2. Switch into the right mode.
3. Generate small micro-tasks.
4. Start a short sprint.
5. Check in.
6. Remember what helped.

## Hackathon Positioning

Short description:

> An adaptive AI companion that turns vague study and work goals into small, timed actions, then remembers what helped the user start.

Product line:

> Your adaptive AI companion for study, work, daily check-ins, and small actionable steps.

Main judging claim:

> Most AI companions keep users talking. NextStep Companion helps users start.

## Why It Fits Sea x OpenAI Codex Hackathon

### Autonomous and Adaptive AI

The system adapts from user input without requiring manual setup every time:

```text
message -> detected state -> mode -> micro-task plan -> check-in -> memory update
```

### AI-Native Products and Operations

The UI is driven by structured AI output, not just a chat bubble:

- current mode
- companion state
- micro-task checklist
- timer
- check-in
- memory update
- orchestration trace

### Deep Domain AI

The focused domain is study initiation and procrastination. The value is helping the user begin, not maximizing conversation length.

MVP user states:

- Avoidance
- Overwhelmed
- Low motivation
- Ready to focus
- Stuck
- Recovery break needed

## Current Repo

Current files:

- `nextstep-companion.html` - standalone React/Tailwind demo.
- `nextstep-companion-data.json` - companion config, mock responses, schema notes.
- `IMPLEMENTATION_PLAN.md` - detailed architecture and build plan.
- `DUTY_SPLIT.md` - four-person team ownership and timeline.

## How To Use These Docs

Use `README.md` for the short project story and judging angle.

Use `IMPLEMENTATION_PLAN.md` when deciding what to build, how the runtime should work, and what the frontend/backend contract should return.

Use `DUTY_SPLIT.md` during the hackathon to keep the team from overlapping work or arguing about ownership.

Important current code anchors:

- `generateChatResult` - current mock engine.
- `generateChatResultAsync` - backend/API replacement boundary.
- `ScenarioSelector` - current page 1.
- `ImageUpload` - current scan/upload page.
- `CompanionCardPage` - generated companion profile.
- `TaskSupportPanel` - right-side adaptive panel.
- `ChatInterface` - runtime chat.
- `VideoCompanionMode` - display/stage mode.
- `MemoryResult` - memory/result page.
- `App` - root state machine and router.

## Five-Page Demo

1. Home: companion hero plus product explanation.
2. Personalization and Scan-to-Companion: upload object/pet/toy and choose tone/use case.
3. Runtime Panel: companion state, current mode, micro-task plan, timer, check-in.
4. Memory Layer: preferences, recent goals, completed tasks, check-in history.
5. Display Mode: large companion, current mode, reply bubble, current task.

## Known-Good Demo Input

Use this during judging:

```text
I have a finance quiz but I am tired and stuck.
```

Expected result:

- detected state: low motivation or avoidance
- mode: Encourage Mode
- micro-task plan appears
- timer can start
- memory update appears

## OpenAI Architecture References

- Responses API: https://platform.openai.com/docs/api-reference/responses
- Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs
- Agents SDK: https://platform.openai.com/docs/guides/agents-sdk
- Realtime API: https://platform.openai.com/docs/guides/realtime/overview
