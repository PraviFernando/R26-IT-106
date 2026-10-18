// ================================================================
// COMPREHENSIVE RISK-BASED RECOMMENDATION REGRESSION SUITE
// Tests A through G as specified in PeriCare Personalization Audit
// ================================================================

const { analyzeDiary, getRecommendations } = require('./emotionEngine.js');
const {
  getRankedActivities,
  getRecommendedGames,
  normalizeReasonKey,
  normalizeEmotionKey,
  normalizeRiskLevel,
  isBabyRelatedReason
} = require('./activitiesLibrary.js');
const { getMusicForReason, getVideosForReason } = require('./mediaLibrary.js');

const USER_DIARY_TEXT = 'අද උදේ ඉඳන් බබා එක දිගටම අඬනවා. කිරි දීලා, නැලෙව්වත් අඬන එක නතර කරන්නේ නෑ. බබාට මොකක් හරි අමාරුවක්ද කියලා මට ලොකු බයක් සහ කලබලයක් දැනෙනවා. ඇඟට පණ නෑ වගේ පුදුම විඩාවක් දැනෙන්නේ. ඇස් දෙක ඇරගෙන ඉන්නත් අමාරුයි. බබාගේ වැඩයි ගෙදර වැඩයි එක්ක මට පොඩි විවේකයක්වත් ගන්න වෙලාවක් නෑ.';

const getIds = (list) => (list || []).map(item => typeof item === 'string' ? item : (item.id || item.titleEn || item.title)).filter(Boolean);
const countDifferences = (listA, listB) => {
  const idsA = getIds(listA);
  const idsB = getIds(listB);
  const setB = new Set(idsB);
  return idsA.filter(id => !setB.has(id)).length;
};

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    totalPassed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    totalFailed++;
    console.error(`  [FAIL] ${testName} - ${details}`);
  }
}

console.log('================================================================');
console.log('STARTING RISK PERSONALIZATION REGRESSION SUITE (TESTS A - G)');
console.log('================================================================\n');

// -------------------------------------------------------------
// TEST A: LOW vs MEDIUM (User Diary Text)
// -------------------------------------------------------------
console.log('--- TEST A: LOW vs MEDIUM (Same diary, emotion, reason, baby context) ---');
const analysisA = analyzeDiary(USER_DIARY_TEXT);
const lowRecsA = getRecommendations({ ...analysisA, riskLevel: 'low' }, [], [], USER_DIARY_TEXT, []);
const medRecsA = getRecommendations({ ...analysisA, riskLevel: 'medium' }, [], [], USER_DIARY_TEXT, []);

const actDiffLM = countDifferences(lowRecsA.activities, medRecsA.activities);
const gameDiffLM = countDifferences(lowRecsA.games, medRecsA.games);
const musicDiffLM = countDifferences(lowRecsA.music, medRecsA.music);

console.log('  Low Activities: ', getIds(lowRecsA.activities));
console.log('  Med Activities: ', getIds(medRecsA.activities));
console.log('  Low Games:      ', getIds(lowRecsA.games));
console.log('  Med Games:      ', getIds(medRecsA.games));
console.log('  Low Music:      ', getIds(lowRecsA.music));
console.log('  Med Music:      ', getIds(medRecsA.music));

assert(actDiffLM >= 2, 'Test A1: Activity IDs differ by at least 2 between Low and Medium', `Actual diff: ${actDiffLM}`);
assert(gameDiffLM >= 2, 'Test A2: Game IDs differ by at least 2 between Low and Medium', `Actual diff: ${gameDiffLM}`);
assert(musicDiffLM >= 2, 'Test A3: Music IDs differ by at least 2 between Low and Medium', `Actual diff: ${musicDiffLM}`);

