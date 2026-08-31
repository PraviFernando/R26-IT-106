const { normalizeText } = require('./textNormalize');
const greetingLexicon = require('./lexicons/greetingLexicon');

/**
 * detectGreeting(text) -> boolean
 * Unlike detectCrisis/detectRoutineRequest, this checks EXACT equality against the fully
 * normalized message, not substring containment — see greetingLexicon.js for why.
 */
function detectGreeting(text) {
  const cleanText = normalizeText(text);
  return greetingLexicon.includes(cleanText);
}

module.exports = { detectGreeting };
