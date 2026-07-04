"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// server/env.js
var require_env = __commonJS({
  "server/env.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var path2 = require("path");
    function loadDotEnv(filePath = path2.resolve(__dirname, "..", ".env")) {
      if (!fs2.existsSync(filePath)) return;
      const lines = fs2.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.replace(/^\uFEFF/, "").trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const separator = trimmed.indexOf("=");
        if (separator === -1) continue;
        const key = trimmed.slice(0, separator).trim().replace(/^\uFEFF/, "");
        const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
        if (key && process.env[key] === void 0) {
          process.env[key] = value;
        }
      }
    }
    module2.exports = {
      loadDotEnv
    };
  }
});

// server/config.js
var require_config = __commonJS({
  "server/config.js"(exports2, module2) {
    "use strict";
    var path2 = require("path");
    var { loadDotEnv } = require_env();
    loadDotEnv();
    var ROOT_DIR2 = path2.resolve(__dirname, "..");
    var FRONTEND_STATIC_DIR = path2.join(ROOT_DIR2, "frontend", "static");
    var DATA_FILE2 = path2.join(FRONTEND_STATIC_DIR, "nextstep-companion-data.json");
    var HTML_FILE2 = path2.join(FRONTEND_STATIC_DIR, "nextstep-companion.html");
    var PORT2 = parsePositiveInteger(process.env.PORT, 3017);
    var RENDER_EXTERNAL_HOSTNAME = String(process.env.RENDER_EXTERNAL_HOSTNAME || "").trim().toLowerCase();
    var RENDER_EXTERNAL_URL = String(process.env.RENDER_EXTERNAL_URL || (RENDER_EXTERNAL_HOSTNAME ? `https://${RENDER_EXTERNAL_HOSTNAME}` : "")).trim().replace(/\/+$/, "");
    var VERCEL_HOSTNAMES = [
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL
    ].map((value) => String(value || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "")).filter(Boolean);
    var VERCEL_EXTERNAL_URLS = VERCEL_HOSTNAMES.map((hostname) => `https://${hostname}`);
    var IS_VERCEL = String(process.env.VERCEL || "").toLowerCase() === "1" || VERCEL_HOSTNAMES.length > 0;
    var VERCEL_HOST_SUFFIXES2 = IS_VERCEL ? [".vercel.app"] : [];
    var HOST2 = process.env.HOST || (RENDER_EXTERNAL_HOSTNAME ? "0.0.0.0" : "127.0.0.1");
    var OPENAI_MODEL2 = process.env.OPENAI_MODEL || "gpt-5.4-mini";
    var OPENAI_SEARCH_MODEL = process.env.OPENAI_SEARCH_MODEL || "gpt-5.5";
    var OPENAI_TIMEOUT_MS2 = parsePositiveInteger(process.env.OPENAI_TIMEOUT_MS, 12e3);
    var FISH_AUDIO_API_KEY2 = process.env.FISH_AUDIO_API_KEY || "";
    var FISH_AUDIO_REFERENCE_ID2 = process.env.FISH_AUDIO_REFERENCE_ID || "";
    var FISH_AUDIO_TIMEOUT_MS2 = parsePositiveInteger(process.env.FISH_AUDIO_TIMEOUT_MS, 2e4);
    var STT_PROVIDER2 = process.env.STT_PROVIDER || "volcano";
    var STT_MODEL2 = process.env.STT_MODEL || "whisper-1";
    var VOLC_APP_ID2 = process.env.VOLC_APP_ID || "";
    var VOLC_ACCESS_TOKEN2 = process.env.VOLC_ACCESS_TOKEN || "";
    var VOLC_SECRET_KEY2 = process.env.VOLC_SECRET_KEY || "";
    var VOLC_ASR_CLUSTER2 = process.env.VOLC_ASR_CLUSTER || "volcengine_input_common";
    var VOLC_ARK_API_KEY = process.env.VOLC_ARK_API_KEY || "";
    var VOLC_CHAT_MODEL = process.env.VOLC_CHAT_MODEL || "doubao-1-5-pro-32k-250115";
    var VOLC_CHAT_TIMEOUT_MS = parsePositiveInteger(process.env.VOLC_CHAT_TIMEOUT_MS, 2e4);
    var USE_MOCK_AI2 = String(process.env.USE_MOCK_AI || "").toLowerCase() === "true";
    var MAX_SESSIONS2 = parsePositiveInteger(process.env.MAX_SESSIONS, 250);
    var SESSION_TTL_MS2 = parsePositiveInteger(process.env.SESSION_TTL_MS, 1e3 * 60 * 60 * 8);
    var ALLOWED_ORIGINS2 = parseAllowedOrigins(process.env.ALLOWED_ORIGINS, PORT2, RENDER_EXTERNAL_URL, VERCEL_EXTERNAL_URLS);
    var ALLOWED_HOSTS2 = parseAllowedHosts(process.env.ALLOWED_HOSTS, ["127.0.0.1", "localhost", "::1", RENDER_EXTERNAL_HOSTNAME, ...VERCEL_HOSTNAMES]).filter(Boolean).map((host) => host.toLowerCase());
    function parsePositiveInteger(value, fallback) {
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
      return parsed;
    }
    function parseAllowedOrigins(value, port, renderExternalUrl, vercelExternalUrls) {
      const portDefaults = [
        `http://localhost:${port}`,
        `http://127.0.0.1:${port}`,
        renderExternalUrl,
        ...vercelExternalUrls
      ].filter(Boolean);
      if (value && value.trim()) {
        return Array.from(/* @__PURE__ */ new Set([...parseList(value, []), ...portDefaults]));
      }
      return portDefaults;
    }
    function parseAllowedHosts(value, defaults) {
      return Array.from(/* @__PURE__ */ new Set([...parseList(value, []), ...defaults]));
    }
    function parseList(value, fallback) {
      if (!value || !value.trim()) return fallback;
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    module2.exports = {
      ROOT_DIR: ROOT_DIR2,
      FRONTEND_STATIC_DIR,
      DATA_FILE: DATA_FILE2,
      HTML_FILE: HTML_FILE2,
      PORT: PORT2,
      HOST: HOST2,
      OPENAI_MODEL: OPENAI_MODEL2,
      OPENAI_SEARCH_MODEL,
      OPENAI_TIMEOUT_MS: OPENAI_TIMEOUT_MS2,
      FISH_AUDIO_API_KEY: FISH_AUDIO_API_KEY2,
      FISH_AUDIO_REFERENCE_ID: FISH_AUDIO_REFERENCE_ID2,
      FISH_AUDIO_TIMEOUT_MS: FISH_AUDIO_TIMEOUT_MS2,
      STT_PROVIDER: STT_PROVIDER2,
      STT_MODEL: STT_MODEL2,
      VOLC_APP_ID: VOLC_APP_ID2,
      VOLC_ACCESS_TOKEN: VOLC_ACCESS_TOKEN2,
      VOLC_SECRET_KEY: VOLC_SECRET_KEY2,
      VOLC_ASR_CLUSTER: VOLC_ASR_CLUSTER2,
      VOLC_ARK_API_KEY,
      VOLC_CHAT_MODEL,
      VOLC_CHAT_TIMEOUT_MS,
      USE_MOCK_AI: USE_MOCK_AI2,
      MAX_SESSIONS: MAX_SESSIONS2,
      SESSION_TTL_MS: SESSION_TTL_MS2,
      ALLOWED_ORIGINS: ALLOWED_ORIGINS2,
      ALLOWED_HOSTS: ALLOWED_HOSTS2,
      VERCEL_HOST_SUFFIXES: VERCEL_HOST_SUFFIXES2
    };
  }
});

// server/companion-data.json
var require_companion_data = __commonJS({
  "server/companion-data.json"(exports2, module2) {
    module2.exports = {
      _project: "Yorimi MVP Runtime Prototype",
      _version: "v4",
      _description: "Yorimi adaptive companion runtime config \u2014 full data schema, scenario metadata, and deterministic fallback examples. Live chat uses /api/chat when the backend and OPENAI_API_KEY are configured.",
      companions: {
        study: {
          name: "Cappu",
          type: "Morning Study Buddy",
          scenario: "study",
          emoji: "\u2615",
          personality: ["cheerful", "gentle", "encouraging"],
          tone: "warm and playful",
          use_case: "Help the user start study sessions and overcome procrastination.",
          backstory: "A small coffee companion that wakes up with the user every morning. Born from the first warm sip of the day, Cappu believes every big goal starts with one tiny step.",
          visual_style: "soft, cute, coffee-inspired, warm amber colors",
          interaction_style: "short encouragement plus concrete next step",
          accentColor: "amber",
          bgGradient: "linear-gradient(135deg,#f59e0b,#f97316)"
        },
        acg: {
          name: "Lumi",
          type: "Original Virtual Companion",
          scenario: "acg",
          emoji: "\u2728",
          personality: ["calm", "gentle", "observant"],
          tone: "soft and encouraging",
          use_case: "Study companionship, light daily check-ins, and emotional warmth.",
          backstory: "An original virtual companion who quietly supports the user during study and rest moments. Lumi appears at dusk and dawn \u2014 you do not have to rush.",
          visual_style: "original character design, soft light, calm expression, gentle glow",
          interaction_style: "gentle short replies and quiet encouragement",
          accentColor: "violet",
          bgGradient: "linear-gradient(135deg,#7c3aed,#4f46e5)"
        },
        pet: {
          name: "Mochi",
          type: "Digital Pet Companion",
          scenario: "pet",
          emoji: "\u{1F43E}",
          personality: ["playful", "curious", "affectionate"],
          tone: "warm, light, playful",
          use_case: "Light companionship, routine check-ins, and memory preservation.",
          backstory: "A gentle digital pet for daily check-ins. Mochi is always here \u2014 wagging at your small wins, nudging you to take care of yourself.",
          visual_style: "soft pet-inspired, cute, friendly, rounded shapes",
          interaction_style: "playful routine reminders and gentle companionship",
          accentColor: "rose",
          bgGradient: "linear-gradient(135deg,#f43f5e,#ec4899)"
        }
      },
      chat_result_schema: {
        _description: "Schema for one AI response turn. All fields required.",
        reply: { type: "string", description: "Companion's spoken/displayed reply to the user" },
        detected_state: { type: "string", description: "User's emotional/cognitive state as detected by AI" },
        mode: { type: "string", enum: ["Encourage Mode", "Focus Mode", "Companion Mode", "Companion Presence Mode", "Routine Check-in Mode", "Check-in Mode"] },
        micro_task: { type: "array", items: "string", description: "2\u20134 actionable small steps for the user" },
        check_in_message: { type: "string", description: "A short follow-up prompt to revisit after tasks" },
        memory_update: { type: "string", description: "One sentence summary saved to user's persistent memory" }
      },
      mock_responses: {
        _description: "Deterministic fallback examples used only when the OpenAI runtime is unavailable, missing, or explicitly forced into local fallback mode.",
        study: {
          low_motivation: {
            _trigger_keywords: ["tired", "procrastinat", "study", "exam", "finance", "boring", "hard", "difficult", "can't", "stressed", "overwhelm", "lazy", "stuck", "hate", "ugh", "not feeling"],
            reply: "That's okay \u2014 feeling stuck is totally normal. Let's make this small enough to start. We'll do just one 10-minute sprint together. You can do this. \u2615",
            detected_state: "Low motivation",
            mode: "Encourage Mode",
            micro_task: [
              "Review 3 key formulas",
              "Solve 2 practice questions",
              "Mark 1 confusing concept"
            ],
            check_in_message: "Come back after 10 minutes and tell me which part felt hardest.",
            memory_update: "User responds better to short 10-minute study sprints."
          },
          focus: {
            _trigger_keywords: ["focus", "concentrate", "ready", "let's go", "start", "begin", "work"],
            reply: "I'm here with you! Let's channel that focus into a solid study block. Pick your top topic and we'll build momentum together. \u2615",
            detected_state: "Ready to focus",
            mode: "Focus Mode",
            micro_task: [
              "Pick one topic to deep-dive into",
              "Set a 25-minute Pomodoro timer",
              "Write down 3 things you want to learn"
            ],
            check_in_message: "After your session, share what you discovered!",
            memory_update: "User enters focus mode well when given a structured timer session."
          },
          default: {
            _trigger_keywords: ["(any other input)"],
            reply: "Hey there! I'm Cappu, ready to study with you. What's on your plate today? Let's break it into one tiny step at a time. \u2615",
            detected_state: "Neutral / Ready",
            mode: "Check-in Mode",
            micro_task: [
              "Write down today's one most important task",
              "Open the right materials",
              "Start with 5 minutes \u2014 just begin"
            ],
            check_in_message: "Tell me what you're working on and we'll figure it out together.",
            memory_update: "User is beginning a new study session."
          }
        },
        acg: {
          default: {
            _trigger_keywords: ["(all inputs \u2014 single mode)"],
            reply: "You do not need to finish everything at once. Let's start with one tiny step, and I'll quietly stay with you while you begin.",
            detected_state: "Seeking gentle support",
            mode: "Companion Mode",
            micro_task: [
              "Choose one small task",
              "Work quietly for 5 minutes",
              "Take a short break after starting"
            ],
            check_in_message: "Start with one small task and take a short break after.",
            memory_update: "User prefers calm and gentle encouragement."
          }
        },
        pet: {
          default: {
            _trigger_keywords: ["(all inputs \u2014 single mode)"],
            reply: "Remember to take a small break. Let's stand up, drink some water, and then continue. You've been working hard! \u{1F43E}",
            detected_state: "Routine check-in",
            mode: "Routine Check-in Mode",
            micro_task: [
              "Stand up",
              "Drink water",
              "Stretch for one minute"
            ],
            check_in_message: "Drink water and stretch for one minute.",
            memory_update: "User responds well to playful routine reminders."
          }
        }
      },
      memory_schema: {
        _description: "Persisted user memory \u2014 updated after each session",
        current_companion: { type: "string", example: "Lumi" },
        last_goal: { type: "string", example: "Finish finance chapter 3" },
        preferred_task_length: { type: "string", example: "10-minute sprint" },
        recent_mode: { type: "string", example: "Encourage Mode" },
        memory_update: { type: "string", example: "User responds better to short 10-minute study sprints." }
      },
      adaptive_modes: [
        { name: "Encourage Mode", trigger: "low motivation / procrastination", accent: "amber" },
        { name: "Focus Mode", trigger: "user ready, wants to concentrate", accent: "blue" },
        { name: "Companion Mode", trigger: "seeking emotional support (ACG)", accent: "violet" },
        { name: "Companion Presence Mode", trigger: "quiet companionship (ACG idle)", accent: "violet" },
        { name: "Routine Check-in Mode", trigger: "wellness / habit reminder (Pet)", accent: "rose" },
        { name: "Check-in Mode", trigger: "neutral / session start", accent: "teal" }
      ],
      api_integration_guide: {
        _description: "Current runtime contract. The browser calls /api/chat; the local/Vercel server routes that request to OpenAI when configured and to marked fallback otherwise.",
        target_function: "generateChatResult(companion, userMessage, channel, messages) -> ChatResult via /api/chat",
        openai_example: {
          endpoint: "https://api.openai.com/v1/chat/completions",
          model: "gpt-4o",
          response_format: { type: "json_object" },
          system_prompt: "You are an adaptive companion AI. Given the user's scenario and message, return a JSON object matching this schema: { reply, detected_state, mode, micro_task (array of 2-4 strings), check_in_message, memory_update }. Mode must be one of: Encourage Mode, Focus Mode, Companion Mode, Companion Presence Mode, Routine Check-in Mode, Check-in Mode."
        },
        claude_example: {
          endpoint: "https://api.anthropic.com/v1/messages",
          model: "claude-opus-4-6",
          note: "Use tool_use or instruct JSON output in system prompt"
        },
        estimated_cost_per_turn: "~$0.001\u20130.003 (gpt-4o-mini) / ~$0.005\u20130.01 (gpt-4o)",
        estimated_monthly_10_users: "< $10 USD at moderate usage"
      },
      same_engine_table: {
        _description: "One adaptive engine powering three companion types",
        capabilities: [
          { capability: "Persona generation", study: "Cappu \u2615", acg: "Lumi \u2728", pet: "Mochi \u{1F43E}" },
          { capability: "Visual identity", study: "Coffee buddy", acg: "Original character", pet: "Digital pet" },
          { capability: "Intent detection", study: "Low motivation", acg: "Seeking support", pet: "Routine check-in" },
          { capability: "Active mode", study: "Encourage Mode", acg: "Companion Mode", pet: "Check-in Mode" },
          { capability: "Interaction style", study: "Micro-task sprint", acg: "Gentle reply", pet: "Routine reminder" },
          { capability: "Memory update", study: "Study rhythm", acg: "Break style", pet: "Daily routine" }
        ]
      }
    };
  }
});

// server/data.js
var require_data = __commonJS({
  "server/data.js"(exports2, module2) {
    "use strict";
    var companionData2 = require_companion_data();
    module2.exports = {
      companionData: companionData2
    };
  }
});

// server/schemas.js
var require_schemas = __commonJS({
  "server/schemas.js"(exports2, module2) {
    "use strict";
    var VALID_SCENARIOS = /* @__PURE__ */ new Set(["study", "acg", "pet", "work", "daily"]);
    var SCENARIO_ALIASES = {
      work: "study",
      daily: "pet"
    };
    var VALID_CHANNELS = /* @__PURE__ */ new Set(["text", "voice", "stage"]);
    var VALID_TONES = /* @__PURE__ */ new Set(["soft_supportive", "short_direct", "cute_playful", "coach_like", "friend_like"]);
    var VALID_USE_CASES = /* @__PURE__ */ new Set(["study", "work", "light_support", "pet_companionship", "routine"]);
    var VALID_CHECK_IN_RESULTS = /* @__PURE__ */ new Set(["Done", "Partly done", "I got stuck"]);
    var VALID_HISTORY_ROLES = /* @__PURE__ */ new Set(["user", "assistant"]);
    var MAX_MESSAGE_LENGTH = 2e3;
    var MAX_HISTORY_ITEMS = 6;
    var MAX_HISTORY_CONTENT_LENGTH = 500;
    var VALID_MODES = /* @__PURE__ */ new Set([
      "Encourage Mode",
      "Focus Mode",
      "Study Companion Mode",
      "Study Sprint Mode",
      "Quiz Mode",
      "Companion Mode",
      "Companion Presence Mode",
      "Routine Check-in Mode",
      "Check-in Mode",
      "Routine Mode"
    ]);
    var VALID_COMPANION_STATES = /* @__PURE__ */ new Set(["idle", "happy", "thinking", "encouraging", "focused", "resting", "concerned"]);
    var VALID_INTENTS = /* @__PURE__ */ new Set([
      "teach_concept",
      "decompose_task",
      "plan_task",
      "continue_context",
      "vague_help",
      "emotional_support",
      "quiz",
      "routine",
      "check_in",
      "general_chat"
    ]);
    var DEFAULT_CHECK_IN_OPTIONS = ["Done", "Partly done", "I got stuck"];
    var runtimeResponseJsonSchema = {
      type: "object",
      additionalProperties: false,
      properties: {
        intent: {
          type: "string",
          enum: [
            "teach_concept",
            "decompose_task",
            "plan_task",
            "continue_context",
            "vague_help",
            "emotional_support",
            "quiz",
            "routine",
            "check_in",
            "general_chat"
          ]
        },
        answer: { type: "string" },
        reply: { type: "string" },
        detected_state: { type: "string" },
        companion_state: {
          type: "string",
          enum: ["idle", "happy", "thinking", "encouraging", "focused", "resting", "concerned"]
        },
        mode: {
          type: "string",
          enum: [
            "Encourage Mode",
            "Focus Mode",
            "Study Companion Mode",
            "Study Sprint Mode",
            "Quiz Mode",
            "Companion Mode",
            "Companion Presence Mode",
            "Routine Check-in Mode",
            "Check-in Mode",
            "Routine Mode"
          ]
        },
        goal_understanding: { type: "string" },
        micro_task_plan: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              duration_minutes: { type: "number", minimum: 1 },
              done: { type: "boolean" }
            },
            required: ["label", "duration_minutes", "done"]
          }
        },
        start_button_label: { type: "string" },
        check_in_message: { type: "string" },
        check_in_options: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: { type: "string", enum: DEFAULT_CHECK_IN_OPTIONS }
        },
        suggested_actions: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: { type: "string" }
        },
        teaching: {
          type: "object",
          additionalProperties: false,
          properties: {
            concept: { type: "string" },
            explanation: { type: "string" },
            example: { type: "string" },
            check_question: { type: "string" }
          },
          required: ["concept", "explanation", "example", "check_question"]
        },
        memory_update: { type: "string" },
        trace: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              step: { type: "string" },
              status: { type: "string", enum: ["complete", "fallback"] },
              summary: { type: "string" }
            },
            required: ["step", "status", "summary"]
          }
        }
      },
      required: [
        "intent",
        "answer",
        "reply",
        "detected_state",
        "companion_state",
        "mode",
        "goal_understanding",
        "micro_task_plan",
        "start_button_label",
        "check_in_message",
        "check_in_options",
        "suggested_actions",
        "teaching",
        "memory_update",
        "trace"
      ]
    };
    function normalizeScenario2(value) {
      const scenario = String(value || "study").toLowerCase();
      if (!VALID_SCENARIOS.has(scenario)) return "study";
      return SCENARIO_ALIASES[scenario] || scenario;
    }
    function validateChatRequest2(body) {
      if (!body || typeof body !== "object") {
        return { ok: false, error: "JSON body is required." };
      }
      const message = String(body.message || "").trim();
      if (!message) {
        return { ok: false, error: "`message` is required." };
      }
      if (message.length > MAX_MESSAGE_LENGTH) {
        return { ok: false, error: "`message` must be 2000 characters or fewer." };
      }
      return {
        ok: true,
        value: {
          session_id: normalizeOptionalString(body.session_id, 120),
          scenario: normalizeScenario2(body.scenario),
          message,
          channel: normalizeChoice(body.channel, VALID_CHANNELS, "text"),
          tone: normalizeChoice(body.tone, VALID_TONES, ""),
          use_case: normalizeChoice(body.use_case, VALID_USE_CASES, ""),
          role: normalizeOptionalString(body.role, 80),
          companion: body.companion && typeof body.companion === "object" ? body.companion : void 0,
          history: normalizeHistory(body.history),
          image_url: normalizeOptionalString(body.image_url, 2e3),
          image_metadata: body.image_metadata && typeof body.image_metadata === "object" ? body.image_metadata : void 0,
          selected_mode: normalizeOptionalString(body.selected_mode, 80),
          check_in_result: VALID_CHECK_IN_RESULTS.has(body.check_in_result) ? body.check_in_result : void 0
        }
      };
    }
    function normalizeChoice(value, validValues, fallback) {
      const normalized = String(value || "").trim();
      return validValues.has(normalized) ? normalized : fallback;
    }
    function normalizeOptionalString(value, maxLength) {
      if (typeof value !== "string") return void 0;
      const normalized = value.trim();
      if (!normalized) return void 0;
      return normalized.slice(0, maxLength);
    }
    function normalizeHistory(value) {
      if (!Array.isArray(value)) return [];
      return value.slice(-MAX_HISTORY_ITEMS).map((item) => ({
        role: normalizeChoice(item?.role, VALID_HISTORY_ROLES, "user"),
        content: String(item?.content || "").slice(0, MAX_HISTORY_CONTENT_LENGTH)
      })).filter((item) => item.content.trim());
    }
    function normalizeMicroTaskPlan(value, legacyTasks) {
      let tasks;
      if (Array.isArray(value) && value.length > 0) {
        tasks = value.slice(0, 4).map((item, index) => ({
          label: String(item.label || item.task || legacyTasks?.[index] || `Task ${index + 1}`),
          duration_minutes: normalizeDuration(item.duration_minutes || item.minutes, index),
          done: Boolean(item.done)
        }));
      } else {
        const fallbackTasks = Array.isArray(legacyTasks) && legacyTasks.length > 0 ? legacyTasks : ["Open the relevant materials", "Work on the first small step"];
        tasks = fallbackTasks.slice(0, 4).map((label, index) => ({
          label: String(label),
          duration_minutes: defaultDuration(index),
          done: false
        }));
      }
      while (tasks.length < 2) {
        const index = tasks.length;
        tasks.push({
          label: index === 0 ? "Open the relevant materials" : "Work on the first small step",
          duration_minutes: defaultDuration(index),
          done: false
        });
      }
      return tasks;
    }
    function defaultDuration(index) {
      return [2, 8, 10, 3][index] || 5;
    }
    function normalizeDuration(value, index) {
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed <= 0) return defaultDuration(index);
      return Math.min(60, Math.max(1, Math.round(parsed)));
    }
    function modeToCompanionState(mode, detectedState) {
      const state = String(detectedState || "").toLowerCase();
      if (state.includes("stuck") || state.includes("overwhelm") || state.includes("low")) return "concerned";
      if (mode === "Encourage Mode") return "encouraging";
      if (mode === "Study Companion Mode") return "thinking";
      if (mode === "Focus Mode" || mode === "Study Sprint Mode" || mode === "Quiz Mode") return "focused";
      if (mode === "Routine Check-in Mode" || mode === "Routine Mode") return "happy";
      if (mode === "Companion Presence Mode") return "resting";
      return "idle";
    }
    function normalizeRuntimeResult2(raw, context = {}) {
      const legacyTasks = Array.isArray(raw?.micro_task) ? raw.micro_task : void 0;
      const microTaskPlan = normalizeMicroTaskPlan(raw?.micro_task_plan, legacyTasks);
      const mode = VALID_MODES.has(raw?.mode) ? raw.mode : context.defaultMode || "Check-in Mode";
      const intent = normalizeIntent(raw?.intent, mode, context.message);
      const answer = String(raw?.answer || raw?.reply || "Let's start with one small step.");
      const reply = intent === "teach_concept" ? answer : String(raw?.reply || answer);
      const result = {
        session_id: context.session_id,
        intent,
        answer,
        reply,
        detected_state: String(raw?.detected_state || "Neutral"),
        companion_state: VALID_COMPANION_STATES.has(raw?.companion_state) ? raw.companion_state : modeToCompanionState(mode, raw?.detected_state),
        mode,
        goal_understanding: String(
          raw?.goal_understanding || `You want to work on: ${context.message || "your next task"}. We will make it small enough to begin.`
        ),
        micro_task_plan: microTaskPlan,
        micro_task: microTaskPlan.map((task) => task.label),
        start_button_label: String(raw?.start_button_label || "Start 10-min Sprint"),
        check_in_message: String(raw?.check_in_message || "How did it go?"),
        check_in_options: normalizeCheckInOptions(raw?.check_in_options),
        suggested_actions: normalizeSuggestedActions(raw?.suggested_actions, microTaskPlan, intent),
        teaching: normalizeTeaching(raw?.teaching, intent, answer),
        memory_update: String(raw?.memory_update || "User benefits from small, concrete next steps."),
        trace: normalizeTrace(raw?.trace, context.fallback_used),
        fallback_used: Boolean(context.fallback_used)
      };
      return result;
    }
    function normalizeIntent(value, mode, message) {
      const normalized = String(value || "").trim();
      if (VALID_INTENTS.has(normalized)) return normalized;
      const lower = String(message || "").toLowerCase();
      if (lower.match(/^\s*(and|also|then|next)\s+[\w\s-]{2,80}$/)) return "continue_context";
      if (lower.match(/\b(help me|i need help|what should i do|guide me|show me)\b/)) return "vague_help";
      if (lower.match(/\b(concept|explain|what is|what are|teach me|define|meaning of|give concept)\b/)) return "teach_concept";
      if (lower.match(/\b(concrete step|concrete steps|first step|steps to|step by step|break down|decompose|plan for|how do i start|how to start|show me how to)\b/)) return "decompose_task";
      if (mode === "Encourage Mode" || lower.match(/\b(sad|tired|overwhelmed|stressed|don't want|dont want|stuck)\b/)) return "emotional_support";
      if (mode === "Routine Check-in Mode" || mode === "Routine Mode") return "routine";
      if (mode === "Check-in Mode") return "check_in";
      if (lower.match(/\b(quiz me|test me|question me)\b/)) return "quiz";
      if (mode === "Study Sprint Mode" || mode === "Focus Mode") return "plan_task";
      return "general_chat";
    }
    function normalizeSuggestedActions(value, microTaskPlan, intent) {
      if (Array.isArray(value) && value.length > 0) {
        return value.slice(0, 4).map((item) => String(item)).filter((item) => item.trim());
      }
      if (intent === "teach_concept") {
        return ["Explain simpler", "Give another example", "Quiz me"];
      }
      const fromTasks = microTaskPlan.map((task) => task.label).slice(0, 3);
      return fromTasks.length >= 2 ? fromTasks : ["Start one small step", "Check in after"];
    }
    function normalizeTeaching(value, intent, answer) {
      const teaching = value && typeof value === "object" ? value : {};
      if (intent !== "teach_concept") {
        return {
          concept: String(teaching.concept || ""),
          explanation: String(teaching.explanation || ""),
          example: String(teaching.example || ""),
          check_question: String(teaching.check_question || "")
        };
      }
      return {
        concept: String(teaching.concept || "Requested concept"),
        explanation: String(teaching.explanation || answer),
        example: String(teaching.example || "Use one tiny example to test the idea."),
        check_question: String(teaching.check_question || "Can you explain it back in one sentence?")
      };
    }
    function normalizeCheckInOptions(value) {
      if (!Array.isArray(value)) return DEFAULT_CHECK_IN_OPTIONS;
      const exact = DEFAULT_CHECK_IN_OPTIONS.every((option, index) => value[index] === option);
      return exact && value.length === DEFAULT_CHECK_IN_OPTIONS.length ? value : DEFAULT_CHECK_IN_OPTIONS;
    }
    function normalizeTrace(value, fallbackUsed) {
      if (Array.isArray(value) && value.length > 0) {
        return value.map((item) => ({
          step: String(item.step || "runtime"),
          status: item.status === "fallback" ? "fallback" : "complete",
          summary: String(item.summary || "Runtime step completed.")
        }));
      }
      return [
        { step: "input", status: "complete", summary: "User message received." },
        {
          step: "runtime",
          status: fallbackUsed ? "fallback" : "complete",
          summary: fallbackUsed ? "Used deterministic fallback engine." : "Generated structured runtime response."
        }
      ];
    }
    module2.exports = {
      DEFAULT_CHECK_IN_OPTIONS,
      normalizeRuntimeResult: normalizeRuntimeResult2,
      normalizeScenario: normalizeScenario2,
      runtimeResponseJsonSchema,
      validateChatRequest: validateChatRequest2
    };
  }
});

