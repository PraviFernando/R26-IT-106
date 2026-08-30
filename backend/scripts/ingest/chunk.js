function countWords(text) {
  const m = text.match(/\S+/g);
  return m ? m.length : 0;
}

// Splits on sentence-terminal punctuation, preserving char offsets into the source text.
function splitSentences(text) {
  const regex = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;
  const sentences = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const leadingWs = raw.length - raw.trimStart().length;
    const start = match.index + leadingWs;
    sentences.push({ text: trimmed, start, end: start + trimmed.length });
  }
  return sentences;
}

// Guards against a pathological "sentence" (e.g. a garbled table row with no punctuation)
// blowing past the target chunk size on its own — breaks it into word-bounded pieces.
function splitLongSentence(sentence, maxWords) {
  const words = [];
  const wordRegex = /\S+/g;
  let m;
  while ((m = wordRegex.exec(sentence.text)) !== null) {
    words.push({
      text: m[0],
      start: sentence.start + m.index,
      end: sentence.start + m.index + m[0].length,
    });
  }
  if (words.length <= maxWords) return [sentence];
  const pieces = [];
  for (let i = 0; i < words.length; i += maxWords) {
    const group = words.slice(i, i + maxWords);
    pieces.push({
      text: group.map((w) => w.text).join(' '),
      start: group[0].start,
      end: group[group.length - 1].end,
    });
  }
  return pieces;
}

/**
 * pages: Array<{ num, text }> (from parse.js)
 * chunkingConfig: ragConfig.js's CHUNKING block
 * returns: Array<{ text, pageStart, pageEnd }>
 */
function chunkPages(pages, chunkingConfig) {
  const { CHUNK_SIZE_TOKENS, CHUNK_OVERLAP_RATIO, WORDS_PER_TOKEN_ESTIMATE, MIN_CHUNK_CHARS } = chunkingConfig;
  const targetWords = Math.round(CHUNK_SIZE_TOKENS * WORDS_PER_TOKEN_ESTIMATE);
  const overlapWords = Math.round(targetWords * CHUNK_OVERLAP_RATIO);
  const maxSentenceWords = targetWords * 3;

  let fullText = '';
  const pageOffsets = []; // [{ num, start, end }]
  for (const page of pages) {
    if (!page.text) continue; // blank/cover pages contribute nothing
    const start = fullText.length;
    fullText += (fullText ? ' ' : '') + page.text;
    pageOffsets.push({ num: page.num, start, end: fullText.length });
  }
  if (!fullText) return [];

  const sentences = splitSentences(fullText).flatMap((s) => splitLongSentence(s, maxSentenceWords));

  function pageForOffset(offset) {
    for (const p of pageOffsets) {
      if (offset >= p.start && offset <= p.end) return p.num;
    }
    return pageOffsets[pageOffsets.length - 1].num;
  }

  const chunks = [];
  let current = [];
  let currentWords = 0;

  function flush() {
    if (!current.length) return;
    const text = current.map((s) => s.text).join(' ').trim();
    if (text.length >= MIN_CHUNK_CHARS) {
      chunks.push({
        text,
        pageStart: pageForOffset(current[0].start),
        pageEnd: pageForOffset(current[current.length - 1].end - 1),
      });
    }
  }

  for (const sentence of sentences) {
    const w = countWords(sentence.text);
    if (currentWords + w > targetWords && current.length > 0) {
      flush();
      // carry trailing ~overlapWords into the next chunk
      const carry = [];
      let carryWords = 0;
      for (let i = current.length - 1; i >= 0 && carryWords < overlapWords; i--) {
        carry.unshift(current[i]);
        carryWords += countWords(current[i].text);
      }
      current = carry;
      currentWords = carryWords;
    }
    current.push(sentence);
    currentWords += w;
  }
  flush();

  return chunks;
}

module.exports = { chunkPages, splitSentences, countWords };
