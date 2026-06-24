# Yorimi — Demo Script
**Target: 3 minutes | Sea × OpenAI Codex Hackathon**

> *The final live speech may be slightly adjusted during the actual presentation, so the script does not need to be word-for-word final. But it should give us a clear and stable 3-minute demo story.*

---

## Before You Start (Setup Checklist)

- [ ] Browser open at `http://127.0.0.1:3017` (or deployed URL), on the homepage
- [ ] Backup tab preloaded at `http://127.0.0.1:3017/?runtime=local`
- [ ] Screen mirrored or projected
- [ ] Known-good input ready to type: **"I have a finance quiz but I am tired and stuck."**
- [ ] Fallback: `?runtime=local` backup tab active — no API key needed for the full demo path

---

## Opening (0:00 – 0:25)

> "Most productivity tools push users to finish tasks.
> Most AI companions keep users talking.
> **Yorimi does something different.**
> It first makes the user feel accompanied — when starting feels hard.
> Then it gently turns that moment of companionship into one small action."

> "It is not a task planner.
> It is not just a chatbot with a cute face.
> It is a companion-to-action system:
> **first companionship — then action.**"

---

## Step 1 — Shape your companion (0:25 – 0:50)

**Action:** Click **"Create my companion →"** on the homepage.

> "I start by shaping the companion — not just picking settings."

**Action:** On the Setup page, select:
- Tone: **"Short & direct"**
- Role: **"Study companion"**
- Use case: **"Help me study"**

> "I am choosing how this companion will sound, what role it will play,
> and what it should help with.
> I am not just configuring a tool.
> I am shaping how this companion will stay with the user
> when they feel stuck and can't begin."

**Action:** Click **"Next: Upload your image →"**.

**Action:** On the upload page, choose the default ☕ coffee cup. Click **Generate Companion**.

> "The system generates a full companion profile —
> name, personality, tone, role, interaction style.
> No prompt engineering needed from the user."

---

## Step 2 — Meet your companion (0:50 – 1:05)

**Action:** Companion card appears. Point to the profile.

> "This is Cappu — a morning study companion.
> Personality, tone, and role are all set from what we chose.
> One click and we're in the runtime."

**Action:** Click **"Start chatting →"**

---

## Step 3 — The core demo: companionship first, then action (1:05 – 1:50)

**Action:** Type into the chat:

```
I have a finance quiz but I am tired and stuck.
```

**Action:** Wait for the AI response to appear (~1 second with mock).

> "Watch the companion's response first."

**Point to the chat message:**

> "It doesn't immediately give a study plan.
> It says: 'I can tell you are tired and stuck. That is okay.
> We do not need to finish everything now.
> I will stay with you for just 10 minutes.
> Let's start with one small step.'
> **This is the difference from a normal chatbot.
> A normal chatbot gives you an answer.
> Yorimi stays with you first —
> then moves you into action.**"

**Point to the Adaptive Mode Panel:**

> "The system detected: low motivation.
> It switched into Encourage Mode —
> the right mode for someone who cannot start."

**Point to Goal Understanding:**

> "It understood the situation, not just the words."

**Point to the Micro-task plan:**

> "Three small steps. Ten minutes total.
> Open your notes. Review three formulas. Try one question.
> Not overwhelming. Just enough to begin."

---

## Step 4 — Start the shared sprint (1:50 – 2:05)

**Action:** Click **"Start 10-min Sprint"**

> "One click. The companion starts a small shared session.
> The user is not being pushed forward alone —
> they are starting *with* the companion.
> That is what makes this feel different."

**Action:** Point to the check-in buttons.

> "After the sprint, three simple options: Done, Partly done, or I got stuck.
> Not a grade. Not a judgment. Just a check-in."

---

## Step 5 — Memory layer (2:05 – 2:35)

**Action:** Click **"View Memory"** (or navigate to the memory page).

> "After the session — this is what makes Yorimi different
> from a one-off chat."

**Point to the memory card:**

> "The companion learned: this user starts better with short, gentle 10-minute sprints.
> Next time they come back tired and stuck,
> the companion already knows how to help them begin."

> "This is not progress tracking.
> This is long-term memory — the companion is not recording completed tasks.
> It is learning your rhythm, your preferred support style,
> and what helps *you specifically* begin.
> Long-term memory is what makes companionship continuous.
> The more sessions, the more the companion understands how to support you."

**Point to the 'What's next' section:**

> "The same engine can extend to future companion skins —
> anime-style virtual companions, digital pet memory companions,
> or a 3D desktop display experience.
> The core stays the same: a companion that stays with you,
> learns from you, and helps you take the next step."

---

## Closing (2:35 – 3:00)

> "What you just saw is the study-first demo —
> the sharpest, clearest version of what this engine does:
> companionship → state detection → mode switch → micro-task → sprint → check-in → memory."

> "The current MVP proves the AI action engine works.
> But the long-term vision is a companion with a stronger physical presence —
> a 3D virtual character, a desktop companion,
> or a low-cost holographic-style display that lives on your desk.
> Not a chatbot window. A presence.
> The same engine powering a much stronger feeling of being accompanied."

> "The same engine can also extend to work sessions
> and future companion skins — anime, pet, desktop display.
> But the core idea stays the same:
> **not a task planner, not just a chatbot —
> a companion that stays with you when starting feels hard,
> then helps you take one small next step.**"

---

## Fallback Lines (if something breaks)

| What breaks | What to say |
|---|---|
| API / OpenAI unavailable | "The system has a mock fallback — so even without an API key, the full interaction works." |
| Avatar / visual fails | "We're running in fallback display mode — same engine, simpler visual." |
| Page doesn't load | "Let me switch to the backup tab." *(pre-open a second tab)* |
| Sprint button doesn't respond | "The sprint starts a shared timed session — here's the check-in flow it leads to." |

---

## One-sentence explanations (for judges' questions)

**"What does the backend do?"**
> "The frontend calls one runtime endpoint. It returns structured state, mode, micro-tasks, memory, and trace — with mock fallback if OpenAI is unavailable."

**"How is this different from ChatGPT?"**
> "ChatGPT gives you an answer. Yorimi gives you companionship first, then a small timed action, and remembers what helped you start."

**"What's the business model / who's the user?"**
> "Students and young professionals who struggle to start studying or working. The companion personalizes over time — that's the retention hook."

**"Why does the companion matter? Why not just a plain UI?"**
> "The companion is the reason users come back. The action engine is what makes it useful. You need both."

**"Why study first?"**
> "Study is the sharpest demo of the full loop: a stuck user, a clear state, a mode switch, a micro-task plan, a sprint, and a memory update. It proves the engine in the most visible way."

---

## Cut Priority (if time is low)

Cut in this order — keep the core loop at all costs:

1. Cut: Display / video mode
2. Cut: Voice input / TTS
3. Cut: Avatar animation
4. **Keep: Homepage → Setup → Upload → Chat (with micro-task plan) → Memory**
5. **Keep: The demo input and the Encourage Mode response**