// server/engines/mock/mockEngine.js
var require_mockEngine = __commonJS({
  "server/engines/mock/mockEngine.js"(exports2, module2) {
    "use strict";
    var { normalizeRuntimeResult: normalizeRuntimeResult2 } = require_schemas();
    var LOW_KEYWORDS = [
      "tired",
      "procrastinat",
      "boring",
      "hard",
      "difficult",
      "can't",
      "cannot",
      "stressed",
      "overwhelm",
      "lazy",
      "stuck",
      "hate",
      "ugh",
      "not feeling",
      "don't feel",
      "don't want",
      "do not want"
    ];
    var ACTION_KEYWORDS = [
      "study",
      "learn",
      "review",
      "prepare",
      "practice",
      "understand",
      "finish",
      "write",
      "work",
      "start",
      "begin",
      "quiz",
      "exam",
      "homework",
      "essay",
      "report",
      "internship",
      "application"
    ];
    var FOCUS_KEYWORDS = ["focus", "concentrate", "ready", "let's go", "continue", "deep work", "pomodoro"];
    var FOLLOW_UP_KEYWORDS = ["help me", "why not", "what should i do", "next", "continue", "guide me", "show me"];
    var TEACH_KEYWORDS = ["concept", "explain", "what is", "what are", "teach me", "define", "meaning of", "give concept"];
    var STEP_KEYWORDS = ["concrete step", "concrete steps", "first step", "steps to", "step by step", "break down", "decompose", "plan for", "how do i start", "how to start", "show me how to"];
    var TONE_OPENERS = {
      soft_supportive: "I am here with you.",
      short_direct: "Got it.",
      cute_playful: "Okay, tiny step time.",
      coach_like: "Good. We will turn this into action.",
      friend_like: "I got you."
    };
    function runMockEngine(input, companionData2, session = {}) {
      const scenario = input.scenario || "study";
      const responses = companionData2.mock_responses || {};
      const scenarioResponses = responses[scenario] || responses.study || {};
      const message = String(input.message || "").toLowerCase();
      const planContext = buildPlanningContext(input, session);
      let raw = scenarioResponses.default;
      if (scenario === "study") {
        const intent = detectIntent(message);
        if (input.check_in_result) raw = buildCheckInResponse(planContext);
        else if (intent === "teach_concept") raw = buildTeachingResponse(planContext);
        else if (intent === "emotional_support") raw = buildSupportResponse(planContext);
        else if (intent === "vague_help") raw = buildVagueHelpResponse(planContext);
        else if (intent === "decompose_task" || intent === "continue_context") raw = buildStepResponse(planContext, intent);
        else if (hasActionableGoal(message) || FOCUS_KEYWORDS.some((keyword) => message.includes(keyword)) || planContext.subject && FOLLOW_UP_KEYWORDS.some((keyword) => message.includes(keyword))) {
          raw = buildStepResponse(planContext, "plan_task");
        }
      }
      const result = normalizeRuntimeResult2(
        {
          ...raw,
          goal_understanding: raw?.goal_understanding || buildGoalUnderstanding(input.message, raw?.mode),
          start_button_label: raw?.start_button_label || (raw?.mode === "Focus Mode" ? "Start 25-min Focus Block" : "Start 10-min Sprint"),
          check_in_options: ["Done", "Partly done", "I got stuck"],
          trace: [
            { step: "input", status: "complete", summary: "User message received." },
            { step: "state_detector", status: "fallback", summary: `Detected ${raw?.detected_state || "neutral state"} using mock rules.` },
            { step: "mode_router", status: "fallback", summary: `Selected ${raw?.mode || "Check-in Mode"}.` },
            { step: "action_planner", status: "fallback", summary: "Generated a small next-step plan from local fallback data." },
            { step: "memory_writer", status: "fallback", summary: raw?.memory_update || "Updated session memory." }
          ]
        },
        {
          fallback_used: true,
          message: input.message,
          defaultMode: raw?.mode
        }
      );
      return result;
    }
    function buildPlanningContext(input, session) {
      const companion = input.companion || {};
      const message = String(input.message || "");
      const lower = message.toLowerCase();
      const teachingSubject = extractConceptSubject(message);
      const continuationSubject = extractContinuationSubject(message);
      const subject = teachingSubject || continuationSubject || extractGoalSubject(message) || extractSubjectFromHistory(input.history) || extractSubjectFromMemory(session);
      const useCase = input.use_case || companion.use_case || "";
      const tone = input.tone || companion.tone || "";
      return {
        message,
        lower,
        subject,
        teachingSubject,
        continuationSubject,
        checkInResult: input.check_in_result,
        useCase,
        tone,
        companionName: companion.name || "your companion",
        companionType: companion.type || "companion",
        objectLabel: companion.default_object_label || companion.visual_identity?.label || inferObjectLabel(companion)
      };
    }
    function buildSupportResponse(context) {
      const subject = context.subject && context.subject !== "this task" ? context.subject : "today";
      const hasSubject = subject !== "today";
      const subjectLine = hasSubject ? ` We will keep ${subject} small enough to touch, not solve all at once.` : " We will choose one tiny next action only if you want it.";
      const answer = buildToneReply(
        context,
        `${TONE_OPENERS[context.tone] || TONE_OPENERS.soft_supportive} You sound tired, so we will not force a full session. First we lower the pressure, then choose one tiny next action.${subjectLine}`
      );
      const micro_task_plan = hasSubject ? [
        { label: "Take one breath and lower your shoulders", duration_minutes: 1, done: false },
        { label: `Open one ${subject} note, slide, practice page, or checklist`, duration_minutes: 2, done: false },
        { label: `Pick only the easiest visible part of ${subject}`, duration_minutes: 2, done: false },
        { label: `Tell me the first blocker in ${subject}`, duration_minutes: 2, done: false }
      ] : [
        { label: "Take one breath and put the task in front of you", duration_minutes: 1, done: false },
        { label: "Choose the smallest visible action, not the whole task", duration_minutes: 2, done: false },
        { label: "Tell me the task name when you are ready", duration_minutes: 1, done: false }
      ];
      return {
        intent: "emotional_support",
        answer,
        reply: answer,
        detected_state: "Tired or low-energy",
        companion_state: "concerned",
        mode: "Encourage Mode",
        goal_understanding: `The user feels tired ${subject === "today" ? "today" : `while thinking about ${subject}`}; support comes before task pressure.`,
        teaching: emptyTeaching(),
        suggested_actions: ["Take a breath", "Pick a 2-minute start", "Ask for a smaller step"],
        micro_task_plan,
        start_button_label: "Start 3-min Gentle Reset",
        check_in_message: hasSubject ? `After this reset, tell me whether ${subject} feels ready for one tiny step.` : "After three minutes, tell me if you want a tiny plan or just company.",
        check_in_options: ["Done", "Partly done", "I got stuck"],
        memory_update: hasSubject ? `User felt tired while thinking about ${subject}; support first, then one tiny subject-specific step.` : "User felt tired; respond with emotional support before planning."
      };
    }
    function buildStepResponse(context, intent) {
      const subject = context.subject || "this task";
      if (!hasSubjectSpecificFallback(subject)) return buildEmergencyFallbackResponse(context, intent || "plan_task");
      const continuation = intent === "continue_context";
      const micro_task_plan = buildConcreteStepPlan(subject);
      const visibleSteps = micro_task_plan.map((task, index) => `${index + 1}. ${task.label}`).join("\n");
      const answer = buildToneReply(
        context,
        `${TONE_OPENERS[context.tone] || TONE_OPENERS.soft_supportive} ${continuation ? `Let's continue with ${subject}.` : `Let's break ${subject} into concrete steps.`}

${visibleSteps}`
      );
      return {
        intent: continuation ? "continue_context" : intent || "plan_task",
        answer,
        reply: answer,
        detected_state: continuation ? `Follow-up task: ${subject}` : `Task decomposition request: ${subject}`,
        companion_state: "focused",
        mode: "Study Sprint Mode",
        goal_understanding: `The user wants practical help with ${subject}; give concrete steps and keep them accompanied through the first action.`,
        teaching: emptyTeaching(),
        suggested_actions: ["Start step 1", "Explain the first concept", "Give me an example", "Quiz me after"],
        micro_task_plan,
        start_button_label: "Start 10-min Guided Sprint",
        check_in_message: `After step 1, tell me what part of ${subject} feels clear or confusing.`,
        check_in_options: ["Done", "Partly done", "I got stuck"],
        memory_update: `User is working on ${subject}; guide with concrete steps, examples, and check-ins.`
      };
    }
    function buildVagueHelpResponse(context) {
      const subject = context.subject || "this task";
      if (!hasSubjectSpecificFallback(subject)) return buildEmergencyFallbackResponse(context, "vague_help");
      const teaching = buildFirstStepTeaching(subject);
      const opener = TONE_OPENERS[context.tone] || TONE_OPENERS.soft_supportive;
      const answer = buildToneReply(
        context,
        `${opener} Yes. Let's do the first step together for ${subject}, not repeat the plan.

${teaching.explanation}

Tiny example: ${teaching.example}

Your move: ${teaching.check_question}`
      );
      return {
        intent: "vague_help",
        answer,
        reply: answer,
        detected_state: `Guided help request: ${subject}`,
        companion_state: "thinking",
        mode: "Study Companion Mode",
        goal_understanding: `The user asked for help continuing ${subject}; begin the first useful step instead of restating the plan.`,
        teaching,
        suggested_actions: ["Do this example with me", "Explain simpler", "Quiz me once", "Make next step smaller"],
        micro_task_plan: [
          { label: `Read the tiny ${subject} explanation in the reply`, duration_minutes: 2, done: false },
          { label: `Try the tiny ${subject} example or prompt`, duration_minutes: 4, done: false },
          { label: `Reply with the word, symbol, or step that feels unclear`, duration_minutes: 2, done: false }
        ],
        start_button_label: "Start 8-min Guided Help",
        check_in_message: `Tell me which part of ${subject} still feels unclear, and I will adjust the next step.`,
        check_in_options: ["Done", "Partly done", "I got stuck"],
        memory_update: `User asked for direct help with ${subject}; continue by teaching or demonstrating, not repeating the plan.`
      };
    }
    function buildTeachingResponse(context) {
      const concept = context.teachingSubject || context.subject || "the concept";
      if (!hasSubjectSpecificFallback(concept)) return buildEmergencyFallbackResponse(context, "teach_concept");
      const teaching = buildTeaching(concept);
      const opener = TONE_OPENERS[context.tone] || TONE_OPENERS.soft_supportive;
      const answer = buildToneReply(
        context,
        `${opener} ${teaching.explanation}

Example: ${teaching.example}

Tiny check: ${teaching.check_question}`
      );
      return {
        intent: "teach_concept",
        answer,
        reply: answer,
        detected_state: `Concept explanation request: ${concept}`,
        companion_state: "thinking",
        mode: "Study Companion Mode",
        goal_understanding: `The user is asking to understand the concept of ${concept}, so teaching comes before sprint planning.`,
        teaching,
        suggested_actions: ["Explain simpler", "Give another example", "Quiz me"],
        micro_task_plan: [
          { label: `Read the ${concept} explanation once`, duration_minutes: 2, done: false },
          { label: `Try the tiny check question for ${concept}`, duration_minutes: 3, done: false },
          { label: `Tell me which part of ${concept} is unclear`, duration_minutes: 2, done: false }
        ],
        start_button_label: "Start 7-min Concept Check",
        check_in_message: `After this, tell me whether ${concept} feels clearer or where it got confusing.`,
        check_in_options: ["Done", "Partly done", "I got stuck"],
        memory_update: `User asked for a concept explanation about ${concept}; teach with simple examples before planning.`
      };
    }
    function buildTeaching(concept) {
      if (concept.toLowerCase().includes("algebra")) {
        return {
          concept: "algebra",
          explanation: "Algebra is math where letters or symbols stand for numbers we do not know yet. The goal is usually to find the value that makes a statement true.",
          example: "In x + 3 = 7, x is the unknown number. Since 4 + 3 = 7, x = 4.",
          check_question: "For x + 2 = 6, what is x?"
        };
      }
      return {
        concept,
        explanation: `${concept} is the idea you are trying to understand. Start by asking what it means, what problem it solves, and what a simple example looks like.`,
        example: `Take one small ${concept} example from your notes and label what each symbol or term means before solving it.`,
        check_question: `Can you write one sentence explaining what ${concept} is used for?`
      };
    }
    function buildEmergencyFallbackResponse(context, intent) {
      const subject = context.subject || context.teachingSubject || "this task";
      const answer = [
        "I am having trouble reaching the AI engine right now, so I will not pretend to tutor this from a template.",
        `For ${subject}, write one thing you already know and one question that feels confusing. Then retry once the AI runtime is connected.`
      ].join(" ");
      return {
        intent,
        answer,
        reply: answer,
        detected_state: `AI fallback for ${subject}`,
        companion_state: "concerned",
        mode: intent === "vague_help" || intent === "teach_concept" ? "Study Companion Mode" : "Study Sprint Mode",
        goal_understanding: `The user wants help with ${subject}, but local fallback cannot provide reliable subject-specific tutoring.`,
        teaching: emptyTeaching(),
        suggested_actions: ["Retry AI response", "Tell me what is confusing", "Start smaller"],
        micro_task_plan: [
          { label: `Write one thing you already know about ${subject}`, duration_minutes: 2, done: false },
          { label: `Write one question about ${subject}`, duration_minutes: 2, done: false }
        ],
        start_button_label: "Start 4-min Fallback Reset",
        check_in_message: "If the AI runtime is back, ask again and I will generate a real subject-specific explanation.",
        check_in_options: ["Done", "Partly done", "I got stuck"],
        memory_update: `Fallback used for ${subject}; avoid pretending local templates are subject expertise.`
      };
    }
    function hasSubjectSpecificFallback(subject) {
      const lower = String(subject || "").toLowerCase();
      return [
        "algebra",
        "simultaneous equation",
        "quantum",
        "essay",
        "report",
        "internship",
        "application",
        "room",
        "clean",
        "quiz",
        "exam"
      ].some((keyword) => lower.includes(keyword));
    }
    function buildFirstStepTeaching(subject) {
      const lower = String(subject || "").toLowerCase();
      if (lower.includes("algebra")) {
        return {
          concept: "algebra",
          explanation: "Algebra starts by using a letter as an unknown number, then using the equation to discover what that letter must be.",
          example: "If x + 3 = 7, the question is: what number plus 3 gives 7? The answer is x = 4.",
          check_question: "Try this one: x + 2 = 6. What should x be?"
        };
      }
      if (lower.includes("simultaneous equation")) {
        return {
          concept: "simultaneous equations",
          explanation: "A simultaneous-equation problem gives two equations that must be true at the same time. Your job is to find values that satisfy both.",
          example: "If x + y = 5 and x - y = 1, adding them gives 2x = 6, so x = 3. Then y = 2.",
          check_question: "Which method do you want to try first: substitution or elimination?"
        };
      }
      if (lower.includes("quantum")) {
        return {
          concept: "quantum mechanics",
          explanation: "A tiny starting point for quantum mechanics is probability: it often predicts the chance of an outcome instead of one fixed classical result.",
          example: "A wavefunction is like a probability description. It helps calculate where a particle may be found when measured.",
          check_question: "Which word should we unpack first: wavefunction, measurement, or probability?"
        };
      }
      if (lower.includes("essay") || lower.includes("report")) {
        return {
          concept: subject,
          explanation: "The first useful move is to turn the task into one claim and three supporting points before writing full paragraphs.",
          example: "Claim: this report should explain the main problem, why it matters, and what action follows.",
          check_question: "What is the one sentence version of what your piece needs to prove or explain?"
        };
      }
      if (lower.includes("internship") || lower.includes("application")) {
        return {
          concept: subject,
          explanation: "Start by matching one requirement from the listing to one piece of evidence from your experience.",
          example: "If the listing says 'data analysis', find one class project, internship, or personal project where you analyzed data.",
          check_question: "What is one requirement from the listing?"
        };
      }
      return {
        concept: subject,
        explanation: `For ${subject}, the first useful step is to define what you are trying to do in one sentence, then work through one tiny example or visible action.`,
        example: `Write: "Right now, ${subject} means I need to complete one small visible action." Then name that action.`,
        check_question: `What is the smallest visible part of ${subject} we can do together right now?`
      };
    }
    function emptyTeaching() {
      return {
        concept: "",
        explanation: "",
        example: "",
        check_question: ""
      };
    }
    function buildCheckInResponse(context) {
      const subject = context.subject || "the current task";
      const normalizedCheckIn = String(context.checkInResult || "").toLowerCase();
      const stuck = normalizedCheckIn.includes("stuck");
      const partly = normalizedCheckIn.includes("partly");
      const done = !stuck && !partly;
      const firstTask = stuck ? `Circle the exact line, formula, or sentence in ${subject} where you got stuck` : partly ? `Keep only the part of ${subject} that is already open in front of you` : `Choose one slightly harder ${subject} example or question`;
      const answer = done ? `Nice. Keep the momentum small: do one slightly harder pass on ${subject}, then stop before it gets messy.` : `That is useful feedback. We will reduce the scope of ${subject} and find the blocker instead of pushing blindly.`;
      return {
        intent: "check_in",
        answer,
        reply: answer,
        detected_state: stuck ? "Blocked during sprint" : partly ? "Partial progress" : "Sprint completed",
        companion_state: done ? "happy" : "thinking",
        mode: "Check-in Mode",
        goal_understanding: `You are checking in after working on ${subject}. The next step should adapt to what actually happened.`,
        teaching: emptyTeaching(),
        suggested_actions: ["Try easier step", "Explain blocker", "Continue sprint"],
        micro_task_plan: [
          { label: firstTask, duration_minutes: 3, done: false },
          { label: `Write one question about ${subject} in plain words`, duration_minutes: 4, done: false },
          { label: `Use notes, textbook, or a worked example to answer only that question`, duration_minutes: 8, done: false }
        ],
        start_button_label: "Start 10-min Adjusted Sprint",
        check_in_message: "Come back with the blocker, not a perfect answer.",
        check_in_options: ["Done", "Partly done", "I got stuck"],
        memory_update: `User checked in on ${subject}; next support should adapt scope before adding more work.`
      };
    }
    function buildConcreteStepPlan(subject) {
      const lower = String(subject || "").toLowerCase();
      if (lower.includes("simultaneous equation")) {
        return [
          { label: "Open a worked example with two equations and two unknowns", duration_minutes: 2, done: false },
          { label: "Choose substitution or elimination and write why it fits this pair", duration_minutes: 3, done: false },
          { label: "Solve one line at a time and keep both equations visible", duration_minutes: 6, done: false },
          { label: "Substitute the answer back into both equations to check it", duration_minutes: 3, done: false }
        ];
      }
      if (lower.includes("algebra")) {
        return [
          { label: "Open the algebra section on variables, equations, or expressions", duration_minutes: 2, done: false },
          { label: "Write one tiny equation and mark the unknown", duration_minutes: 3, done: false },
          { label: "Solve one step at a time while keeping the equation balanced", duration_minutes: 5, done: false },
          { label: "Try one similar algebra question and mark the first blocker", duration_minutes: 5, done: false }
        ];
      }
      if (lower.includes("quantum")) {
        return [
          { label: "Open your quantum mechanics notes, textbook section, or lecture slide", duration_minutes: 2, done: false },
          { label: "Pick one starter idea: wavefunction, measurement, uncertainty, or operators", duration_minutes: 3, done: false },
          { label: "Read one worked example and label every symbol you recognize", duration_minutes: 6, done: false },
          { label: "Write the first confusing symbol, assumption, or equation as your blocker", duration_minutes: 3, done: false }
        ];
      }
      if (lower.includes("quiz") || lower.includes("exam")) {
        return [
          { label: `Open the ${subject} notes, formula sheet, or review list`, duration_minutes: 2, done: false },
          { label: "Circle three topics most likely to appear", duration_minutes: 4, done: false },
          { label: "Try two practice questions without checking the answer first", duration_minutes: 8, done: false },
          { label: "Mark one weak spot for the next sprint", duration_minutes: 2, done: false }
        ];
      }
      if (lower.includes("essay") || lower.includes("report")) {
        return [
          { label: `Open the ${subject} prompt, rubric, or brief`, duration_minutes: 2, done: false },
          { label: "Write one sentence saying what the piece must prove or explain", duration_minutes: 4, done: false },
          { label: "Create a three-bullet outline before drafting", duration_minutes: 5, done: false },
          { label: "Draft the first 100 rough words without editing", duration_minutes: 8, done: false }
        ];
      }
      if (lower.includes("room") || lower.includes("clean")) {
        return [
          { label: "Choose one visible zone, not the whole room", duration_minutes: 1, done: false },
          { label: "Remove only trash or dishes from that zone", duration_minutes: 4, done: false },
          { label: "Put loose items into one temporary pile", duration_minutes: 5, done: false },
          { label: "Stop and decide the next zone after the timer", duration_minutes: 1, done: false }
        ];
      }
      if (lower.includes("internship") || lower.includes("application")) {
        return [
          { label: "Open one target internship listing or application page", duration_minutes: 3, done: false },
          { label: "Highlight the top three required skills or keywords", duration_minutes: 5, done: false },
          { label: "Update one resume bullet to match the listing", duration_minutes: 8, done: false },
          { label: "Write the next blocker: resume, cover letter, portfolio, or submit", duration_minutes: 2, done: false }
        ];
      }
      return [
        {
          label: `Write one thing you already know about ${subject}`,
          duration_minutes: 2,
          done: false
        },
        {
          label: `Write one question that feels confusing about ${subject}`,
          duration_minutes: 2,
          done: false
        },
        {
          label: "Retry the AI response when the runtime is connected",
          duration_minutes: 1,
          done: false
        }
      ];
    }
    function buildToneReply(context, base) {
      if (context.tone === "short_direct") {
        return base.replace("I am here with you. ", "").replace(" We will ", " We\u2019ll ");
      }
      if (context.tone === "cute_playful") {
        return `${base} Tiny, visible progress only.`;
      }
      if (context.tone === "coach_like") {
        return `${base} Keep the sprint measurable: open material, name the target, attempt one example.`;
      }
      if (context.tone === "friend_like") {
        return `${base} No need to solve the whole thing in one go.`;
      }
      return base;
    }
    function buildGoalUnderstanding(message, mode) {
      if (mode === "Focus Mode") {
        return "You are ready to focus, so the best next step is to turn that energy into a structured block.";
      }
      if (mode === "Encourage Mode") {
        return `You want to make progress on "${message}", but it feels too large right now. We will make the first step small enough to start.`;
      }
      return `You want support with "${message}". We will choose one small next action and check back after.`;
    }
    function hasActionableGoal(message) {
      return ACTION_KEYWORDS.some((keyword) => message.includes(keyword)) || Boolean(extractGoalSubject(message));
    }
    function detectIntent(message) {
      const lower = String(message || "").toLowerCase();
      if (extractContinuationSubject(message)) return "continue_context";
      if (TEACH_KEYWORDS.some((keyword) => lower.includes(keyword))) return "teach_concept";
      if (STEP_KEYWORDS.some((keyword) => lower.includes(keyword))) return "decompose_task";
      if (lower.match(/\b(quiz me|test me|question me)\b/)) return "quiz";
      if (FOLLOW_UP_KEYWORDS.some((keyword) => lower.includes(keyword)) && !extractGoalSubject(message)) return "vague_help";
      if (LOW_KEYWORDS.some((keyword) => lower.includes(keyword))) return "emotional_support";
      if (hasActionableGoal(lower)) return "plan_task";
      return "general_chat";
    }
    function extractContinuationSubject(message) {
      const match = String(message || "").trim().match(/^(?:and|also|then|next)\s+(.{2,80})$/i);
      return cleanSubject(match?.[1]);
    }
    function extractGoalSubject(message) {
      const text = String(message || "").replace(/[’]/g, "'").replace(/[“”]/g, '"').trim();
      const patterns = [
        /\b(?:i\s+have|i\s+got|i've\s+got)\s+(?:a|an|the|my)?\s*(.+?)(?:\s+(?:but|and)\s+i\b|$)/i,
        /\b(?:stuck\s+on|stuck\s+with|confused\s+by|confused\s+about|struggling\s+with)\s+(.+)/i,
        /\b(?:i\s+need\s+to|i\s+want\s+to|i\s+have\s+to|i\s+gotta|i\s+should)\s+(?:study|learn|review|prepare\s+for|practice|understand|finish|start|work\s+on)\s+(.+)/i,
        /\b(?:study|learn|review|prepare\s+for|practice|understand|finish|start|work\s+on)\s+(.+)/i,
        /\b(?:quiz|exam|homework|assignment|essay|report)\s+(?:on|about|for)\s+(.+)/i
      ];
      for (const pattern of patterns) {
        const match = text.match(pattern);
        const cleaned = cleanSubject(match?.[1]);
        if (cleaned) return cleaned;
      }
      return "";
    }
    function extractConceptSubject(message) {
      const text = String(message || "").trim();
      const patterns = [
        /\b(?:concept|definition|meaning)\s+(?:of|for)\s+(.+)/i,
        /\b(?:explain|define|teach\s+me|give\s+me\s+(?:the\s+)?concept\s+of|give\s+concept\s+of)\s+(.+)/i,
        /\bwhat\s+(?:is|are)\s+(.+)/i
      ];
      for (const pattern of patterns) {
        const match = text.match(pattern);
        const cleaned = cleanSubject(match?.[1]);
        if (cleaned) return cleaned;
      }
      return "";
    }
    function extractSubjectFromHistory(history) {
      if (!Array.isArray(history)) return "";
      for (const item of [...history].reverse()) {
        if (item?.role && item.role !== "user") continue;
        const subject = extractGoalSubject(item?.content || "");
        if (subject) return subject;
      }
      return "";
    }
    function extractSubjectFromMemory(session) {
      const memory = session?.memory || {};
      const candidates = [
        memory.last_goal,
        ...Array.isArray(memory.recent_goals) ? memory.recent_goals : []
      ];
      for (const candidate of candidates) {
        const subject = extractGoalSubject(candidate) || extractConceptSubject(candidate);
        if (subject) return subject;
      }
      return "";
    }
    function cleanSubject(value) {
      if (!value) return "";
      let subject = String(value).replace(/\s+/g, " ").replace(/[.!?]+$/g, "").trim();
      subject = subject.replace(/^(?:learning|studying|reviewing|practicing|starting|start learning|start studying)\s+/i, "").replace(/\b(today|tonight|now|please|pls|again|first)\b.*$/i, "").replace(/\b(?:but|and)\s+(?:i|it|this|that)\b.*$/i, "").replace(/\b(?:for|in)\s+(?:my|the)?\s*(?:quiz|exam|homework|assignment|class)\b.*$/i, "").trim();
      const filler = /* @__PURE__ */ new Set(["it", "this", "that", "something", "stuff", "task", "work"]);
      if (!subject || filler.has(subject.toLowerCase())) return "";
      return subject.slice(0, 80);
    }
    function inferObjectLabel(companion) {
      const raw = [
        companion.defaultObject,
        companion.default_object,
        companion.selectedDefault,
        companion.sourceLabel,
        companion.type,
        companion.name
      ].filter(Boolean).join(" ").toLowerCase();
      if (raw.includes("lamp") || raw.includes("luma")) return "desk lamp";
      if (raw.includes("book") || raw.includes("folio")) return "open book";
      if (raw.includes("coffee") || raw.includes("cup") || raw.includes("cappu")) return "coffee cup";
      return "";
    }
    module2.exports = {
      runMockEngine,
      detectIntent,
      extractConceptSubject,
      extractGoalSubject
    };
  }
});

// server/engines/openai/client.js
var require_client = __commonJS({
  "server/engines/openai/client.js"(exports2, module2) {
    "use strict";
    var { OPENAI_MODEL: OPENAI_MODEL2, OPENAI_SEARCH_MODEL, OPENAI_TIMEOUT_MS: OPENAI_TIMEOUT_MS2 } = require_config();
    var { runtimeResponseJsonSchema } = require_schemas();
    async function runOpenAI({ input, session, repairContext }) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured.");
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS2);
      const allowWebSearch = shouldAllowWebSearch(input);
      const requestBody = {
        model: allowWebSearch ? OPENAI_SEARCH_MODEL : OPENAI_MODEL2,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: buildSystemPrompt()
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(buildRuntimePayload(input, session, allowWebSearch, repairContext))
              }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "nextstep_runtime_response",
            schema: runtimeResponseJsonSchema,
            strict: true
          }
        }
      };
      if (allowWebSearch) {
        requestBody.tools = [{ type: "web_search" }];
        requestBody.tool_choice = "auto";
      }
      try {
        const response = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
          const body = await response.text();
          throw new Error(`OpenAI request failed: ${response.status} ${body.slice(0, 300)}`);
        }
        const data = await response.json();
        return JSON.parse(extractOutputText(data));
      } finally {
        clearTimeout(timeout);
      }
    }
    function buildSystemPrompt() {
      return [
        "You are the runtime engine for Yorimi, an adaptive AI character presence and companion system.",
        "Your job is to answer the latest user message, choose the right intent, and then produce the right support shape.",
        "Use the current message, scenario, channel, tone, use_case, companion profile, uploaded-image context, memory, check_in_result, and recent_history.",
        "Intent routing rules:",
        "- teach_concept: user asks for a concept, definition, meaning, explanation, example, or says things like 'give concept of algebra'. Teach first.",
        "- decompose_task: user asks for concrete steps, step-by-step help, how to start, or to break down a task.",
        "- plan_task: user wants to study, prepare, finish, start, work on, or organize a concrete task.",
        "- continue_context: user sends a short follow-up like 'and algebra', 'also calculus', 'next derivatives', 'why not you help me', or 'guide me'; use recent_history and apply the previous intent to the current or prior subject.",
        "- vague_help: user asks for help after a previous topic, such as 'help me', 'what should I do', or 'show me'; use recent_history, active_goal, and active_plan to begin the first useful step instead of repeating the plan.",
        "- emotional_support: user is sad, tired, overwhelmed, avoiding, stressed, or says they cannot start.",
        "- quiz: user asks to be quizzed, tested, or checked.",
        "- routine: user asks for reminders, routines, breaks, hydration, or daily care.",
        "- check_in: user reports Done, Partly done, or I got stuck after a sprint.",
        "- general_chat: ordinary companion chat.",
        "Mode routing rules:",
        "- Encourage Mode: user is stuck, sad, tired, avoiding, overwhelmed, or says they do not want to begin.",
        "- Study Sprint Mode: user gives an actionable study/work goal or asks for help finishing a task.",
        "- Study Companion Mode: user asks to understand, learn with guidance, or continue from a vague help request.",
        "- Quiz Mode: user asks to be quizzed or tested.",
        "- Focus Mode: user is ready, already started, or asks to continue deep work.",
        "- Routine Check-in Mode: pet/routine use case, reminders, breaks, hydration, or daily care.",
        "- Companion Presence Mode: ACG/presence/emotional support when the user mainly wants company.",
        "- Check-in Mode: only when the user is explicitly reporting progress after a prior sprint.",
        "Treat memory.preferred_mode as historical context, not a command. The current user message wins.",
        "Do not give the same Study Sprint template for every message.",
        "First identify the user's intent:",
        "- If the user asks for explanation, teach the concept.",
        "- If the user asks for steps, give concrete steps.",
        "- If the user expresses tiredness or stress, respond supportively first.",
        "- If the user gives a short follow-up like 'and algebra', use chat history.",
        "- If the user says 'help me' or similar after a previous topic, start doing the first useful step with them. Do not repeat the same plan.",
        "- If the user gives a concrete subject plus tiredness/stress, keep the subject visible while lowering the pressure.",
        "- Study Sprint Mode should make the answer practical, but it must not replace the answer.",
        "Never reuse the previous assistant reply or repeat the same task labels from recent_history or memory.active_plan.",
        "The reply must mention one concrete noun or verb from the current user message.",
        "If intent is teach_concept, do not lead with 'open your notes', 'write the exact task', or a generic sprint plan.",
        "For teach_concept, the answer/reply must include: simple explanation, one tiny example, one short check question, and 2-4 suggested actions.",
        "Use the general study-start framework only for plan_task intent.",
        "If intent is decompose_task, answer with numbered concrete steps tailored to the subject; do not use a generic 'open material, name concept, try example' template.",
        "For decompose_task and plan_task, use your general knowledge to infer concrete beginner steps for any academic or work subject. Do not depend on hardcoded subject branches.",
        "When the subject is unfamiliar or broad, infer a sensible beginner path instead of giving a generic planning template.",
        "For academic subjects, use this pattern: identify the first beginner concept, explain why it matters, give one tiny example, give one small practice action, and ask one short check question.",
        "For non-academic tasks, use this pattern: define the desired outcome, identify the first visible action, give a concrete 5-10 minute step, and ask for the user's current blocker.",
        "Avoid generic phrases like 'open the most relevant material', 'name the first concrete part', 'do one small example', or 'mark the first blocker' unless paired with a concrete subject-specific action.",
        "If intent is vague_help, respond by beginning the first useful step for the current subject. For study tasks, teach or demonstrate a tiny example. For work tasks, draft or outline the next action. For emotional tasks, support first. Never repeat the same micro_task_plan from last_reply or active_plan.",
        "If intent is emotional_support, validate the user's state before proposing any task. Use Encourage Mode, not Study Sprint Mode, unless they also give a concrete goal.",
        "If the user says they need to study/learn/review/prepare a subject, treat that subject as already specific enough to begin. Do not ask them to rewrite the task first.",
        "If the user names a subject or task, include useful materials or resources in the micro-task labels, such as notes, formula sheet, textbook section, lecture slide, practice question, rubric, or checklist.",
        "If web_search_allowed is true, use web search only when current/external information is necessary. Do not search for basic tutoring, common study skills, or ordinary concept explanations.",
        "Do not invent a different subject. For example, if the user says quantum mechanics, the plan must be about quantum mechanics, not finance, SVD, or generic studying.",
        "If check_in_result is Done, celebrate briefly and propose the next slightly harder step. If Partly done, reduce scope. If I got stuck, diagnose the blocker and create an easier first step.",
        "Use short supportive copy and 2-4 concrete micro-tasks.",
        "Prefer 5-10 minute starts when the user is stuck, tired, overwhelmed, or procrastinating.",
        "Avoid diagnosis, therapy claims, or medical framing.",
        "Respect the selected tone, use case, companion role, and companion personality. If the companion came from a pet/object/image, speak as that specific companion.",
        "Always fill intent, answer, suggested_actions, and teaching. For non-teaching intents, teaching fields can be empty strings.",
        "Return only schema-valid JSON.",
        "If repair_context is present, the previous response was rejected for being too generic. Generate a new subject-specific response that directly fixes repair_context.reason and avoids repair_context.banned_phrases."
      ].join("\n");
    }
    function buildRuntimePayload(input, session = {}, webSearchAllowed = false, repairContext) {
      const memory = session.memory || {};
      const inferredIntent = inferInputIntent(input);
      const inferredMode = inferModeFromIntent(inferredIntent, input);
      return {
        scenario: input.scenario,
        message: input.message,
        inferred_intent: inferredIntent,
        channel: input.channel,
        selected_mode: inferredMode,
        tone: input.tone,
        use_case: input.use_case,
        role: input.role || input.companion?.role || "",
        check_in_result: input.check_in_result || null,
        image_url_present: Boolean(input.image_url || input.companion?.sourceImageUrl),
        image_metadata: input.image_metadata || null,
        default_object_label: input.companion?.default_object_label || input.image_metadata?.default_object_label || "",
        companion: input.companion || session.companion || null,
        memory,
        recent_history: buildRecentHistory(input, session),
        active_goal: memory.active_goal || memory.last_goal || "",
        active_plan: memory.active_plan || [],
        last_reply: memory.last_reply || "",
        turn_count: memory.turn_count || 0,
        web_search_allowed: webSearchAllowed,
        repair_context: repairContext || null
      };
    }
    function inferInputIntent(input) {
      const message = String(input.message || "").toLowerCase();
      if (input.check_in_result) return "check_in";
      if (message.match(/^\s*(and|also|then|next)\s+[\w\s-]{2,80}$/)) return "continue_context";
      if (message.match(/\b(concept|explain|what is|what are|teach me|define|meaning of|give concept)\b/)) return "teach_concept";
      if (message.match(/\b(concrete step|concrete steps|first step|steps to|step by step|break down|decompose|plan for|how do i start|how to start|show me how to)\b/)) return "decompose_task";
      if (message.match(/\b(quiz me|test me|question me)\b/)) return "quiz";
      if (message.match(/\b(help me|i need help|why not|what should i do|guide me|show me|continue)\b/) && !message.match(/\b(study|learn|review|prepare|practice|write|finish|apply|clean|quiz|exam|essay|homework|internship|start|work on)\b/)) {
        return "vague_help";
      }
      if (input.scenario === "pet" || input.use_case === "routine" || input.use_case === "pet_companionship") return "routine";
      if (message.match(/\b(sad|tired|overwhelmed|stressed|don't want|dont want|cannot|can't|stuck|hate)\b/)) return "emotional_support";
      if (message.match(/\b(learn|study|review|prepare|practice|write|finish|apply|clean|quiz|exam|essay|homework|internship|start|work on)\b/)) return "plan_task";
      return "general_chat";
    }
    function inferModeFromIntent(intent, input = {}) {
      if (intent === "emotional_support") return "Encourage Mode";
      if (intent === "teach_concept") return "Study Companion Mode";
      if (intent === "vague_help") return "Study Companion Mode";
      if (intent === "decompose_task") return "Study Sprint Mode";
      if (intent === "plan_task") return "Study Sprint Mode";
      if (intent === "quiz") return "Quiz Mode";
      if (intent === "routine") return "Routine Check-in Mode";
      if (intent === "check_in") return "Check-in Mode";
      if (intent === "continue_context") return input.selected_mode || "Study Companion Mode";
      return "Companion Presence Mode";
    }
    function shouldAllowWebSearch(input) {
      const message = String(input.message || "").toLowerCase();
      return /\b(latest|current|recent|news|source|sources|resources|website|search|look up|find online)\b/.test(message) || /\b(syllabus|curriculum|deadline|price|schedule|event|documentation|docs|api changes)\b/.test(message) || /\b(2025|2026)\b/.test(message);
    }
    function buildRecentHistory(input, session) {
      const serverHistory = Array.isArray(session.history) ? session.history.slice(-6) : [];
      const clientHistory = Array.isArray(input.history) ? input.history.slice(-6) : [];
      return [...serverHistory, ...clientHistory].slice(-8);
    }
    function extractOutputText(data) {
      if (typeof data.output_text === "string" && data.output_text.trim()) {
        return data.output_text;
      }
      for (const output of data.output || []) {
        for (const content of output.content || []) {
          if (typeof content.text === "string" && content.text.trim()) return content.text;
          if (typeof content.json === "object") return JSON.stringify(content.json);
        }
      }
      throw new Error("OpenAI response did not contain parseable output text.");
    }
    module2.exports = {
      runOpenAI
    };
  }
});

