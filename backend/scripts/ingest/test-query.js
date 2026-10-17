require('dotenv').config();
const pineconeClient = require('../../services/rag/pineconeClient');

const DEFAULT_QUERIES = [
  'what causes postpartum depression',
  'breastfeeding problems',
  'EPDS score meaning',
];

async function runQuery(text, topK = 5) {
  const [vector] = await pineconeClient.embedText(text, 'query');
  const { matches } = await pineconeClient.getIndex().query({ vector, topK, includeMetadata: true });
  return matches || [];
}

async function main() {
  const custom = process.argv.slice(2);
  const queries = custom.length ? [custom.join(' ')] : DEFAULT_QUERIES;

  for (const q of queries) {
    console.log(`\n=== "${q}" ===`);
    const matches = await runQuery(q);
    if (!matches.length) {
      console.log('  (no matches — has the index been populated with `npm run ingest:kb -- --all`?)');
      continue;
    }
    matches.forEach((m, i) => {
      const md = m.metadata || {};
      console.log(`  ${i + 1}. score=${m.score.toFixed(4)} ${md.source_file} [p.${md.page_range}] "${md.title}"`);
      console.log(`     ${(md.text || '').slice(0, 160).replace(/\s+/g, ' ')}...`);
    });
  }
}

main().catch((err) => {
  console.error(`test-query failed: ${err.message}`);
  process.exit(1);
});
