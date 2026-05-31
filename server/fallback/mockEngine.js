const { normalizeRuntimeResult } = require("../schemas");

const LOW_KEYWORDS = [
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
  "do not want",
];

const ACTION_KEYWORDS = [
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
  "application",
];

const FOCUS_KEYWORDS = ["focus", "concentrate", "ready", "let's go", "continue", "deep work", "pomodoro"];
const FOLLOW_UP_KEYWORDS = ["help me", "why not", "what should i do", "next", "continue", "guide me", "show me"];
const TEACH_KEYWORDS = ["concept", "explain", "what is", "what are", "teach me", "define", "meaning of", "give concept"];
const STEP_KEYWORDS = ["concrete step", "concrete steps", "first step", "steps to", "step by step", "break down", "decompose", "plan for", "how do i start", "how to start", "show me how to"];

const TONE_OPENERS = {
  soft_supportive: "I am here with you.",
  short_direct: "Got it.",
  cute_playful: "Okay, tiny step time.",
  coach_like: "Good. We will turn this into action.",
  friend_like: "I got you.",
};

function runMockEngine(input, companionData, session = {}) {
  const scenario = input.scenario || "study";
  const responses = companionData.mock_responses || {};
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
    else if (
      hasActionableGoal(message) ||
      FOCUS_KEYWORDS.some((keyword) => message.includes(keyword)) ||
      (planContext.subject && FOLLOW_UP_KEYWORDS.some((keyword) => message.includes(keyword)))
    ) {
      raw = buildStepResponse(planContext, "plan_task");
    }
  }

  const result = normalizeRuntimeResult(
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
        { step: "memory_writer", status: "fallback", summary: raw?.memory_update || "Updated session memory." },
      ],
    },
    {
      fallback_used: true,
      message: input.message,
      defaultMode: raw?.mode,
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
  const subject =
    teachingSubject ||
    continuationSubject ||
    extractGoalSubject(message) ||
    extractSubjectFromHistory(input.history) ||
    extractSubjectFromMemory(session);
  const useCase = input.use_case || companion.use_case || "";
  const tone = input.tone || companion.tone || "";

  return {
    message,
    lower,
    subject,
    teachingSubject,
    continuationSubject,
    useCase,
    tone,
    companionName: companion.name || "your companion",
    companionType: companion.type || "companion",
    objectLabel: companion.default_object_label || companion.visual_identity?.label || inferObjectLabel(companion),
  };
}

function buildSupportResponse(context) {
  const subject = context.subject && context.subject !== "this task" ? context.subject : "today";
  const hasSubject = subject !== "today";
  const subjectLine = hasSubject
    ? ` We will keep ${subject} small enough to touch, not solve all at once.`
    : " We will choose one tiny next action only if you want it.";
  const answer = buildToneReply(
    context,
    `${TONE_OPENERS[context.tone] || TONE_OPENERS.soft_supportive} You sound tired, so we will not force a full session. First we lower the pressure, then choose one tiny next action.${subjectLine}`
  );
  const micro_task_plan = hasSubject
    ? [
        { label: "Take one breath and lower your shoulders", duration_minutes: 1, done: false },
        { label: `Open one ${subject} note, slide, practice page, or checklist`, duration_minutes: 2, done: false },
        { label: `Pick only the easiest visible part of ${subject}`, duration_minutes: 2, done: false },
        { label: `Tell me the first blocker in ${subject}`, duration_minutes: 2, done: false },
      ]
    : [
        { label: "Take one breath and put the task in front of you", duration_minutes: 1, done: false },
        { label: "Choose the smallest visible action, not the whole task", duration_minutes: 2, done: false },
        { label: "Tell me the task name when you are ready", duration_minutes: 1, done: false },
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
    check_in_message: hasSubject
      ? `After this reset, tell me whether ${subject} feels ready for one tiny step.`
      : "After three minutes, tell me if you want a tiny plan or just company.",
    check_in_options: ["Done", "Partly done", "I got stuck"],
    memory_update: hasSubject
      ? `User felt tired while thinking about ${subject}; support first, then one tiny subject-specific step.`
      : "User felt tired; respond with emotional support before planning.",
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
    `${TONE_OPENERS[context.tone] || TONE_OPENERS.soft_supportive} ${continuation ? `Let's continue with ${subject}.` : `Let's break ${subject} into concrete steps.`}\n\n${visibleSteps}`
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
    memory_update: `User is working on ${subject}; guide with concrete steps, examples, and check-ins.`,
  };
}

