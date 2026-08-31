require('dotenv').config();
const fs = require('fs');
const path = require('path');
const retrievalService = require('../../services/rag/retrievalService');

const testset = require('./testset.json');

function precisionAt3(chunks, expectedSet) {
  if (chunks.length === 0) return 0;
  const hits = chunks.filter((c) => expectedSet.has(c.source_file)).length;
  return hits / chunks.length;
}

function recallAt3(chunks, expectedSet) {
  if (expectedSet.size === 0) return null; // handled separately as a control question
  const returned = new Set(chunks.map((c) => c.source_file));
  const hits = [...expectedSet].filter((f) => returned.has(f)).length;
  return hits / expectedSet.size;
}

function mrr(chunks, expectedSet) {
  if (expectedSet.size === 0) return null;
  for (let i = 0; i < chunks.length; i++) {
    if (expectedSet.has(chunks[i].source_file)) return 1 / (i + 1);
  }
  return 0;
}

function ndcgAt3(chunks, expectedSet) {
  if (expectedSet.size === 0) return null;
  // Ground truth is file-level, but the same relevant source can contribute more than one
  // chunk to the top-3. Only the first occurrence of a given source counts as a relevance
  // hit — otherwise DCG could exceed IDCG (which budgets at most expectedSet.size relevant
  // positions), producing an invalid NDCG > 1.
  const seen = new Set();
  const dcg = chunks.reduce((sum, c, i) => {
    const isNewHit = expectedSet.has(c.source_file) && !seen.has(c.source_file);
    if (isNewHit) seen.add(c.source_file);
    return sum + (isNewHit ? 1 : 0) / Math.log2(i + 2);
  }, 0);
  const idealHits = Math.min(expectedSet.size, 3);
  const idcg = Array.from({ length: idealHits }, (_, i) => 1 / Math.log2(i + 2)).reduce((a, b) => a + b, 0);
  return idcg === 0 ? 0 : dcg / idcg;
}

function mean(nums) {
  const filtered = nums.filter((n) => n !== null && !Number.isNaN(n));
  if (filtered.length === 0) return null;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

async function main() {
  const results = [];

  for (const item of testset) {
    const expectedSet = new Set(item.expectedSourceFiles);
    const isControl = expectedSet.size === 0;

    const retrieval = await retrievalService.retrieve(item.question);
    const chunks = retrieval.isCrisis ? [] : retrieval.chunks;

    const row = {
      id: item.id,
      question: item.question,
      isControl,
      expectedCategory: item.expectedCategory,
      actualCategory: retrieval.category,
      guardrailZone: retrieval.isCrisis ? null : retrieval.guardrailZone,
      returnedSources: chunks.map((c) => c.source_file),
      precisionAt3: isControl ? null : precisionAt3(chunks, expectedSet),
      recallAt3: isControl ? null : recallAt3(chunks, expectedSet),
      mrr: isControl ? null : mrr(chunks, expectedSet),
      ndcgAt3: isControl ? null : ndcgAt3(chunks, expectedSet),
      correctlyRejected: isControl ? chunks.length === 0 : null,
    };
    results.push(row);

    const summary = isControl
      ? `correctlyRejected=${row.correctlyRejected}`
      : `P@3=${row.precisionAt3.toFixed(2)} R@3=${row.recallAt3.toFixed(2)} MRR=${row.mrr.toFixed(2)} NDCG@3=${row.ndcgAt3.toFixed(2)}`;
    console.log(`${item.id} [${row.guardrailZone || 'crisis'}/${row.actualCategory}] ${summary}`);
  }

  const positives = results.filter((r) => !r.isControl);
  const controls = results.filter((r) => r.isControl);

  const aggregate = {
    numQuestions: results.length,
    numPositive: positives.length,
    numControl: controls.length,
    meanPrecisionAt3: mean(positives.map((r) => r.precisionAt3)),
    meanRecallAt3: mean(positives.map((r) => r.recallAt3)),
    meanMRR: mean(positives.map((r) => r.mrr)),
    meanNDCGAt3: mean(positives.map((r) => r.ndcgAt3)),
    falsePositiveRate: controls.length ? controls.filter((r) => !r.correctlyRejected).length / controls.length : null,
  };

  console.log('\n=== Aggregate ===');
  console.log(JSON.stringify(aggregate, null, 2));

  const outDir = __dirname;
  fs.writeFileSync(path.join(outDir, 'retrieval-eval-results.json'), JSON.stringify({ results, aggregate }, null, 2));
  console.log(`\nWrote ${path.join(outDir, 'retrieval-eval-results.json')}`);
}

main().catch((err) => {
  console.error('runRetrievalEval failed:', err.message);
  process.exit(1);
});
