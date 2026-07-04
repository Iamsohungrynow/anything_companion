# Yorimi Web

The Yorimi web app: the bilingual landing page, app-screen mockups, the companion demo,
and the whole `/api/*` runtime, all served by one Next.js app.
Next.js (App Router) + TypeScript + Tailwind v4 + Motion.

## Run

```bash
cd web
npm install
cp .env.example .env   # add OPENAI_API_KEY etc. for live AI; mock works with no keys
npm run dev            # http://localhost:3000
```

- `/` — the landing page
- `/demo` — the full companion demo (served from `public/demo.html`)
- `/mockups` — Home / Countdown / Chat app-screen mockups
- `/api/*` — the Yorimi runtime (chat incl. SSE, TTS, STT), bundled into the app

```bash
npm run build      # production build (verified passing)
npm run typecheck  # tsc --noEmit
```

## Deploy (one Vercel project)

Import the repo as a single Vercel project:

1. New Project, import the repo.
2. Set **Root Directory** to `web` (framework auto-detects Next.js).
3. Set **Production Branch** to `main`.
4. Add the runtime keys as Environment Variables (see `.env.example`):
   `OPENAI_API_KEY`, `FISH_AUDIO_API_KEY`, `FISH_AUDIO_REFERENCE_ID`, `VOLC_*`, etc.
5. Deploy.

One project serves `/` (landing), `/mockups`, `/demo`, and `/api/*`. No proxy, no second project.

### How the API is served

`app/api/[...path]/route.ts` loads the Yorimi runtime, pre-bundled into one self-contained
file at `server/runtime.bundle.cjs` (all internal requires inlined, only Node built-ins
external), via Node's native require at runtime; `next.config.mjs` trace-includes that file
into the serverless function. The bundle is committed. Regenerate it from `/server` with:

```bash
npm run build:runtime
```

Without provider keys, chat falls back to mock and TTS/STT report "not configured".

## Design system (locked)

Warm-pastel, cute, rounded, light theme. Tokens live in `app/globals.css` (`@theme`):

- **Ground**: milk-peach `#fff6f1`, surfaces `peach-100 / peach-200`.
- **Accent (only one)**: coral `#ff8a66` (+ `coral-soft`, `coral-deep`). Rose `#ff9cb2` is a
  same-family cute pop, used sparingly.
- **Text**: cocoa-plum `#4b3742` (never pure black), muted `plum-soft`.
- **Radii**: `rounded-soft` 18, `rounded-card` 28, `rounded-blob` 44, pill for controls.
- **Type**: Fredoka (rounded display) + Nunito (body) via `next/font`, CJK falls through to the
  system stack.
- **Motion**: `motion/react` for entrance + scroll reveals + interactive springs; cheap ambient
  loops (mascot bob/blink/spark, equalizer, marquee) are CSS keyframes in `globals.css`. Everything
  collapses under `prefers-reduced-motion`.

## Structure

```
app/
  layout.tsx          fonts + metadata
  globals.css         Tailwind v4 + design tokens + ambient keyframes
  page.tsx            landing composition
  mockups/page.tsx    three phone mockups
components/
  ui/Mascot.tsx       the companion (shared SVG character, placeholder IP)
  ui/Reveal.tsx       reduced-motion-safe scroll reveal
  landing/            Nav, Hero, LoopDemo (countdown USP), Bento, MiniTV,
                      Audience, TourMarquee, Reserve, Footer
  mockups/            PhoneFrame, TabBar, HomeScreen, CountdownScreen, ChatScreen
```

The mascot is a placeholder design direction, not the flagship IP.