function buildVagueHelpResponse(context) {
  const subject = context.subject || "this task";
  if (!hasSubjectSpecificFallback(subject)) return buildEmergencyFallbackResponse(context, "vague_help");

  const teaching = buildFirstStepTeaching(subject);
  const opener = TONE_OPENERS[context.tone] || TONE_OPENERS.soft_supportive;
  const answer = buildToneReply(
    context,
    `${opener} Yes. Let's do the first step together for ${subject}, not repeat the plan.\n\n${teaching.explanation}\n\nTiny example: ${teaching.example}\n\nYour move: ${teaching.check_question}`
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
      { label: `Reply with the word, symbol, or step that feels unclear`, duration_minutes: 2, done: false },
    ],
    start_button_label: "Start 8-min Guided Help",
    check_in_message: `Tell me which part of ${subject} still feels unclear, and I will adjust the next step.`,
    check_in_options: ["Done", "Partly done", "I got stuck"],
    memory_update: `User asked for direct help with ${subject}; continue by teaching or demonstrating, not repeating the plan.`,
  };
}

function buildTeachingResponse(context) {
  const concept = context.teachingSubject || context.subject || "the concept";
  if (!hasSubjectSpecificFallback(concept)) return buildEmergencyFallbackResponse(context, "teach_concept");

  const teaching = buildTeaching(concept);
  const opener = TONE_OPENERS[context.tone] || TONE_OPENERS.soft_supportive;
  const answer = buildToneReply(
    context,
    `${opener} ${teaching.explanation}\n\nExample: ${teaching.example}\n\nTiny check: ${teaching.check_question}`
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
      { label: `Tell me which part of ${concept} is unclear`, duration_minutes: 2, done: false },
    ],
    start_button_label: "Start 7-min Concept Check",
    check_in_message: `After this, tell me whether ${concept} feels clearer or where it got confusing.`,
    check_in_options: ["Done", "Partly done", "I got stuck"],
    memory_update: `User asked for a concept explanation about ${concept}; teach with simple examples before planning.`,
  };
}

function buildTeaching(concept) {
  if (concept.toLowerCase().includes("algebra")) {
    return {
      concept: "algebra",
      explanation: "Algebra is math where letters or symbols stand for numbers we do not know yet. The goal is usually to find the value that makes a statement true.",
      example: "In x + 3 = 7, x is the unknown number. Since 4 + 3 = 7, x = 4.",
      check_question: "For x + 2 = 6, what is x?",
    };
  }

  return {
    concept,
    explanation: `${concept} is the idea you are trying to understand. Start by asking what it means, what problem it solves, and what a simple example looks like.`,
    example: `Take one small ${concept} example from your notes and label what each symbol or term means before solving it.`,
    check_question: `Can you write one sentence explaining what ${concept} is used for?`,
  };
}

function buildEmergencyFallbackResponse(context, intent) {
  const subject = context.subject || context.teachingSubject || "this task";
  const answer = [
    "I am having trouble reaching the AI engine right now, so I will not pretend to tutor this from a template.",
    `For ${subject}, write one thing you already know and one question that feels confusing. Then retry once the AI runtime is connected.`,
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
      { label: `Write one question about ${subject}`, duration_minutes: 2, done: false },
    ],
    start_button_label: "Start 4-min Fallback Reset",
    check_in_message: "If the AI runtime is back, ask again and I will generate a real subject-specific explanation.",
    check_in_options: ["Done", "Partly done", "I got stuck"],
    memory_update: `Fallback used for ${subject}; avoid pretending local templates are subject expertise.`,
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
    "exam",
  ].some((keyword) => lower.includes(keyword));
}

