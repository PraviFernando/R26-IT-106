const { Pinecone } = require('@pinecone-database/pinecone');
const {
  PINECONE_INDEX_NAME,
  PINECONE_METRIC,
  PINECONE_CLOUD,
  PINECONE_REGION,
  PINECONE_EMBEDDING_MODEL,
  EMBEDDING_DIMENSION,
} = require('../../config/ragConfig');

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is missing from env');
    }
    client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return client;
}

async function listIndexes() {
  const { indexes } = await getClient().listIndexes();
  return indexes || [];
}

async function describeIndex(name = PINECONE_INDEX_NAME) {
  return getClient().describeIndex(name);
}

async function createIndexIfMissing(name = PINECONE_INDEX_NAME) {
  const existing = await listIndexes();
  if (existing.some((idx) => idx.name === name)) {
    return describeIndex(name);
  }
  await getClient().createIndex({
    name,
    dimension: EMBEDDING_DIMENSION,
    metric: PINECONE_METRIC,
    spec: { serverless: { cloud: PINECONE_CLOUD, region: PINECONE_REGION } },
  });
  return describeIndex(name);
}

function getIndex(name = PINECONE_INDEX_NAME) {
  return getClient().index(name);
}

/**
 * Embed text via Pinecone's hosted inference model (no local embedding runtime).
 * inputType must be 'passage' at ingestion time or 'query' at query time.
 */
async function embedText(texts, inputType) {
  if (!['passage', 'query'].includes(inputType)) {
    throw new Error(`embedText: inputType must be 'passage' or 'query', got '${inputType}'`);
  }
  const inputs = Array.isArray(texts) ? texts : [texts];
  const result = await getClient().inference.embed({
    model: PINECONE_EMBEDDING_MODEL,
    inputs,
    parameters: { inputType, truncate: 'END' },
  });
  return result.data.map((d) => d.values);
}

/**
 * Upsert pre-embedded records. SDK v8 requires the { records: [...] } wrapper.
 * vectors: Array<{ id, values, metadata }>
 */
async function upsertBatch(vectors, name = PINECONE_INDEX_NAME) {
  return getIndex(name).upsert({ records: vectors });
}

/**
 * Delete all vectors tagged with the given source_file metadata value.
 * Serverless Pinecone 404s with PineconeNotFoundError ("Namespace not found") when the
 * default namespace has never had a vector upserted into it — expected on a first-ever
 * ingest, so that specific case is swallowed as a no-op. Any other error propagates.
 */
async function deleteBySourceFile(sourceFile, name = PINECONE_INDEX_NAME) {
  try {
    return await getIndex(name).deleteMany({ filter: { source_file: { $eq: sourceFile } } });
  } catch (err) {
    if (err.name === 'PineconeNotFoundError') return;
    throw err;
  }
}

module.exports = {
  getClient,
  listIndexes,
  describeIndex,
  createIndexIfMissing,
  getIndex,
  embedText,
  upsertBatch,
  deleteBySourceFile,
};
