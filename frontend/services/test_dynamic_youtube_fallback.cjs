// test_dynamic_youtube_fallback.cjs
// Targeted test suite for PeriCare Dynamic YouTube API Fallback & Unseen Sentence Handling

const { analyzeDiary } = require('./emotionEngine.js');
const { fetchAndRankVideos } = require('../../backend/services/youtubeService.js');

async function runDynamicYouTubeTests() {
  console.log('================================================================');
  console.log('🧪 PERICARE — DYNAMIC YOUTUBE FALLBACK & UNSEEN SENTENCE TEST');
  console.log('================================================================\n');

  const testCases = [
    {
      id: 'Test A',
      sentence: "I don't know how to take care of my newborn",
      expectedReason: 'difficulty_caring_for_baby',
      emoji: '😢'
    },
    {
      id: 'Test B',
      sentence: "Baby has a mild fever today and feels warm. I am worried about his health.",
      expectedReason: 'baby_health',
      emoji: '😰'
    },
    {
      id: 'Test C (Unseen Loneliness)',
      sentence: "No one seems to reach out or visit me nowadays and I am home alone.",
      expectedReason: 'loneliness',
      emoji: '🧍'
    },
    {
      id: 'Test D (Unseen Mother Sleep)',
      sentence: "My eyes stay wide open all night and I cannot fall asleep even when resting.",
      expectedReason: 'sleep_problems',
      emoji: '😴'
    },
    {
      id: 'Test E (Unseen Bonding)',
      sentence: "I feel disconnected when holding my baby and struggle to form an emotional bond.",
      expectedReason: 'bonding_issues',
      emoji: '😔'
    }
  ];

  let passCount = 0;

  for (const tc of testCases) {
    console.log(`----------------------------------------------------------------`);
    console.log(`📌 ${tc.id}`);
    console.log(`   Diary Sentence: "${tc.sentence}"`);

    // Step 1: NLP Classification
    const nlpResult = analyzeDiary(tc.sentence);
    const detectedReason = nlpResult.primaryReason || nlpResult.reason;
    const detectedEmotion = nlpResult.detectedEmotion;

    console.log(`   NLP Classification -> Detected Reason: "${detectedReason}" | Emotion: "${detectedEmotion}"`);

    // Check reason match (accepting mother_sleep_problems for sleep_problems)
    const reasonMatch = detectedReason === tc.expectedReason || (tc.expectedReason === 'sleep_problems' && detectedReason === 'mother_sleep_problems');
    console.log(`   Reason Match Check: ${reasonMatch ? 'PASS ✅' : `FAIL ❌ (Expected ${tc.expectedReason}, got ${detectedReason})`}`);

    // Step 2: YouTube Dynamic Recommendation Fetching
    const videos = await fetchAndRankVideos(detectedReason, detectedEmotion, 'low', true, tc.sentence, tc.emoji);

    console.log(`   Returned Videos Count: ${videos.length}`);
    const validCount = videos.filter(v => v.id && v.title).length;
    const hasDuplicates = new Set(videos.map(v => v.id)).size !== videos.length;

    console.log(`   Valid Playable Videos: ${validCount}/${videos.length} | Has Duplicates: ${hasDuplicates ? 'YES ❌' : 'NO ✅'}`);

    if (tc.expectedReason === 'baby_health') {
      const hasMedicalNotice = videos.some(v => v.medicalNotice);
      console.log(`   Medical Notice Included: ${hasMedicalNotice ? 'YES ✅' : 'NO ❌'}`);
    }

    if (reasonMatch && validCount === 5 && !hasDuplicates) {
      console.log(`   RESULT: PASS ✅`);
      passCount++;
    } else {
      console.log(`   RESULT: FAIL ❌`);
    }
  }

  console.log('\n================================================================');
  console.log(`🎯 OVERALL TEST RESULT: ${passCount}/${testCases.length} TESTS PASSED`);
  console.log('================================================================\n');
}

runDynamicYouTubeTests().catch(err => {
  console.error('Test Execution Error:', err);
});