function buildFirstStepTeaching(subject) {
  const lower = String(subject || "").toLowerCase();
  if (lower.includes("algebra")) {
    return {
      concept: "algebra",
      explanation: "Algebra starts by using a letter as an unknown number, then using the equation to discover what that letter must be.",
      example: "If x + 3 = 7, the question is: what number plus 3 gives 7? The answer is x = 4.",
      check_question: "Try this one: x + 2 = 6. What should x be?",
    };
  }
  if (lower.includes("simultaneous equation")) {
    return {
      concept: "simultaneous equations",
      explanation: "A simultaneous-equation problem gives two equations that must be true at the same time. Your job is to find values that satisfy both.",
      example: "If x + y = 5 and x - y = 1, adding them gives 2x = 6, so x = 3. Then y = 2.",
      check_question: "Which method do you want to try first: substitution or elimination?",
    };
  }
  if (lower.includes("quantum")) {
    return {
      concept: "quantum mechanics",
      explanation: "A tiny starting point for quantum mechanics is probability: it often predicts the chance of an outcome instead of one fixed classical result.",
      example: "A wavefunction is like a probability description. It helps calculate where a particle may be found when measured.",
      check_question: "Which word should we unpack first: wavefunction, measurement, or probability?",
    };
  }
  if (lower.includes("essay") || lower.includes("report")) {
    return {
      concept: subject,
      explanation: "The first useful move is to turn the task into one claim and three supporting points before writing full paragraphs.",
      example: "Claim: this report should explain the main problem, why it matters, and what action follows.",
      check_question: "What is the one sentence version of what your piece needs to prove or explain?",
    };
  }
  if (lower.includes("internship") || lower.includes("application")) {
    return {
      concept: subject,
      explanation: "Start by matching one requirement from the listing to one piece of evidence from your experience.",
      example: "If the listing says 'data analysis', find one class project, internship, or personal project where you analyzed data.",
      check_question: "What is one requirement from the listing?",
    };
  }
  return {
    concept: subject,
    explanation: `For ${subject}, the first useful step is to define what you are trying to do in one sentence, then work through one tiny example or visible action.`,
    example: `Write: "Right now, ${subject} means I need to complete one small visible action." Then name that action.`,
    check_question: `What is the smallest visible part of ${subject} we can do together right now?`,
  };
}

function emptyTeaching() {
  return {
    concept: "",
    explanation: "",
    example: "",
    check_question: "",
  };
}

function buildStudyResponse(context, mode) {
  const subject = context.subject || "this task";
  const subjectText = subject === "this task" ? "your task" : subject;
  const lowEnergy = mode === "Encourage Mode";
  const opener = TONE_OPENERS[context.tone] || TONE_OPENERS.soft_supportive;
  const objectLine = context.objectLabel ? ` ${context.companionName} can act as your ${context.objectLabel} anchor while you begin.` : "";
  const micro_task_plan = buildGeneralStudyPlan(subjectText, lowEnergy);

  return {
    reply: buildToneReply(context, `${opener} We will make ${subjectText} concrete first, then do one short focused pass.${objectLine}`),
    detected_state: lowEnergy ? "Specific goal + low energy" : "Specific study goal",
    companion_state: lowEnergy ? "encouraging" : "focused",
    mode,
    goal_understanding: `You want to study ${subjectText}. The next move is to narrow it to one concept, one example, and one visible blocker.`,
    micro_task_plan,
    start_button_label: lowEnergy ? "Start 10-min Study Sprint" : "Start 15-min Study Sprint",
    check_in_message: `After the sprint, tell me whether you found the first blocker in ${subjectText}.`,
    check_in_options: ["Done", "Partly done", "I got stuck"],
    memory_update: `User is working on ${subjectText} and benefits from subject-first micro-planning with concrete materials.`,
  };
}

function buildCheckInResponse(context) {
  const subject = context.subject || "the current task";
  const stuck = String(context.message).toLowerCase().includes("stuck");
  const partly = String(context.message).toLowerCase().includes("partly");
  const done = !stuck && !partly;
  const firstTask = stuck
    ? `Circle the exact line, formula, or sentence in ${subject} where you got stuck`
    : partly
      ? `Keep only the part of ${subject} that is already open in front of you`
      : `Choose one slightly harder ${subject} example or question`;

  const answer = done
      ? `Nice. Keep the momentum small: do one slightly harder pass on ${subject}, then stop before it gets messy.`
      : `That is useful feedback. We will reduce the scope of ${subject} and find the blocker instead of pushing blindly.`;

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
      { label: `Use notes, textbook, or a worked example to answer only that question`, duration_minutes: 8, done: false },
    ],
    start_button_label: "Start 10-min Adjusted Sprint",
    check_in_message: "Come back with the blocker, not a perfect answer.",
    check_in_options: ["Done", "Partly done", "I got stuck"],
    memory_update: `User checked in on ${subject}; next support should adapt scope before adding more work.`,
  };
}

