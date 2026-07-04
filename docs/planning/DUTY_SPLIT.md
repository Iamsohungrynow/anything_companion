# Duty Split

## Working Rules

- Keep the backend contract stable while the next frontend is being built.
- Keep the current standalone HTML runtime available until the new frontend reaches parity.
- Review changes by interface, not only by file ownership.
- Do not mix product-scope changes, backend contract changes, and interaction-polish changes in the same PR unless necessary.

## Scope Split

| Area | Owner | Scope |
| --- | --- | --- |
| Product direction and technical plan | Martina | Product scope, roadmap, architecture decisions, implementation sequencing |
| Runtime and backend | Martina | `/api/chat`, runtime orchestration, memory behavior, schema, deployment, tests |
| AIRI adoption path | Martina | What to reuse, what to reject, repo structure, migration order |
| Voice and interaction | Zhuoran | Mic flow, playback flow, voice states, avatar reactions, stage/display interaction |
| Presence and demo polish | Zhuoran | Listening / thinking / speaking states, timing, transitions, projection/display behavior |

## Decision Boundaries

### Martina decides

- runtime contract changes
- schema changes
- memory model changes
- deployment and env setup
- dependency stack changes
- migration order for the new frontend
- merge decisions for `main`

### Zhuoran decides

- voice control behavior inside the existing API boundaries
- mic-state UX
- playback and interruption UX
- avatar state transitions
- stage-mode interaction polish

### Review together before merging

- any AIRI-derived frontend structure that affects product narrative
- any change that touches both interaction UX and backend semantics
- any change that may weaken fallback behavior

## Current Work Split

### Martina

- keep the implementation plan aligned with the current product direction
- freeze the adapter contract for `/api/chat`, `/api/tts`, and `/api/stt`
- define the character profile and memory boundaries
- decide the AIRI-derived frontend structure
- harden storage, deployment, and test coverage before external pilots

### Zhuoran

- build the voice bar and mic-state UX
- build TTS playback and interruption behavior
- build listening / thinking / speaking avatar states
- improve stage-mode and presence transitions
- help validate the AIRI-derived frontend from the interaction side

## Constraints

- Do not change `server/http/runtimeHandlers.js` casually.
- Do not change runtime response semantics without review.
- Preserve `answer || reply` rendering.
- Preserve typed-input fallback.
- Preserve browser speech fallback when API voice is unavailable.
- Keep fallback state visible when fallback is used.

## PR Split

### Martina-owned PRs

- runtime contract
- memory and schema
- deployment
- storage
- AIRI integration architecture

### Zhuoran-owned PRs

- voice UX
- playback controls
- avatar reactions
- stage/display behavior
- interaction polish

## Joint Checkpoints

- agree on one adapter contract before the new frontend work expands
- verify the new frontend against the current static HTML behavior
- verify voice failure still falls back cleanly
- verify the backend contract stays compatible during migration
