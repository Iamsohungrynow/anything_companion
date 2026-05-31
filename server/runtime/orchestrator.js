const { USE_MOCK_AI } = require("../config");
const { companionData } = require("../data");
const { detectIntent, extractConceptSubject, extractGoalSubject, runMockEngine } = require("../fallback/mockEngine");
const { runOpenAI } = require("../openai/client");
const { normalizeRuntimeResult, validateChatRequest } = require("../schemas");
const { ensureSession, getSession, updateSessionAfterTurn } = require("../store/sessionStore");

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
      const openAIResult = await runOpenAI({ input, session });
      runtimeResult = normalizeRuntimeResult(openAIResult, {
        session_id: session.id,
        message: input.message,
        fallback_used: false,
      });
    } catch (error) {
      fallbackUsed = true;
      runtimeResult = runMockEngine(input, companionData);
      runtimeResult.trace.unshift({
        step: "openai_adapter",
        status: "fallback",
        summary: "OpenAI adapter failed; deterministic fallback used.",
      });
    }
  } else {
    fallbackUsed = true;
    runtimeResult = runMockEngine(input, companionData);
  }

  runtimeResult.session_id = session.id;
  runtimeResult.fallback_used = fallbackUsed || runtimeResult.fallback_used;

  const updatedSession = updateSessionAfterTurn(session, input, runtimeResult);

  return {
    ...runtimeResult,
    memory: updatedSession.memory,
  };
}

function hydrateCompanion(input) {
  const companion = input.companion || companionData.companions?.[input.scenario] || companionData.companions?.study || {};
  return {
    ...input,
    companion,
  };
}

module.exports = {
  runTurn,
};