// server/engines/doubao/client.js
var require_client2 = __commonJS({
  "server/engines/doubao/client.js"(exports2, module2) {
    "use strict";
    var https2 = require("https");
    var { VOLC_ARK_API_KEY, VOLC_CHAT_MODEL, VOLC_CHAT_TIMEOUT_MS } = require_config();
    async function runDoubao({ input, session, repairContext }) {
      if (!VOLC_ARK_API_KEY) {
        throw new Error("VOLC_ARK_API_KEY is not configured.");
      }
      const t0 = Date.now();
      const payload = buildRuntimePayload(input, session, repairContext);
      const requestBody = {
        model: VOLC_CHAT_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: JSON.stringify(payload) }
        ]
      };
      console.log("[doubao] sending request model=%s timeout=%dms", VOLC_CHAT_MODEL, VOLC_CHAT_TIMEOUT_MS);
      return new Promise((resolve, reject) => {
        const bodyStr = JSON.stringify(requestBody);
        const req = https2.request(
          {
            hostname: "ark.cn-beijing.volces.com",
            path: "/api/v3/chat/completions",
            method: "POST",
            timeout: VOLC_CHAT_TIMEOUT_MS,
            headers: {
              Authorization: `Bearer ${VOLC_ARK_API_KEY}`,
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(bodyStr)
            }
          },
          (res) => {
            console.log("[doubao] status=%d elapsed=%dms", res.statusCode, Date.now() - t0);
            let raw = "";
            res.on("data", (chunk) => {
              raw += chunk;
            });
            res.on("end", () => {
              try {
                const data = JSON.parse(raw);
                if (res.statusCode !== 200) {
                  reject(new Error(`Doubao error: ${res.statusCode} ${raw.slice(0, 200)}`));
                  return;
                }
                const content = data.choices?.[0]?.message?.content;
                if (!content) {
                  reject(new Error("Doubao response missing content."));
                  return;
                }
                console.log("[doubao] success elapsed=%dms reasoning_tokens=%d", Date.now() - t0, data.usage?.completion_tokens_details?.reasoning_tokens ?? 0);
                resolve(JSON.parse(content));
              } catch (e) {
                reject(new Error(`Doubao parse error: ${e.message}. raw: ${raw.slice(0, 200)}`));
              }
            });
          }
        );
        req.on("timeout", () => {
          req.destroy(new Error("Doubao request timed out."));
        });
        req.on("error", (err) => {
          console.error("[doubao] failed elapsed=%dms reason=%s", Date.now() - t0, err?.message);
          reject(err);
        });
        req.write(bodyStr);
        req.end();
      });
    }
    function buildSystemPrompt() {
      return [
        "You are NextStep Companion runtime engine. Output ONLY a JSON object \u2014 no markdown, no extra text.",
        "Fields: intent, mode, detected_state, companion_state, reply, answer, goal_understanding, micro_task_plan (array of {label,duration_minutes,done}), start_button_label, check_in_message, check_in_options, suggested_actions, teaching ({concept,explanation,example,check_question}), memory_update, trace.",
        "Intents: teach_concept|decompose_task|plan_task|continue_context|vague_help|emotional_support|quiz|routine|check_in|general_chat",
        "Modes: Encourage Mode|Study Companion Mode|Study Sprint Mode|Quiz Mode|Focus Mode|Routine Check-in Mode|Companion Presence Mode|Check-in Mode",
        "reply: 2-4 sentences. Always name the specific subject from the message. NEVER say 'open the relevant materials' or 'work on the first small step'.",
        "micro_task_plan labels: specific subtopics (e.g. 'Review eigenvalue definition', 'Solve 3 row-reduction problems'). Never generic.",
        "teach_concept: explain+tiny example+check question. plan_task/decompose_task: numbered steps for THAT subject.",
        "emotional_support: validate feeling first, then one tiny optional action. check_in Done: celebrate + harder next step.",
        "If repair_context present: fix repair_context.reason, avoid repair_context.banned_phrases."
      ].join("\n");
    }
    function buildRuntimePayload(input, session = {}, repairContext) {
      const memory = session.memory || {};
      const companion = input.companion || session.companion || null;
      const { sourceImageUrl, imageData, image_data, ...companionRest } = companion || {};
      return {
        scenario: input.scenario,
        message: input.message,
        channel: input.channel,
        tone: input.tone,
        use_case: input.use_case,
        role: input.role || companion?.role || "",
        check_in_result: input.check_in_result || null,
        image_url_present: Boolean(input.image_url || sourceImageUrl),
        image_metadata: input.image_metadata || null,
        default_object_label: companion?.default_object_label || input.image_metadata?.default_object_label || "",
        companion: companion ? companionRest : null,
        memory,
        recent_history: buildRecentHistory(input, session),
        active_goal: memory.active_goal || memory.last_goal || "",
        active_plan: memory.active_plan || [],
        last_reply: memory.last_reply || "",
        turn_count: memory.turn_count || 0,
        repair_context: repairContext || null
      };
    }
    function buildRecentHistory(input, session) {
      const serverHistory = Array.isArray(session.history) ? session.history.slice(-6) : [];
      const clientHistory = Array.isArray(input.history) ? input.history.slice(-6) : [];
      return [...serverHistory, ...clientHistory].slice(-8);
    }
    async function runDoubaoStream2({ input, session, repairContext }, onSentence) {
      if (!VOLC_ARK_API_KEY) throw new Error("VOLC_ARK_API_KEY is not configured.");
      const t0 = Date.now();
      const runtimePayload = buildRuntimePayload(input, session, repairContext);
      const requestBody = {
        model: VOLC_CHAT_MODEL,
        stream: true,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: JSON.stringify(runtimePayload) }
        ]
      };
      return new Promise((resolve, reject) => {
        const bodyStr = JSON.stringify(requestBody);
        const extractState = { replyStart: -1, processedTo: 0 };
        let accumulated = "";
        const req = https2.request(
          {
            hostname: "ark.cn-beijing.volces.com",
            path: "/api/v3/chat/completions",
            method: "POST",
            timeout: VOLC_CHAT_TIMEOUT_MS,
            headers: {
              Authorization: `Bearer ${VOLC_ARK_API_KEY}`,
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(bodyStr)
            }
          },
          (res) => {
            if (res.statusCode !== 200) {
              let errBody = "";
              res.on("data", (c) => {
                errBody += c;
              });
              res.on("end", () => reject(new Error(`Doubao stream error: ${res.statusCode} ${errBody.slice(0, 200)}`)));
              return;
            }
            let rawBuf = "";
            res.on("data", (chunk) => {
              rawBuf += chunk.toString();
              const lines = rawBuf.split("\n");
              rawBuf = lines.pop();
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const sseData = line.slice(6).trim();
                if (sseData === "[DONE]") continue;
                try {
                  const delta = JSON.parse(sseData).choices?.[0]?.delta?.content ?? "";
                  if (!delta) continue;
                  accumulated += delta;
                  if (onSentence) {
                    extractReplyChunks(accumulated, extractState).forEach(onSentence);
                  }
                } catch {
                }
              }
            });
            res.on("end", () => {
              try {
                console.log("[doubao-stream] done elapsed=%dms", Date.now() - t0);
                resolve(JSON.parse(accumulated));
              } catch (e) {
                reject(new Error(`Doubao stream parse error: ${e.message}. raw: ${accumulated.slice(0, 200)}`));
              }
            });
          }
        );
        req.on("timeout", () => req.destroy(new Error("Doubao stream timed out.")));
        req.on("error", reject);
        req.write(bodyStr);
        req.end();
      });
    }
    function extractReplyChunks(accumulated, state) {
      const sentences = [];
      if (state.replyStart === -1) {
        const m = accumulated.match(/"reply"\s*:\s*"/);
        if (!m) return sentences;
        state.replyStart = m.index + m[0].length;
      }
      const raw = accumulated.slice(state.replyStart);
      let content = "";
      let i = 0;
      while (i < raw.length) {
        const c = raw[i];
        if (c === '"' && (i === 0 || raw[i - 1] !== "\\")) break;
        if (c === "\\" && i + 1 < raw.length) {
          const esc = { n: "\n", '"': '"', "\\": "\\", t: "	", r: "\r" }[raw[i + 1]] ?? raw[i + 1];
          content += esc;
          i += 2;
        } else {
          content += c;
          i++;
        }
      }
      const unprocessed = content.slice(state.processedTo);
      const re = /[^.!?。！？\n]*[.!?。！？]+\s*/g;
      let match;
      while ((match = re.exec(unprocessed)) !== null) {
        const text = match[0].trim();
        if (text.length > 4) {
          sentences.push(text);
          state.processedTo += match[0].length;
        }
      }
      return sentences;
    }
    module2.exports = { runDoubao, runDoubaoStream: runDoubaoStream2 };
  }
});