function buildGeneralStudyPlan(subject, lowEnergy) {
  const firstDuration = lowEnergy ? 2 : 3;
  const secondDuration = lowEnergy ? 4 : 5;
  const thirdDuration = lowEnergy ? 6 : 8;
  return [
    {
      label: `Open your ${subject} notes, slide, textbook section, or assignment page`,
      duration_minutes: firstDuration,
      done: false,
    },
    {
      label: `Write the one ${subject} concept, formula, definition, or question you need first`,
      duration_minutes: secondDuration,
      done: false,
    },
    {
      label: `Work through one small ${subject} example and mark the first confusing step`,
      duration_minutes: thirdDuration,
      done: false,
    },
    {
      label: `Save one blocker or next question for the follow-up check-in`,
      duration_minutes: 2,
      done: false,
    },
  ];
}

function buildConcreteStepPlan(subject) {
  const lower = String(subject || "").toLowerCase();
  if (lower.includes("simultaneous equation")) {
    return [
      { label: "Open a worked example with two equations and two unknowns", duration_minutes: 2, done: false },
      { label: "Choose substitution or elimination and write why it fits this pair", duration_minutes: 3, done: false },
      { label: "Solve one line at a time and keep both equations visible", duration_minutes: 6, done: false },
      { label: "Substitute the answer back into both equations to check it", duration_minutes: 3, done: false },
    ];
  }
  if (lower.includes("algebra")) {
    return [
      { label: "Open the algebra section on variables, equations, or expressions", duration_minutes: 2, done: false },
      { label: "Write one tiny equation and mark the unknown", duration_minutes: 3, done: false },
      { label: "Solve one step at a time while keeping the equation balanced", duration_minutes: 5, done: false },
      { label: "Try one similar algebra question and mark the first blocker", duration_minutes: 5, done: false },
    ];
  }
  if (lower.includes("quantum")) {
    return [
      { label: "Open your quantum mechanics notes, textbook section, or lecture slide", duration_minutes: 2, done: false },
      { label: "Pick one starter idea: wavefunction, measurement, uncertainty, or operators", duration_minutes: 3, done: false },
      { label: "Read one worked example and label every symbol you recognize", duration_minutes: 6, done: false },
      { label: "Write the first confusing symbol, assumption, or equation as your blocker", duration_minutes: 3, done: false },
    ];
  }
  if (lower.includes("quiz") || lower.includes("exam")) {
    return [
      { label: `Open the ${subject} notes, formula sheet, or review list`, duration_minutes: 2, done: false },
      { label: "Circle three topics most likely to appear", duration_minutes: 4, done: false },
      { label: "Try two practice questions without checking the answer first", duration_minutes: 8, done: false },
      { label: "Mark one weak spot for the next sprint", duration_minutes: 2, done: false },
    ];
  }
  if (lower.includes("essay") || lower.includes("report")) {
    return [
      { label: `Open the ${subject} prompt, rubric, or brief`, duration_minutes: 2, done: false },
      { label: "Write one sentence saying what the piece must prove or explain", duration_minutes: 4, done: false },
      { label: "Create a three-bullet outline before drafting", duration_minutes: 5, done: false },
      { label: "Draft the first 100 rough words without editing", duration_minutes: 8, done: false },
    ];
  }
  if (lower.includes("room") || lower.includes("clean")) {
    return [
      { label: "Choose one visible zone, not the whole room", duration_minutes: 1, done: false },
      { label: "Remove only trash or dishes from that zone", duration_minutes: 4, done: false },
      { label: "Put loose items into one temporary pile", duration_minutes: 5, done: false },
      { label: "Stop and decide the next zone after the timer", duration_minutes: 1, done: false },
    ];
  }
  if (lower.includes("internship") || lower.includes("application")) {
    return [
      { label: "Open one target internship listing or application page", duration_minutes: 3, done: false },
      { label: "Highlight the top three required skills or keywords", duration_minutes: 5, done: false },
      { label: "Update one resume bullet to match the listing", duration_minutes: 8, done: false },
      { label: "Write the next blocker: resume, cover letter, portfolio, or submit", duration_minutes: 2, done: false },
    ];
  }
  return [
    {
      label: `Write one thing you already know about ${subject}`,
      duration_minutes: 2,
      done: false,
    },
    {
      label: `Write one question that feels confusing about ${subject}`,
      duration_minutes: 2,
      done: false,
    },
    {
      label: "Retry the AI response when the runtime is connected",
      duration_minutes: 1,
      done: false,
    },
  ];
}

function buildToneReply(context, base) {
  if (context.tone === "short_direct") {
    return base.replace("I am here with you. ", "").replace(" We will ", " We’ll ");
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

module.exports = {
  runMockEngine,
};
