import { analyzeDiary, getRecommendations } from './emotionEngine.js';
import http from 'http';

const testCases = [
  {
    id: 'TEST 1 — Sinhala Baby Crying + Needs',
    input: "මගේ බබා අද ගොඩක් අඬනවා. ඇයි කියලා මට තේරෙන්නේ නැහැ",
    validateFrontend: (res, rec) => {
      const b = res.babyIntents;
      const game1 = rec.games[0]?.id;
      const passIntents = b.baby_related && b.baby_crying && b.baby_needs;
      const passGame = game1 === 'baby_mood';
      const passNotLoneliness = res.primaryReason !== 'loneliness';
      return passIntents && passGame && passNotLoneliness;
    },
    validateBackend: (data) => {
      const isBaby = data.primaryReason === 'baby_crying' || data.primaryReason === 'baby_needs';
      const passGame = data.recommendations.games[0] === 'baby_mood';
      const passAct = data.recommendations.activities[0] === 'baby_mood';
      return isBaby && passGame && passAct;
    }
  },
  {
    id: 'TEST 2 — Singlish Baby Crying',
    input: "mage baba godak andanawa",
    validateFrontend: (res, rec) => {
      const b = res.babyIntents;
      const game1 = rec.games[0]?.id;
      return b.baby_related && b.baby_crying && game1 === 'baby_mood';
    },
    validateBackend: (data) => {
      return data.primaryReason === 'baby_crying' && data.recommendations.games[0] === 'baby_mood';
    }
  },
  {
    id: 'TEST 3 — Sinhala Baby Feeding',
    input: "මගේ දුවට කිරි දෙන්න මට අමාරුයි",
    validateFrontend: (res, rec) => {
      const b = res.babyIntents;
      const game1 = rec.games[0]?.id;
      return b.baby_related && b.baby_feeding && game1 === 'baby_mood';
    },
    validateBackend: (data) => {
      const isFeeding = data.primaryReason === 'baby_feeding';
      const passGame = data.recommendations.games[0] === 'baby_mood';
      const hasFeedingActs = data.recommendations.activities.includes('new_drink_water');
      return isFeeding && passGame && hasFeedingActs;
    }
  },
  {
    id: 'TEST 4 — Sinhala Baby Sleep',
    input: "මගේ පුතා රෑට නිදාගන්නේ නැහැ",
    validateFrontend: (res, rec) => {
      const b = res.babyIntents;
      const game1 = rec.games[0]?.id;
      return b.baby_related && b.baby_sleep && game1 === 'baby_mood';
    },
    validateBackend: (data) => {
      return data.primaryReason === 'baby_sleep' && data.recommendations.games[0] === 'baby_mood';
    }
  },
  {
    id: 'TEST 5 — Sinhala Mother Fatigue',
    input: "මට අද හරිම මහන්සියි",
    validateFrontend: (res, rec) => {
      const passReason = res.primaryReason === 'fatigue';
      const hasBabyMood = rec.games.some(g => g.id === 'baby_mood');
      return passReason && !hasBabyMood;
    },
    validateBackend: (data) => {
      const passReason = data.primaryReason === 'fatigue';
      const hasBabyMood = data.recommendations.games.includes('baby_mood');
      return passReason && !hasBabyMood;
    }
  },
  {
    id: 'TEST 6 — Singlish Anxiety / Sleep',
    input: "mata godak baya hithenawa saha mata hariyata nidaganna baha",
    validateFrontend: (res, rec) => {
      return res.primaryReason === 'anxiety' || res.primaryReason === 'sleep_problems' || res.secondaryReason === 'sleep_problems' || res.secondaryReason === 'anxiety';
    },
    validateBackend: (data) => {
      return data.primaryReason === 'anxiety' || data.primaryReason === 'sleep_problems';
    }
  },
  {
    id: 'TEST 7 — English Regression Test',
    input: "My baby is crying a lot today and I don't know what she needs.",
    validateFrontend: (res, rec) => {
      const b = res.babyIntents;
      const game1 = rec.games[0]?.id;
      return b.baby_related && b.baby_crying && b.baby_needs && game1 === 'baby_mood';
    },
    validateBackend: (data) => {
      return data.primaryReason === 'baby_crying' && data.recommendations.games[0] === 'baby_mood';
    }
  }
];

function testBackendCase(tc) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ text: tc.input });
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const pass = tc.validateBackend(data);
          resolve({ pass, data });
        } catch (e) {
          resolve({ pass: false, error: e.message, body });
        }
      });
    });
    req.on('error', (e) => {
      resolve({ pass: false, error: e.message });
    });
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING 7 MULTILINGUAL PIPELINE TESTS");
  console.log("=================================================\n");

  let frontendPassed = 0;
  let backendPassed = 0;

  for (const tc of testCases) {
    // 1. Frontend verification
    const analysis = analyzeDiary(tc.input);
    const recommendations = getRecommendations(analysis, [], [], tc.input);
    const fePass = tc.validateFrontend(analysis, recommendations);
    
    if (fePass) {
      frontendPassed++;
      console.log(`✅ [FRONTEND PASS] ${tc.id}`);
    } else {
      console.log(`❌ [FRONTEND FAIL] ${tc.id}`);
      console.log(`   Input: "${tc.input}"`);
      console.log(`   Analysis:`, JSON.stringify(analysis, null, 2));
    }

    // 2. Backend verification
    const beRes = await testBackendCase(tc);
    if (beRes.pass) {
      backendPassed++;
      console.log(`✅ [BACKEND  PASS] ${tc.id}`);
      console.log(`   Reason: ${beRes.data.primaryReason}, Risk: ${beRes.data.riskLevel}`);
      console.log(`   Games: [${beRes.data.recommendations.games.join(', ')}]`);
      console.log(`   Activities: [${beRes.data.recommendations.activities.join(', ')}]\n`);
    } else {
      console.log(`❌ [BACKEND  FAIL] ${tc.id}`);
      console.log(`   Input: "${tc.input}"`);
      if (beRes.error) {
        console.log(`   Error: ${beRes.error}`);
      } else {
        console.log(`   Response:`, JSON.stringify(beRes.data, null, 2));
      }
      console.log('\n');
    }
  }

  console.log("=================================================");
  console.log(`📊 FRONTEND SUMMARY: ${frontendPassed} / ${testCases.length} PASSED`);
  console.log(`📊 BACKEND  SUMMARY: ${backendPassed} / ${testCases.length} PASSED`);
  console.log("=================================================");

  if (frontendPassed < testCases.length || backendPassed < testCases.length) {
    process.exit(1);
  }
}

runTests();
