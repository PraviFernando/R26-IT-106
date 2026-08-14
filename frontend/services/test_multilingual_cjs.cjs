// CJS Test Runner for emotionEngine
const emotionEngine = require('./emotionEngine.js');
const { analyzeDiary, getRecommendations } = emotionEngine;

const testCases = [
  {
    id: 'TEST 1 — Sinhala Baby Crying + Needs',
    input: "මගේ බබා අද ගොඩක් අඬනවා. ඇයි කියලා මට තේරෙන්නේ නැහැ",
    validate: (res, rec) => {
      const b = res.babyIntents;
      const game1 = rec.games[0]?.id;
      const passIntents = b.baby_related && b.baby_crying && b.baby_needs;
      const passGame = game1 === 'baby_mood';
      const passNotLoneliness = res.primaryReason !== 'loneliness';
      return {
        pass: passIntents && passGame && passNotLoneliness,
        details: `baby_related: ${b.baby_related}, crying: ${b.baby_crying}, needs: ${b.baby_needs}, primaryReason: ${res.primaryReason}, Game #1: ${game1}`
      };
    }
  },
  {
    id: 'TEST 2 — Singlish Baby Crying',
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
    id: 'TEST 3 — Sinhala Baby Feeding',
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
    id: 'TEST 4 — Sinhala Baby Sleep',
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
    id: 'TEST 5 — Sinhala Mother Fatigue',
    input: "මට අද හරිම මහන්සියි",
    validate: (res, rec) => {
      const passReason = res.primaryReason === 'fatigue';
      const hasBabyMood = rec.games.some(g => g.id === 'baby_mood');
      return {
        pass: passReason && !hasBabyMood,
        details: `primaryReason: ${res.primaryReason}, hasBabyMood: ${hasBabyMood}`
      };
    }
  },
  {
    id: 'TEST 6 — Singlish Anxiety / Sleep',
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
    id: 'TEST 7 — English Regression Test',
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

console.log("=================================================");
console.log("🧪 RUNNING 7 MULTILINGUAL PIPELINE TESTS (CJS)");
console.log("=================================================\n");

let passedCount = 0;

testCases.forEach((tc) => {
  const analysis = analyzeDiary(tc.input);
  const recommendations = getRecommendations(analysis, [], [], tc.input);
  const result = tc.validate(analysis, recommendations);

  if (result.pass) {
    passedCount++;
    console.log(`✅ [PASS] ${tc.id}`);
    console.log(`   Input: "${tc.input}"`);
    console.log(`   Details: ${result.details}\n`);
  } else {
    console.log(`❌ [FAIL] ${tc.id}`);
    console.log(`   Input: "${tc.input}"`);
    console.log(`   Details: ${result.details}`);
    console.log(`   Full Analysis:`, JSON.stringify(analysis._debug || analysis, null, 2), `\n`);
  }
});

console.log("=================================================");
console.log(`📊 SUMMARY: ${passedCount} / ${testCases.length} TESTS PASSED`);
console.log("=================================================");

if (passedCount < testCases.length) {
  process.exit(1);
}