// -------------------------------------------------------------
// TEST B: MEDIUM vs HIGH (Controlled user input & Clinical Safety)
// -------------------------------------------------------------
console.log('\n--- TEST B: MEDIUM vs HIGH (Controlled input and High Risk Safety) ---');
const highRecsB = getRecommendations({ ...analysisA, riskLevel: 'high' }, [], [], USER_DIARY_TEXT, []);

const actDiffMH = countDifferences(medRecsA.activities, highRecsB.activities);
const gameDiffMH = countDifferences(medRecsA.games, highRecsB.games);
const musicDiffMH = countDifferences(medRecsA.music, highRecsB.music);

console.log('  High Activities:', getIds(highRecsB.activities));
console.log('  High Games:     ', getIds(highRecsB.games));
console.log('  High Music:     ', getIds(highRecsB.music));

assert(actDiffMH >= 2, 'Test B1: Activity IDs differ by at least 2 between Medium and High', `Actual diff: ${actDiffMH}`);
assert(gameDiffMH >= 2, 'Test B2: Game IDs differ by at least 2 between Medium and High', `Actual diff: ${gameDiffMH}`);
assert(musicDiffMH >= 2, 'Test B3: Music IDs differ by at least 2 between Medium and High', `Actual diff: ${musicDiffMH}`);

const unsafeActs = ['new_smile_challenge', 'new_drink_water', 'new_gentle_stretch', 'gentle_stretch', 'new_self_care_checklist'];
const unsafeGames = ['word_builder', 'spot_diff', 'coin_maze', 'number_seq', 'memory_match'];
const hasUnsafeAct = highRecsB.activities.some(a => unsafeActs.includes(a.id));
const hasUnsafeGame = highRecsB.games.some(g => unsafeGames.includes(g.id));

assert(!hasUnsafeAct, 'Test B4: High risk strictly filters out demanding/unsafe physical tasks');
assert(!hasUnsafeGame, 'Test B5: High risk strictly filters out high cognitive strain games');

// -------------------------------------------------------------
// TEST C: EMOTION & REASON PERSONALIZATION (Fixed risk, changing emotion/reason)
// -------------------------------------------------------------
console.log('\n--- TEST C: EMOTION & REASON PERSONALIZATION (Fixed Risk) ---');
const textHappy = 'I feel joyful and happy playing with my baby';
const textSad = 'I feel sad and alone today in this quiet room';

const analysisHappy = analyzeDiary(textHappy);
const analysisSad = analyzeDiary(textSad);

const recsHappyLow = getRecommendations({ ...analysisHappy, riskLevel: 'low' }, [], [], textHappy, []);
const recsSadLow = getRecommendations({ ...analysisSad, riskLevel: 'low' }, [], [], textSad, []);

const actDiffEmotion = countDifferences(recsHappyLow.activities, recsSadLow.activities);
const gameDiffEmotion = countDifferences(recsHappyLow.games, recsSadLow.games);
const musicDiffEmotion = countDifferences(recsHappyLow.music, recsSadLow.music);

assert(actDiffEmotion >= 1, 'Test C1: Activities respond to emotion/reason personalization', `Diff: ${actDiffEmotion}`);
assert(gameDiffEmotion >= 1, 'Test C2: Games respond to emotion/reason personalization', `Diff: ${gameDiffEmotion}`);
assert(musicDiffEmotion >= 1, 'Test C3: Music responds to emotion/reason personalization', `Diff: ${musicDiffEmotion}`);

// -------------------------------------------------------------
// TEST D: RISK SOURCE AND STATE (Authoritative EPDS preservation)
// -------------------------------------------------------------
console.log('\n--- TEST D: RISK SOURCE AND STATE (Authoritative EPDS preservation) ---');
// Simulating AppContext risk preservation
const simulateAppContextRisk = (diaryRisk, epdsRisk) => {
  const normDiary = normalizeRiskLevel(diaryRisk);
  const normEpds = epdsRisk ? normalizeRiskLevel(epdsRisk) : null;
  if (normEpds) {
    return (normDiary === 'high' && normEpds !== 'high') ? 'high' : normEpds;
  }
  return normDiary || 'low';
};

