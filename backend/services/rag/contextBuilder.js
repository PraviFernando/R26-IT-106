const { GENERATION } = require('../../config/ragConfig');

function countWords(text) {
  const m = (text || '').match(/\S+/g);
  return m ? m.length : 0;
}

function formatChunk(chunk, index) {
  return `[${index + 1}] (${chunk.title}, p.${chunk.page_range})\n${chunk.text}`;
}

/**
 * buildContext(chunks) -> templated string with inline [1] [2] [3] markers.
 * chunks is Phase 2's already-ranked, already-top-3 retrievalService output. Capped at
 * GENERATION.CONTEXT_MAX_WORDS total — if over budget, the 3rd (lowest-ranked) chunk is
 * truncated first, matching the original spec's truncation priority.
 */
function buildContext(chunks) {
  if (!chunks || chunks.length === 0) return '';

  const formatted = chunks.map(formatChunk);
  let totalWords = formatted.reduce((sum, block) => sum + countWords(block), 0);

  if (totalWords > GENERATION.CONTEXT_MAX_WORDS && formatted.length >= 3) {
    const lastIndex = formatted.length - 1;
    const overBudget = totalWords - GENERATION.CONTEXT_MAX_WORDS;
    const lastWords = formatted[lastIndex].split(/\s+/);
    const keepCount = Math.max(0, lastWords.length - overBudget);
    formatted[lastIndex] = lastWords.slice(0, keepCount).join(' ') + (keepCount < lastWords.length ? '...' : '');
  }

  return formatted.join('\n\n');
}

module.exports = { buildContext };
