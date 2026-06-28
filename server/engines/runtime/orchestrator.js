const { USE_MOCK_AI } = require("../../config");
const { companionData } = require("../../data");
const { detectIntent, extractConceptSubject, extractGoalSubject, runMockEngine } = require("../mock/mockEngine");
// const { runOpenAI } = require("../openai/client"); // overseas — disabled on this branch
const { runDoubao } = require("../doubao/client");
const { normalizeRuntimeResult, validateChatRequest } = require("../../schemas");
const { ensureSession, getSession, updateSessionAfterTurn } = require("../../store/sessionStore");

async function runTurn(body) {
  const parsed = validateChatRequest(body);
  if (!parsed.ok) {
    const error = new Error(parsed.error);
    error.statusCode = 400;
    throw error;
  }

  const input = hydrateCompanion(parsed.value);
  const session = ensureSession(input);
  let runtimeResult;
  let fallbackUsed = false;

  if (!USE_MOCK_AI) {
    try {
      const doubaoResult = await runDoubao({ input, session });
      runtimeResult = normalizeRuntimeResult(doubaoResult, {
        session_id: session.id,
        message: input.message,
        defaultMode: inferDefaultMode(input),
        fallback_used: false,
      });
      runtimeResult.runtime_source = "doubao";
      const repairContext = buildRepairContext(input, runtimeResult);
      if (repairContext) {
        const repairedResult = await runDoubao({ input, session, repairContext });
        runtimeResult = normalizeRuntimeResult(repairedResult, {
          session_id: session.id,
          message: input.message,
          defaultMode: inferDefaultMode(input),
          fallback_used: false,
        });
        runtimeResult.runtime_source = "doubao";
        runtimeResult.trace.push({
          step: "doubao_repair",
          status: "complete",
          summary: repairContext.reason,
        });
      }
      runtimeResult = applyRuntimeGuards(input, runtimeResult, session);
      runtimeResult = ensureVisibleTaskFormat(runtimeResult);
    } catch (error) {
      console.error("[doubao_adapter] failed, using mock fallback:", error?.message || error);
      fallbackUsed = true;
      runtimeResult = runMockEngine(input, companionData, session);
      runtimeResult.trace.unshift({
        step: "doubao_adapter",
        status: "fallback",
        summary: "Doubao adapter failed; deterministic fallback used.",
      });
    }
  } else {
    fallbackUsed = true;
    runtimeResult = runMockEngine(input, companionData, session);
  }

  runtimeResult = ensureVisibleTaskFormat(runtimeResult);

  runtimeResult.session_id = session.id;
  runtimeResult.fallback_used = fallbackUsed || runtimeResult.fallback_used;
  if (runtimeResult.fallback_used) runtimeResult.runtime_source = "mock";

  const updatedSession = updateSessionAfterTurn(session, input, runtimeResult);

  return {
    ...runtimeResult,
    memory: updatedSession.memory,
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
    ...(runtimeResult.micro_task || []),
    ...(runtimeResult.suggested_actions || []),
  ].join(" ").toLowerCase();
  const mentionsSubject = !subject || subjectMentions(text, subject);
  const repeatsPlan = repeatsActivePlan(text, session) || /choose one tiny slice|learn the simplest definition|worked example while looking|mark the first blocker|let'?s break .* into concrete steps/i.test(text);
  const tooThin = reply.split(/\s+/).filter(Boolean).length < 28;
  const valid = runtimeResult.intent === "vague_help" &&
    runtimeResult.mode === "Study Companion Mode" &&
    mentionsSubject &&
    !repeatsPlan &&
    !tooThin;

  if (valid) return runtimeResult;

  return {
    ...runtimeResult,
    intent: "vague_help",
    mode: "Study Companion Mode",
    companion_state: runtimeResult.companion_state === "focused" ? "thinking" : runtimeResult.companion_state,
    trace: [
      ...(runtimeResult.trace || []),
      {
        step: "vague_help_guard",
        status: "complete",
        summary: "Preserved OpenAI content and corrected vague-help metadata; mock tutoring is not used on the normal path.",
      },
    ],
  };
}

