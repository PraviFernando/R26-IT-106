const path = require('path');

function slugifyFilename(filename) {
  return filename
    .replace(/\.pdf$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildVectorId(sourceFile, chunkIndex) {
  return `${slugifyFilename(sourceFile)}__chunk${chunkIndex}`;
}

module.exports = {
  OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
  OLLAMA_LLM_MODEL: process.env.OLLAMA_LLM_MODEL || 'gemma3n:e2b',

  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || 'ppd-rag-kb',
  PINECONE_METRIC: 'cosine',
  PINECONE_CLOUD: process.env.PINECONE_CLOUD || 'aws',
  PINECONE_REGION: process.env.PINECONE_REGION || 'us-east-1',
  PINECONE_EMBEDDING_MODEL: process.env.PINECONE_EMBEDDING_MODEL || 'multilingual-e5-large',
  EMBEDDING_DIMENSION: 1024,

  // PDF corpus lives outside backend/, as a sibling of R26-IT-106/.
  KB_SOURCE_DIR: process.env.KB_SOURCE_DIR
    ? path.resolve(process.env.KB_SOURCE_DIR)
    : path.resolve(__dirname, '../../../Knowglagepdf'),

  CHUNKING: {
    CHUNK_SIZE_TOKENS: 400,
    CHUNK_OVERLAP_RATIO: 0.15,
    WORDS_PER_TOKEN_ESTIMATE: 0.75, // heuristic: 1 token ≈ 0.75 English words (no tokenizer dependency)
    MIN_CHUNK_CHARS: 40,            // drop near-empty trailing chunks
  },

  RETRIEVAL: {
    TOP_K: 5,                 // Pinecone query top-k, domain-filtered
    PER_SOURCE_DEDUP_CAP: 2,  // max chunks from any one source doc after dedupe
    FINAL_TOP_N: 3,           // chunks that actually reach the prompt
  },

  GUARDRAIL: {
    // Recalibrated 2026-08-26 against the live 998-vector corpus + multilingual-e5-large:
    // off-topic queries (including literal gibberish) scored 0.76-0.81, on-topic queries
    // (even loosely paraphrased) scored 0.85-0.90 — the original 0.50/0.35 values (set in
    // Phase 0, before any real corpus existed) accepted almost everything on score alone.
    ACCEPT_THRESHOLD: 0.83,   // score >= this: accept (observed on-topic floor: 0.848)
    HEDGE_THRESHOLD: 0.80,    // 0.80-0.83: accept-with-hedge; < 0.80 AND no lexicon match: reject (observed off-topic ceiling: 0.813, typical band 0.76-0.81)
  },

  DOMAIN_CATEGORIES: {
    MATERNAL_MENTAL_HEALTH: 'maternal_mental_health',
    NEWBORN_CARE: 'newborn_care',
    UNKNOWN: 'unknown',
  },

  RISK_LEVELS: { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' },
  DEFAULT_RISK_LEVEL: 'medium',

  INGESTION: {
    EMBED_BATCH_SIZE: 90,       // conservative vs. Pinecone's ~96-input/request guidance for hosted embed
    RATE_LIMIT_MAX_RETRIES: 5,  // large files can exceed the free tier's per-minute embed token cap
    RATE_LIMIT_BACKOFF_MS: 65000, // > 60s so a fresh per-minute window has definitely started
  },

  GENERATION: {
    CONTEXT_MAX_WORDS: 900,   // ~1200 tokens * 0.75 words/token, consistent with CHUNKING's heuristic
    HISTORY_MAX_TURNS: 3,     // "system rules + risk tone + 3 chunks + last ~3 turns"
    DISCLAIMER: {
      en: "I'm a support tool, not a substitute for professional medical care.",
      si: 'මම සහායක මෙවලමක් මිස වෘත්තීය වෛද්‍ය සත්කාරයට විකල්පයක් නොවෙමි.',
    },
  },

  slugifyFilename,
  buildVectorId,
};
