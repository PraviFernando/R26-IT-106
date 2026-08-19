// ================================================================
// SYSTEM TEST RUNNER — test_system.cjs
// Consolidates all multilingual pipeline tests into one run
// ================================================================

async function runTests() {
  console.log("====================================");
  console.log("RUNNING COMPLETE SYSTEM TEST");
  console.log("====================================\n");

  let emotionEngine;
  try {
    // Dynamic import to support ES Module inside CommonJS context
    emotionEngine = await import('./emotionEngine.js');
  } catch (err) {
    console.error("❌ Failed to import emotionEngine.js:", err.message);
    process.exit(1);
  }

  const { analyzeDiary, getRecommendations } = emotionEngine;

  const testCases = [
    {
      id: 'Test 1 - Sinhala Baby Crying',
      input: "මගේ බබා අද ගොඩක් අඬනවා. ඇයි කියලා මට තේරෙන්නේ නැහැ",
      validate: (res, rec) => {
        const b = res.babyIntents;
        const game1 = rec.games[0]?.id;
        const passIntents = b.baby_related && b.baby_crying && b.baby_needs;
        const passGame = game1 === 'baby_mood';
        
        // Limits and duplicates constraints checks
        const gamesCount = rec.games?.length || 0;
        const actsCount = rec.activities?.length || 0;
        const babyMoodCount = rec.games?.filter(g => g.id === 'baby_mood').length || 0;
        
        const uniqueGames = new Set(rec.games?.map(g => g.id || g));
        const uniqueActs = new Set(rec.activities?.map(a => a.id || a));
        const noDuplicates = uniqueGames.size === gamesCount && uniqueActs.size === actsCount;

        const pass = passIntents && passGame && gamesCount <= 4 && actsCount <= 4 && babyMoodCount === 1 && noDuplicates;
        return {
          pass,
          details: `baby_related: ${b.baby_related}, crying: ${b.baby_crying}, needs: ${b.baby_needs}, Game #1: ${game1}, games: ${gamesCount}, activities: ${actsCount}, baby_mood count: ${babyMoodCount}, noDuplicates: ${noDuplicates}`
        };
      }
    },
    {
      id: 'Test 2 - Singlish Baby Crying',
      input: "mage baba godak andanawa",
      validate: (res, rec) => {
        const b = res.babyIntents;
        const game1 = rec.games[0]?.id;
        const passIntents = b.baby_related && b.baby_crying;
        const passGame = game1 === 'baby_mood';
        return {
          pass: passIntents && passGame,
          details: `baby_related: ${b.baby_related}, crying: ${b.baby_crying}, Game #1: ${game1}`
        };
      }
    },
    {
      id: 'Test 3 - Sinhala Baby Feeding',
      input: "මගේ දුවට කිරි දෙන්න මට අමාරුයි",
      validate: (res, rec) => {
        const b = res.babyIntents;
        const game1 = rec.games[0]?.id;
        const passIntents = b.baby_related && b.baby_feeding;
        const passGame = game1 === 'baby_mood';
        return {
          pass: passIntents && passGame,
          details: `baby_related: ${b.baby_related}, feeding: ${b.baby_feeding}, Game #1: ${game1}`
        };
      }
    },
    {
      id: 'Test 4 - Sinhala Baby Sleep',
      input: "මගේ පුතා රෑට නිදාගන්නේ නැහැ",
      validate: (res, rec) => {
        const b = res.babyIntents;
        const game1 = rec.games[0]?.id;
        const passIntents = b.baby_related && b.baby_sleep;
        const passGame = game1 === 'baby_mood';
        return {
          pass: passIntents && passGame,
          details: `baby_related: ${b.baby_related}, sleep: ${b.baby_sleep}, Game #1: ${game1}`
        };
      }
    },
    {
      id: 'Test 5 - Sinhala Mother Fatigue',
      input: "මට අද හරිම මහන්සියි",
      validate: (res, rec) => {
        const passReason = res.primaryReason === 'fatigue';
        const hasBabyMood = rec.games?.some(g => g.id === 'baby_mood') || false;
        return {
          pass: passReason && !hasBabyMood,
          details: `primaryReason: ${res.primaryReason}, hasBabyMood: ${hasBabyMood}`
        };
      }
    },
    {
      id: 'Test 6 - Singlish Anxiety and Sleep',
      input: "mata godak baya hithenawa saha mata hariyata nidaganna baha",
      validate: (res, rec) => {
        const passReason = res.primaryReason === 'anxiety' || res.primaryReason === 'sleep_problems' || res.secondaryReason === 'sleep_problems' || res.secondaryReason === 'anxiety';
        return {
          pass: passReason,
          details: `primaryReason: ${res.primaryReason}, secondaryReason: ${res.secondaryReason}`
        };
      }
    },
    {
      id: 'Test 7 - English Regression',
      input: "My baby is crying a lot today and I don't know what she needs.",
      validate: (res, rec) => {
        const b = res.babyIntents;
        const game1 = rec.games[0]?.id;
        const passIntents = b.baby_related && b.baby_crying && b.baby_needs;
        const passGame = game1 === 'baby_mood';
        return {
          pass: passIntents && passGame,
          details: `baby_related: ${b.baby_related}, crying: ${b.baby_crying}, needs: ${b.baby_needs}, Game #1: ${game1}`
        };
      }
    }
  ];

  let passedCount = 0;

  testCases.forEach((tc) => {
    const analysis = analyzeDiary(tc.input);
    const recommendations = getRecommendations(analysis, [], [], tc.input);
    const result = tc.validate(analysis, recommendations);

    if (result.pass) {
      passedCount++;
      console.log(`[PASS] ${tc.id}`);
      console.log(`   Input: "${tc.input}"`);
      console.log(`   Details: ${result.details}\n`);
    } else {
      console.log(`[FAIL] ${tc.id}`);
      console.log(`   Input: "${tc.input}"`);
      console.log(`   Details: ${result.details}`);
      console.log(`   Analysis:`, JSON.stringify(analysis, null, 2), `\n`);
    }
  });

  console.log("====================================");
  console.log("RESULTS");
  console.log("====================================");
  console.log(`Total: ${testCases.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${testCases.length - passedCount}`);
  console.log("====================================");

  if (passedCount < testCases.length) {
    process.exit(1);
  }
}

runTests();
