# PDF ingestion

Turns the PDFs in `Knowglagepdf/` (default `KB_SOURCE_DIR`, a sibling of `R26-IT-106/`)
into embedded, upserted vectors in the Pinecone index configured in `config/ragConfig.js`.
Plain Node — no Python, no local FAISS index.

## Usage

```sh
# ingest every PDF listed in metadataMap.js
npm run ingest:kb -- --all

# re-ingest a single file (deletes its existing vectors first, then re-adds)
npm run ingest:kb -- --file "CMJ_Post partum depression.pdf"

# sanity-check retrieval against the 3 acceptance-criteria sample questions
npm run ingest:test-query

# or an ad-hoc question
npm run ingest:test-query -- "what foods help with breastfeeding recovery"
```

Requires a real `PINECONE_API_KEY` in `backend/.env` (see `npm run verify:rag` to confirm
Pinecone/Ollama connectivity first).

## Pipeline

1. `metadataMap.js` — hand-tagged `{filename → {title, category, language}}` table. Every
   PDF must have an entry here before it can be ingested.
2. `parse.js` — extracts per-page text via `pdf-parse` v2's `PDFParse` class API, cleaning
   de-hyphenation/blank-lines/page-numbers.
3. `chunk.js` — sentence-boundary-aware chunking into `CHUNKING.CHUNK_SIZE_TOKENS` (400)
   token targets (word-count heuristic, `CHUNK_OVERLAP_RATIO` 0.15 overlap), mapped back to
   page numbers for the `page_range` metadata field.
4. `embedAndUpsert.js` — batches chunks (`INGESTION.EMBED_BATCH_SIZE`), embeds via
   `services/rag/pineconeClient.js`'s `embedText(texts, 'passage')`, and upserts with
   metadata `{ source_file, title, page_range, category, language, chunk_index, text }`.
   `text` is stored because Pinecone is the only persisted store in this architecture —
   retrieval needs the chunk content back directly from query results.
5. `ingest.js` — CLI entrypoint tying the above together, plus delete-before-reinsert via
   `pineconeClient.deleteBySourceFile()` so re-running ingestion never leaves stale
   duplicate chunks.

Vector IDs follow `{sourceFileSlug}__chunk{n}` (0-based `n`), via `ragConfig.js`'s
`slugifyFilename`/`buildVectorId`.
