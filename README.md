<p align="center">
  <img src="./assets/brand/yorimi-logo.png" alt="Yorimi logo" width="300" />
</p>

<h1 align="center">Yorimi</h1>

<p align="center">
  <strong>Be there. Every day.</strong>
</p>

<p align="center">
  An AI character companion for study, daily life, and creator IP, with a warm
  hand-drawn identity and a path toward a 3D desktop device.
</p>

---

## What's in this repo

The product is the **`web/`** app: a Next.js 15 + Tailwind + Motion site that serves
everything from one deployment:

- `/` - the bilingual (中 / EN) landing page
- `/mockups` - app-screen mockups
- `/demo` - the full companion demo (live video companion, memory, voice)
- `/api/*` - the Yorimi runtime (chat incl. SSE streaming, TTS, STT), bundled into the app

The canonical runtime source lives at **`/server`** (Node). It is bundled into the web
app as a single self-contained file (`web/server/runtime.bundle.cjs`) via
`npm run build:runtime`, so the web app needs no separate backend. The repo root also
keeps the original standalone runtime (`/server`, `/api`, `vercel.json`) which can still
be deployed on its own, but the `web/` app supersedes it.

## Run locally

```bash
cd web
npm install
cp .env.example .env        # add OPENAI_API_KEY etc. for live AI; mock works with no keys
npm run dev                 # http://localhost:3000  (landing + /demo + /api/*)
```

One server serves the landing, the demo, and the whole API. Without keys, chat falls
back to schema-compatible mock behavior and TTS/STT report "not configured".

## Deployment (one Vercel project)

Import this repo as a single Vercel project:

1. New Project, import the repo.
2. **Root Directory = `web`** (framework auto-detects Next.js).
3. **Production Branch = `main`**.
4. Add the runtime keys as Environment Variables (`OPENAI_API_KEY`, `FISH_AUDIO_API_KEY`,
   `FISH_AUDIO_REFERENCE_ID`, `VOLC_*`, etc. - see `web/.env.example`).
5. Deploy.

That one project serves the landing, `/demo`, and `/api/*`. No proxy, no second project.

## Repository structure

- [`web/`](./web) - the app (landing, mockups, demo, and the bundled `/api/*` runtime)
- [`server/`](./server) - canonical runtime source (bundled into `web/` via `npm run build:runtime`)
- [`frontend/static`](./frontend/static) - the standalone companion demo HTML + data
- [`api/`](./api) - Vercel serverless wrappers for the standalone runtime (legacy)
- [`assets/`](./assets) - brand, companion visuals, hardware-demo media

## Notes

- The visible assistant message renders from `answer` first, then `reply`.
- Mock behavior is fallback only.
- Voice is progressive enhancement; typing and reading must always work.
- Regenerate the web app's runtime bundle after changing `/server`: `cd web && npm run build:runtime`.
