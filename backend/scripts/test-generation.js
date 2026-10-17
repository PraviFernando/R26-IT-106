require('dotenv').config();
const riskLevelService = require('../services/rag/riskLevelService');
const generationService = require('../services/rag/generationService');

const SAMPLE_QUERIES = [
  'what causes postpartum depression',
  'recommend a good pizza recipe',
  "I don't want to be here anymore",
];

function parseArgs(argv) {
  const riskArg = argv.find((a) => a.startsWith('--risk='));
  const risk = riskArg ? riskArg.split('=')[1] : null;
  const rest = argv.filter((a) => !a.startsWith('--risk='));
  return { risk, query: rest.join(' ') };
}

async function main() {
  const { risk, query } = parseArgs(process.argv.slice(2));
  // riskLevelService.getRiskLevel() needs a live Mongo connection (EPDSScreening lookup)
  // unless MOCK_RISK_LEVEL is set — this is a standalone CLI with no real user/DB in play,
  // so always mock it rather than requiring --risk to avoid a Mongo dependency entirely.
  process.env.MOCK_RISK_LEVEL = risk || 'medium';

  const queries = query ? [query] : SAMPLE_QUERIES;
  const riskLevel = await riskLevelService.getRiskLevel('test-user');

  for (const q of queries) {
    console.log(`\n=== "${q}" (riskLevel=${riskLevel}) ===`);
    const start = Date.now();
    const result = await generationService.generateReply({ query: q, riskLevel });
    const elapsedMs = Date.now() - start;

    console.log(`  isCrisis: ${result.isCrisis}`);
    console.log(`  category: ${result.category}`);
    console.log(`  guardrailZone: ${result.guardrailZone}`);
    console.log(`  elapsed: ${elapsedMs}ms`);
    console.log(`  sources: ${JSON.stringify(result.sources)}`);
    console.log(`  answer:\n${result.answer}`);
  }
}

main().catch((err) => {
  console.error(`test-generation failed: ${err.message}`);
  process.exit(1);
});
