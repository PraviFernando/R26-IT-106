const { INGESTION, buildVectorId } = require('../../config/ragConfig');
const pineconeClient = require('../../services/rag/pineconeClient');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isRateLimitError(err) {
  return err.name === 'PineconeUnmappedHttpError' && /429|RESOURCE_EXHAUSTED/.test(err.message);
}

// Large source files can push a single ingest run past Pinecone's free-tier per-minute
// embed token cap on their own — retrying the same batch after the window resets (rather
// than failing the whole file) makes ingestion self-healing regardless of file size.
async function embedWithRetry(texts) {
  const { RATE_LIMIT_MAX_RETRIES, RATE_LIMIT_BACKOFF_MS } = INGESTION;
  for (let attempt = 0; ; attempt++) {
    try {
      return await pineconeClient.embedText(texts, 'passage');
    } catch (err) {
      if (!isRateLimitError(err) || attempt >= RATE_LIMIT_MAX_RETRIES) throw err;
      console.log(`  rate-limited, waiting ${Math.round(RATE_LIMIT_BACKOFF_MS / 1000)}s before retry ${attempt + 1}/${RATE_LIMIT_MAX_RETRIES}...`);
      await sleep(RATE_LIMIT_BACKOFF_MS);
    }
  }
}

/**
 * chunks: Array<{ text, pageStart, pageEnd }> (from chunk.js)
 * sourceFile: original filename, e.g. "CMJ_Post partum depression.pdf"
 * meta: { title, category, language } (from metadataMap.js)
 * returns: { upserted }
 */
async function embedAndUpsertChunks(chunks, sourceFile, meta) {
  const batchSize = INGESTION.EMBED_BATCH_SIZE;
  let upserted = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const vectors = await embedWithRetry(batch.map((c) => c.text));

    const records = batch.map((c, j) => {
      const chunkIndex = i + j;
      const pageRange = c.pageStart === c.pageEnd ? String(c.pageStart) : `${c.pageStart}-${c.pageEnd}`;
      return {
        id: buildVectorId(sourceFile, chunkIndex),
        values: vectors[j],
        metadata: {
          source_file: sourceFile,
          title: meta.title,
          page_range: pageRange,
          category: meta.category,
          language: meta.language,
          chunk_index: chunkIndex,
          text: c.text,
        },
      };
    });

    await pineconeClient.upsertBatch(records);
    upserted += records.length;
  }

  return { upserted };
}

module.exports = { embedAndUpsertChunks };
