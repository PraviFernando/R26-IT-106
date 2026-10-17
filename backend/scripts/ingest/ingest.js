require('dotenv').config();

const path = require('path');
const { KB_SOURCE_DIR, CHUNKING } = require('../../config/ragConfig');
const metadataMap = require('./metadataMap');
const { parsePdf } = require('./parse');
const { chunkPages } = require('./chunk');
const { embedAndUpsertChunks } = require('./embedAndUpsert');
const pineconeClient = require('../../services/rag/pineconeClient');

const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}${detail ? `: ${detail}` : ''}`);
}

function parseArgs(argv) {
  if (argv.includes('--all')) return { mode: 'all' };
  const i = argv.indexOf('--file');
  if (i !== -1 && argv[i + 1]) return { mode: 'file', file: argv[i + 1] };
  return { mode: null };
}

async function ingestFile(filename) {
  const meta = metadataMap[filename];
  if (!meta) {
    throw new Error(`no metadataMap entry for "${filename}" — every PDF must be hand-tagged before ingesting`);
  }
  const filePath = path.join(KB_SOURCE_DIR, filename);
  const pages = await parsePdf(filePath);
  const chunks = chunkPages(pages, CHUNKING);

  // Delete-then-reinsert covers both first-ever ingest (no-op against a fresh index)
  // and re-ingest (avoids stale duplicate chunks) via a single code path.
  await pineconeClient.deleteBySourceFile(filename);
  const { upserted } = await embedAndUpsertChunks(chunks, filename, meta);

  return { pages: pages.length, chunks: chunks.length, upserted };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.mode) {
    console.error('Usage: node ingest.js --all | --file "<name>.pdf"');
    process.exit(1);
  }

  if (args.mode === 'file' && !metadataMap[args.file]) {
    console.error(`Aborting: "${args.file}" has no metadataMap entry. Add one in scripts/ingest/metadataMap.js first.`);
    process.exit(1);
  }

  try {
    await pineconeClient.createIndexIfMissing();
  } catch (err) {
    console.error(`Aborting: could not reach Pinecone (${err.message})`);
    process.exit(1);
  }

  const files = args.mode === 'all' ? Object.keys(metadataMap) : [args.file];

  for (const filename of files) {
    try {
      const { pages, chunks, upserted } = await ingestFile(filename);
      record(filename, true, `${pages} pages, ${chunks} chunks, ${upserted} upserted`);
    } catch (err) {
      record(filename, false, err.message);
    }
  }

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} files ingested successfully`);
  process.exit(passed === results.length && results.length > 0 ? 0 : 1);
}

main();
