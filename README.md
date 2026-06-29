<p align="center">
  <img src="./assets/brand/yorimi-logo.png" alt="Yorimi logo" width="300" />
</p>

<h1 align="center">Yorimi</h1>

<p align="center">
  <strong>Be there. Every day.</strong>
</p>

<p align="center">
  AI character presence for study, work, routines, creator IP interaction, and 3D desktop companionship.
</p>

<p align="center">
  <a href="https://github.com/Iamsohungrynow/Yorimi">GitHub</a>
  |
  <a href="https://compagnon-eveil.vercel.app/">Live Demo</a>
</p>

---

## What Yorimi Is

Yorimi is an adaptive AI companion system built around character presence, not generic chat. It combines:

- persona-consistent conversation
- session memory and companion profile context
- study, work, routine, and emotional check-in support
- voice playback with browser fallback
- expressive companion visuals and state feedback
- a path toward physical 3D desktop embodiment

The goal is to make a companion that feels coherent across tone, role, use case, and recent history, while still staying responsive to the user's latest message.

## Product Experience

Yorimi is designed for moments when a user wants more than an answer. A companion can respond with personality, remember relevant context, and help the user move from hesitation into one small action.

Typical use cases include:

- study support and sprint starts
- work focus and routine check-ins
- low-energy or emotionally stuck moments
- object-based companions and creator-owned characters
- character-driven interaction systems for original IP

## Current Prototype

This repository contains the current Yorimi runtime prototype, including:

- a standalone web companion demo
- the OpenAI runtime adapter
- schema-compatible fallback behavior
- session and lightweight memory handling
- browser and API-based voice paths
- committed companion and hardware-demo assets

The live demo currently uses an older deployment domain:

```text
https://compagnon-eveil.vercel.app/
```

That URL is only a deployment detail. The product and repository identity are Yorimi.

## Demo

- Live web demo: https://compagnon-eveil.vercel.app/
- Local route: `http://127.0.0.1:3017/nextstep-companion.html`
- Hardware proof GIF: [assets/hardware-demo.gif](./assets/hardware-demo.gif)
- Hardware proof video: [assets/hardware-demo.mp4](./assets/hardware-demo.mp4)
- Device state demo assets: [assets](./assets)

## Run Locally

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open:

```text
http://127.0.0.1:3017/nextstep-companion.html
```

For live AI, set:

```env
OPENAI_API_KEY=your_key_here
USE_MOCK_AI=false
```

Without `OPENAI_API_KEY`, the backend falls back to schema-compatible mock behavior for rendering and failure handling.

## Repository Structure

- [frontend/static](./frontend/static) - served standalone HTML demo and companion data
- [frontend/companion-experience](./frontend/companion-experience) - interaction-system source files
- [server/engines/openai](./server/engines/openai) - OpenAI adapter
- [server/engines/mock](./server/engines/mock) - emergency fallback logic
- [server/engines/runtime](./server/engines/runtime) - orchestration and runtime guards
- [server/tests](./server/tests) - contract and smoke tests
- [assets](./assets) - companion visuals and demo media
- [api](./api) - Vercel serverless wrappers

## Notes

- Normal chat should use the OpenAI runtime when `OPENAI_API_KEY` is configured.
- Mock behavior is fallback only.
- The visible assistant message should render from `answer` first, then `reply`.
- Voice is progressive enhancement; typing and reading must always work.
