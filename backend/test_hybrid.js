const dotenv = require('dotenv');
dotenv.config();

const { fetchAndRankVideos } = require('./services/youtubeService');

async function runTests() {
  console.log('==================================================');
  console.log('RUNNING SPECIFIC SCENARIO VERIFICATION TESTS');
  console.log('==================================================\n');

  // Test 1 — Breastfeeding + Anxious
  console.log('--- Test 1 — Breastfeeding + Anxious ---');
  console.log('Emotion: anxious, Reason: baby_feeding, Baby Context: true');
  try {
    const results = await fetchAndRankVideos('baby_feeding', 'anxious', 'low', 'true');
    console.log('Result Count:', results.length);
    console.log('Videos:', results.map(r => ({ title: r.title, id: r.id, source: r.source })));
    
    // Verifications
    console.log('Video 1 is Breastfeeding related:', results[0]?.id === 'qdXehiELnIA' ? '✅' : '❌');
    const hasAnxietySupport = results.some(r => r.id === 'hrozJ-EbdGI' || r.id === 'sF80I-TQiW0');
    console.log('Includes anxiety/emotional support curated video:', hasAnxietySupport ? '✅' : '❌');
    console.log('Passed Cap Check (<= 5):', results.length <= 5 ? '✅' : '❌');
  } catch (err) {
    console.error('Test 1 failed:', err.message);
  }
  console.log('\n');

  // Test 2 — Baby Crying + Stressed
  console.log('--- Test 2 — Baby Crying + Stressed ---');
  console.log('Emotion: stressed, Reason: baby_crying, Baby Context: true');
  try {
    const results = await fetchAndRankVideos('baby_crying', 'stressed', 'low', 'true');
    console.log('Result Count:', results.length);
    console.log('Videos:', results.map(r => ({ title: r.title, id: r.id, source: r.source })));

    // Verifications
    console.log('Video 1 is baby crying / soothing related:', results[0]?.id === 'kmbKaSRyZ-c' ? '✅' : '❌');
    const hasStressSupport = results.some(r => r.id === '1n46HPsYsHM' || r.id === 'fm5ZnhqWkO8');
    console.log('Includes stress support curated video:', hasStressSupport ? '✅' : '❌');
    console.log('Passed Cap Check (<= 5):', results.length <= 5 ? '✅' : '❌');
  } catch (err) {
    console.error('Test 2 failed:', err.message);
  }
  console.log('\n');

  // Test 3 — Mother Sleep / Fatigue + Stressed
  console.log('--- Test 3 — Mother Sleep / Fatigue + Stressed ---');
  console.log('Emotion: stressed, Reason: fatigue, Baby Context: false');
  try {
    const results = await fetchAndRankVideos('fatigue', 'stressed', 'low', 'false');
    console.log('Result Count:', results.length);
    console.log('Videos:', results.map(r => ({ title: r.title, id: r.id, source: r.source })));

    // Verifications
    const hasBabyFeedingOrCrying = results.some(r => r.id === 'qdXehiELnIA' || r.id === 'kmbKaSRyZ-c');
    console.log('No unrelated baby care (feeding/crying) videos included:', !hasBabyFeedingOrCrying ? '✅' : '❌');
    console.log('Passed Cap Check (<= 5):', results.length <= 5 ? '✅' : '❌');
  } catch (err) {
    console.error('Test 3 failed:', err.message);
  }
  console.log('\n');

  // Test 4 — Loneliness + Sad
  console.log('--- Test 4 — Loneliness + Sad ---');
  console.log('Emotion: sad, Reason: loneliness, Baby Context: false');
  try {
    const results = await fetchAndRankVideos('loneliness', 'sad', 'low', 'false');
    console.log('Result Count:', results.length);
    console.log('Videos:', results.map(r => ({ title: r.title, id: r.id, source: r.source })));

    // Verifications
    const hasBabyCare = results.some(r => r.id === 'qdXehiELnIA' || r.id === 'kmbKaSRyZ-c' || r.id === 'j2C8MkY7Co8' || r.id === 'TWHOFDQHOUA' || r.id === '3G5aAQL3R_g');
    console.log('No breastfeeding or baby sleep/crying videos included:', !hasBabyCare ? '✅' : '❌');
    console.log('Passed Cap Check (<= 5):', results.length <= 5 ? '✅' : '❌');
  } catch (err) {
    console.error('Test 4 failed:', err.message);
  }
  console.log('\n');

  // Test 5 — API Failure Fallback
  console.log('--- Test 5 — API Failure ---');
  console.log('Simulating YouTube API Key deletion...');
  const originalKey = process.env.YOUTUBE_API_KEY;
  delete process.env.YOUTUBE_API_KEY;
  try {
    const results = await fetchAndRankVideos('baby_feeding', 'anxious', 'low', 'true');
    console.log('Result Count:', results.length);
    console.log('Videos:', results.map(r => ({ title: r.title, id: r.id, source: r.source })));

    // Verifications
    console.log('Returns available videos on API key failure:', results.length > 0 ? '✅' : '❌');
    console.log('Fills full 5 hybrid video slots safely:', results.length === 5 ? '✅' : '❌');
  } catch (err) {
    console.error('Test 5 failed:', err.message);
  } finally {
    // Restore key
    process.env.YOUTUBE_API_KEY = originalKey;
  }
  console.log('\n');

  // Test 6 — Candidate Validation Pipeline
  console.log('--- Test 6 — Candidate Validation Pipeline ---');
  console.log('Testing validateYouTubeVideos with invalid candidate...');
  const { validateYouTubeVideos } = require('./services/youtubeService');
  const mockCandidates = [
    { id: '2OEL4P1Rz04', title: 'Valid Video' },
    { id: 'INVALID_ID_99999', title: 'Invalid Video' }
  ];
  try {
    const validated = await validateYouTubeVideos(mockCandidates, process.env.YOUTUBE_API_KEY);
    console.log('Candidates input count:', mockCandidates.length);
    console.log('Validated output count:', validated.length);
    console.log('Filters out invalid video candidate:', !validated.some(v => v.id === 'INVALID_ID_99999') ? '✅' : '❌');
  } catch (err) {
    console.error('Test 6 failed:', err.message);
  }
  console.log('\n');

  console.log('==================================================');
  console.log('ALL SCENARIO TESTS COMPLETED');
  console.log('==================================================');
}

runTests();
