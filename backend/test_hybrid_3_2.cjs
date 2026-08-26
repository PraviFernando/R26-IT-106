const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const youtubeService = require('./services/youtubeService');

const testCases = [
  {
    caseNo: 1,
    diaryText: "මගේ බබාට මම ලං වෙලා නැහැ වගේ දැනෙනවා",
    expectedReason: "bonding_issues",
    emotion: "sad",
    riskLevel: 0,
    babyIntent: true
  },
  {
    caseNo: 2,
    diaryText: "මට හරිම පාලුයි. කවුරුත් මා එක්ක කතා කරන්නවත් මාව බලන්නවත් එන්නේ නැහැ.",
    expectedReason: "loneliness",
    emotion: "lonely",
    riskLevel: 0,
    babyIntent: false
  },
  {
    caseNo: 3,
    diaryText: "මට හරිම මහන්සියි, ඇඟට කිසිම පණක් නැහැ.",
    expectedReason: "fatigue",
    emotion: "fatigue",
    riskLevel: 0,
    babyIntent: false
  },
  {
    caseNo: 4,
    diaryText: "මට බබා ගැන හිතලා ලොකු බයක් එනවා.",
    expectedReason: "anxiety",
    emotion: "anxious",
    riskLevel: 0,
    babyIntent: true
  },
  {
    caseNo: 5,
    diaryText: "මට උදව් කරන්න කවුරුත් නැහැ. බබාගේ වැඩ ඔක්කොම මට තනියම කරන්න වෙලා.",
    expectedReason: "lack_of_support",
    emotion: "stressed",
    riskLevel: 0,
    babyIntent: false
  },
  {
    caseNo: 6,
    diaryText: "රෑ මුලුල්ලේම බබා අඬනවා, මට නිදාගන්න හම්බුනේ නැහැ.",
    expectedReason: "sleep_problems",
    emotion: "fatigue",
    riskLevel: 0,
    babyIntent: true
  },
  {
    caseNo: 7,
    diaryText: "මට මේ ඔක්කොම වැඩ දරාගන්න බැහැ.",
    expectedReason: "overwhelmed",
    emotion: "stressed",
    riskLevel: 0,
    babyIntent: false
  },
  {
    caseNo: 8,
    diaryText: "ප්‍රසූතියෙන් පසු ඇඟට පණ නැහැ, ශාරීරික සුවතාවය අවශ්‍යයි.",
    expectedReason: "physical_recovery",
    emotion: "fatigue",
    riskLevel: 0,
    babyIntent: false
  },
  {
    caseNo: 9,
    diaryText: "හිතට නරක අඳුරු සිතුවිලි එනවා, මට හරිම බයයි.",
    expectedReason: "negative_thoughts",
    emotion: "anxious",
    riskLevel: 0,
    babyIntent: false
  },
  {
    caseNo: 10,
    diaryText: "මගේ බබා නිතරම අඬනවා, මට එයාව සන්සුන් කරගන්න බැහැ.",
    expectedReason: "baby_crying",
    emotion: "stressed",
    riskLevel: 0,
    babyIntent: true
  },
  {
    caseNo: 11,
    diaryText: "බබා කිරි බොන්නේ නැහැ, කිරි දෙනකොට අපහසුයි.",
    expectedReason: "baby_feeding",
    emotion: "anxious",
    riskLevel: 0,
    babyIntent: true
  },
  {
    caseNo: 12,
    diaryText: "බබා රෑට නිදාගන්නේ නැහැ, නින්ද සන්සුන් කරන්න ඕනේ.",
    expectedReason: "baby_sleep",
    emotion: "fatigue",
    riskLevel: 0,
    babyIntent: true
  },
  {
    caseNo: 13,
    diaryText: "බබාගේ සංඥා සහ අවශ්‍යතා තේරුම් ගන්න අමාරුයි.",
    expectedReason: "understanding_baby",
    emotion: "anxious",
    riskLevel: 0,
    babyIntent: true
  },
  {
    caseNo: 14,
    diaryText: "බබාට අසනීපයි වගේ, උණ ගැන බයයි.",
    expectedReason: "baby_health",
    emotion: "anxious",
    riskLevel: 0,
    babyIntent: true
  },
  {
    caseNo: 15,
    diaryText: "වියදම් වැඩි වී මුදල් ප්‍රශ්න නිසා ලොකු බයක් දැනෙනවා.",
    expectedReason: "financial_worry",
    emotion: "stressed",
    riskLevel: 0,
    babyIntent: false
  },
  {
    caseNo: 16,
    diaryText: "මගේ husband එක්කත් family එකත් එක්කත් ප්රශ්න තියෙනවා.",
    expectedReason: "relationship_family_problem",
    emotion: "stressed",
    riskLevel: 0,
    babyIntent: false
  }
];

async function runTests() {
  console.log('========================================================================================');
  console.log('                 PERICARE HYBRID VIDEO RECOMMENDATION TEST SUITE (16 CATEGORIES)         ');
  console.log('========================================================================================\n');

  const results = [];

  for (const tc of testCases) {
    console.log(`>>> Running Case ${tc.caseNo}: Reason="${tc.expectedReason}" | Emotion="${tc.emotion}"`);
    const videos = await youtubeService.fetchAndRankVideos(
      tc.expectedReason,
      tc.emotion,
      tc.riskLevel,
      tc.babyIntent,
      tc.diaryText
    );

    const total = videos.length;
    const curatedCount = videos.filter(v => v.source === 'curated').length;
    const apiCount = videos.filter(v => v.source === 'youtube_api').length;
    const uniqueIds = new Set(videos.map(v => youtubeService.extractYouTubeId(v.url || v.id)));
    const uniqueCount = uniqueIds.size;

    const pass = total === 5 && curatedCount === 3 && apiCount === 2 && uniqueCount === 5;

    results.push({
      caseNo: tc.caseNo,
      reason: tc.expectedReason,
      total,
      curated: curatedCount,
      api: apiCount,
      unique: uniqueCount,
      passStatus: pass ? 'PASS ✅' : 'FAIL ❌',
      videos: videos.map(v => ({ id: v.id, title: v.title, source: v.source }))
    });

    // 1-second delay between test cases to prevent YouTube API 429 rate limit
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n========================================================================================');
  console.log('                                  TEST RESULTS MATRIX                                   ');
  console.log('========================================================================================');
  console.log('Case | Reason                      | Total | Curated | API | Unique | Status');
  console.log('----------------------------------------------------------------------------------------');
  results.forEach(r => {
    const reasonPadded = r.reason.padEnd(27, ' ');
    const casePadded = String(r.caseNo).padEnd(4, ' ');
    console.log(`${casePadded} | ${reasonPadded} | ${r.total}     | ${r.curated}       | ${r.api}   | ${r.unique}      | ${r.passStatus}`);
  });
  console.log('========================================================================================\n');
}

runTests().catch(console.error);
