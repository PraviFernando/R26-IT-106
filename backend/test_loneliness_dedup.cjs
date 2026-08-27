const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const youtubeService = require('./services/youtubeService');

async function testLonelinessDeduplication() {
  console.log('========================================================================================');
  console.log('            LONELINESS VIDEO DEDUPLICATION & NEW RECOMMENDATION VALIDATION              ');
  console.log('========================================================================================\n');

  // TEST 1: Reason = loneliness basic validation
  console.log('>>> TEST 1: Fetching videos for reason="loneliness"...');
  const videos = await youtubeService.fetchAndRankVideos('loneliness', 'lonely', 0, false, 'තනිකම දැනෙනවා');

  const totalCount = videos.length;
  const curatedVideos = videos.filter(v => v.source === 'curated');
  const apiVideos = videos.filter(v => v.source === 'youtube_api');
  const uniqueIds = new Set(videos.map(v => youtubeService.extractYouTubeId(v.url || v.id)));

  console.log(`\n  Total Videos Output : ${totalCount} (Max 5)`);
  console.log(`  Curated Videos Count: ${curatedVideos.length} (Expected 3)`);
  console.log(`  API Videos Count    : ${apiVideos.length} (Expected 2)`);
  console.log(`  Unique Video IDs    : ${uniqueIds.size} (Expected ${totalCount})`);

  console.log('\n  Recommended Video Details:');
  videos.forEach((v, i) => {
    console.log(`    [${i + 1}] ID: ${v.id.padEnd(12, ' ')} | Source: ${v.source.padEnd(11, ' ')} | Title: "${v.title}"`);
  });

  const isTest1Pass = totalCount <= 5 && curatedVideos.length === 3 && apiVideos.length <= 2 && uniqueIds.size === totalCount;
  console.log(`  RESULT TEST 1: ${isTest1Pass ? 'PASS ✅' : 'FAIL ❌'}\n`);

  // TEST 2 & TEST 3: Check for duplicate 2OEL4P1Rz04
  console.log('>>> TEST 2 & 3: Checking if 2OEL4P1Rz04 appears only once...');
  const count2OEL = videos.filter(v => youtubeService.extractYouTubeId(v.url || v.id) === '2OEL4P1Rz04').length;
  console.log(`  Occurrences of 2OEL4P1Rz04: ${count2OEL} (Expected 1)`);
  const isTest2And3Pass = count2OEL === 1;
  console.log(`  RESULT TEST 2 & 3: ${isTest2And3Pass ? 'PASS ✅' : 'FAIL ❌'}\n`);

  // TEST 4: Check if new videos 1oanOmN83fw and iLUk7xB0BVw are present
  console.log('>>> TEST 4: Checking inclusion of new loneliness videos 1oanOmN83fw and iLUk7xB0BVw...');
  const has1oan = videos.some(v => youtubeService.extractYouTubeId(v.url || v.id) === '1oanOmN83fw');
  const hasiLUk = videos.some(v => youtubeService.extractYouTubeId(v.url || v.id) === 'iLUk7xB0BVw');
  console.log(`  Includes 1oanOmN83fw: ${has1oan ? 'YES ✅' : 'NO ❌'}`);
  console.log(`  Includes iLUk7xB0BVw: ${hasiLUk ? 'YES ✅' : 'NO ❌'}`);
  const isTest4Pass = has1oan && hasiLUk;
  console.log(`  RESULT TEST 4: ${isTest4Pass ? 'PASS ✅' : 'FAIL ❌'}\n`);

  // TEST 5: Verify other categories continue working
  console.log('>>> TEST 5: Verifying other categories (fatigue, baby_crying, anxiety)...');
  const fatigueVids = await youtubeService.fetchAndRankVideos('fatigue', 'fatigue', 0, false, 'මහන්සියි');
  const cryingVids = await youtubeService.fetchAndRankVideos('baby_crying', 'stressed', 0, true, 'අඬනවා');
  const anxietyVids = await youtubeService.fetchAndRankVideos('anxiety', 'anxious', 0, false, 'බයයි');

  const fUnique = new Set(fatigueVids.map(v => youtubeService.extractYouTubeId(v.url || v.id))).size;
  const cUnique = new Set(cryingVids.map(v => youtubeService.extractYouTubeId(v.url || v.id))).size;
  const aUnique = new Set(anxietyVids.map(v => youtubeService.extractYouTubeId(v.url || v.id))).size;

  const isTest5Pass = (fatigueVids.length === 5 && fUnique === 5) &&
                      (cryingVids.length === 5 && cUnique === 5) &&
                      (anxietyVids.length === 5 && aUnique === 5);

  console.log(`  Fatigue Count : ${fatigueVids.length} (Unique: ${fUnique})`);
  console.log(`  Crying Count  : ${cryingVids.length} (Unique: ${cUnique})`);
  console.log(`  Anxiety Count : ${anxietyVids.length} (Unique: ${aUnique})`);
  console.log(`  RESULT TEST 5: ${isTest5Pass ? 'PASS ✅' : 'FAIL ❌'}\n`);

  const allPass = isTest1Pass && isTest2And3Pass && isTest4Pass && isTest5Pass;
  console.log('========================================================================================');
  console.log(`                     FINAL SUITE STATUS: ${allPass ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
  console.log('========================================================================================\n');
}

testLonelinessDeduplication().catch(console.error);
