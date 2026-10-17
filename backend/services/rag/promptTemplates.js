const { RISK_LEVELS } = require('../../config/ragConfig');

// Per PP1 §2.2's tone spec: informational/motivational for low risk, structured guidance
// for medium, supportive and gentle for high. This is the user's ongoing EPDS-based risk
// level (riskLevelService.js) — a different signal from the per-message isCrisis flag,
// which is handled entirely separately via CRISIS_RESPONSE below (no LLM call at all).
const RISK_TONE_PROMPTS = {
  [RISK_LEVELS.LOW]:
    'You are a warm, encouraging support assistant for mothers dealing with postpartum ' +
    'depression and newborn care. Answer informatively and with light encouragement. Keep ' +
    'the tone upbeat and confident.',
  [RISK_LEVELS.MEDIUM]:
    'You are a supportive assistant for mothers dealing with postpartum depression and ' +
    'newborn care. This user may be experiencing some difficulty. Answer with clear, ' +
    'structured, step-by-step guidance, and gently note when professional support could help.',
  [RISK_LEVELS.HIGH]:
    'You are a gentle, supportive assistant for mothers dealing with postpartum depression ' +
    'and newborn care. This user may be experiencing significant difficulty. Answer softly ' +
    'and with care, validate their feelings, avoid clinical or dismissive language, and ' +
    'encourage them to reach out to a healthcare provider or support person.',
};

const LANGUAGE_INSTRUCTIONS = {
  en: '',
  si:
    'Respond entirely in Sinhala (සිංහල script). Do not respond in English, even though the ' +
    'context below is in English.',
};

const GUARDRAIL_ZONE_INSTRUCTIONS = {
  accept:
    'Answer using the numbered context below. Cite sources inline like [1] where relevant. ' +
    'Do not use outside knowledge beyond what is in the context.',
  accept_with_hedge:
    'The context below may not precisely match this question. Answer cautiously, note that ' +
    'your information may be incomplete, and encourage the user to verify with the cited ' +
    'sources or a healthcare professional.',
};

// Sourced from frontend/services/knowledgeLibrary.js's kb_s1 entry (titleEn: "National Mental
// Health Helpline 1926", url: "tel:1926") — same helpline, ported into fixed response text
// rather than an LLM-generated one, since this path must never depend on model behavior.
const CRISIS_RESPONSE =
  "I'm really concerned about what you just shared, and I want you to know you don't have to go " +
  "through this alone. Please reach out to Sri Lanka's National Mental Health Helpline at 1926 — " +
  "it's free, confidential, and available 24 hours a day. If you're in immediate danger, please " +
  'contact emergency services right away.';

const REJECT_FALLBACKS = [
  "I don't have verified information on that. Would you like me to connect you to the 1926 " +
  'helpline, or ask about something I can help with — postpartum mental health or newborn care?',
  "I'm not confident I have good information to answer that accurately. I can help with " +
  'postpartum depression, EPDS scores, or newborn care questions if you\'d like to try one of those.',
];

function pickFallback() {
  return REJECT_FALLBACKS[0];
}

// Fixed, non-LLM-generated reply for plain greetings/small talk (see greetingDetector.js) —
// states what the bot can actually help with rather than a generic "how can I help."
const GREETING_RESPONSES = {
  en:
    "Hi! I'm really glad you reached out. I'm here to chat about postpartum mental health or " +
    'newborn care — ask me anything, or just tell me how you\'re doing today.',
  si:
    'ආයුබෝවන්! ඔබ මා අමතා ඇති නිසා සතුටුයි. දරු ප්‍රසූතියෙන් පසු මානසික සෞඛ්‍යය හෝ අලුත උපන් ' +
    'බිළිඳුන් රැකවරණය ගැන අපි කතා කරමු — ඕනෑම දෙයක් අසන්න, නැත්නම් ඔබ අද කොහොමද කියලා කියන්න.',
};

function pickGreeting(language) {
  return GREETING_RESPONSES[language] || GREETING_RESPONSES.en;
}

module.exports = {
  RISK_TONE_PROMPTS,
  GUARDRAIL_ZONE_INSTRUCTIONS,
  LANGUAGE_INSTRUCTIONS,
  CRISIS_RESPONSE,
  REJECT_FALLBACKS,
  pickFallback,
  GREETING_RESPONSES,
  pickGreeting,
};
