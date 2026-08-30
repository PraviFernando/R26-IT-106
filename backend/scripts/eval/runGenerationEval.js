require('dotenv').config();
const fs = require('fs');
const path = require('path');
process.env.MOCK_RISK_LEVEL = process.env.MOCK_RISK_LEVEL || 'medium';

const generationService = require('../../services/rag/generationService');
const ollamaClient = require('../../services/rag/ollamaClient');
const { buildContext } = require('../../services/rag/contextBuilder');
const retrievalService = require('../../services/rag/retrievalService');

const testset = require('./testset.json');

function percentile(sortedNums, p) {
  if (sortedNums.length === 0) return null;
  const idx = Math.min(sortedNums.length - 1, Math.floor((p / 100) * sortedNums.length));
  return sortedNums[idx];
}

// Plain-text structured judge prompt, not JSON mode — same reasoning as the main
// generation pipeline's own decision to avoid trusting small-model JSON output.
function buildJudgePrompt({ question, context, answer }) {
  return [
    'You are evaluating an AI assistant\'s answer for a postpartum-support chatbot.',
    'Rate the answer using ONLY the information in the provided context.',
    '',
    `Context:\n${context}`,
    '',
    `Question: ${question}`,
    '',
    `Answer: ${answer}`,
    '',
    'Respond in EXACTLY this format, one line per field, no extra text:',
    'FAITHFULNESS: <1-5, does the answer stick to claims supported by the context>',
    'ANSWER_RELEVANCE: <1-5, does the answer actually address the question>',
    'HALLUCINATION: <yes or no, does the answer state anything not supported by the context>',
  ].join('\n');
}

function parseJudgeResponse(text) {
  const faithMatch = text.match(/FAITHFULNESS:\s*(\d)/i);
  const relMatch = text.match(/ANSWER_RELEVANCE:\s*(\d)/i);
  const hallMatch = text.match(/HALLUCINATION:\s*(yes|no)/i);
  return {
    faithfulness: faithMatch ? Number(faithMatch[1]) : null,
    answerRelevance: relMatch ? Number(relMatch[1]) : null,
    hallucination: hallMatch ? hallMatch[1].toLowerCase() : null,
    raw: text,
  };
}

function csvEscape(value) {
  const s = String(value ?? '').replace(/"/g, '""');
  return `"${s}"`;
}

async function main() {
  const results = [];
  const latencies = [];

  for (const item of testset) {
    const isControl = item.expectedSourceFiles.length === 0;
    console.log(`\n=== ${item.id}: "${item.question}" ===`);

    const start = Date.now();
    const reply = await generationService.generateReply({ query: item.question, riskLevel: 'medium' });
    const elapsedMs = Date.now() - start;
    latencies.push(elapsedMs);

    const row = {
      id: item.id,
      question: item.question,
      isCrisis: reply.isCrisis,
      guardrailZone: reply.guardrailZone,
      elapsedMs,
      answer: reply.answer,
      sources: reply.sources,
      citationCheck: null,
      judge: null,
    };

    if (!reply.isCrisis && reply.guardrailZone !== 'reject') {
      // Citation correctness — checked programmatically against what retrieval actually
      // returned for this question, not judged by the LLM (sources are built directly
      // from retrieval.chunks in generationService.js, never LLM-text-derived, but worth
      // confirming empirically rather than only trusting the code).
      const retrieval = await retrievalService.retrieve(item.question);
      const retrievedSourceFiles = new Set((retrieval.chunks || []).map((c) => c.source_file));
      const citedFilesMatch = reply.sources.every((s) =>
        (retrieval.chunks || []).some((c) => c.title === s.title && c.page_range === s.section)
      );
      row.citationCheck = { citedFilesMatch, retrievedSourceFiles: [...retrievedSourceFiles] };

      // Local-Ollama judge pass — a rough automated proxy, explicitly not ground truth.
      const context = buildContext(retrieval.chunks || []);
      const judgePrompt = buildJudgePrompt({ question: item.question, context, answer: reply.answer });
      try {
        const judgeText = await ollamaClient.generateText(judgePrompt);
        row.judge = parseJudgeResponse(judgeText);
      } catch (err) {
        row.judge = { error: err.message };
      }

      console.log(
        `  [${row.guardrailZone}] ${elapsedMs}ms | judge: F=${row.judge?.faithfulness} R=${row.judge?.answerRelevance} H=${row.judge?.hallucination} | citations OK=${row.citationCheck.citedFilesMatch}`
      );
    } else {
      console.log(`  [${row.isCrisis ? 'crisis' : row.guardrailZone}] ${elapsedMs}ms (no LLM call — judge skipped)`);
    }

    results.push(row);
  }

  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  const aggregate = {
    numQuestions: results.length,
    p50LatencyMs: percentile(sortedLatencies, 50),
    p95LatencyMs: percentile(sortedLatencies, 95),
    meanFaithfulness:
      results.filter((r) => r.judge?.faithfulness).reduce((s, r, _, arr) => s + r.judge.faithfulness / arr.length, 0) || null,
    meanAnswerRelevance:
      results.filter((r) => r.judge?.answerRelevance).reduce((s, r, _, arr) => s + r.judge.answerRelevance / arr.length, 0) ||
      null,
    hallucinationRate:
      results.filter((r) => r.judge?.hallucination).length > 0
        ? results.filter((r) => r.judge?.hallucination === 'yes').length / results.filter((r) => r.judge?.hallucination).length
        : null,
    citationAccuracy:
      results.filter((r) => r.citationCheck).length > 0
        ? results.filter((r) => r.citationCheck?.citedFilesMatch).length / results.filter((r) => r.citationCheck).length
        : null,
  };

  console.log('\n=== Aggregate ===');
  console.log(JSON.stringify(aggregate, null, 2));

  const outDir = __dirname;
  fs.writeFileSync(path.join(outDir, 'generation-eval-results.json'), JSON.stringify({ results, aggregate }, null, 2));

  const csvHeader =
    'id,question,answer,context_used_sources,judge_faithfulness,judge_relevance,judge_hallucination,human_faithfulness,human_relevance,human_notes';
  const csvRows = results.map((r) =>
    [
      r.id,
      r.question,
      r.answer,
      (r.citationCheck?.retrievedSourceFiles || []).join('; '),
      r.judge?.faithfulness ?? '',
      r.judge?.answerRelevance ?? '',
      r.judge?.hallucination ?? '',
      '',
      '',
      '',
    ]
      .map(csvEscape)
      .join(',')
  );
  fs.writeFileSync(path.join(outDir, 'generation-eval-review.csv'), [csvHeader, ...csvRows].join('\n'));

  console.log(`\nWrote ${path.join(outDir, 'generation-eval-results.json')}`);
  console.log(`Wrote ${path.join(outDir, 'generation-eval-review.csv')}`);
}

main().catch((err) => {
  console.error('runGenerationEval failed:', err.message);
  process.exit(1);
});
