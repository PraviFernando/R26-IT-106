const { DOMAIN_CATEGORIES } = require('../../config/ragConfig');
const { normalizeText } = require('./textNormalize');
const newbornCareLexicon = require('./lexicons/newbornCareLexicon');
const maternalMentalHealthLexicon = require('./lexicons/maternalMentalHealthLexicon');

// Exact port of babyCareService.js's detectBabyTopics() scoring: phrase match = +3
// (substring), keyword match = +1 (word-boundary regex).
function scoreLexicon(cleanText, lexicon) {
  let score = 0;

  lexicon.phrases.forEach((phrase) => {
    const normPhrase = phrase.replace(/['’]/g, '');
    if (cleanText.indexOf(normPhrase) !== -1) score += 3;
  });

  lexicon.keywords.forEach((kw) => {
    const normKw = kw.replace(/['’]/g, '');
    const regex = new RegExp(`\\b${normKw}\\b`, 'i');
    if (regex.test(cleanText)) score += 1;
  });

  return score;
}

/**
 * classifyCategory(text) -> { category, score }
 * Scores text against both domain lexicons; the higher-scoring one wins. Both zero, or an
 * exact tie with both > 0 (ambiguous/mixed query), resolve to UNKNOWN so the caller's
 * Pinecone query stays unfiltered rather than guessing wrong.
 */
function classifyCategory(text) {
  const cleanText = normalizeText(text);

  const maternalScore = scoreLexicon(cleanText, maternalMentalHealthLexicon);
  const newbornScore = scoreLexicon(cleanText, newbornCareLexicon);

  if (maternalScore === 0 && newbornScore === 0) {
    return { category: DOMAIN_CATEGORIES.UNKNOWN, score: 0 };
  }
  if (maternalScore === newbornScore) {
    return { category: DOMAIN_CATEGORIES.UNKNOWN, score: maternalScore };
  }
  if (maternalScore > newbornScore) {
    return { category: DOMAIN_CATEGORIES.MATERNAL_MENTAL_HEALTH, score: maternalScore };
  }
  return { category: DOMAIN_CATEGORIES.NEWBORN_CARE, score: newbornScore };
}

module.exports = { classifyCategory };