// server/store/sessionStore.js
var require_sessionStore = __commonJS({
  "server/store/sessionStore.js"(exports2, module2) {
    "use strict";
    var crypto = require("crypto");
    var { MAX_SESSIONS: MAX_SESSIONS2, SESSION_TTL_MS: SESSION_TTL_MS2 } = require_config();
    var sessions = /* @__PURE__ */ new Map();
    function createSession2({ scenario, companion, tone, use_case } = {}) {
      pruneExpiredSessions();
      enforceSessionLimit();
      const sessionId = crypto.randomUUID();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const memory = createInitialMemory({ companion, tone, use_case, now });
      const session = {
        id: sessionId,
        scenario: scenario || "study",
        companion: companion || null,
        tone: tone || "",
        use_case: use_case || "",
        history: [],
        memory,
        created_at: now,
        updated_at: now
      };
      sessions.set(sessionId, session);
      return session;
    }
    function createInitialMemory({ companion, tone, use_case, now }) {
      return {
        user_name: "",
        current_companion: companion?.name || "Companion",
        companion_settings: companion || {},
        preferred_mode: "Check-in Mode",
        preferred_task_length: "10-minute sprint",
        recent_goals: [],
        completed_micro_tasks: [],
        check_in_history: [],
        latest_memory_update: "First session - building baseline.",
        active_plan: [],
        last_reply: "",
        turn_count: 0,
        tone: tone || "",
        use_case: use_case || "",
        updated_at: now,
        last_goal: "Starting a session",
        recent_mode: "Check-in Mode",
        memory_update: "First session - building baseline."
      };
    }
    function getSession2(sessionId) {
      pruneExpiredSessions();
      if (!sessionId) return null;
      const session = sessions.get(sessionId) || null;
      if (!session) return null;
      if (isExpired(session)) {
        sessions.delete(sessionId);
        return null;
      }
      return session;
    }
    function ensureSession2(input) {
      const existing = getSession2(input.session_id);
      if (existing) return existing;
      return createSession2(input);
    }
    function updateSessionAfterTurn2(session, input, result) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const recentGoals = [input.message, ...session.memory.recent_goals || []].filter(Boolean).slice(0, 5);
      const completed = Array.isArray(session.memory.completed_micro_tasks) ? session.memory.completed_micro_tasks.slice(0, 10) : [];
      const checkInResult = normalizeCheckInResult(input.check_in_result);
      if (checkInResult === "done" && Array.isArray(result.micro_task)) {
        completed.unshift(...result.micro_task.slice(0, 2));
      }
      const checkIns = Array.isArray(session.memory.check_in_history) ? session.memory.check_in_history.slice(0, 10) : [];
      if (checkInResult) {
        checkIns.unshift({
          date: now,
          goal: input.message,
          result: checkInResult
        });
      }
      if (input.companion) session.companion = input.companion;
      if (input.tone) session.tone = input.tone;
      if (input.use_case) session.use_case = input.use_case;
      session.memory = {
        ...session.memory,
        current_companion: input.companion?.name || session.memory.current_companion,
        companion_settings: input.companion || session.memory.companion_settings,
        preferred_mode: result.mode,
        preferred_task_length: inferPreferredTaskLength(result),
        recent_goals: recentGoals,
        completed_micro_tasks: completed.slice(0, 10),
        check_in_history: checkIns.slice(0, 10),
        latest_memory_update: result.memory_update,
        active_plan: Array.isArray(result.micro_task) ? result.micro_task.slice(0, 4) : [],
        last_reply: result.reply || "",
        turn_count: Number(session.memory.turn_count || 0) + 1,
        updated_at: now,
        last_goal: input.message,
        recent_mode: result.mode,
        memory_update: result.memory_update
      };
      session.history.push({ role: "user", content: input.message, at: now });
      session.history.push({ role: "assistant", content: result.reply, at: now });
      session.history = session.history.slice(-12);
      session.updated_at = now;
      return session;
    }
    function inferPreferredTaskLength(result) {
      const durations = Array.isArray(result.micro_task_plan) ? result.micro_task_plan.map((task) => Number(task.duration_minutes || 0)).filter(Boolean) : [];
      const total = durations.reduce((sum, value) => sum + value, 0);
      if (result.mode === "Encourage Mode") return "10-minute sprint";
      if (total > 0 && total <= 15) return `${total}-minute sprint`;
      if (result.mode === "Routine Check-in Mode") return "Short breaks";
      return "Flexible";
    }
    function normalizeCheckInResult(value) {
      const normalized = String(value || "").toLowerCase().replace(/\s+/g, "_");
      if (normalized.includes("partly")) return "partly_done";
      if (normalized.includes("stuck")) return "stuck";
      if (normalized === "done") return "done";
      return null;
    }
    function resetSession2(sessionId) {
      return sessions.delete(sessionId);
    }
    function pruneExpiredSessions() {
      if (!SESSION_TTL_MS2) return;
      for (const [sessionId, session] of sessions.entries()) {
        if (isExpired(session)) sessions.delete(sessionId);
      }
    }
    function enforceSessionLimit() {
      while (sessions.size >= MAX_SESSIONS2) {
        const oldest = sessions.keys().next().value;
        if (!oldest) return;
        sessions.delete(oldest);
      }
    }
    function isExpired(session) {
      if (!SESSION_TTL_MS2 || !session?.updated_at) return false;
      return Date.now() - Date.parse(session.updated_at) > SESSION_TTL_MS2;
    }
    module2.exports = {
      createSession: createSession2,
      ensureSession: ensureSession2,
      getSession: getSession2,
      resetSession: resetSession2,
      updateSessionAfterTurn: updateSessionAfterTurn2
    };
  }
});

