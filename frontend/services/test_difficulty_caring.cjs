// ================================================================
// TEST SUITE — test_difficulty_caring.cjs
// Comprehensive validation for difficulty_caring_for_baby ONLY
// ================================================================

const { analyzeDiary, getRecommendations } = require('./emotionEngine.js');
const { normalizeReasonKey, normalizeEmotionKey, normalizeRiskLevel } = require('./activitiesLibrary.js');
const { getVideosForReason } = require('./mediaLibrary.js');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failedTests++;
  }
}

console.log("=================================================");
console.log("RUNNING TARGETED TEST SUITE: difficulty_caring_for_baby");
console.log("=================================================\n");

// ---------------------------------------------------------------
// 1. CLASSIFICATION TESTS (A through F)
// ---------------------------------------------------------------
console.log("--- 1. CLASSIFICATION / REASON SEPARATION TESTS ---");

const testA = analyzeDiary("I don't know how to take care of my newborn");
assert(testA.primaryReason === "difficulty_caring_for_baby", `TEST A: "I don't know how to take care of my newborn" -> ${testA.primaryReason} (expected: difficulty_caring_for_baby)`);

const testB = analyzeDiary("mata baba wa balaganne kohomada kiyala danne naha");
assert(testB.primaryReason === "difficulty_caring_for_baby", `TEST B: "mata baba wa balaganne kohomada kiyala danne naha" -> ${testB.primaryReason} (expected: difficulty_caring_for_baby)`);

const testC = analyzeDiary("mata mage aluth upan baba wa balaganna amarui");
assert(testC.primaryReason === "difficulty_caring_for_baby", `TEST C: "mata mage aluth upan baba wa balaganna amarui" -> ${testC.primaryReason} (expected: difficulty_caring_for_baby)`);

const testD = analyzeDiary("I don't understand why my baby is crying");
assert(testD.primaryReason === "baby_needs", `TEST D: "I don't understand why my baby is crying" -> ${testD.primaryReason} (expected: baby_needs)`);

const testE = analyzeDiary("mata babata adare hithenne naha");
assert(testE.primaryReason === "bonding_issues", `TEST E: "mata babata adare hithenne naha" -> ${testE.primaryReason} (expected: bonding_issues)`);

const testF = analyzeDiary("nobody helps me with the baby");
assert(testF.primaryReason === "lack_of_support", `TEST F: "nobody helps me with the baby" -> ${testF.primaryReason} (expected: lack_of_support)`);

console.log("");

// ---------------------------------------------------------------
// 2. VIDEO MAPPING TESTS
// ---------------------------------------------------------------
console.log("--- 2. CURATED VIDEO SOURCES TEST ---");

const videoRes = getVideosForReason('difficulty_caring_for_baby', 'anxious', null, 'low');
const videoIds = videoRes.videos.map(v => v.id);

assert(videoIds.includes('7yxd25nZMaE'), `Video 1 (7yxd25nZMaE) returned for difficulty_caring_for_baby`);
assert(videoIds.includes('dp_education_health'), `Video 2 (DP Education Health channel) returned for difficulty_caring_for_baby`);
assert(videoIds.includes('40twQSFLHMw'), `Video 3 (40twQSFLHMw) returned for difficulty_caring_for_baby`);

// Assert these 3 curated videos are NOT mapped to other reasons
const bondingVids = getVideosForReason('bonding_issues', 'anxious', null, 'low').videos.map(v => v.id);
const needsVids = getVideosForReason('baby_needs', 'anxious', null, 'low').videos.map(v => v.id);
const supportVids = getVideosForReason('lack_of_support', 'anxious', null, 'low').videos.map(v => v.id);

assert(!bondingVids.includes('7yxd25nZMaE') && !bondingVids.includes('40twQSFLHMw'), `Curated videos NOT assigned to bonding_issues`);
assert(!needsVids.includes('7yxd25nZMaE') && !needsVids.includes('40twQSFLHMw'), `Curated videos NOT assigned to baby_needs`);
assert(!supportVids.includes('7yxd25nZMaE') && !supportVids.includes('40twQSFLHMw'), `Curated videos NOT assigned to lack_of_support`);

console.log("");

// ---------------------------------------------------------------
// 3. RISK LEVEL TESTS
// ---------------------------------------------------------------
console.log("--- 3. RISK LEVEL PERSONALIZATION TESTS ---");

['low', 'medium', 'high'].forEach(risk => {
  const rec = getRecommendations({ primaryReason: 'difficulty_caring_for_baby', selectedEmoji: 'anxious', riskLevel: risk }, [], [], '', []);
  assert(rec.riskLevel === risk, `Risk level '${risk}' correctly returned`);
  assert(rec._internal.primaryReason === 'difficulty_caring_for_baby', `Primary reason preserved as difficulty_caring_for_baby under '${risk}' risk`);
});

console.log("");

// ---------------------------------------------------------------
// 4. EMOJI PERSONALIZATION TESTS
// ---------------------------------------------------------------
console.log("--- 4. EMOJI PERSONALIZATION TESTS ---");

['sleepy', 'tired', 'crying', 'happy', 'sad'].forEach(emoji => {
  const rec = getRecommendations({ primaryReason: 'difficulty_caring_for_baby', selectedEmoji: emoji, riskLevel: 'low' }, [], [], '', []);
  assert(rec.selectedEmoji === emoji, `Selected emoji '${emoji}' applied`);
  assert(rec._internal.primaryReason === 'difficulty_caring_for_baby', `Primary reason STILL difficulty_caring_for_baby with emoji '${emoji}'`);
});

console.log("");

// ---------------------------------------------------------------
// 5. DIARY VS QUICK RESPONSE CONSISTENCY TEST
// ---------------------------------------------------------------
console.log("--- 5. DIARY vs QUICK RESPONSE CONSISTENCY TEST ---");

const getIds = (list) => (list || []).map(item => typeof item === 'string' ? item : (item.id || item.titleEn || item.title)).filter(Boolean);
const checkEquivalence = (a, b) => {
  const idsA = getIds(a);
  const idsB = getIds(b);
  if (idsA.length !== idsB.length) return false;
  return idsA.every((id, idx) => id === idsB[idx]);
};

const diaryAnalysis = { primaryReason: 'difficulty_caring_for_baby', selectedEmoji: 'tired', riskLevel: 'medium' };
const qrAnalysis = { primaryReason: 'difficulty_caring_for_baby', selectedEmoji: 'tired', riskLevel: 'medium' };

const diaryRecs = getRecommendations(diaryAnalysis, [], [], 'I struggle to care for my baby', []);
const qrRecs = getRecommendations(qrAnalysis, [], [], '', []);

assert(checkEquivalence(diaryRecs.activities, qrRecs.activities), `Diary & Quick Response Activities are IDENTICAL`);
assert(checkEquivalence(diaryRecs.games, qrRecs.games), `Diary & Quick Response Games are IDENTICAL`);
assert(checkEquivalence(diaryRecs.music, qrRecs.music), `Diary & Quick Response Music are IDENTICAL`);
assert(checkEquivalence(diaryRecs.videos, qrRecs.videos), `Diary & Quick Response Videos are IDENTICAL`);

console.log("");
console.log("=================================================");
console.log(`SUMMARY: ${passedTests} Passed, ${failedTests} Failed`);
console.log("=================================================");

if (failedTests > 0) {
  process.exit(1);
}