function ensureVisibleTaskFormat(runtimeResult) {
  const taskIntents = new Set(["plan_task", "decompose_task", "continue_context", "vague_help", "emotional_support"]);
  if (!taskIntents.has(runtimeResult.intent)) return runtimeResult;

  const tasks = Array.isArray(runtimeResult.micro_task_plan)
    ? runtimeResult.micro_task_plan.map((task) => String(task?.label || "").trim()).filter(Boolean)
    : [];
  if (tasks.length === 0) return runtimeResult;

  const reply = String(runtimeResult.reply || runtimeResult.answer || "").trim();
  const hasVisibleSteps = /\n\s*1\.|\b1\.\s|\bStep\s+1\b|First\s+\d+/i.test(reply);
  const hasEnoughDetail = reply.split(/\s+/).filter(Boolean).length >= 36;
  if (hasVisibleSteps && hasEnoughDetail) return runtimeResult;

  const intro = reply || "Let's make this concrete.";
  const visibleTasks = tasks.slice(0, 4).map((task, index) => `${index + 1}. ${task}`).join("\n");
  const heading = runtimeResult.intent === "emotional_support"
    ? "Gentle reset:"
    : runtimeResult.intent === "vague_help"
      ? "Guided first step:"
      : "First tiny sprint:";
  const nextReply = `${intro}\n\n${heading}\n${visibleTasks}`;

  return {
    ...runtimeResult,
    answer: runtimeResult.answer || nextReply,
    reply: nextReply,
    trace: [
      ...(runtimeResult.trace || []),
      {
        step: "visible_task_formatter",
        status: "complete",
        summary: "Added the structured micro-task plan to the visible chat reply.",
      },
    ],
  };
}

function applyIntentGuard(input, runtimeResult, session, expectedIntent) {
  const subject = extractGoalSubject(input.message) || extractConceptSubject(input.message);
  const text = [
    runtimeResult.intent,
    runtimeResult.answer,
    runtimeResult.reply,
    runtimeResult.goal_understanding,
    ...(runtimeResult.micro_task || []),
    ...(runtimeResult.suggested_actions || []),
  ].join(" ").toLowerCase();
  const mentionsSubject = !subject || subjectMentions(text, subject);

  const genericSprint = /make .* concrete first|start .* by opening the right material|what are we working on|tell me what|write the exact task/i.test(text);
  const validEmotional = expectedIntent !== "emotional_support" ||
    (runtimeResult.intent === "emotional_support" && runtimeResult.mode === "Encourage Mode" && !genericSprint);
  const validSteps = !["decompose_task", "continue_context"].includes(expectedIntent) ||
    (runtimeResult.intent === expectedIntent && !genericSprint && mentionsSubject);

  if (validEmotional && validSteps) return runtimeResult;

  return {
    ...runtimeResult,
    intent: expectedIntent,
    mode: modeForIntent(expectedIntent, runtimeResult.mode),
    trace: [
      ...(runtimeResult.trace || []),
      {
        step: "intent_guard",
        status: "complete",
        summary: `Corrected response metadata to ${expectedIntent}; preserved OpenAI answer instead of substituting mock output.`,
      },
    ],
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
    ...(runtimeResult.suggested_actions || []),
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
      ...(runtimeResult.trace || []),
      {
        step: "intent_guard",
        status: "complete",
        summary: `Corrected concept-teaching metadata for ${concept}; preserved OpenAI answer instead of substituting mock output.`,
      },
    ],
  };
}

function applyPlanningGuard(input, runtimeResult, session) {
  const subject = extractGoalSubject(input.message);
  if (!subject) return runtimeResult;

  const planText = [
    runtimeResult.reply,
    runtimeResult.goal_understanding,
    ...(runtimeResult.micro_task || []),
  ].join(" ").toLowerCase();
  const mentionsSubject = subjectMentions(planText, subject);
  const genericRestatement = /write (?:the )?exact task|tell me what|what are we working on|one thing you want/i.test(planText);
  const tersePlan = String(runtimeResult.reply || "").split(/\s+/).length < 24 &&
    !String(runtimeResult.reply || "").match(/1\.|step|first|then|next/i);

  if (mentionsSubject && !genericRestatement && !tersePlan) return runtimeResult;

  return {
    ...runtimeResult,
    intent: "plan_task",
    mode: "Study Sprint Mode",
    trace: [
      ...(runtimeResult.trace || []),
      {
        step: "planning_guard",
        status: "complete",
        summary: `Corrected planning metadata for ${subject}; preserved OpenAI answer instead of substituting mock output.`,
      },
    ],
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
    ...(runtimeResult.micro_task || []),
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
      "mark the first blocker",
    ],
    previous_reply: runtimeResult.reply,
    previous_micro_task_plan: runtimeResult.micro_task_plan,
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
    ...(Array.isArray(memory.recent_goals) ? memory.recent_goals : []),
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
  return repeatedTasks.length >= 2 || (lastReply && normalizedText.includes(lastReply.slice(0, 80)));
}

function hydrateCompanion(input) {
  const existingSession = getSession(input.session_id);
  const companion = input.companion || existingSession?.companion || companionData.companions?.[input.scenario] || companionData.companions?.study || {};
  return {
    ...input,
    tone: input.tone || existingSession?.tone || companion?.tone || "",
    use_case: input.use_case || existingSession?.use_case || companion?.use_case || "",
    companion,
  };
}

function inferDefaultMode(input) {
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

module.exports = {
  runTurn,
};
