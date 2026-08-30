const { DOMAIN_CATEGORIES, GUARDRAIL, RETRIEVAL } = require('../../config/ragConfig');
const { normalizeText } = require('./textNormalize');
const { detectCrisis } = require('./crisisDetector');
const { detectGreeting } = require('./greetingDetector');
const { classifyCategory } = require('./domainGate');
const pineconeClient = require('./pineconeClient');

// Pinecone's matches already arrive sorted by score descending — group by source_file and
// keep the first N per group, preserving that order. Pure array logic, no API call.
function capPerSource(matches, cap) {
  const countBySource = {};
  const result = [];
  for (const match of matches) {
    const sourceFile = match.metadata?.source_file;
    const count = countBySource[sourceFile] || 0;
    if (count < cap) {
      result.push(match);
      countBySource[sourceFile] = count + 1;
    }
  }
  return result;
}

function toChunkView(match) {
  const md = match.metadata || {};
  return {
    text: md.text,
    title: md.title,
    source_file: md.source_file,
    page_range: md.page_range,
    category: md.category,
    score: match.score,
  };
}

/**
 * retrieve(text) -> the RAG pipeline up through the guardrail decision, no LLM call.
 *
 * Pipeline: normalize -> crisis pre-check -> greeting pre-check (both short-circuit before
 * any Pinecone call) -> domain gate -> embed query -> Pinecone top-K search (domain-filtered)
 * -> dedupe capped per source -> 3-zone guardrail decision -> top-N final chunks.
 */
async function retrieve(text) {
  const normalized = normalizeText(text);

  if (detectCrisis(normalized)) {
    return { isCrisis: true };
  }

  if (detectGreeting(normalized)) {
    return { isCrisis: false, isGreeting: true };
  }

  const { category } = classifyCategory(normalized);
  const [vector] = await pineconeClient.embedText(text, 'query');
  const filter = category === DOMAIN_CATEGORIES.UNKNOWN ? undefined : { category: { $eq: category } };

  let { matches } = await pineconeClient.getIndex().query({
    vector,
    topK: RETRIEVAL.TOP_K,
    includeMetadata: true,
    filter,
  });

  // A domain-filtered search can come back empty even when relevant content exists, if a
  // source file was tagged under a different category at ingestion time than the query
  // classifies to (e.g. the dual-domain "Pregnancy WHO article.pdf" is tagged
  // maternal_mental_health, but a breastfeeding query classifies as newborn_care). Retrying
  // unfiltered lets that content surface instead of silently returning nothing.
  if (filter && (!matches || matches.length === 0)) {
    ({ matches } = await pineconeClient.getIndex().query({
      vector,
      topK: RETRIEVAL.TOP_K,
      includeMetadata: true,
    }));
  }

  const deduped = capPerSource(matches || [], RETRIEVAL.PER_SOURCE_DEDUP_CAP);
  const topScore = deduped[0]?.score ?? 0;
  const lexiconMatched = category !== DOMAIN_CATEGORIES.UNKNOWN;

  let guardrailZone;
  if (deduped.length === 0) {
    // Nothing retrieved at all (e.g. a domain-filtered search against a category with no
    // indexed content yet) — a lexicon match can't rescue a hedge with nothing to hedge about.
    guardrailZone = 'reject';
  } else if (topScore >= GUARDRAIL.ACCEPT_THRESHOLD) {
    guardrailZone = 'accept';
  } else if (topScore >= GUARDRAIL.HEDGE_THRESHOLD) {
    guardrailZone = 'accept_with_hedge';
  } else if (lexiconMatched) {
    guardrailZone = 'accept_with_hedge';
  } else {
    guardrailZone = 'reject';
  }

  const chunks = guardrailZone === 'reject' ? [] : deduped.slice(0, RETRIEVAL.FINAL_TOP_N).map(toChunkView);

  return { isCrisis: false, category, guardrailZone, topScore, chunks };
}

module.exports = { retrieve };
