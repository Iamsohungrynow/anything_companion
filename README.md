# Compagnon Eveil

Compagnon Eveil is an AI companion demo for study, daily routines, emotional check-ins, object-based companions, and creator-style character interaction.

The demo focuses on natural companion dialogue, lightweight memory, state feedback, micro-action guidance, voice fallback, and a path toward desktop presence.

## Live Demo

Current deployment:

```text
https://compagnon-eveil.vercel.app/
```

## What Is In This Repo

The main product is the **`web/`** app: a Next.js 15 + Tailwind + Motion site that serves everything from one deployment:

- `/` - landing page
- `/mockups` - app-screen mockups
- `/demo` - the full companion demo with chat, memory, and voice controls
- `/api/*` - the companion runtime, including chat, SSE streaming, TTS, and STT routes

The canonical runtime source lives in **`server/`**. It is bundled into the web app as `web/server/runtime.bundle.cjs` through `npm run build:runtime`, so the web app can deploy without a separate backend.

The repo also keeps the older standalone runtime shape in `server/`, `api/`, and root `vercel.json` for compatibility, but the `web/` app is the current deployment path.

## Run Locally

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

Then open:

```text
http://localhost:3000
```

Without provider keys, chat falls back to schema-compatible mock behavior and TTS/STT report that they are not configured. Add `OPENAI_API_KEY` for live AI responses. Fish Audio keys are optional; browser speech fallback remains available without them.

## Deploy

Import this repo as one Vercel project:

1. Set **Root Directory** to `web`.
2. Set **Production Branch** to `main`.
3. Add runtime environment variables from `web/.env.example`.
4. Deploy.

One project serves the landing page, `/mockups`, `/demo`, and `/api/*`.

## Repository Structure

- [`web/`](./web) - Next.js app, landing page, mockups, demo, and bundled API runtime
- [`server/`](./server) - canonical Node runtime source
- [`frontend/static/`](./frontend/static) - standalone companion demo HTML and companion data
- [`frontend/companion-experience/`](./frontend/companion-experience) - companion interaction-system source files
- [`api/`](./api) - Vercel serverless wrappers for the standalone runtime
- [`assets/`](./assets) - companion visuals and hardware-demo media
- [`docs/`](./docs) - planning notes, submission materials, and test matrices

## Runtime Notes

- Visible assistant messages render from `answer` first, then `reply`.
- Mock behavior is fallback only.
- Voice is progressive enhancement; typing and reading must always work.
- Regenerate the web runtime bundle after changing `server/`: `cd web && npm run build:runtime`.
