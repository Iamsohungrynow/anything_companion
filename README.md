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

Yorimi is **two apps that share one runtime**:

1. **Runtime + companion demo** (repo root) - a Node backend (`server/`) exposing
   `/api/*` (chat, TTS, STT) plus a self-contained companion demo
   (`frontend/static/nextstep-companion.html`) with a live video companion, memory,
   and voice. Deployed as Vercel serverless functions (`api/`) + static files
   (see `vercel.json`).
2. **Marketing site** (`web/`) - a Next.js 15 + Tailwind + Motion app: the bilingual
   (中 / EN) landing page, app-screen mockups at `/mockups`, and the demo re-served at
   `/demo`. It proxies `/api/*` to the runtime.

## Run locally (two terminals)

```bash
# 1) runtime + demo  ->  http://127.0.0.1:3017
npm install
cp .env.example .env        # add OPENAI_API_KEY etc. for live AI; mock works with no keys
npm run dev

# 2) marketing site  ->  http://localhost:3000
cd web && npm install && npm run dev
```

- Landing: <http://localhost:3000>
- App mockups: <http://localhost:3000/mockups>
- Companion demo: <http://localhost:3000/demo> (or `http://127.0.0.1:3017/nextstep-companion.html`)

Without `OPENAI_API_KEY`, the runtime falls back to schema-compatible mock behavior.

## Deployment (two Vercel projects, both from `main`)

The two apps are two Vercel projects imported from this same repo:

| Project | Root Directory | Serves |
|---|---|---|
| **Runtime + demo** | repo root | `/api/*` functions + the companion demo at `/` |
| **Marketing site** | `web` | the landing at `/`, `/mockups`, `/demo`; proxies `/api/*` to the runtime |

> Your **public site is the marketing-site project** - its `/` is the landing page.
> The runtime project's URL is used only as the API backend (via the `YORIMI_API_ORIGIN`
> env var on the marketing-site project). Step-by-step: [`web/README.md`](./web/README.md).

Provider keys (OpenAI / Fish Audio / Doubao / Volcano) live in the **runtime** project's
environment variables, not the marketing site.

## Repository structure

- [`web/`](./web) - Next.js marketing site (landing, mockups, `/demo`)
- [`frontend/static`](./frontend/static) - standalone companion demo HTML + data
- [`frontend/companion-experience`](./frontend/companion-experience) - interaction-system source
- [`server/`](./server) - Node runtime: provider engines, orchestration, sessions, tests
- [`api/`](./api) - Vercel serverless wrappers for the runtime
- [`assets/`](./assets) - brand, companion visuals, hardware-demo media

## Notes

- The visible assistant message renders from `answer` first, then `reply`.
- Mock behavior is fallback only.
- Voice is progressive enhancement; typing and reading must always work.
