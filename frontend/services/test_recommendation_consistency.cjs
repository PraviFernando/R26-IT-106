// ================================================================
// TEST RECOMMENDATION CONSISTENCY — test_recommendation_consistency.cjs
// Asserts 100% equivalence between Diary and Quick Response flows
// ================================================================

const { analyzeDiary, getRecommendations } = require('./emotionEngine.js');
const { normalizeReasonKey, normalizeEmotionKey, normalizeRiskLevel } = require('./activitiesLibrary.js');

const getIds = (list) => (list || []).map(item => typeof item === 'string' ? item : (item.id || item.titleEn || item.title)).filter(Boolean);

const checkEquivalence = (a, b) => {
  const idsA = getIds(a);
  const idsB = getIds(b);
  if (idsA.length !== idsB.length) return false;
  return idsA.every((id, idx) => id === idsB[idx]);
};

console.log("=================================================");
console.log("RUNNING DIARY vs QUICK RESPONSE CONSISTENCY TEST");
console.log("=================================================\n");

const testCases = [
  { name: "TEST 1", diaryText: "mata raata ninda naha baba nagitinawa nisa", reason: "sleep_problems", emoji: "sleepy", risk: "LOW" },
  { name: "TEST 2", diaryText: "mata raata ninda naha baba nagitinawa nisa", reason: "Mother sleep problems", emoji: "tired", risk: "LOW" },
  { name: "TEST 3", diaryText: "I feel very alone and nobody understands me", reason: "loneliness", emoji: "crying", risk: "LOW" },
  { name: "TEST 4", diaryText: "I feel so lonely today", reason: "loneliness", emoji: "happy", risk: "MEDIUM" },
  { name: "TEST 5", diaryText: "I struggle to bond with my baby", reason: "bonding_issues", emoji: "crying", risk: "HIGH" },
  { name: "TEST 6", diaryText: "I have no help or support at home", reason: "lack_of_support", emoji: "frustrated", risk: "HIGH" }
];

let totalPassed = 0;
let totalFailed = 0;

for (const tc of testCases) {
  const normReason = normalizeReasonKey(tc.reason);
  const normEmoji = normalizeEmotionKey(tc.emoji);
  const normRisk = normalizeRiskLevel(tc.risk);

  // 1. DIARY FLOW (Text -> NLP classification -> Canonical Context -> Engine)
  const diaryAnalysis = analyzeDiary(tc.diaryText);
  diaryAnalysis.primaryReason = normReason;
  diaryAnalysis.selectedEmoji = normEmoji;
  diaryAnalysis.riskLevel = normRisk;

  const diaryRecs = getRecommendations(diaryAnalysis, [], [], tc.diaryText, []);

  // 2. QUICK RESPONSE FLOW (Direct selection -> Canonical Context -> Engine)
  const qrAnalysis = {
    primaryReason: normReason,
    selectedEmoji: normEmoji,
    riskLevel: normRisk,
    detectedEmotion: normEmoji,
    diaryText: ''
  };

  const qrRecs = getRecommendations(qrAnalysis, [], [], '', []);

  // Compare all four categories
  const passAct = checkEquivalence(diaryRecs.activities, qrRecs.activities);
  const passGame = checkEquivalence(diaryRecs.games, qrRecs.games);
  const passMusic = checkEquivalence(diaryRecs.music, qrRecs.music);
  const passVideo = checkEquivalence(diaryRecs.videos, qrRecs.videos);

  const passAll = passAct && passGame && passMusic && passVideo;

  if (passAll) {
    totalPassed++;
    console.log(`[PASS] ${tc.name}: ${tc.reason} | Emoji: ${tc.emoji} | Risk: ${tc.risk}`);
    console.log(`   Activities: SAME [${getIds(diaryRecs.activities).join(', ')}]`);
    console.log(`   Games:      SAME [${getIds(diaryRecs.games).join(', ')}]`);
    console.log(`   Music:      SAME [${getIds(diaryRecs.music).join(', ')}]`);
    console.log(`   Videos:     SAME [${getIds(diaryRecs.videos).join(', ')}]\n`);
  } else {
    totalFailed++;
    console.log(`[FAIL] ${tc.name}: ${tc.reason} | Emoji: ${tc.emoji} | Risk: ${tc.risk}`);
    if (!passAct) {
      console.log(`   ❌ Activities MISMATCH:`);
      console.log(`      Diary:`, getIds(diaryRecs.activities));
      console.log(`      QR:   `, getIds(qrRecs.activities));
    }
    if (!passGame) {
      console.log(`   ❌ Games MISMATCH:`);
      console.log(`      Diary:`, getIds(diaryRecs.games));
      console.log(`      QR:   `, getIds(qrRecs.games));
    }
    if (!passMusic) {
      console.log(`   ❌ Music MISMATCH:`);
      console.log(`      Diary:`, getIds(diaryRecs.music));
      console.log(`      QR:   `, getIds(qrRecs.music));
    }
    if (!passVideo) {
      console.log(`   ❌ Videos MISMATCH:`);
      console.log(`      Diary:`, getIds(diaryRecs.videos));
      console.log(`      QR:   `, getIds(qrRecs.videos));
    }
    console.log('');
  }
}

console.log("=================================================");
console.log(`CONSISTENCY SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed`);
console.log("=================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
