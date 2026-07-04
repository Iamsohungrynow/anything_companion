# Yorimi Web

Marketing landing page + app-screen mockups for Yorimi, the AI character companion.
Next.js (App Router) + TypeScript + Tailwind v4 + Motion.

## Run

```bash
cd web
npm install      # already run once; re-run if deps change
npm run dev      # http://localhost:3000
```

- `/` — the landing page
- `/demo` — the full companion demo (served from `public/demo.html`), whose `/api/*` calls are proxied to the runtime
- `/mockups` — Home / Countdown / Chat app-screen mockups

```bash
npm run build      # production build (verified passing)
npm run typecheck  # tsc --noEmit
```

## Deploy (Vercel, as its own project)

This app lives in the `web/` subfolder; the repo root is a separate (backend) Vercel
project. Deploy `web/` as its **own** project:

1. Vercel dashboard: New Project, import the Yorimi repo.
2. Set **Root Directory** to `web`. The framework preset auto-detects **Next.js**.
3. Set **Production Branch** to `main` (the `web/` app lives on `main`).
4. Add an Environment Variable:
   - `YORIMI_API_ORIGIN` = your deployed backend URL (e.g. `https://yorimi.vercel.app`).
     This is where `/api/*` (chat, TTS, STT) is proxied. Without it, API calls fail in prod.
5. Deploy.

Notes:
- `/api/*` is a server-side rewrite (see `next.config.mjs`), so no CORS setup is needed and no
  provider keys live in this project.
- Voice/chat provider keys (Fish, OpenAI, etc.) belong to the **backend** project's env, not here.
- `/demo` and its `/assets/*` media are served statically from `public/`.

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