// server/engines/runtime/orchestrator.js
var require_orchestrator = __commonJS({
  "server/engines/runtime/orchestrator.js"(exports2, module2) {
    "use strict";
    var { USE_MOCK_AI: USE_MOCK_AI2 } = require_config();
    var { companionData: companionData2 } = require_data();
    var { detectIntent, extractConceptSubject, extractGoalSubject, runMockEngine } = require_mockEngine();
    var { runOpenAI } = require_client();
    var { runDoubao } = require_client2();
    var { normalizeRuntimeResult: normalizeRuntimeResult2, validateChatRequest: validateChatRequest2 } = require_schemas();
    var { ensureSession: ensureSession2, getSession: getSession2, updateSessionAfterTurn: updateSessionAfterTurn2 } = require_sessionStore();
    async function runTurn2(body) {
      const parsed = validateChatRequest2(body);
      if (!parsed.ok) {
        const error = new Error(parsed.error);
        error.statusCode = 400;
        throw error;
      }
      const input = hydrateCompanion(parsed.value);
      const session = ensureSession2(input);
      let runtimeResult;
      let fallbackUsed = false;
      if (!USE_MOCK_AI2) {
        try {
          const doubaoResult = await runDoubao({ input, session });
          runtimeResult = normalizeRuntimeResult2(doubaoResult, {
            session_id: session.id,
            message: input.message,
            defaultMode: inferDefaultMode2(input),
            fallback_used: false
          });
          runtimeResult.runtime_source = "doubao";
          const repairContext = buildRepairContext(input, runtimeResult);
          if (repairContext) {
            const repairedResult = await runDoubao({ input, session, repairContext });
            runtimeResult = normalizeRuntimeResult2(repairedResult, {
              session_id: session.id,
              message: input.message,
              defaultMode: inferDefaultMode2(input),
              fallback_used: false
            });
            runtimeResult.runtime_source = "doubao";
            runtimeResult.trace.push({
              step: "doubao_repair",
              status: "complete",
              summary: repairContext.reason
            });
          }
          runtimeResult = applyRuntimeGuards(input, runtimeResult, session);
          runtimeResult = ensureVisibleTaskFormat(runtimeResult);
        } catch (doubaoError) {
          console.error("[doubao_adapter] failed, trying OpenAI:", doubaoError?.message || doubaoError);
          try {
            const openAIResult = await runOpenAI({ input, session });
            runtimeResult = normalizeRuntimeResult2(openAIResult, {
              session_id: session.id,
              message: input.message,
              defaultMode: inferDefaultMode2(input),
              fallback_used: false
            });
            runtimeResult.runtime_source = "openai";
            const repairContext = buildRepairContext(input, runtimeResult);
            if (repairContext) {
              const repairedResult = await runOpenAI({ input, session, repairContext });
              runtimeResult = normalizeRuntimeResult2(repairedResult, {
                session_id: session.id,
                message: input.message,
                defaultMode: inferDefaultMode2(input),
                fallback_used: false
              });
              runtimeResult.runtime_source = "openai";
            }
            runtimeResult = applyRuntimeGuards(input, runtimeResult, session);
            runtimeResult = ensureVisibleTaskFormat(runtimeResult);
          } catch (openAIError) {
            console.error("[openai_adapter] failed, using mock fallback:", openAIError?.message || openAIError);
            fallbackUsed = true;
            runtimeResult = runMockEngine(input, companionData2, session);
            runtimeResult.trace.unshift({
              step: "openai_adapter",
              status: "fallback",
              summary: "Doubao and OpenAI both failed; deterministic fallback used."
            });
          }
        }
      } else {
        fallbackUsed = true;
        runtimeResult = runMockEngine(input, companionData2, session);
      }
      runtimeResult = ensureVisibleTaskFormat(runtimeResult);
      runtimeResult.session_id = session.id;
      runtimeResult.fallback_used = fallbackUsed || runtimeResult.fallback_used;
      if (runtimeResult.fallback_used) runtimeResult.runtime_source = "mock";
      const updatedSession = updateSessionAfterTurn2(session, input, runtimeResult);
      return {
        ...runtimeResult,
        memory: updatedSession.memory
      };
    }
    function applyRuntimeGuards(input, runtimeResult, session) {
      const intent = detectIntent(input.message);
      if (intent === "vague_help") {
        return applyVagueHelpGuard(input, runtimeResult, session);
      }
      if (intent === "teach_concept") {
        return applyTeachingGuard(input, runtimeResult, session);
      }
      if (["decompose_task", "continue_context", "emotional_support"].includes(intent)) {
        return applyIntentGuard(input, runtimeResult, session, intent);
      }
      return runtimeResult;
    }
    function applyVagueHelpGuard(input, runtimeResult, session) {
      const subject = extractSessionSubject(input, session);
      const reply = String(runtimeResult.reply || runtimeResult.answer || "");
      const text = [
        runtimeResult.intent,
        reply,
        runtimeResult.goal_understanding,
        ...runtimeResult.micro_task || [],
        ...runtimeResult.suggested_actions || []
      ].join(" ").toLowerCase();
      const mentionsSubject = !subject || subjectMentions(text, subject);
      const repeatsPlan = repeatsActivePlan(text, session) || /choose one tiny slice|learn the simplest definition|worked example while looking|mark the first blocker|let'?s break .* into concrete steps/i.test(text);
      const tooThin = reply.split(/\s+/).filter(Boolean).length < 28;
      const valid = runtimeResult.intent === "vague_help" && runtimeResult.mode === "Study Companion Mode" && mentionsSubject && !repeatsPlan && !tooThin;
      if (valid) return runtimeResult;
      return {
        ...runtimeResult,
        intent: "vague_help",
        mode: "Study Companion Mode",
        companion_state: runtimeResult.companion_state === "focused" ? "thinking" : runtimeResult.companion_state,
        trace: [
          ...runtimeResult.trace || [],
          {
            step: "vague_help_guard",
            status: "complete",
            summary: "Preserved OpenAI content and corrected vague-help metadata; mock tutoring is not used on the normal path."
          }
        ]
      };
    }
    function ensureVisibleTaskFormat(runtimeResult) {
      const taskIntents = /* @__PURE__ */ new Set(["plan_task", "decompose_task", "continue_context", "vague_help", "emotional_support"]);
      if (!taskIntents.has(runtimeResult.intent)) return runtimeResult;
      const tasks = Array.isArray(runtimeResult.micro_task_plan) ? runtimeResult.micro_task_plan.map((task) => String(task?.label || "").trim()).filter(Boolean) : [];
      if (tasks.length === 0) return runtimeResult;
      const reply = String(runtimeResult.reply || runtimeResult.answer || "").trim();
      const hasVisibleSteps = /\n\s*1\.|\b1\.\s|\bStep\s+1\b|First\s+\d+/i.test(reply);
      const hasEnoughDetail = reply.split(/\s+/).filter(Boolean).length >= 36;
      if (hasVisibleSteps && hasEnoughDetail) return runtimeResult;
      const intro = reply || "Let's make this concrete.";
      const visibleTasks = tasks.slice(0, 4).map((task, index) => `${index + 1}. ${task}`).join("\n");
      const heading = runtimeResult.intent === "emotional_support" ? "Gentle reset:" : runtimeResult.intent === "vague_help" ? "Guided first step:" : "First tiny sprint:";
      const nextReply = `${intro}

${heading}
${visibleTasks}`;
      return {
        ...runtimeResult,
        answer: runtimeResult.answer || nextReply,
        reply: nextReply,
        trace: [
          ...runtimeResult.trace || [],
          {
            step: "visible_task_formatter",
            status: "complete",
            summary: "Added the structured micro-task plan to the visible chat reply."
          }
        ]
      };
    }
    function applyIntentGuard(input, runtimeResult, session, expectedIntent) {
      const subject = extractGoalSubject(input.message) || extractConceptSubject(input.message);
      const text = [
        runtimeResult.intent,
        runtimeResult.answer,
        runtimeResult.reply,
        runtimeResult.goal_understanding,
        ...runtimeResult.micro_task || [],
        ...runtimeResult.suggested_actions || []
      ].join(" ").toLowerCase();
      const mentionsSubject = !subject || subjectMentions(text, subject);
      const genericSprint = /make .* concrete first|start .* by opening the right material|what are we working on|tell me what|write the exact task/i.test(text);
      const validEmotional = expectedIntent !== "emotional_support" || runtimeResult.intent === "emotional_support" && runtimeResult.mode === "Encourage Mode" && !genericSprint;
      const validSteps = !["decompose_task", "continue_context"].includes(expectedIntent) || runtimeResult.intent === expectedIntent && !genericSprint && mentionsSubject;
      if (validEmotional && validSteps) return runtimeResult;
      return {
        ...runtimeResult,
        intent: expectedIntent,
        mode: modeForIntent(expectedIntent, runtimeResult.mode),
        trace: [
          ...runtimeResult.trace || [],
          {
            step: "intent_guard",
            status: "complete",
            summary: `Corrected response metadata to ${expectedIntent}; preserved OpenAI answer instead of substituting mock output.`
          }
        ]
      };
    }
    function applyTeachingGuard(input, runtimeResult, session) {
      const concept = extractConceptSubject(input.message);
      if (!concept) return runtimeResult;
      const text = [
        runtimeResult.intent,
        runtimeResult.answer,
        runtimeResult.reply,
        runtimeResult.teaching?.explanation,
        runtimeResult.teaching?.example,
        ...runtimeResult.suggested_actions || []
      ].join(" ").toLowerCase();
      const conceptWords = concept.toLowerCase().split(/\s+/).filter((word) => word.length > 2);
      const mentionsConcept = conceptWords.some((word) => text.includes(word));
      const sprintFirst = /open your .*notes|write (?:the )?exact task|make .* concrete first|start .* by opening/i.test(text);
      if (runtimeResult.intent === "teach_concept" && mentionsConcept && !sprintFirst) return runtimeResult;
      return {
        ...runtimeResult,
        intent: "teach_concept",
        mode: "Study Companion Mode",
        trace: [
          ...runtimeResult.trace || [],
          {
            step: "intent_guard",
            status: "complete",
            summary: `Corrected concept-teaching metadata for ${concept}; preserved OpenAI answer instead of substituting mock output.`
          }
        ]
      };
    }
    function modeForIntent(intent, currentMode) {
      if (intent === "emotional_support") return "Encourage Mode";
      if (intent === "teach_concept" || intent === "vague_help" || intent === "continue_context") return "Study Companion Mode";
      if (intent === "decompose_task" || intent === "plan_task") return "Study Sprint Mode";
      if (intent === "quiz") return "Quiz Mode";
      if (intent === "routine") return "Routine Check-in Mode";
      if (intent === "check_in") return "Check-in Mode";
      return currentMode || "Companion Presence Mode";
    }
    function isLocalGenericTemplate(text) {
      return /open the most relevant material|name the first concrete part|do one small example, paragraph, question, or visible action|mark the first blocker|write: "right now, .* means i need to complete one small visible action/i.test(String(text || ""));
    }
    function buildRepairContext(input, runtimeResult) {
      const text = [
        runtimeResult.reply,
        runtimeResult.answer,
        runtimeResult.goal_understanding,
        ...runtimeResult.micro_task || []
      ].join(" ");
      const intent = detectIntent(input.message);
      if (!["plan_task", "decompose_task", "vague_help", "teach_concept"].includes(intent)) return null;
      if (!isLocalGenericTemplate(text)) return null;
      return {
        reason: "Response used generic fallback planning instead of subject-specific help.",
        inferred_intent: intent,
        banned_phrases: [
          "open the most relevant material",
          "name the first concrete part",
          "do one small example, paragraph, question, or visible action",
          "mark the first blocker"
        ],
        previous_reply: runtimeResult.reply,
        previous_micro_task_plan: runtimeResult.micro_task_plan
      };
    }
    function subjectMentions(text, subject) {
      const subjectWords = String(subject || "").toLowerCase().split(/\s+/).filter((word) => word.length > 2);
      if (subjectWords.length === 0) return true;
      return subjectWords.some((word) => String(text || "").includes(word));
    }
    function extractSessionSubject(input, session) {
      const fromCurrent = extractGoalSubject(input.message) || extractConceptSubject(input.message);
      if (fromCurrent) return fromCurrent;
      const memory = session?.memory || {};
      const candidates = [
        memory.active_goal,
        memory.last_goal,
        ...Array.isArray(memory.recent_goals) ? memory.recent_goals : []
      ];
      for (const candidate of candidates) {
        const subject = extractGoalSubject(candidate) || extractConceptSubject(candidate);
        if (subject) return subject;
      }
      return "";
    }
    function repeatsActivePlan(text, session) {
      const activePlan = Array.isArray(session?.memory?.active_plan) ? session.memory.active_plan : [];
      const normalizedText = String(text || "").toLowerCase();
      const repeatedTasks = activePlan.filter((task) => {
        const words = String(task || "").toLowerCase().split(/\s+/).filter((word) => word.length > 3);
        if (words.length < 3) return false;
        const hits = words.filter((word) => normalizedText.includes(word)).length;
        return hits / words.length >= 0.6;
      });
      const lastReply = String(session?.memory?.last_reply || "").toLowerCase().trim();
      return repeatedTasks.length >= 2 || lastReply && normalizedText.includes(lastReply.slice(0, 80));
    }
    function hydrateCompanion(input) {
      const existingSession = getSession2(input.session_id);
      const companion = input.companion || existingSession?.companion || companionData2.companions?.[input.scenario] || companionData2.companions?.study || {};
      return {
        ...input,
        tone: input.tone || existingSession?.tone || companion?.tone || "",
        use_case: input.use_case || existingSession?.use_case || companion?.use_case || "",
        companion
      };
    }
    function inferDefaultMode2(input) {
      const message = String(input.message || "").toLowerCase();
      if (input.check_in_result) return "Check-in Mode";
      if (input.scenario === "pet" || input.use_case === "routine" || input.use_case === "pet_companionship") return "Routine Check-in Mode";
      if (input.scenario === "acg" || input.use_case === "light_support") return "Companion Presence Mode";
      if (message.match(/\b(done|finished|completed|partly|stuck)\b/)) return "Check-in Mode";
      if (message.match(/\b(focus|ready|continue|deep work|pomodoro)\b/)) return "Study Sprint Mode";
      if (message.match(/\b(sad|tired|overwhelmed|stressed|don't want|dont want|cannot|can't|stuck|hate)\b/)) return "Encourage Mode";
      if (message.match(/\b(learn|study|review|prepare|practice|write|finish|apply|clean|quiz|exam|essay|homework|internship)\b/)) return "Study Sprint Mode";
      return "Companion Presence Mode";
    }
    module2.exports = {
      runTurn: runTurn2,
      inferDefaultMode: inferDefaultMode2
    };
  }
});

