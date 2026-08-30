// ================================================================
// COMPREHENSIVE MATRIX TEST RUNNER — test_matrix.cjs
// Tests emoji personalization across LOW, MEDIUM, HIGH risk levels
// for Activities, Games, Music, and Videos.
// ================================================================

async function runMatrixTests() {
  console.log("=================================================");
  console.log("RUNNING MATRIX PERSONALIZATION & SAFETY TESTS");
  console.log("=================================================\n");

  let emotionEngine;
  let activitiesLibrary;
  let mediaLibrary;

  try {
    emotionEngine = await import('./emotionEngine.js');
    activitiesLibrary = await import('./activitiesLibrary.js');
    mediaLibrary = await import('./mediaLibrary.js');
  } catch (err) {
    console.error("❌ Failed to import modules:", err.message);
    process.exit(1);
  }

  const { analyzeDiary, getRecommendations } = emotionEngine;
  const { getRankedActivities, getRecommendedGames } = activitiesLibrary;
  const { getMusicForReason, getVideosForReason } = mediaLibrary;

  const riskLevels = ['low', 'medium', 'high'];
  const testReasons = [
    { key: 'loneliness', diary: "I feel very alone today" },
    { key: 'sleep_problems', diary: "mata raata ninda naha baba nagitinawa nisa" },
    { key: 'bonding_issues', diary: "mata babata adare hithenne na" },
    { key: 'lack_of_support', diary: "nobody helps me at all" },
    { key: 'overwhelmed', diary: "everything is too much and I am breaking down" }
  ];

  const emojiPairs = [
    { a: '😴', aName: 'sleepy', b: '😪', bName: 'tired' },
    { a: '😢', aName: 'crying', b: '😊', bName: 'happy' },
    { a: '😔', aName: 'sad', b: '😌', bName: 'calm' }
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const resultsSummary = {
    low: { pass: true, count: 0 },
    medium: { pass: true, count: 0 },
    high: { pass: true, count: 0 },
    activities: true,
    games: true,
    music: true,
    videos: true,
    reasonIntegrity: true,
    riskIntegrity: true,
    highRiskSafety: true
  };

  const getIds = (list) => (list || []).map(item => typeof item === 'string' ? item : (item.id || item.titleEn || item.title)).filter(Boolean);
  const countDifferences = (listA, listB) => {
    const idsA = getIds(listA);
    const idsB = getIds(listB);
    const setB = new Set(idsB);
    let diff = 0;
    idsA.forEach(id => {
      if (!setB.has(id)) diff++;
    });
    return diff;
  };

  // Clean logger
  const log = (...args) => console.log(...args);

  for (const rObj of testReasons) {
    for (const risk of riskLevels) {
      for (const pair of emojiPairs) {
        totalTests++;
        const diaryText = rObj.diary;
        const reason = rObj.key;

        // Perform analysis and recommendation for Emoji A
        const analysisA = analyzeDiary(diaryText);
        analysisA.primaryReason = reason; // enforce test reason
        analysisA.riskLevel = risk;
        analysisA.selectedEmoji = pair.aName;
        const recsA = getRecommendations(analysisA, [], [], diaryText, []);

        // Perform analysis and recommendation for Emoji B
        const analysisB = analyzeDiary(diaryText);
        analysisB.primaryReason = reason; // enforce test reason
        analysisB.riskLevel = risk;
        analysisB.selectedEmoji = pair.bName;
        const recsB = getRecommendations(analysisB, [], [], diaryText, []);

        // Calculate differences across all 4 categories
        const actDiff = countDifferences(recsA.activities, recsB.activities);
        const gameDiff = countDifferences(recsA.games, recsB.games);
        const musicDiff = countDifferences(recsA.music, recsB.music);
        const videoDiff = countDifferences(recsA.videos, recsB.videos);

        // Verification checks
        const reasonCorrectA = recsA._internal?.primaryReason === reason;
        const reasonCorrectB = recsB._internal?.primaryReason === reason;
        const riskCorrectA = recsA.riskLevel === risk;
        const riskCorrectB = recsB.riskLevel === risk;

        const passAct = actDiff >= 2;
        const passGame = gameDiff >= 2;
        const passMusic = musicDiff >= 2;
        const passVideo = videoDiff >= 2;

        // High risk safety check
        let passSafety = true;
        if (risk === 'high') {
          const highRiskUnsafeActivities = ['new_smile_challenge', 'new_drink_water', 'new_gentle_stretch', 'gentle_stretch'];
          const highRiskUnsafeGames = ['word_builder', 'spot_diff', 'coin_maze', 'number_seq'];
          const hasUnsafeAct = recsA.activities.some(a => highRiskUnsafeActivities.includes(a.id)) || recsB.activities.some(a => highRiskUnsafeActivities.includes(a.id));
          const hasUnsafeGame = recsA.games.some(g => highRiskUnsafeGames.includes(g.id)) || recsB.games.some(g => highRiskUnsafeGames.includes(g.id));
          if (hasUnsafeAct || hasUnsafeGame) passSafety = false;
        }

        const passAll = reasonCorrectA && reasonCorrectB && riskCorrectA && riskCorrectB && passAct && passGame && passMusic && passVideo && passSafety;

        if (passAll) {
          passedTests++;
          resultsSummary[risk].count++;
        } else {
          failedTests++;
          resultsSummary[risk].pass = false;
          if (!passAct) resultsSummary.activities = false;
          if (!passGame) resultsSummary.games = false;
          if (!passMusic) resultsSummary.music = false;
          if (!passVideo) resultsSummary.videos = false;
          if (!reasonCorrectA || !reasonCorrectB) resultsSummary.reasonIntegrity = false;
          if (!riskCorrectA || !riskCorrectB) resultsSummary.riskIntegrity = false;
          if (!passSafety) resultsSummary.highRiskSafety = false;

          console.log(`FAIL_TEST_CASE: ${reason.toUpperCase()} | Risk: ${risk.toUpperCase()} | ${pair.aName} vs ${pair.bName}`);
          console.log(`   Diffs -> Acts: ${actDiff} (pass:${passAct}), Games: ${gameDiff} (pass:${passGame}), Music: ${musicDiff} (pass:${passMusic}), Videos: ${videoDiff} (pass:${passVideo})`);
          if (!passAct) {
            console.log(`❌ FAIL ACTS: ${reason} | Risk: ${risk} | ${pair.aName} vs ${pair.bName} (diff: ${actDiff})`);
            console.log(`   Acts A (${pair.aName}):`, getIds(recsA.activities));
            console.log(`   Acts B (${pair.bName}):`, getIds(recsB.activities));
          }
          if (!passVideo) {
            console.log(`   Vids A (${pair.aName}):`, getIds(recsA.videos));
            console.log(`   Vids B (${pair.bName}):`, getIds(recsB.videos));
          }
        }
      }
    }
  }

  console.log("\n=================================================");
  console.log("FINAL TEST MATRIX RESULTS");
  console.log("=================================================");
  console.log(`Total Combinations Tested: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log("-------------------------------------------------");
  console.log(`LOW Risk Status:      ${resultsSummary.low.pass ? 'PASS' : 'FAIL'} (${resultsSummary.low.count}/${totalTests / 3})`);
  console.log(`MEDIUM Risk Status:   ${resultsSummary.medium.pass ? 'PASS' : 'FAIL'} (${resultsSummary.medium.count}/${totalTests / 3})`);
  console.log(`HIGH Risk Status:     ${resultsSummary.high.pass ? 'PASS' : 'FAIL'} (${resultsSummary.high.count}/${totalTests / 3})`);
  console.log("-------------------------------------------------");
  console.log(`Activities Personalization: ${resultsSummary.activities ? 'PASS' : 'FAIL'}`);
  console.log(`Games Personalization:      ${resultsSummary.games ? 'PASS' : 'FAIL'}`);
  console.log(`Music Personalization:      ${resultsSummary.music ? 'PASS' : 'FAIL'}`);
  console.log(`Videos Personalization:     ${resultsSummary.videos ? 'PASS' : 'FAIL'}`);
  console.log("-------------------------------------------------");
  console.log(`Reason Integrity:     ${resultsSummary.reasonIntegrity ? 'PASS' : 'FAIL'}`);
  console.log(`Risk Integrity:       ${resultsSummary.riskIntegrity ? 'PASS' : 'FAIL'}`);
  console.log(`High Risk Safety:     ${resultsSummary.highRiskSafety ? 'PASS' : 'FAIL'}`);
  console.log("=================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runMatrixTests();
