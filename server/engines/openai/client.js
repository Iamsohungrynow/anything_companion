const { OPENAI_MODEL, OPENAI_SEARCH_MODEL, OPENAI_TIMEOUT_MS } = require("../../config");
const { runtimeResponseJsonSchema } = require("../../schemas");

async function runOpenAI({ input, session, repairContext }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  const allowWebSearch = shouldAllowWebSearch(input);
  const requestBody = {
    model: allowWebSearch ? OPENAI_SEARCH_MODEL : OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: buildSystemPrompt(),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify(buildRuntimePayload(input, session, allowWebSearch, repairContext)),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "nextstep_runtime_response",
        schema: runtimeResponseJsonSchema,
        strict: true,
      },
    },
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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
    "You are the runtime engine for NextStep Companion, an adaptive study and companion chatbot.",
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
    "If repair_context is present, the previous response was rejected for being too generic. Generate a new subject-specific response that directly fixes repair_context.reason and avoids repair_context.banned_phrases.",
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
    repair_context: repairContext || null,
  };
}

function inferInputIntent(input) {
  const message = String(input.message || "").toLowerCase();
  if (input.check_in_result) return "check_in";
  if (message.match(/^\s*(and|also|then|next)\s+[\w\s-]{2,80}$/)) return "continue_context";
  if (message.match(/\b(concept|explain|what is|what are|teach me|define|meaning of|give concept)\b/)) return "teach_concept";
  if (message.match(/\b(concrete step|concrete steps|first step|steps to|step by step|break down|decompose|plan for|how do i start|how to start|show me how to)\b/)) return "decompose_task";
  if (message.match(/\b(quiz me|test me|question me)\b/)) return "quiz";
  if (message.match(/\b(help me|i need help|why not|what should i do|guide me|show me|continue)\b/) &&
      !message.match(/\b(study|learn|review|prepare|practice|write|finish|apply|clean|quiz|exam|essay|homework|internship|start|work on)\b/)) {
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
  return (
    /\b(latest|current|recent|news|source|sources|resources|website|search|look up|find online)\b/.test(message) ||
    /\b(syllabus|curriculum|deadline|price|schedule|event|documentation|docs|api changes)\b/.test(message) ||
    /\b(2025|2026)\b/.test(message)
  );
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

module.exports = {
  runOpenAI,
};
