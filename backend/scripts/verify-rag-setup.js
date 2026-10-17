require('dotenv').config();

const { OLLAMA_LLM_MODEL, PINECONE_INDEX_NAME, PINECONE_METRIC, EMBEDDING_DIMENSION } = require('../config/ragConfig');
const ollamaClient = require('../services/rag/ollamaClient');
const pineconeClient = require('../services/rag/pineconeClient');

const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}${detail ? `: ${detail}` : ''}`);
}

async function checkEnvVars() {
  const required = ['PINECONE_API_KEY', 'OLLAMA_HOST'];
  const missing = required.filter((key) => !process.env[key]);
  record('env vars present', missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : `${required.join(', ')} set`);
  if (missing.length) throw new Error('Missing required env vars, aborting further checks.');
}

async function checkOllamaModel() {
  const models = await ollamaClient.listModels();
  const has = models.some((m) => m === OLLAMA_LLM_MODEL || m.startsWith(`${OLLAMA_LLM_MODEL}:`) || m.split(':')[0] === OLLAMA_LLM_MODEL.split(':')[0]);
  record(
    'ollama model present',
    has,
    has ? OLLAMA_LLM_MODEL : `not found — run: ollama pull ${OLLAMA_LLM_MODEL}`
  );
  if (!has) throw new Error(`Ollama model ${OLLAMA_LLM_MODEL} not pulled.`);
}

async function checkOllamaGeneration() {
  const text = await ollamaClient.generateText('Say OK', { stream: false });
  const pass = typeof text === 'string' && text.trim().length > 0;
  record('ollama generation liveness', pass, pass ? `got ${text.length} chars` : 'empty response');
  if (!pass) throw new Error('Ollama generation returned no text.');
}

async function checkPineconeEmbedding() {
  const [vector] = await pineconeClient.embedText('postpartum depression support', 'query');
  const pass = Array.isArray(vector) && vector.length === EMBEDDING_DIMENSION;
  record(
    'pinecone embedding dimension',
    pass,
    `got ${Array.isArray(vector) ? vector.length : typeof vector}, expected ${EMBEDDING_DIMENSION}`
  );
  if (!pass) throw new Error('Pinecone embedding dimension mismatch.');
}

async function checkPineconeIndex() {
  const description = await pineconeClient.createIndexIfMissing(PINECONE_INDEX_NAME);
  const dimension = description.dimension;
  const metric = description.metric;
  const pass = dimension === EMBEDDING_DIMENSION && metric === PINECONE_METRIC;
  record(
    'pinecone index config',
    pass,
    `${PINECONE_INDEX_NAME}: dimension=${dimension}, metric=${metric}`
  );
  if (!pass) throw new Error('Pinecone index config mismatch.');
}

async function main() {
  try {
    await checkEnvVars();
    await checkOllamaModel();
    await checkOllamaGeneration();
    await checkPineconeEmbedding();
    await checkPineconeIndex();
  } catch (err) {
    console.error(`\nverify-rag-setup aborted: ${err.message}`);
  }

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exit(passed === results.length && results.length > 0 ? 0 : 1);
}

main();
