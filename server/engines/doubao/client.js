const https = require("https");
const { VOLC_ARK_API_KEY, VOLC_CHAT_MODEL, VOLC_CHAT_TIMEOUT_MS } = require("../../config");

async function runDoubao({ input, session, repairContext }) {
  if (!VOLC_ARK_API_KEY) {
    throw new Error("VOLC_ARK_API_KEY is not configured.");
  }

  const t0 = Date.now();
  const payload = buildRuntimePayload(input, session, repairContext);

  // doubao-1-5-pro-32k does not support multi-modal; send text-only payload.
  const requestBody = {
    model: VOLC_CHAT_MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: JSON.stringify(payload) },
    ],
  };

  console.log("[doubao] sending request model=%s timeout=%dms", VOLC_CHAT_MODEL, VOLC_CHAT_TIMEOUT_MS);
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(requestBody);
    const req = https.request(
      {
        hostname: "ark.cn-beijing.volces.com",
        path: "/api/v3/chat/completions",
        method: "POST",
        timeout: VOLC_CHAT_TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${VOLC_ARK_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        console.log("[doubao] status=%d elapsed=%dms", res.statusCode, Date.now() - t0);
        let raw = "";
        res.on("data", (chunk) => { raw += chunk; });
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
    req.on("timeout", () => { req.destroy(new Error("Doubao request timed out.")); });
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
    "You are NextStep Companion runtime engine. Output ONLY a JSON object — no markdown, no extra text.",
    "Fields: intent, mode, detected_state, companion_state, reply, answer, goal_understanding, micro_task_plan (array of {label,duration_minutes,done}), start_button_label, check_in_message, check_in_options, suggested_actions, teaching ({concept,explanation,example,check_question}), memory_update, trace.",
    "Intents: teach_concept|decompose_task|plan_task|continue_context|vague_help|emotional_support|quiz|routine|check_in|general_chat",
    "Modes: Encourage Mode|Study Companion Mode|Study Sprint Mode|Quiz Mode|Focus Mode|Routine Check-in Mode|Companion Presence Mode|Check-in Mode",
    "reply: 2-4 sentences. Always name the specific subject from the message. NEVER say 'open the relevant materials' or 'work on the first small step'.",
    "micro_task_plan labels: specific subtopics (e.g. 'Review eigenvalue definition', 'Solve 3 row-reduction problems'). Never generic.",
    "teach_concept: explain+tiny example+check question. plan_task/decompose_task: numbered steps for THAT subject.",
    "emotional_support: validate feeling first, then one tiny optional action. check_in Done: celebrate + harder next step.",
    "If repair_context present: fix repair_context.reason, avoid repair_context.banned_phrases.",
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
    repair_context: repairContext || null,
  };
}

function buildRecentHistory(input, session) {
  const serverHistory = Array.isArray(session.history) ? session.history.slice(-6) : [];
  const clientHistory = Array.isArray(input.history) ? input.history.slice(-6) : [];
  return [...serverHistory, ...clientHistory].slice(-8);
}

// ── Streaming variant ──────────────────────────────────────────────────────
// Calls Doubao with stream:true, extracts `reply` sentences incrementally,
// calls onSentence(text) for each complete sentence, resolves with full JSON.
async function runDoubaoStream({ input, session, repairContext }, onSentence) {
  if (!VOLC_ARK_API_KEY) throw new Error("VOLC_ARK_API_KEY is not configured.");

  const t0 = Date.now();
  const runtimePayload = buildRuntimePayload(input, session, repairContext);

  // doubao-1-5-pro-32k does not support multi-modal; send text-only.
  const requestBody = {
    model: VOLC_CHAT_MODEL,
    stream: true,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: JSON.stringify(runtimePayload) },
    ],
  };

  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(requestBody);
    const extractState = { replyStart: -1, processedTo: 0 };
    let accumulated = "";

    const req = https.request(
      {
        hostname: "ark.cn-beijing.volces.com",
        path: "/api/v3/chat/completions",
        method: "POST",
        timeout: VOLC_CHAT_TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${VOLC_ARK_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          let errBody = "";
          res.on("data", (c) => { errBody += c; });
          res.on("end", () => reject(new Error(`Doubao stream error: ${res.statusCode} ${errBody.slice(0, 200)}`)));
          return;
        }
        let rawBuf = "";
        res.on("data", (chunk) => {
          rawBuf += chunk.toString();
          const lines = rawBuf.split("\n");
          rawBuf = lines.pop(); // keep incomplete line

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
            } catch { /* skip malformed SSE line */ }
          }
        });

        res.on("end", () => {
          try {
            // accumulated = the model's full content string (built from delta pieces)
            console.log("[doubao-stream] done elapsed=%dms", Date.now() - t0);
            resolve(JSON.parse(accumulated));
          } catch (e) {
            reject(new Error(`Doubao stream parse error: ${e.message}. raw: ${accumulated.slice(0, 200)}`));
          }
        });
      },
    );
    req.on("timeout", () => req.destroy(new Error("Doubao stream timed out.")));
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

// Extract newly complete sentences from the `reply` field as it streams in.
function extractReplyChunks(accumulated, state) {
  const sentences = [];

  if (state.replyStart === -1) {
    const m = accumulated.match(/"reply"\s*:\s*"/);
    if (!m) return sentences;
    state.replyStart = m.index + m[0].length;
  }

  // Decode the JSON string value character by character
  const raw = accumulated.slice(state.replyStart);
  let content = "";
  let i = 0;
  while (i < raw.length) {
    const c = raw[i];
    if (c === '"' && (i === 0 || raw[i - 1] !== "\\")) break; // closing quote
    if (c === "\\" && i + 1 < raw.length) {
      const esc = { n: "\n", '"': '"', "\\": "\\", t: "\t", r: "\r" }[raw[i + 1]] ?? raw[i + 1];
      content += esc;
      i += 2;
    } else {
      content += c;
      i++;
    }
  }

  // Find new complete sentences since last time
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

module.exports = { runDoubao, runDoubaoStream };
