const { fetchAndRankVideos } = require('./services/youtubeService');

async function testBondingVideos() {
  console.log('=== TESTING BONDING ISSUES VIDEO RECOMMENDATIONS ===\n');

  const testCases = [
    "මගේ බබාට මම ලං වෙලා නැහැ වගේ දැනෙනවා",
    "මට බබා එක්ක ලොකු ආදරයක් දැනෙන්නේ නැහැ",
    "මම බබා දිහා බැලුවාම මට හැඟීමක් නැහැ",
    "I feel emotionally disconnected from my baby",
    "I don't feel a bond with my newborn",
    "I feel distant from my baby even when I am taking care of her",
    "I want to feel closer and more connected to my baby"
  ];

  for (let i = 0; i < testCases.length; i++) {
    const diary = testCases[i];
    console.log(`[TEST ${i+1}] Diary: "${diary}"`);
    const videos = await fetchAndRankVideos('bonding_issues', 'sad', 'low', 'true', diary);
    console.log('  Video #1:', videos[0]?.title, '(', videos[0]?.id, ')');
    console.log('  Video #2:', videos[1]?.title, '(', videos[1]?.id, ')');
    console.log('  Total returned:', videos.length);
    console.log('  All Video Titles:', videos.map(v => v.title));
    
    // Validations:
    const hasJaundice = videos.some(v => (v.title || '').toLowerCase().includes('jaundice'));
    const hasFever = videos.some(v => (v.title || '').toLowerCase().includes('fever'));
    const hasCrying = videos.some(v => (v.title || '').toLowerCase().includes('crying'));
    const hasRelaxation = videos.some(v => (v.title || '').toLowerCase().includes('relaxation music'));
    
    if (!hasJaundice && !hasFever && !hasCrying && !hasRelaxation && videos[0]?.id === 'kQiT2tO3KeE' && videos[1]?.id === '4VuEIeDrwAM') {
      console.log('  ✅ PASS: Bonding-specific videos returned with ZERO unrelated pollution!\n');
    } else {
      console.log('  ❌ FAIL: Unrelated videos found or hardcoded bonding missing!\n');
    }
  }
}

testBondingVideos();