// server/http/runtimeHandlers.js
var fs = require("fs");
var https = require("https");
var { randomUUID } = require("crypto");
var path = require("path");
var packageJson = { version: "0.1.0" };
var {
  ALLOWED_HOSTS,
  ALLOWED_ORIGINS,
  DATA_FILE,
  FISH_AUDIO_API_KEY,
  FISH_AUDIO_REFERENCE_ID,
  FISH_AUDIO_TIMEOUT_MS,
  HOST,
  HTML_FILE,
  MAX_SESSIONS,
  OPENAI_MODEL,
  OPENAI_TIMEOUT_MS,
  PORT,
  ROOT_DIR,
  SESSION_TTL_MS,
  STT_PROVIDER,
  STT_MODEL,
  VOLC_APP_ID,
  VOLC_ACCESS_TOKEN,
  VOLC_SECRET_KEY,
  VOLC_ASR_CLUSTER,
  USE_MOCK_AI,
  VERCEL_HOST_SUFFIXES
} = require_config();
var { companionData } = require_data();
var { runTurn, inferDefaultMode } = require_orchestrator();
var { runDoubaoStream } = require_client2();
var { validateChatRequest, normalizeRuntimeResult, normalizeScenario } = require_schemas();
var { createSession, ensureSession, getSession, resetSession, updateSessionAfterTurn } = require_sessionStore();
var ttsCache = /* @__PURE__ */ new Map();
var MAX_TTS_CACHE_ENTRIES = 40;
async function handleHttpRequest(req, res) {
  return handleRequest(req, res, async () => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/api/health") return handleHealth(req, res);
    if (url.pathname === "/api/scenarios") return handleScenarios(req, res);
    if (url.pathname === "/api/session") return handleSession(req, res);
    if (url.pathname === "/api/chat") return handleChat(req, res);
    if (url.pathname === "/api/tts") return handleTts(req, res);
    if (url.pathname === "/api/stt") return handleStt(req, res);
    const memoryMatch = url.pathname.match(/^\/api\/session\/([^/]+)\/memory$/);
    if (memoryMatch) return handleSessionMemory(req, res, memoryMatch[1]);
    const resetMatch = url.pathname.match(/^\/api\/session\/([^/]+)\/reset$/);
    if (resetMatch) return handleSessionReset(req, res, resetMatch[1]);
    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(url.pathname, req.method, res);
      return;
    }
    sendJson(res, 404, { ok: false, error: "Not found." });
  });
}
async function handleApiRequest(req, res, routeHandler) {
  return handleRequest(req, res, routeHandler);
}
async function handleRequest(req, res, routeHandler) {
  try {
    if (!isAllowedHost(req)) {
      sendJson(res, 421, { ok: false, error: "Host not allowed." });
      return;
    }
    if (!setCors(req, res)) return;
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    await routeHandler();
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      ok: false,
      error: error.message || "Internal server error."
    });
  }
}
async function handleHealth(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  sendJson(res, 200, buildHealthPayload());
}
async function handleScenarios(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  sendJson(res, 200, {
    companions: companionData.companions || {},
    adaptive_modes: companionData.adaptive_modes || []
  });
}
async function handleSession(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const body = await readJson(req);
  const scenario = normalizeScenario(body?.scenario);
  const session = createSession({
    scenario,
    companion: body?.companion || companionData.companions?.[scenario],
    tone: body?.tone,
    use_case: body?.use_case
  });
  sendJson(res, 200, {
    session_id: session.id,
    scenario: session.scenario,
    companion: session.companion,
    memory: session.memory,
    created_at: session.created_at
  });
}
async function handleChat(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const body = await readJson(req);
  const wantsStream = String(req.headers.accept || "").includes("text/event-stream");
  if (!wantsStream) {
    const result = await runTurn(body);
    console.log(
      "[api/chat]",
      JSON.stringify({
        openai_configured: Boolean(process.env.OPENAI_API_KEY),
        mock_forced: USE_MOCK_AI,
        runtime_source: result?.runtime_source || (result?.fallback_used ? "mock" : "openai"),
        intent: result?.intent,
        mode: result?.mode,
        model: OPENAI_MODEL
      })
    );
    sendJson(res, 200, result);
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  const emit = (event, data) => res.write(`event: ${event}
data: ${JSON.stringify(data)}

`);
  try {
    let runtimeResult;
    if (!USE_MOCK_AI) {
      const parsed = validateChatRequest(body);
      if (!parsed.ok) {
        emit("error", { error: parsed.error });
        res.end();
        return;
      }
      const input = parsed.value;
      const session = ensureSession(input);
      try {
        const raw = await runDoubaoStream({ input, session }, (sentence) => {
          emit("reply_chunk", { text: sentence });
        });
        runtimeResult = normalizeRuntimeResult(raw, {
          session_id: session.id,
          message: input.message,
          defaultMode: inferDefaultMode(input),
          fallback_used: false
        });
        runtimeResult.runtime_source = "doubao";
        const updated = updateSessionAfterTurn(session, input, runtimeResult);
        runtimeResult.memory = updated.memory;
      } catch (streamErr) {
        console.error("[handleChat] stream failed, falling back to runTurn:", streamErr?.message);
        runtimeResult = await runTurn(body);
        splitSentences(runtimeResult.reply || runtimeResult.answer || "").forEach((s) => emit("reply_chunk", { text: s }));
      }
    } else {
      runtimeResult = await runTurn(body);
      splitSentences(runtimeResult.reply || runtimeResult.answer || "").forEach((s) => emit("reply_chunk", { text: s }));
    }
    console.log("[api/chat] source=%s intent=%s", runtimeResult?.runtime_source, runtimeResult?.intent);
    emit("result", runtimeResult);
  } catch (err) {
    emit("error", { error: err.message || "Internal error" });
  }
  res.end();
}
function splitSentences(text) {
  return text.split(/(?<=[.!?。！？])\s+|(?<=[。！？])/).map((s) => s.trim()).filter((s) => s.length > 4);
}
async function handleTts(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const body = await readJson(req);
  await proxyFishAudioTts(body, res);
}
async function handleStt(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const body = await readJson(req);
  const audio = String(body?.audio || "").trim();
  const mimeType = String(body?.mimeType || "audio/webm").trim();
  const language = String(body?.lang || "").trim();
  if (!audio) {
    sendJson(res, 400, { ok: false, error: "audio is required." });
    return;
  }
  const audioBuffer = Buffer.from(audio, "base64");
  if (!audioBuffer.length) {
    sendJson(res, 400, { ok: false, error: "audio must be a valid base64 string." });
    return;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(OPENAI_TIMEOUT_MS, 25e3));
  try {
    const volcanoConfigured = Boolean(VOLC_APP_ID && VOLC_ACCESS_TOKEN);
    if (STT_PROVIDER === "openai" || !volcanoConfigured) {
      await sttOpenAI(res, audioBuffer, mimeType, language, controller);
    } else {
      await sttVolcano(res, audio, mimeType, controller);
    }
  } catch (error) {
    const isTimeout = error?.name === "AbortError";
    sendJson(res, isTimeout ? 504 : 502, {
      ok: false,
      error: isTimeout ? "STT timed out." : "STT request failed.",
      provider: STT_PROVIDER,
      error_name: error?.name,
      error_message: error?.message
    });
  } finally {
    clearTimeout(timeout);
  }
}
async function sttOpenAI(res, audioBuffer, mimeType, language, controller) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 503, { ok: false, error: "OpenAI STT is not configured." });
    return;
  }
  const baseMimeType = mimeType.split(";")[0].trim() || "audio/webm";
  const extension = getAudioExtension(baseMimeType);
  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer], { type: baseMimeType }), `audio.${extension}`);
  formData.append("model", STT_MODEL);
  if (language) formData.append("language", language.split("-")[0]);
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: formData
  });
  if (!response.ok) {
    const providerBody = await response.text();
    sendJson(res, 502, {
      ok: false,
      error: `OpenAI STT request failed (${response.status}).`,
      provider: "openai",
      model: STT_MODEL,
      provider_status: response.status,
      provider_body: providerBody.slice(0, 200)
    });
    return;
  }
  const data = await response.json();
  sendJson(res, 200, {
    text: String(data?.text || ""),
    provider: "openai",
    model: STT_MODEL
  });
}
async function sttVolcano(res, audio, mimeType, controller) {
  if (!VOLC_APP_ID || !VOLC_ACCESS_TOKEN) {
    sendJson(res, 503, { error: "VOLC_APP_ID and VOLC_ACCESS_TOKEN are required for Volcano STT." });
    return;
  }
  const baseMime = mimeType.split(";")[0].trim();
  const format = baseMime.includes("mp4") ? "mp4" : baseMime.includes("ogg") ? "ogg" : "webm";
  const codec = mimeType.includes("opus") ? "opus" : "default";
  const payload = {
    app: { appid: VOLC_APP_ID, token: VOLC_ACCESS_TOKEN, cluster: VOLC_ASR_CLUSTER },
    user: { uid: "companion_stt" },
    request: {
      reqid: randomUUID(),
      nbest: 1,
      workflow: "audio_in,resample,partition,vad,fe,decode,itn,nlu_punctuation",
      show_utterances: false,
      result_type: "full",
      sequence: -1
    },
    audio: { format, codec, sample_rate: 16e3, bits: 16, channel: 1, language: "zh-CN", audio_data: audio }
  };
  const bodyStr = JSON.stringify(payload);
  const data = await new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "openspeech.bytedance.com",
        path: "/api/v1/asr",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
          // Bearer;{token} is the correct format for Volcano Engine one-shot ASR
          Authorization: `Bearer;${VOLC_ACCESS_TOKEN}`
        }
      },
      (r) => {
        let raw = "";
        r.on("data", (chunk) => {
          raw += chunk;
        });
        r.on("end", () => {
          try {
            resolve({ status: r.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: r.statusCode, body: { message: raw } });
          }
        });
      }
    );
    req.on("error", reject);
    if (controller?.signal) {
      controller.signal.addEventListener("abort", () => req.destroy(new Error("aborted")));
    }
    req.write(bodyStr);
    req.end();
  });
  if (data.status !== 200) {
    sendJson(res, 502, {
      error: `STT provider error (${data.status}).`,
      provider: "volcano",
      provider_status: data.status,
      provider_body: JSON.stringify(data.body).slice(0, 200)
    });
    return;
  }
  if (data.body.code !== 1e3) {
    sendJson(res, 502, {
      error: `Volcano STT error: ${data.body.message || "unknown"}`,
      provider: "volcano",
      provider_code: data.body.code
    });
    return;
  }
  const text = (data.body.utterances || []).map((u) => u.text).join("").trim();
  sendJson(res, 200, { text, provider: "volcano", cluster: VOLC_ASR_CLUSTER });
}
async function handleSessionMemory(req, res, id) {
  if (!allowMethods(req, res, ["GET"])) return;
  const session = getSession(id);
  if (!session) {
    sendJson(res, 404, { ok: false, error: "Session not found." });
    return;
  }
  sendJson(res, 200, { session_id: session.id, memory: session.memory });
}
async function handleSessionReset(req, res, id) {
  if (!allowMethods(req, res, ["POST"])) return;
  sendJson(res, 200, { ok: resetSession(id) });
}
function buildHealthPayload() {
  return {
    ok: true,
    service: "yorimi-runtime",
    version: packageJson.version,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    host: HOST,
    allowed_hosts: ALLOWED_HOSTS,
    openai_configured: Boolean(process.env.OPENAI_API_KEY),
    stt_provider: STT_PROVIDER,
    stt_volcano_configured: Boolean(VOLC_APP_ID && VOLC_ACCESS_TOKEN),
    stt_model: STT_MODEL,
    fish_audio_configured: Boolean(FISH_AUDIO_API_KEY && FISH_AUDIO_REFERENCE_ID),
    mock_forced: USE_MOCK_AI,
    model: OPENAI_MODEL,
    max_sessions: MAX_SESSIONS,
    session_ttl_ms: SESSION_TTL_MS
  };
}
function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  sendJson(res, 405, { ok: false, error: "Method not allowed." });
  return false;
}
function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    sendJson(res, 403, { ok: false, error: `Origin not allowed: ${origin}` });
    return false;
  }
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return true;
}
function isAllowedHost(req) {
  const host = normalizeHost(req.headers.host || "");
  if (!host) return false;
  if (ALLOWED_HOSTS.includes(host)) return true;
  return VERCEL_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}
