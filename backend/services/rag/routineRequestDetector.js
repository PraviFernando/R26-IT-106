const { normalizeText } = require('./textNormalize');
const routineRequestLexicon = require('./lexicons/routineRequestLexicon');

// Structural mirror of crisisDetector.js — flat boolean, no scoring needed.
function detectRoutineRequest(text) {
    const cleanText = normalizeText(text);
    return routineRequestLexicon.some((kw) => cleanText.includes(kw.replace(/['’]/g, '')));
}

module.exports = { detectRoutineRequest };
