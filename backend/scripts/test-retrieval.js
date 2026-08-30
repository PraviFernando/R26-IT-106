require('dotenv').config();
const retrievalService = require('../services/rag/retrievalService');

const SAMPLE_QUERIES = [
  'what causes postpartum depression',
  'my baby wont stop crying at night',
  "what's the weather today",
  "I don't want to be here anymore",
];

async function main() {
  const custom = process.argv.slice(2);
  const queries = custom.length ? [custom.join(' ')] : SAMPLE_QUERIES;

  for (const q of queries) {
    console.log(`\n=== "${q}" ===`);
    const result = await retrievalService.retrieve(q);

    if (result.isCrisis) {
      console.log('  isCrisis: true (short-circuited before any Pinecone call)');
      continue;
    }

    console.log(`  category: ${result.category}`);
    console.log(`  guardrailZone: ${result.guardrailZone}`);
    console.log(`  topScore: ${result.topScore.toFixed(4)}`);
    if (!result.chunks.length) {
      console.log('  chunks: (none)');
    } else {
      result.chunks.forEach((c, i) => {
        console.log(`  ${i + 1}. score=${c.score.toFixed(4)} ${c.source_file} [p.${c.page_range}] "${c.title}"`);
        console.log(`     ${(c.text || '').slice(0, 140).replace(/\s+/g, ' ')}...`);
      });
    }
  }
}

main().catch((err) => {
  console.error(`test-retrieval failed: ${err.message}`);
  process.exit(1);
});
