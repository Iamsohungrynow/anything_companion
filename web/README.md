# Compagnon Eveil Web

The Compagnon Eveil web app serves the landing page, app-screen mockups, companion demo, and `/api/*` runtime from one Next.js app.

Stack: Next.js App Router, TypeScript, Tailwind v4, and Motion.

## Run

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

Local URL:

```text
http://localhost:3000
```

Routes:

- `/` - landing page
- `/demo` - full companion demo served from `public/demo.html`
- `/mockups` - Home, Countdown, and Chat app-screen mockups
- `/api/*` - companion runtime routes for chat, SSE, TTS, and STT

Useful checks:

```bash
npm run build
npm run typecheck
```

## Deploy

Import the repo as one Vercel project:

1. Set **Root Directory** to `web`.
2. Set **Production Branch** to `main`.
3. Add runtime keys from `.env.example`, including `OPENAI_API_KEY` and optional voice provider keys.
4. Deploy.

One project serves `/`, `/mockups`, `/demo`, and `/api/*`.

## How The API Is Served

`app/api/[...path]/route.ts` loads the runtime from `server/runtime.bundle.cjs`. The bundle is committed and is trace-included into the Vercel serverless function.

Regenerate it from the repository root runtime source with:

```bash
npm run build:runtime
```

Without provider keys, chat falls back to mock behavior and TTS/STT report that they are not configured.

## Structure

```text
app/
  layout.tsx
  globals.css
  page.tsx
  mockups/page.tsx
components/
  ui/
  landing/
  mockups/
public/
  demo.html
server/
  runtime.bundle.cjs
```

The mascot and companion art are placeholder demo assets, not licensed third-party IP.
