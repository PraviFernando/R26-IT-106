const { GENERATION } = require('../../config/ragConfig');
const retrievalService = require('./retrievalService');
const ollamaClient = require('./ollamaClient');
const { buildContext } = require('./contextBuilder');
const {
  RISK_TONE_PROMPTS,
  GUARDRAIL_ZONE_INSTRUCTIONS,
  LANGUAGE_INSTRUCTIONS,
  CRISIS_RESPONSE,
  pickFallback,
  pickGreeting,
} = require('./promptTemplates');
const { detectRoutineRequest } = require('./routineRequestDetector');
const { selectRoutineItems } = require('./routineCatalog');

function withDisclaimer(reply, language) {
  const disclaimer = GENERATION.DISCLAIMER[language] || GENERATION.DISCLAIMER.en;
  return { ...reply, answer: `${reply.answer}\n\n${disclaimer}` };
}

function formatHistory(history) {
  const recent = history.slice(-GENERATION.HISTORY_MAX_TURNS);
  return recent.map((turn) => `${turn.role}: ${turn.content}`).join('\n');
}

function assemblePrompt({ riskLevel, guardrailZone, context, history, query, language }) {
  const parts = [
    RISK_TONE_PROMPTS[riskLevel] || RISK_TONE_PROMPTS.medium,
    GUARDRAIL_ZONE_INSTRUCTIONS[guardrailZone],
    LANGUAGE_INSTRUCTIONS[language],
    `Context:\n${context}`,
  ].filter(Boolean);

  const historyText = formatHistory(history);
  if (historyText) parts.push(`Recent conversation:\n${historyText}`);

  parts.push(`User question: ${query}`);
  return parts.join('\n\n');
}

/**
 * generateReply({ query, riskLevel, history, language }) ->
 *   { answer, sources, category, guardrailZone, isCrisis, suggestedRoutineItems }
 * Turns Phase 2's retrievalService output into an actual chat reply. Crisis and reject
 * paths never call Ollama — only the accept/accept_with_hedge zones generate text.
 * suggestedRoutineItems is a deterministic catalog lookup (routineCatalog.js), never
 * LLM-generated — only populated when detectRoutineRequest() matches the query.
 */
async function generateReply({ query, riskLevel, history = [], language = 'en' }) {
  const retrieval = await retrievalService.retrieve(query);

  if (retrieval.isCrisis) {
    return withDisclaimer({
      answer: CRISIS_RESPONSE,
      sources: [],
      category: null,
      guardrailZone: null,
      isCrisis: true,
      suggestedRoutineItems: [],
    }, language);
  }

  if (retrieval.isGreeting) {
    // No disclaimer here on purpose — stapling "not a substitute for medical care" onto a
    // reply to "hi" is itself part of what reads as robotic, and there's no medical content
    // in this reply for it to caveat. The one-time disclaimer modal (Phase 7) already covers
    // the conversation as a whole.
    return {
      answer: pickGreeting(language),
      sources: [],
      category: null,
      guardrailZone: null,
      isCrisis: false,
      suggestedRoutineItems: [],
    };
  }

  if (retrieval.guardrailZone === 'reject') {
    return withDisclaimer({
      answer: pickFallback(),
      sources: [],
      category: retrieval.category,
      guardrailZone: 'reject',
      isCrisis: false,
      suggestedRoutineItems: [],
    }, language);
  }

  const context = buildContext(retrieval.chunks);
  const prompt = assemblePrompt({ riskLevel, guardrailZone: retrieval.guardrailZone, context, history, query, language });
  const answer = await ollamaClient.generateText(prompt);

  const suggestedRoutineItems = detectRoutineRequest(query) ? selectRoutineItems(retrieval.category) : [];

  return withDisclaimer({
    answer,
    sources: retrieval.chunks.map((c) => ({ title: c.title, section: c.page_range })),
    category: retrieval.category,
    guardrailZone: retrieval.guardrailZone,
    isCrisis: false,
    suggestedRoutineItems,
  }, language);
}

module.exports = { generateReply };
