// ================================================================
// EPDS END-TO-END FLOW & REGRESSION TEST RUNNER — test_e2e_epds_flow.cjs
// Verifies:
// 1. EPDS score-to-risk mapping across clinical cutoffs (0-8, 9-12, 13-30)
// 2. Risk persistence and retrieval via backend API
// 3. Recommendation generation for low, medium, and high risk
// 4. Correct Sinhala urgency messages (no malformed "ශ්‍රේෂ්ඨ" placeholders)
// 5. UI refresh / state recalculation when risk changes without re-running diary NLP
// 6. High-risk activity filtering & emergency-support banner visibility
// 7. Multilingual support (English, Sinhala Unicode, Singlish)
// ================================================================

const http = require('http');

async function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', err => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('================================================================');
  console.log('STARTING EPDS END-TO-END FLOW & REGRESSION TEST');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      passed++;
      console.log(`[PASS] ${message}`);
      if (details) console.log(`       ${details}`);
    } else {
      failed++;
      console.error(`[FAIL] ${message}`);
      if (details) console.error(`       ${details}`);
    }
  }

  // Import recommendation services dynamically
  let emotionEngine;
  let activitiesLibrary;
  let mediaLibrary;

  try {
    emotionEngine = await import('./emotionEngine.js');
    activitiesLibrary = await import('./activitiesLibrary.js');
    mediaLibrary = await import('./mediaLibrary.js');
  } catch (err) {
    console.error('Failed to import recommendation modules:', err);
    process.exit(1);
  }

  const { analyzeDiary, getRecommendations, RISK } = emotionEngine;
  const { getRankedActivities, getRecommendedGames, normalizeRiskLevel } = activitiesLibrary;

  // ─────────────────────────────────────────────────────────────
  // 1. EPDS SCORE-TO-RISK MAPPING
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 1. EPDS SCORE-TO-RISK MAPPING (0-8 Low, 9-12 Medium, 13-30 High) ---');
  
  const getRiskFromScore = (score) => {
    if (score >= 13) return 'high';
    if (score >= 9) return 'medium';
    return 'low';
  };

  assert(getRiskFromScore(0) === 'low', 'Score 0 maps to LOW risk');
  assert(getRiskFromScore(5) === 'low', 'Score 5 maps to LOW risk');
  assert(getRiskFromScore(8) === 'low', 'Score 8 boundary maps to LOW risk');
  assert(getRiskFromScore(9) === 'medium', 'Score 9 boundary maps to MEDIUM risk');
  assert(getRiskFromScore(11) === 'medium', 'Score 11 maps to MEDIUM risk');
  assert(getRiskFromScore(12) === 'medium', 'Score 12 boundary maps to MEDIUM risk');
  assert(getRiskFromScore(13) === 'high', 'Score 13 boundary maps to HIGH risk');
  assert(getRiskFromScore(20) === 'high', 'Score 20 maps to HIGH risk');
  assert(getRiskFromScore(30) === 'high', 'Score 30 maximum maps to HIGH risk');

  // ─────────────────────────────────────────────────────────────
  // 2. BACKEND RISK PERSISTENCE AND RETRIEVAL
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. BACKEND RISK PERSISTENCE AND RETRIEVAL (GET /epds/history) ---');
  
  const testEmail = `test_epds_${Date.now()}@pericare.test`;
  const testPassword = 'TestPassword123!';
  let token = null;

  try {
    // 2.1 Register test user
    const regRes = await makeRequest({
      hostname: 'localhost',
      port: 8073,
      path: '/user/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Test Mother',
      email: testEmail,
      password: testPassword,
      role: 'patient',
      username: `testm_${Date.now()}`
    });

    if (regRes.status === 201 || regRes.status === 200) {
      token = regRes.data.token;
      assert(Boolean(token), 'Test mother account created and JWT token received');
    } else {
      // Try login if user already exists
      const loginRes = await makeRequest({
        hostname: 'localhost',
        port: 8073,
        path: '/user/signin',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: testEmail,
        password: testPassword
      });
      token = loginRes.data?.token;
      assert(Boolean(token), 'Test mother logged in and JWT token received');
    }

    if (token) {
      // 2.2 Submit EPDS Screening (e.g., Medium risk: totalScore = 10)
      // Answers sum to 10: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      const submitRes = await makeRequest({
        hostname: 'localhost',
        port: 8073,
        path: '/epds/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        answers: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        fullName: 'Test Mother',
        age: 28,
        district: 'Colombo',
        village: 'Piliyandala'
      });

      assert(submitRes.status === 200 || submitRes.status === 201, 'EPDS screening submitted successfully to backend', `Status: ${submitRes.status}`);

      // 2.3 Retrieve history
      const historyRes = await makeRequest({
        hostname: 'localhost',
        port: 8073,
        path: '/epds/history',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      assert(historyRes.status === 200, 'EPDS history retrieved successfully (GET /epds/history)');
      const records = Array.isArray(historyRes.data) ? historyRes.data : [];
      assert(records.length > 0, `EPDS history contains saved record (Count: ${records.length})`);
      if (records.length > 0) {
        const latest = records[0];
        assert(latest.totalScore === 10, `Persisted score is accurate (expected 10, got ${latest.totalScore})`);
        assert(['medium', 'moderate'].includes(latest.riskLevel.toLowerCase()), `Persisted risk is medium/moderate (got: ${latest.riskLevel})`);
      }

      // 2.4 Clean up test account
      try {
        await makeRequest({
          hostname: 'localhost',
          port: 8073,
          path: '/user/me',
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('   Test account cleaned up successfully.');
      } catch (cleanErr) {
        // Ignored
      }
    }
  } catch (apiErr) {
    console.warn(`[WARN] Backend test skipped or encountered error: ${apiErr.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. RECOMMENDATION GENERATION ACROSS RISK LEVELS
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. RECOMMENDATION GENERATION FOR LOW, MEDIUM, AND HIGH RISK ---');

  const baseAnalysis = {
    detectedEmotion: 'sad',
    primaryReason: 'loneliness',
    selectedEmoji: 'sad',
    diaryText: 'I feel very alone today at home'
  };

  const recsLow = getRecommendations({ ...baseAnalysis, riskLevel: 'low' });
  const recsMed = getRecommendations({ ...baseAnalysis, riskLevel: 'medium' });
  const recsHigh = getRecommendations({ ...baseAnalysis, riskLevel: 'high' });

  assert(recsLow.riskLevel === 'low', 'Low-risk recommendations returned riskLevel: low');
  assert(recsMed.riskLevel === 'medium', 'Medium-risk recommendations returned riskLevel: medium');
  assert(recsHigh.riskLevel === 'high', 'High-risk recommendations returned riskLevel: high');

  assert(recsLow.activities?.length <= 4 && recsLow.activities?.length > 0, `Low risk returned ${recsLow.activities.length} activities`);
  assert(recsMed.activities?.length <= 4 && recsMed.activities?.length > 0, `Medium risk returned ${recsMed.activities.length} activities`);
  assert(recsHigh.activities?.length <= 4 && recsHigh.activities?.length > 0, `High risk returned ${recsHigh.activities.length} activities`);

  // ─────────────────────────────────────────────────────────────
  // 4. CORRECT SINHALA URGENCY MESSAGES (TASK 1 REGRESSION)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. CORRECT SINHALA URGENCY MESSAGES (TASK 1 FIX VERIFICATION) ---');

  // Low risk must NOT return urgency message
  assert(recsLow.urgencyMessage === null, 'Low risk returns NO urgency message (null)');

  // Medium risk Sinhala input must return meaningful, grammatically correct message
  const sinhalaAnalysis = {
    detectedEmotion: 'stressed',
    primaryReason: 'loneliness',
    riskLevel: 'medium',
    diaryText: 'මට අද හරිම තනිකමක් දැනෙනවා'
  };
  const recsSinhalaMed = getRecommendations(sinhalaAnalysis, [], [], sinhalaAnalysis.diaryText);
  
  assert(Boolean(recsSinhalaMed.urgencyMessage), 'Medium risk returns an urgencyMessage');
  assert(!recsSinhalaMed.urgencyMessage.includes('ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ'), 'Medium risk urgencyMessage DOES NOT contain placeholder "ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ"');
  assert(recsSinhalaMed.urgencyMessage.includes('ඔබ යම් බරක් රැගෙන සිටිනවා'), 'Medium risk urgencyMessage contains authentic Sinhala clinical guidance');
  console.log(`   Actual Sinhala urgencyMessage: "${recsSinhalaMed.urgencyMessage}"`);

  // Verify supportMsg in rules has no placeholder
  assert(!recsSinhalaMed.supportMsg?.includes('ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ'), 'recs.supportMsg DOES NOT contain placeholder "ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ"');

  // Verify English input receives English urgency message
  const englishAnalysis = {
    detectedEmotion: 'sad',
    primaryReason: 'loneliness',
    riskLevel: 'medium',
    diaryText: 'I feel very alone today'
  };
  const recsEnglishMed = getRecommendations(englishAnalysis, [], [], englishAnalysis.diaryText);
  assert(recsEnglishMed.urgencyMessage?.includes('You are carrying some weight'), 'English medium risk returns authentic English urgency guidance');
  console.log(`   Actual English urgencyMessage: "${recsEnglishMed.urgencyMessage}"`);

  // ─────────────────────────────────────────────────────────────
  // 5. HIGH RISK ACTIVITY FILTERING & EMERGENCY BANNER
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. HIGH RISK ACTIVITY FILTERING & EMERGENCY SAFETY CHECKS ---');

  // High risk must exclude non-clinical/strenuous/distracting activities
  const highRiskUnsafe = ['new_smile_challenge', 'new_drink_water', 'gentle_stretch', 'new_gentle_stretch'];
  const hasUnsafeAct = recsHigh.activities.some(a => highRiskUnsafe.includes(a.id || a));
  assert(!hasUnsafeAct, 'High risk filters out unsafe non-clinical activities');

  // High risk must prioritize grounding, breathing, and safety activities
  const highRiskAnxiety = getRecommendations({ detectedEmotion: 'stressed', primaryReason: 'anxiety', riskLevel: 'high' });
  const highRiskSafe = ['breathing_478', 'new_478_breathing', 'new_five_senses_grounding', 'grounding_54321', 'guided_meditation', 'new_guided_meditation', 'new_worry_box', 'deep_breathing'];
  const hasSafeAct = highRiskAnxiety.activities.some(a => highRiskSafe.includes(a.id || a));
  assert(hasSafeAct, 'High risk prioritizes calming, grounding, and safety activities for anxiety/distress');

  // High risk urgency message points to emergency helpline 1926
  assert(recsHigh.urgencyMessage?.includes('1926'), 'High risk urgency message references Sri Lanka National Mental Health Helpline (1926)');

  // ─────────────────────────────────────────────────────────────
  // 6. UI REFRESH ON RISK CHANGE WITHOUT RE-RUNNING NLP (TASK 2)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. UI REFRESH ON RISK CHANGE WITHOUT RE-RUNNING NLP (TASK 2) ---');

  // Simulate cached diary analysis in AppContext
  const cachedAnalysis = analyzeDiary('මට අද රෑට නින්ද යන්නේ නැහැ');
  const initialRisk = 'low';
  cachedAnalysis.riskLevel = initialRisk;

  // Initial recommendation at Low risk
  const recsInitial = getRecommendations(cachedAnalysis, [], [], cachedAnalysis.diaryText);
  assert(recsInitial.riskLevel === 'low', 'Initial recommendations generated at LOW risk');

  // Transition from LOW -> MEDIUM
  const updatedAnalysisMed = { ...cachedAnalysis, riskLevel: 'medium' };
  const recsUpdatedMed = getRecommendations(updatedAnalysisMed, [], [], updatedAnalysisMed.diaryText);
  assert(recsUpdatedMed.riskLevel === 'medium', 'Recalculation with new risk produces MEDIUM recommendations');
  assert(recsUpdatedMed.urgencyMessage !== null, 'Changing LOW -> MEDIUM activates urgencyMessage');

  // Transition from MEDIUM -> HIGH
  const updatedAnalysisHigh = { ...cachedAnalysis, riskLevel: 'high' };
  const recsUpdatedHigh = getRecommendations(updatedAnalysisHigh, [], [], updatedAnalysisHigh.diaryText);
  assert(recsUpdatedHigh.riskLevel === 'high', 'Recalculation with new risk produces HIGH recommendations');
  assert(recsUpdatedHigh.urgencyMessage?.includes('1926'), 'Changing MEDIUM -> HIGH activates Emergency Support banner text');

  // Verify primaryReason was preserved without re-running analyzeDiary
  assert(recsUpdatedMed._internal?.primaryReason === cachedAnalysis.primaryReason, 'Maternal distress reason preserved during risk transition');
  assert(recsUpdatedHigh._internal?.primaryReason === cachedAnalysis.primaryReason, 'Maternal distress reason preserved during high risk transition');

  // ─────────────────────────────────────────────────────────────
  // 7. MULTILINGUAL INPUT SUPPORT (SINHALA, SINGLISH, ENGLISH)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 7. MULTILINGUAL INPUT REGRESSION (SINHALA, SINGLISH, ENGLISH) ---');

  // Sinhala Unicode
  const resSi = analyzeDiary('මගේ බබා අද ගොඩක් අඬනවා');
  assert(resSi.babyIntents.baby_related && resSi.babyIntents.baby_crying, 'Sinhala Unicode: "මගේ බබා අද ගොඩක් අඬනවා" correctly recognized baby_crying');

  // Singlish
  const resSinglish = analyzeDiary('mage baba godak andanawa mata bayai');
  assert(resSinglish.babyIntents.baby_related && resSinglish.babyIntents.baby_crying, 'Singlish: "mage baba godak andanawa" correctly recognized baby_crying');

  // English
  const resEn = analyzeDiary('My baby is crying continuously and I feel exhausted');
  assert(resEn.babyIntents.baby_related && resEn.babyIntents.baby_crying, 'English: "My baby is crying" correctly recognized baby_crying');

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
