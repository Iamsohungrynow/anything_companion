# Yorimi Demo Run Instructions

<p align="center">
  <img src="../../../../assets/brand/yorimi-logo.png" alt="Yorimi Logo" width="220" />
</p>

Project: Yorimi  
Stage: Preliminary Round Wave 1 / Wave 2 preparation  
Live demo: https://compagnon-eveil.vercel.app/

The deployed domain still uses **Compagnon Éveil**, the predecessor name of Yorimi.

## 1. Quick Start

Prerequisites:

- Node.js 18 or later
- Git

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open:

```text
http://127.0.0.1:3017/nextstep-companion.html
```

The route filename is kept for compatibility with the predecessor runtime. The product and submission identity are now Yorimi.

## 2. API Key Configuration

Edit `.env`:

```env
OPENAI_API_KEY=your_key_here
USE_MOCK_AI=false
```

When `OPENAI_API_KEY` is configured, normal chat uses the OpenAI runtime. When the key is missing or the runtime fails, the system falls back to a schema-compatible mock response so the frontend contract and fallback behavior can still be tested.

The mock fallback is not a replacement for live AI quality. Real character dialogue, teaching quality, and companionship behavior should be evaluated with the OpenAI runtime.

## 3. Recommended Demo Path

1. Open the home page and confirm the AI character + desktop presence positioning.
2. Create or select a companion.
3. Send a low-motivation input, for example: "I have an exam tomorrow, but I am tired and cannot start."
4. Confirm the answer responds gently first, then suggests one small action.
5. Start the short focus/check-in flow if available in the current build.
6. Review the memory summary.
7. Show the 3D desktop device demo videos or physical device.

## 4. Current Demo State

| Module | Status | Notes |
| --- | --- | --- |
| Home / product framing | Demonstrable | Existing runtime prototype |
| Character creation | Demonstrable | Companion profile setup |
| AI dialogue | Demonstrable with API key or fallback | OpenAI runtime is the live path |
| 10-minute action loop | In progress | Wave 2 MVP target |
| Memory Lite | In progress | Session memory exists; persistent memory is a target |
| Expression/state feedback | In progress | Runtime state tags exist; richer visual mapping is a target |
| 3D desktop device | Physical demo exists | Preset expressions/motions/states can be shown |
| Creator Studio | Prototype target | Wave 2/3 direction |

## 5. 3D Desktop Device Evidence

Yorimi's desktop device follows a Pepper's Ghost-style reflective display route: a bright screen projects character visuals onto an angled transparent surface, creating a floating character effect inside a desktop object. The current physical demo is used to validate presence and presentation, not yet full real-time AI-device synchronization.

Current local evidence assets:

- [hardware-demo.gif](../../../../assets/hardware-demo.gif) - compressed README preview of the physical desktop device.
- [hardware-demo.mp4](../../../../assets/hardware-demo.mp4) - source hardware proof video.
- [idle loop.mp4](../../../../assets/idle%20loop.mp4)
- [thinking.mp4](../../../../assets/thinking.mp4)
- [remind.mp4](../../../../assets/remind.mp4)
- [jump.mp4](../../../../assets/jump.mp4)
- [turn_around.mp4](../../../../assets/turn_around.mp4)
- [confused.mp4](../../../../assets/confused.mp4)

Current device parameters:

| Item | Value |
| --- | --- |
| Display | 9.7-inch high-brightness IPS screen |
| Imaging route | Pepper's Ghost reflective holographic display |
| Playback | Internal display/driver board for preset character content |
| Content | Character expressions, motions, idle, thinking, reminder, and focus states |
| Positioning | Desktop companion object for pitches, exhibitions, and daily presence tests |

External references:

- [AI HoloBox](https://www.aiholobox.com/) describes a ChatGPT-powered holographic desktop companion product.
- [Global Market Insights](https://www.gminsights.com/industry-analysis/holographic-display-market) estimates the holographic display market at USD 4.3B in 2025 and forecasts 25.5% CAGR during 2026-2035.
- [Gatebox](https://www.gatebox.ai/) is a comparable virtual character companion device category reference.

## 6. Verification

Run the required test gate:

```powershell
npm run test:agents
npm run test:vercel
npm run test:mart
npm run test:api
npm run test:d
```

When `OPENAI_API_KEY` is configured:

```powershell
npm run test:openai
```

Before committing:

```powershell
git diff --check HEAD
git status --short --branch
git ls-files .env
```

`git ls-files .env` must print nothing.
