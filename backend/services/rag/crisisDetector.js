const { normalizeText } = require('./textNormalize');
const crisisLexicon = require('./lexicons/crisisLexicon');

/**
 * detectCrisis(text) -> boolean
 * Deliberately flat/binary, not graded like riskLevelService.js's low/medium/high — that
 * service sets response *tone* for normal replies; this is a hard safety gate meant to
 * short-circuit the RAG pipeline entirely.
 */
function detectCrisis(text) {
  const cleanText = normalizeText(text);
  return crisisLexicon.some((kw) => cleanText.includes(kw.replace(/['’]/g, '')));
}

module.exports = { detectCrisis };
