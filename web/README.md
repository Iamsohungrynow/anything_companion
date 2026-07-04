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
- `/mockups` — Home / Countdown / Chat app-screen mockups

```bash
npm run build      # production build (verified passing)
npm run typecheck  # tsc --noEmit
```

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