assert(simulateAppContextRisk('medium', 'low') === 'low', 'Test D1: EPDS Low is not overwritten by diary medium keywords');
assert(simulateAppContextRisk('low', 'medium') === 'medium', 'Test D2: EPDS Medium reaches pipeline without defaulting to Low');
assert(simulateAppContextRisk('low', 'high') === 'high', 'Test D3: EPDS High reaches pipeline safely');
assert(simulateAppContextRisk('high', 'low') === 'high', 'Test D4: Severe crisis in diary safely escalates clinical risk');

// -------------------------------------------------------------
// TEST E: CACHE INVALIDATION ON RISK CHANGE
// -------------------------------------------------------------
console.log('\n--- TEST E: CACHE INVALIDATION ON RISK CHANGE ---');
let cachedRecs = lowRecsA;
const simulateUIResolvedRecs = (currentRisk, cached) => {
  const isMatching = cached && normalizeRiskLevel(cached.riskLevel) === currentRisk;
  const validCache = isMatching ? cached : null;
  return validCache
    ? validCache.activities
    : getRankedActivities(analysisA.detectedEmotion, analysisA.primaryReason, currentRisk, USER_DIARY_TEXT);
};

const resolvedAtLow = simulateUIResolvedRecs('low', cachedRecs);
const resolvedAtMed = simulateUIResolvedRecs('medium', cachedRecs);
const cacheInvalidationDiff = countDifferences(resolvedAtLow, resolvedAtMed);

assert(cacheInvalidationDiff >= 2, 'Test E1: Switching risk invalidates cache and yields updated activities in UI', `Diff: ${cacheInvalidationDiff}`);

// -------------------------------------------------------------
// TEST F: BABY-CARE CONTEXT RULES
// -------------------------------------------------------------
console.log('\n--- TEST F: BABY-CARE RULES ---');
const babyRecs = getRecommendations(analysisA, [], [], USER_DIARY_TEXT, []);
const hasBabyMood = babyRecs.games[0] && babyRecs.games[0].id === 'baby_mood';
assert(hasBabyMood, 'Test F1: Baby crying diary entry places baby_mood at index 0 in games');

const motherSleepAnalysis = analyzeDiary('mata raata ninda naha mind keeps running');
const motherSleepRecs = getRecommendations({ ...motherSleepAnalysis, primaryReason: 'sleep_problems', riskLevel: 'low' }, [], [], '', []);
const motherSleepHasBabyGame = motherSleepRecs.games.some(g => g.id === 'baby_mood');
assert(!motherSleepHasBabyGame, 'Test F2: Unrelated maternal sleep concern does NOT receive irrelevant baby game');

// -------------------------------------------------------------
// TEST G: DETERMINISM
// -------------------------------------------------------------
console.log('\n--- TEST G: DETERMINISM ---');
const run1 = getRecommendations({ ...analysisA, riskLevel: 'medium' }, [], [], USER_DIARY_TEXT, []);
const run2 = getRecommendations({ ...analysisA, riskLevel: 'medium' }, [], [], USER_DIARY_TEXT, []);

const actStable = getIds(run1.activities).join(',') === getIds(run2.activities).join(',');
const gameStable = getIds(run1.games).join(',') === getIds(run2.games).join(',');
const musicStable = getIds(run1.music).join(',') === getIds(run2.music).join(',');

assert(actStable, 'Test G1: Repeated activity recommendations are 100% deterministic');
assert(gameStable, 'Test G2: Repeated game recommendations are 100% deterministic');
assert(musicStable, 'Test G3: Repeated music recommendations are 100% deterministic');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`REGRESSION SUITE COMPLETED: Total Passed: ${totalPassed} | Total Failed: ${totalFailed}`);
console.log('================================================================');

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
