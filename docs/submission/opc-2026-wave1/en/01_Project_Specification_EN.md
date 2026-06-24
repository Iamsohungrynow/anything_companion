# Yorimi Project Specification

| Field | Content |
| --- | --- |
| Project name | Yorimi |
| Product type | AI character interaction system + 3D desktop companion device |
| Track | Digital Culture: AI+Entertainment / AI+Education |
| Stage | Preliminary Round Wave 1: Idea / Specs |
| Live demo | https://compagnon-eveil.vercel.app/ |

Yorimi was previously named **Compagnon Éveil**, so the deployed demo still uses the `compagnon-eveil` domain. The current Wave 1 submission repositions the project as Yorimi: an AI character presence product for digital culture.

<p align="center">
  <img src="../../../../assets/brand/yorimi-logo.png" alt="Yorimi Logo" width="220" />
</p>

## 1. One-Sentence Definition

Yorimi turns virtual characters from content people watch into AI presences that remember, respond, accompany, and appear on the user's desk.

## 2. Problem

Fans of ACGN, VTubers, indie game characters, and original characters often feel real emotional attachment to virtual IP. However, most characters remain static: they appear in images, videos, streams, game scripts, or chat avatars, but they do not remember the user, act consistently over time, or exist in the user's physical space.

Young users also struggle with study, work, and daily routines. The hardest moment is often starting. Traditional task tools add more tasks; they do not first respond to the user's emotional state.

Yorimi combines these two needs: a virtual character with persona, memory, companionship, and a physical desktop presence.

## 3. Target Users

- ACGN users, otome-game users, VTuber fans, indie game players, original character owners, and young users who want study or daily companionship.
- VTubers, illustrators, Live2D creators, indie game teams, original IP owners, and campus ACG communities.

## 4. Application Scenarios

### AI Character Companionship

Users create or select a character with name, personality, tone, world boundaries, and visual identity. The character replies consistently, remembers preferences, and becomes more personal over time.

### Study and Micro-Action Support

When a user says, "I have an exam tomorrow, but I am too tired to start," Yorimi first responds gently, then suggests one small concrete action such as opening notes, reviewing one formula, or entering a 10-minute sprint. After the sprint, the user checks in and Yorimi updates memory.

### Creator IP Operation

Creators can turn their characters into interactive AI services by uploading persona settings, worldview boundaries, tone samples, voice style, skins, and interaction rules. This lets character IP become an ongoing, operable, and monetizable service.

### 3D Desktop Presence

Yorimi has a physical 3D desktop display demo. The current demo can show preset expressions, motions, and states. Wave 2/3 targets will connect Web/App state to real-time device display.

## 5. Core Business Logic

User loop:

```text
Create/select character -> chat with persona -> record preferences and memory
-> provide study/life companionship -> guide small actions
-> update memory -> increase retention
```

Creator loop:

```text
Upload character assets -> launch interactive character
-> fans subscribe or purchase content -> creator receives data and revenue
-> character improves over time
```

## 6. Functional Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-1 | Character creation and setup | User can define name, personality, tone, and use case |
| FR-2 | Persona-consistent AI dialogue | Multi-turn replies stay within persona and world boundaries |
| FR-3 | State recognition | System recognizes study, daily companionship, low motivation, and task-start states |
| FR-4 | Micro-action guidance | Low-motivation users receive one small, concrete, low-pressure action |
| FR-5 | Lightweight memory | Key preferences and interaction summaries can be reused across sessions |
| FR-6 | Expression/state feedback | Conversation output can map to character state or expression tags |
| FR-7 | 3D desktop display | Physical device can show preset character expressions/motions/states; real-time sync is a later target |
| FR-8 | Creator Studio prototype | Creators can preview how uploaded persona/tone/skin settings become an interactive character |

## 7. Wave 1 Current Scope and Wave 2 MVP Target

Wave 1 current completion:

- Product positioning and target scenarios.
- Core business logic.
- Executable product requirements.
- Evaluation criteria.
- Deployed Web runtime prototype from the predecessor project.
- Physical 3D desktop device demo.
- Technical architecture and roadmap.

Wave 2 MVP target:

- Rebrand the runtime into Yorimi.
- Run the full character creation -> AI dialogue -> micro-action -> 10-minute sprint -> check-in -> memory summary loop.
- Add expression/state feedback and stronger device display linkage.
- Build a first Creator Studio prototype.

## 8. Evaluation Criteria

| Evaluation Item | Method | Target |
| --- | --- | --- |
| Persona consistency | Multi-turn dialogue review | At least 90% of persona-related replies stay consistent |
| Onboarding usability | New user creates a character without assistance | No major blocker in the flow |
| Low-motivation response | Test inputs such as "I cannot start" | Yorimi responds gently and gives a concrete first action |
| Memory effectiveness | Cross-session preference checks | Key preferences are recalled correctly |
| Desktop presence effect | Compare screen-only vs desktop-device experience | Device group reports stronger companionship |
| Creator interest | Interviews with creators | At least 1-3 creators are willing to continue testing |
| Payment signal | User interviews/surveys | Clear willingness for at least one paid element |

## 9. Boundaries, Safety, and IP

Yorimi is for daily companionship, study support, and lightweight action guidance. It does not replace therapy, medical diagnosis, professional counseling, or real human relationships.

Creator content must be original, authorized, or owned by the uploader. Creator Studio will need copyright confirmation, review, takedown, and complaint mechanisms.

Users should be able to view, edit, and delete memory. Memory is used only to improve companionship and should not be abused for unrelated commercial targeting. Minors require stricter content and usage-time boundaries.
