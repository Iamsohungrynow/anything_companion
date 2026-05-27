# Implementation Plan

## 1. Product Scope

Build NextStep Companion as a study-start companion for users who are stuck, tired, overwhelmed, or procrastinating.

Keep the product focused:

- Main wedge: "I need to study, but I cannot start."
- Main demo scenario: finance quiz preparation.
- Main product value: turn vague intent into a small timed action.
- Secondary value: remember what helps the user start.

Do not lead with:

- generic AI friend positioning
- broad emotional support claims
- complex 3D/video dependency
- pet/ACG/work as equal headline products
- long freeform chat

Pet, ACG, toy, and desktop-object companions are personalization skins over the same engine.

## 2. MVP User Flow

### Page 1 - Home / Product Framing

Purpose:

Show the product idea in one screen.

Add:

- virtual companion visual: pet, study partner, desktop robot, or transparent character
- product line: "Your adaptive AI companion for study, work, daily check-ins, and small actionable steps."
- proof chips:
  - Detects state
  - Plans micro-tasks
  - Remembers what helps
- CTA: "Create my companion"

Implementation anchor:

- rework `ScenarioSelector`
- default primary path should be Study
- keep alternate companion types as small chips, not equal product cards

### Page 2 - Personalization + Scan-to-Companion

Purpose:

Let users upload a pet, toy, figure, keychain, desk item, or meaningful object and turn it into a companion.

Tone of Voice:

- Soft and supportive / 温柔支持型
- Short and direct / 简短直接型
- Cute and playful / 可爱活泼型
- Coach-like / 教练型
- Friend-like / 朋友型

Main Use Case:

- Help me study / 帮我学习
- Help me work / 帮我工作
- Light emotional support / 轻情绪支持
- Pet companionship / 宠物陪伴
- Reminder and routine / 提醒与日程

Scan fields:

- What is this object or pet's name? / 它叫什么？
- What personality should it have? / 它是什么性格？
- What role should it play in your life? / 它在你的生活中扮演什么角色？

Role options:

- Study companion
- Emotional support buddy
- Memory keeper
- Daily reminder pet

Generated profile example:

```json
{
  "name": "Mochi",
  "type": "Digital Pet Companion",
  "personality": ["gentle", "cute", "supportive"],
  "role": "Helps the user start study tasks and gives daily check-ins"
}
```

MVP behavior:

- accept uploaded/default image
- generate profile from selected tone, use case, name, personality, and role
- if OpenAI vision is ready, use image understanding
- if not, mock scan result and still generate convincing profile

Implementation anchors:

- `ImageUpload`
- `CompanionCardPage`
- `COMPANIONS`
- `SCENARIO_META`

### Page 3 - Runtime Panel

Purpose:

Prove the companion helps users act, not just talk.

Left side:

- companion display
- state-based visual reaction

Companion states:

- Idle / 待机
- Happy / 开心
- Thinking / 思考
- Encouraging / 鼓励
- Focused / 专注
- Resting / 休息
- Concerned / 关心

Right side:

- Current Mode: Encourage Mode / 当前模式：鼓励模式
- Current Mode: Study Sprint Mode / 当前模式：学习冲刺模式
- Goal Understanding
- Micro-task Plan
- Start button
- Countdown
- Check-in result
- Orchestration trace

Example input:

```text
I need to prepare for my finance quiz.
```

Example output:

```text
Goal Understanding:
You want to prepare for your finance quiz, but the task feels too big right now.

Micro-task Plan:
Step 1: Open your notes. 2 minutes
Step 2: Review 3 key formulas. 8 minutes
Step 3: Try 2 practice questions. 10 minutes
Step 4: Mark what you do not understand. 3 minutes

Start Button:
Start 10-min Sprint

Check-in:
How did it go?
- Done
- Partly done
- I got stuck
```

Implementation anchors:

- `ChatInterface`
- `TaskSupportPanel`
- `generateChatResultAsync`
- `MODE_COLORS`

### Page 4 - Memory Layer

Purpose:

Show that the companion is not a one-off chat.