function normalizeHost(hostHeader) {
  const host = String(hostHeader).trim().toLowerCase();
  if (!host) return "";
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return end === -1 ? host : host.slice(1, end);
  }
  return host.split(":")[0];
}
function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Expires: "0"
  });
  res.end(JSON.stringify(payload, null, 2));
}
function getAudioExtension(mimeType) {
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("webm")) return "webm";
  return "bin";
}
async function proxyFishAudioTts(body, res) {
  const text = String(body?.text || "").trim();
  if (!text) {
    sendJson(res, 400, { ok: false, error: "text is required." });
    return;
  }
  if (!FISH_AUDIO_API_KEY || !FISH_AUDIO_REFERENCE_ID) {
    sendJson(res, 503, { ok: false, error: "Fish Audio TTS is not configured." });
    return;
  }
  const cacheKey = text;
  const cached = ttsCache.get(cacheKey);
  if (cached) {
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=300",
      "Content-Length": cached.length,
      "X-TTS-Cache": "HIT"
    });
    res.end(cached);
    return;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FISH_AUDIO_TIMEOUT_MS);
  try {
    const fishResponse = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${FISH_AUDIO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        reference_id: FISH_AUDIO_REFERENCE_ID,
        format: "mp3",
        latency: "normal"
      })
    });
    if (!fishResponse.ok) {
      const errorText = await fishResponse.text().catch(() => "");
      sendJson(res, fishResponse.status, {
        ok: false,
        error: "Fish Audio TTS request failed.",
        detail: errorText.slice(0, 300)
      });
      return;
    }
    const audioBuffer = Buffer.from(await fishResponse.arrayBuffer());
    ttsCache.set(cacheKey, audioBuffer);
    if (ttsCache.size > MAX_TTS_CACHE_ENTRIES) {
      ttsCache.delete(ttsCache.keys().next().value);
    }
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=300",
      "Content-Length": audioBuffer.length,
      "X-TTS-Cache": "MISS"
    });
    res.end(audioBuffer);
  } catch (error) {
    sendJson(res, error.name === "AbortError" ? 504 : 502, {
      ok: false,
      error: error.name === "AbortError" ? "Fish Audio TTS timed out." : "Fish Audio TTS proxy failed."
    });
  } finally {
    clearTimeout(timeout);
  }
}
function readJson(req) {
  if (Object.prototype.hasOwnProperty.call(req, "body") && req.body !== void 0) {
    return readPreparedJson(req);
  }
  return new Promise((resolve, reject) => {
    const contentType2 = String(req.headers["content-type"] || "");
    if (!contentType2.toLowerCase().includes("application/json")) {
      reject(Object.assign(new Error("Content-Type must be application/json."), { statusCode: 415 }));
      return;
    }
    let raw = "";
    let size = 0;
    let tooLarge = false;
    req.on("data", (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > 1024 * 1024) {
        tooLarge = true;
        raw = "";
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      if (tooLarge) {
        reject(Object.assign(new Error("Request body too large."), { statusCode: 413 }));
        return;
      }
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error("Invalid JSON body."), { statusCode: 400 }));
      }
    });
    req.on("error", () => {
      if (tooLarge) reject(Object.assign(new Error("Request body too large."), { statusCode: 413 }));
      else reject(Object.assign(new Error("Request stream error."), { statusCode: 400 }));
    });
  });
}
function readPreparedJson(req) {
  const contentType2 = String(req.headers["content-type"] || "");
  if (contentType2 && !contentType2.toLowerCase().includes("application/json")) {
    throw Object.assign(new Error("Content-Type must be application/json."), { statusCode: 415 });
  }
  if (req.body === null || req.body === "") return {};
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > 1024 * 1024) {
      throw Object.assign(new Error("Request body too large."), { statusCode: 413 });
    }
    return parseJsonString(req.body.toString("utf8"));
  }
  if (typeof req.body === "string") {
    if (Buffer.byteLength(req.body) > 1024 * 1024) {
      throw Object.assign(new Error("Request body too large."), { statusCode: 413 });
    }
    return parseJsonString(req.body);
  }
  return req.body || {};
}
function parseJsonString(raw) {
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw Object.assign(new Error("Invalid JSON body."), { statusCode: 400 });
  }
}
function serveStatic(urlPath, method, res) {
  const isHead = method === "HEAD";
  if (urlPath === "/" || urlPath === "/nextstep-companion.html") {
    sendFile(res, HTML_FILE, "text/html; charset=utf-8", isHead);
    return;
  }
  if (urlPath === "/nextstep-companion-data.json") {
    sendFile(res, DATA_FILE, "application/json; charset=utf-8", isHead);
    return;
  }
  if (urlPath.startsWith("/assets/")) {
    serveSafeStatic(ROOT_DIR, "assets", urlPath, res, isHead);
    return;
  }
  if (!urlPath.startsWith("/models/")) {
    sendJson(res, 404, { ok: false, error: "Not found." });
    return;
  }
  serveSafeStatic(ROOT_DIR, "models", urlPath, res, isHead);
}
function serveSafeStatic(rootDir, publicPrefix, urlPath, res, isHead) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch {
    sendJson(res, 400, { ok: false, error: "Malformed path." });
    return;
  }
  const staticRoot = path.resolve(rootDir, publicPrefix);
  const staticPath = decodedPath.replace(new RegExp(`^/${publicPrefix}[\\\\/]`), "");
  const fullPath = path.resolve(staticRoot, staticPath);
  const relative = path.relative(staticRoot, fullPath);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    sendJson(res, 404, { ok: false, error: "Not found." });
    return;
  }
  sendFile(res, fullPath, contentType(fullPath), isHead);
}
function sendFile(res, filePath, type, headOnly = false) {
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Expires: "0"
  });
  if (headOnly) {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
}
function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".mp4" || ext === ".m4v") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}
module.exports = {
  buildHealthPayload,
  handleApiRequest,
  handleChat,
  handleHealth,
  handleHttpRequest,
  handleScenarios,
  handleSession,
  handleSessionMemory,
  handleSessionReset,
  handleStt,
  handleTts,
  sendJson
};
