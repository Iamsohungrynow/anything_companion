# Mart Backend Test Cases

These tests prove Mart's backend/API runtime boundary works independently from the frontend visuals.

Run the automated contract test:

```powershell
npm run test:mart
```

## Scope Under Test

Mart owns:

- runtime response contract
- `/api/chat` endpoint
- OpenAI API adapter
- session memory update
- mock fallback path
- health/session/memory/reset endpoints
- response fields consumed by `generateChatResultAsync`
- CORS and Host allowlists
- in-memory session TTL and eviction limits
- request validation and static-file safety

## Test Matrix

| ID | Scope | Test Case | Expected Result |
| --- | --- | --- | --- |
| B-01 | Health | `GET /api/health` | Returns `ok: true`, service name, version, timestamp, host, allowed hosts, model, OpenAI configured flag, session limits |
| B-02 | Scenarios | `GET /api/scenarios` | Returns companion config and adaptive modes from `nextstep-companion-data.json` |
| B-03 | Session | `POST /api/session` with `study` | Returns `session_id`, `scenario`, companion, memory, `created_at` |
| B-04 | Chat contract | `POST /api/chat` with stuck finance quiz input | Returns flat runtime response with all required fields and enum-safe `mode` / `companion_state` |
| B-05 | Frontend compatibility | Chat response includes `micro_task` | `micro_task` is an array of labels for current `TaskSupportPanel` and `MemoryResult` |
| B-06 | New contract | Chat response includes `micro_task_plan` | Each item has `label`, positive `duration_minutes`, and `done` |
| B-07 | Fallback | Run without `OPENAI_API_KEY` | Response is still `200`, schema-valid, and `fallback_used: true` |
| B-08 | Trace | Fallback chat response | `trace` includes runtime steps, at least one `fallback` status, and no raw secret/config error |
| B-09 | Memory persistence | Send two chat turns with same `session_id` | Same `session_id`; `memory.recent_goals` contains at least two goals |
| B-10 | Memory endpoint | `GET /api/session/:id/memory` | Returns latest memory snapshot |
| B-11 | Reset endpoint | `POST /api/session/:id/reset` | Returns `ok: true`; later memory lookup returns `404` |
| B-12 | Validation | `POST /api/chat` without `message` | Returns `400` JSON error |
| B-13 | Validation | `POST /api/chat` with invalid JSON | Returns `400` JSON error |
| B-14 | Routing | Unknown `/api/*` route | Returns `404` JSON error |
| B-15 | Scenario normalization | `POST /api/chat` with `work` or unknown scenario | Does not crash; `work` maps to `study`, unknown values fall back to `study` |
| B-16 | Env loading | `.env` support | `.env` values load without external packages and do not overwrite existing env vars |
| B-17 | CORS | Allowed and denied `Origin` headers | Allowed origins are echoed; denied origins return `403`; no wildcard is sent |
| B-18 | Static security | `GET /.env` and `GET /server/index.js` | Returns `404`; local secrets and backend source are not exposed |
| B-19 | Static security | Traversal-like model path | Returns `404`; cannot escape the `models/` directory |
| B-20 | Static robustness | Malformed encoded model path | Returns clean `400` JSON error |
| B-21 | Static compatibility | `HEAD /nextstep-companion.html` | Returns `200`; supports frontend-style preflight checks |
| B-22 | Request size | `POST /api/chat` with body over 1MB | Returns clean `413` JSON error |
| B-23 | Check-in labels | `Done`, `Partly done`, `I got stuck` | Stored as `done`, `partly_done`, `stuck` respectively |
| B-24 | Check-in validation | Unknown check-in result | Does not create a fake `done` check-in |
| B-25 | Content-Type validation | `POST /api/chat` with `text/plain` | Returns `415` JSON error |
| B-26 | Message validation | `POST /api/chat` with message over 2000 characters | Returns `400` JSON error |
| B-27 | Host guard | Request with disallowed or missing `Host` header | Returns `421` JSON error |
| B-28 | Session limit | Start with `MAX_SESSIONS=2` and create three sessions | Oldest session is evicted; newest session remains readable |
| B-29 | Session TTL | Start with short `SESSION_TTL_MS` | Expired session memory lookup returns `404` |
| B-30 | Runtime schema normalization | `check_in_options` | API returns exactly `["Done", "Partly done", "I got stuck"]` |

## Manual PowerShell Checks

Start the server:

```powershell
npm run dev
```

Health:

```powershell
Invoke-RestMethod "http://127.0.0.1:3017/api/health"
```

Create session:

```powershell
$session = Invoke-RestMethod "http://127.0.0.1:3017/api/session" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{ scenario = "study" } | ConvertTo-Json -Depth 10)

$session.session_id
```

Chat:

```powershell
$chat = Invoke-RestMethod "http://127.0.0.1:3017/api/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    session_id = $session.session_id
    scenario = "study"
    message = "I have a finance quiz but I am tired and stuck."
    channel = "text"
    tone = "soft_supportive"
    use_case = "study"
  } | ConvertTo-Json -Depth 10)

$chat.mode
$chat.micro_task
$chat.memory.latest_memory_update
```

## Pass Criteria

Mart's work is demo-ready when:

- `npm run test:mart` passes.
- `/api/chat` returns schema-compatible JSON for the valid inputs covered by the contract suite.
- Missing OpenAI key does not break the demo.
- Memory persists across turns with the same `session_id`.
- Current frontend remains compatible through `micro_task`, `reply`, `mode`, `detected_state`, `check_in_message`, and `memory_update`.
- CORS and Host guards reject unapproved browser origins and Host headers.
- In-memory sessions have a configured TTL and maximum count.
- Static serving cannot expose `.env` or backend source files.
- Oversized parsed JSON chat/session requests and malformed JSON fail as JSON responses, not socket crashes.