MVP memory fields:

- User Name / 用户名字
- Companion Settings / 角色设定
- Preferred Mode / 常用模式
- Recent Goals / 最近目标
- Completed Micro-tasks / 完成的小任务
- Check-in History / 每日 check-in 记录

Display examples:

- You prefer short and gentle reminders.
- You are currently preparing for a finance quiz.
- You completed 3 study sprints this week.
- You often start better with 5-minute tasks.

Implementation anchors:

- `MemoryResult`
- `memory_schema` in `nextstep-companion-data.json`
- `safeMemory` in `App`

### Page 5 - Display / Stage Mode

Purpose:

Make the companion usable on a large screen, projection, or desktop display.

Keep only:

- big companion
- current emotional state
- AI reply bubble
- current mode
- current micro-task

Layout:

- center: companion
- top: "`Cappu` is in Study Sprint Mode"
- bottom: companion reply
- bottom-right: next step and duration

Example display copy:

```text
Let's only do 10 minutes. Open your notes and find the first formula. I will stay with you.

Next step: Review 3 formulas - 8 min
```

Implementation anchors:

- `VideoCompanionMode`
- `Live2DStage`
- `AnimatedSvgFallback`
- `SimpleCharacterDisplay`
- `TaskMiniOverlay`

## 3. Runtime Architecture

Keep frontend and backend separated by one clean runtime contract.

```text
Frontend
  - home flow
  - scan-to-companion setup
  - runtime panel
  - timer/check-in UI
  - memory display
  - stage mode

Backend
  - /api/chat
  - orchestration layer
  - OpenAI call
  - structured output validation
  - session memory
  - fallback mock engine
```

## 4. Orchestration Layer

For the hackathon, implement subagents as backend modules behind one endpoint.

```text
POST /api/chat
  -> Orchestrator
    -> Persona Skill
    -> State Detector Skill
    -> Mode Router Skill
    -> Action Planner Skill
    -> Companion Reply Skill
    -> Memory Writer Skill
  -> structured response
  -> frontend adaptive UI
```

MVP implementation can be one OpenAI Responses API call with structured JSON, plus modular prompt sections.

If there is time, split the flow into Agents SDK handoffs. Do not make that a dependency for the judged demo.

## 5. MML Layer

For this repo, define MML as the Mode-Memory-Loop unless the team has a different external MML spec.

```text
Message -> Mode detection -> Micro-task plan -> Live timer/check-in -> Memory update
```

Show this in the UI as an orchestration trace:

```text
Input received
State detected: Low motivation
Mode selected: Encourage Mode
Action generated: 10-minute sprint
Memory update queued: user starts better with short tasks
```

## 6. Backend File Structure

Recommended structure if adding a backend:

```text
server/
  index.ts
  schemas.ts
  openai/
    client.ts
  runtime/
    orchestrator.ts
    prompts.ts
    skills/
      personaSkill.ts
      stateDetectorSkill.ts
      modeRouterSkill.ts
      actionPlannerSkill.ts
      companionReplySkill.ts
      memoryWriterSkill.ts
  fallback/
    mockEngine.ts
  store/
    sessionStore.ts
```

## 7. API Endpoints

Minimum:

```text
GET  /api/health
POST /api/session
POST /api/chat
GET  /api/session/:id/memory
POST /api/session/:id/reset
```

Optional:

```text
POST /api/realtime/session
```

Only add Realtime if voice becomes a core demo feature. Browser speech is enough for MVP.

## 8. Runtime Request Contract

```ts
type RuntimeRequest = {
  session_id?: string;
  scenario: "study" | "work" | "pet" | "daily";
  message: string;
  channel: "text" | "voice" | "stage";
  tone: "soft_supportive" | "short_direct" | "cute_playful" | "coach_like" | "friend_like";
  use_case: "study" | "work" | "light_support" | "pet_companionship" | "routine";
  companion: CompanionProfile;
  memory?: MemorySnapshot;
};
```

## 9. Runtime Response Contract

