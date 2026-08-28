const { fetchAndRankVideos } = require('./services/youtubeService');
const { analyzeDiary } = require('../frontend/services/emotionEngine');

async function testAllReasons() {
  console.log('==================================================');
  console.log('TESTING ALL REASON VIDEO RECOMMENDATION PIPELINE');
  console.log('==================================================\n');

  const testCases = [
    {
      name: "TEST 1 — BONDING",
      text: "මගේ බබාට මම ලං වෙලා නැහැ වගේ දැනෙනවා",
      expectedReason: "bonding_issues",
      forbiddenKws: ["jaundice", "fever", "crying", "sleep", "feeding", "workout", "financial", "husband"]
    },
    {
      name: "TEST 2 — SLEEP",
      text: "මට නින්ද මදි නිසා හරිම අමාරුයි",
      expectedReason: "sleep_problems",
      forbiddenKws: ["bonding", "attachment", "jaundice", "fever", "workout", "financial", "husband", "crying"]
    },
    {
      name: "TEST 3 — LACK OF SUPPORT",
      text: "මට බබා බලාගන්න කවුරුත් උදව් කරන්නේ නැහැ",
      expectedReason: "lack_of_support",
      forbiddenKws: ["bonding", "sleep", "jaundice", "fever", "workout", "financial", "husband"]
    },
    {
      name: "TEST 4 — PHYSICAL RECOVERY",
      text: "දරු ප්රසූතියෙන් පස්සේ මගේ ඇඟ ගොඩක් රිදෙනවා",
      expectedReason: "physical_discomfort",
      forbiddenKws: ["bonding", "attachment", "sleep", "jaundice", "fever", "financial", "husband"]
    },
    {
      name: "TEST 5 — OVERWHELMED",
      text: "බබාගේ වැඩයි ගෙදර වැඩයි ඔක්කොම මගේ පිටට ඇවිත් මට දරාගන්න බෑ",
      expectedReason: "overwhelmed",
      forbiddenKws: ["bonding", "attachment", "sleep", "jaundice", "fever", "financial", "husband"]
    },
    {
      name: "TEST 6 — FAMILY RELATIONSHIP",
      text: "බබා ලැබුණට පස්සේ මගේ සැමියාත් එක්ක අපේ සම්බන්ධය ගොඩක් නරක වෙලා",
      expectedReason: "relationship_family_problem",
      forbiddenKws: ["bonding", "attachment", "sleep", "jaundice", "fever", "feeding", "crying"]
    },
    {
      name: "TEST 7 — LONELINESS",
      text: "බබා එක්ක ගෙදර තනියම ඉන්න නිසා මට හරිම පාළුයි",
      expectedReason: "loneliness",
      forbiddenKws: ["bonding", "attachment", "sleep", "jaundice", "fever", "financial", "husband"]
    }
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    console.log(`\n--- ${tc.name} ---`);
    console.log(`Input text: "${tc.text}"`);

    const analysis = analyzeDiary(tc.text);
    console.log(`Detected Reason: ${analysis.primaryReason} (Expected: ${tc.expectedReason})`);
    console.log(`Detected Emotion: ${analysis.detectedEmotion}`);

    const videos = await fetchAndRankVideos(
      analysis.primaryReason,
      analysis.detectedEmotion,
      analysis.riskLevel,
      analysis.babyIntents.baby_related,
      tc.text
    );

    console.log(`Final Videos (${videos.length}):`);
    videos.forEach((v, idx) => console.log(`  ${idx + 1}. [${v.id}] ${v.title}`));

    // Validation check
    let pollutionFound = [];
    videos.forEach(v => {
      const fullText = ((v.title || '') + ' ' + (v.description || '')).toLowerCase();
      tc.forbiddenKws.forEach(kw => {
        if (fullText.includes(kw)) {
          pollutionFound.push({ videoId: v.id, title: v.title, forbiddenKw: kw });
        }
      });
    });

    const isReasonCorrect = analysis.primaryReason.includes(tc.expectedReason.replace('physical_discomfort', 'physical')) || 
                            tc.expectedReason.includes(analysis.primaryReason) ||
                            (tc.expectedReason === 'overwhelmed' && (analysis.primaryReason === 'overwhelmed' || analysis.primaryReason === 'daily_responsibilities' || analysis.primaryReason === 'stress')) ||
                            (tc.expectedReason === 'physical_discomfort' && (analysis.primaryReason === 'physical_discomfort' || analysis.primaryReason === 'physical_recovery'));

    if (isReasonCorrect && pollutionFound.length === 0 && videos.length >= 2) {
      console.log(`✅ PASS: Reason correct & 0 forbidden cross-category pollution!`);
      passedCount++;
    } else {
      console.log(`❌ FAIL:`);
      if (!isReasonCorrect) console.log(`   - Incorrect reason detected: got "${analysis.primaryReason}" expected "${tc.expectedReason}"`);
      if (pollutionFound.length > 0) console.log(`   - Cross-category pollution detected:`, JSON.stringify(pollutionFound));
      if (videos.length < 2) console.log(`   - Too few videos returned: ${videos.length}`);
    }
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: ${passedCount} / ${testCases.length} Passed`);
  console.log(`==================================================`);
}

testAllReasons();
