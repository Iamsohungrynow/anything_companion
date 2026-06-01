# Person C Structure

## Ownership

- `app/`: page flow, selected companion state, session memory state.
- `features/onboarding/`: user choices before chat starts.
- `features/companion/`: companion profile generation and visual preview.
- `features/chat/`: chat surface, task support panel, countdown, and local mock response generator.
- `features/voice/`: microphone input and text-to-speech output.
- `features/video/`: alternate video companion presentation.
- `features/memory/`: session summary, memory cards, and delivery alignment UI.
- `shared/`: types and local shims used across Person C files.

## Import Rule

Feature folders may import from `shared/` and from sibling feature folders when a screen composes another feature. Avoid retired root-level utility, component, and type paths; the categorized folders above are the source of truth.