```ts
type RuntimeResponse = {
  session_id: string;
  reply: string;
  detected_state: "avoidance" | "overwhelmed" | "low_motivation" | "ready_to_focus" | "stuck" | "recovery_break_needed" | "neutral";
  companion_state: "idle" | "happy" | "thinking" | "encouraging" | "focused" | "resting" | "concerned";
  mode: "Encourage Mode" | "Study Sprint Mode" | "Check-in Mode" | "Routine Mode";
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
  memory: MemorySnapshot;
  trace: Array<{
    step: string;
    status: "complete" | "fallback";
    summary: string;
  }>;
  fallback_used: boolean;
};
```

## 10. Memory Snapshot

```ts
type MemorySnapshot = {
  user_name?: string;
  current_companion: string;
  companion_settings: CompanionProfile;
  preferred_mode: string;
  preferred_task_length: string;
  recent_goals: string[];
  completed_micro_tasks: string[];
  check_in_history: Array<{
    date: string;
    goal: string;
    result: "done" | "partly_done" | "stuck";
  }>;
  latest_memory_update: string;
  updated_at: string;
};
```

## 11. Fastest Path In Current Repo

Because the repo is currently a single HTML file, do not start with a full rewrite.

Phase 1:

- keep `nextstep-companion.html`
- add new fields to React state
- extend `ImageUpload` into builder page
- extend `TaskSupportPanel` with goal understanding, timer, check-in buttons, and trace
- extend `MemoryResult` with memory cards
- replace only `generateChatResultAsync` when backend is ready

Phase 2:

- add `server/`
- move mock logic into `server/fallback/mockEngine.ts`
- make `generateChatResultAsync` call `/api/chat`

Phase 3:

- optional migration from standalone HTML to Vite/React
- only do this after the demo flow works

## 12. Prompt System

Prompt goals:

- stay brief
- do not over-therapize
- convert vague goals into concrete next actions
- prefer 5-10 minute starts
- return schema-valid JSON
- avoid medical or mental-health diagnosis
- preserve selected tone

Runtime instruction:

```text
You are the runtime engine for an adaptive study companion.
Your job is to help the user start action, not maximize conversation.
Return short supportive copy and 2-4 concrete micro-tasks.
Use the selected tone.
Update memory with one useful preference or fact.
```

## 13. Fallback Strategy

The demo must work even if:

- OpenAI key is missing
- OpenAI call times out
- schema parse fails
- Live2D asset is missing
- microphone permission is denied
- TTS is unsupported
- upload fails
- CDN is unavailable during demo

Fallback rules:

- API failure -> mock engine
- Live2D failure -> SVG/simple avatar
- mic failure -> manual input
- TTS failure -> subtitle/chat bubble
- upload failure -> default image
- network/CDN risk -> pre-open the app before judging

## 14. Demo Script

Opening:

> Most AI companions keep the user talking. NextStep Companion helps the user start. It detects when someone is stuck, switches into the right mode, creates a tiny action plan, checks in, and remembers what helped.

Step 1:

> I create a companion from a familiar desk object, so the system has a personal anchor.

Step 2:

> I choose the tone and main use case. For this demo, I want short, supportive study help.

Step 3:

Type:

```text
I have a finance quiz but I am tired and stuck.
```

Say:

> The system detects low motivation, enters Encourage Mode, and avoids giving a huge study plan. It creates a small sprint.

Step 4:

Click:

```text
Start 10-min Sprint
```

Say:

> This is the difference from a normal companion. It moves the user into action.

Step 5:

Open memory.

Say:

> The memory layer learns that this user starts better with short study sprints. Next time the companion can adapt immediately.

Closing:

> The current demo is study-first, but the same orchestration layer supports work sessions, routines, pet companionship, and desktop display mode.

## 15. Known-Good Demo Inputs

```text
I have a finance quiz but I am tired and stuck.
```

```text
I want to start my essay but it feels too big.
```

```text
I need to clean my room and I feel overwhelmed today.
```

```text
I am ready to focus now.
```

Avoid:

- crisis or medical wording
- long emotional confessions
- requests unrelated to study/work/routine
- anything requiring real external tools

