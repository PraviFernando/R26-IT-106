require('dotenv').config();
const axios = require('axios');
const { fetchAndRankVideos } = require('./services/youtubeService');
const { analyzeDiary } = require('../frontend/services/emotionEngine');

// Mock API candidates per reason to test API success when quota 429 occurs
const MOCK_API_CANDIDATES = {
  bonding_issues: [
    { id: 'api_bond_1', title: 'Postpartum Mother-Baby Attachment & Bonding Guide', description: 'Connecting with your baby.', channelTitle: 'Maternal Health Channel' },
    { id: 'api_bond_2', title: 'Building Emotional Connection with Newborn', description: 'Skin-to-skin and bonding tips.', channelTitle: 'Newborn Care' }
  ],
  loneliness: [
    { id: 'api_lone_1', title: 'Postpartum Loneliness & Isolation Support for Mothers', description: 'Overcoming isolation.', channelTitle: 'Mom Support' },
    { id: 'api_lone_2', title: 'Finding Community and Support in Motherhood', description: 'Connecting with other moms.', channelTitle: 'Maternal Wellness' }
  ],
  lack_of_support: [
    { id: 'api_supp_1', title: 'Postpartum Lack of Support & Coping for Mothers', description: 'How to seek help.', channelTitle: 'Parenting Care' },
    { id: 'api_supp_2', title: 'Communicating Support Needs with Your Partner', description: 'Partner assistance guide.', channelTitle: 'Family Support' }
  ],
  sleep_problems: [
    { id: 'api_sleep_1', title: 'Postpartum Sleep Deprivation & Rest Tips for Mothers', description: 'Managing maternal sleep.', channelTitle: 'Sleep Science' },
    { id: 'api_sleep_2', title: 'How to Sleep Better as a New Mother', description: 'Restful sleep strategies.', channelTitle: 'Health Today' }
  ],
  anxiety: [
    { id: 'api_anx_1', title: 'Postpartum Anxiety Coping Techniques & Calming Support', description: 'Relieving anxiety.', channelTitle: 'Mindfulness Today' },
    { id: 'api_anx_2', title: 'Calming Breathing Exercises for Postpartum Anxiety', description: 'Breathing for anxiety.', channelTitle: 'Wellness Hub' }
  ],
  overwhelmed: [
    { id: 'api_over_1', title: 'Postpartum Overwhelmed Daily Responsibilities Management', description: 'Managing task stress.', channelTitle: 'Mom Life' },
    { id: 'api_over_2', title: 'Balancing Household Tasks and New Baby', description: 'Time management tips.', channelTitle: 'Family Life' }
  ],
  relationship_family_problem: [
    { id: 'api_rel_1', title: 'Postpartum Relationship Problems & Partner Communication', description: 'Managing marriage stress.', channelTitle: 'Family Therapy' },
    { id: 'api_rel_2', title: 'Resolving Post-Baby Conflict with Your Partner', description: 'Partner communication.', channelTitle: 'Couples Support' }
  ]
};

// Override axios.get to return deterministic 2 YouTube API candidates for testing hybrid composition
axios.get = async function(url, config) {
  const q = (config?.params?.q || '').toLowerCase();
  let matchedReason = 'loneliness';
  if (q.includes('bonding') || q.includes('attachment')) matchedReason = 'bonding_issues';
  else if (q.includes('anxiety') || q.includes('anxious')) matchedReason = 'anxiety';
  else if (q.includes('sleep')) matchedReason = 'sleep_problems';
  else if (q.includes('support')) matchedReason = 'lack_of_support';
  else if (q.includes('overwhelmed') || q.includes('responsibilities')) matchedReason = 'overwhelmed';
  else if (q.includes('relationship') || q.includes('partner')) matchedReason = 'relationship_family_problem';

  const items = (MOCK_API_CANDIDATES[matchedReason] || MOCK_API_CANDIDATES.loneliness).map(c => ({
    id: { videoId: c.id },
    snippet: {
      title: c.title,
      description: c.description,
      channelTitle: c.channelTitle,
      thumbnails: { default: { url: `https://img.youtube.com/vi/${c.id}/0.jpg` } }
    }
  }));
  return { data: { items } };
};

const TEST_CASES = [
  {
    id: 1,
    name: 'BONDING ISSUES',
    text: 'මගේ බබාට මම ලං වෙලා නැහැ වගේ දැනෙනවා',
    expectedReason: 'bonding_issues',
    forbiddenKeywords: ['jaundice', 'fever', 'sick', 'illness', 'cough', 'sleep', 'sleeping', 'feed', 'feeding', 'breastfeed', 'crying', 'colic', 'cognitive', 'financial', 'budget', 'marriage', 'husband', 'c section', 'recovery', 'workout']
  },
  {
    id: 2,
    name: 'LONELINESS',
    text: 'I feel completely alone and nobody talks to me',
    expectedReason: 'loneliness',
    forbiddenKeywords: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'feeding', 'workout']
  },
  {
    id: 3,
    name: 'LACK OF SUPPORT',
    text: 'My husband does not help me with the baby and I feel unsupported',
    expectedReason: 'lack_of_support',
    forbiddenKeywords: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'feeding', 'workout']
  },
  {
    id: 4,
    name: 'SLEEP PROBLEMS',
    text: 'I cannot sleep even when my baby is sleeping',
    expectedReason: 'sleep_problems',
    forbiddenKeywords: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'feeding', 'colic', 'cognitive', 'financial', 'marriage', 'husband', 'workout']
  },
  {
    id: 5,
    name: 'ANXIETY',
    text: 'I feel anxious and constantly worry that something bad will happen',
    expectedReason: 'anxiety',
    forbiddenKeywords: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'financial', 'marriage']
  },
  {
    id: 6,
    name: 'OVERWHELMED',
    text: 'I feel overwhelmed because I have too many responsibilities',
    expectedReason: 'overwhelmed',
    forbiddenKeywords: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'cognitive', 'financial', 'marriage']
  },
  {
    id: 7,
    name: 'RELATIONSHIP / FAMILY',
    text: 'I am having problems with my husband and family after the baby',
    expectedReason: 'relationship_family_problem',
    forbiddenKeywords: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'crying', 'feeding', 'breastfeed']
  }
];

async function runTests() {
  console.log('==================================================');
  console.log('PERICARE 3 CURATED + 2 YOUTUBE API HYBRID TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;

  for (const tc of TEST_CASES) {
    console.log(`--- TEST ${tc.id} — ${tc.name} ---`);
    console.log(`Input text: "${tc.text}"`);

    const analysis = analyzeDiary(tc.text);
    console.log(`Detected Reason: ${analysis.primaryReason} (Expected: ${tc.expectedReason})`);
    console.log(`Detected Emotion: ${analysis.detectedEmotion}`);

    const isBaby = analysis.babyIntents?.baby_related || ['baby_feeding', 'baby_sleep', 'baby_crying', 'understanding_baby', 'baby_health', 'bonding_issues'].includes(analysis.primaryReason);

    const videos = await fetchAndRankVideos(
      analysis.primaryReason,
      analysis.detectedEmotion,
      analysis.riskLevel,
      isBaby,
      tc.text
    );

    const curatedCount = videos.filter(v => v.source === 'curated').length;
    const apiCount = videos.filter(v => v.source === 'youtube_api').length;
    const totalCount = videos.length;

    console.log(`\nFinal Video Output (${totalCount}):`);
    videos.forEach((v, i) => {
      console.log(`  ${i + 1}. [${v.source}] [${v.id}] ${v.title}`);
    });

    let pass = true;

    if (analysis.primaryReason !== tc.expectedReason) {
      console.log(`❌ FAIL: Expected reason "${tc.expectedReason}", got "${analysis.primaryReason}"`);
      pass = false;
    }

    if (totalCount !== 5) {
      console.log(`❌ FAIL: Total video count is ${totalCount}, expected 5!`);
      pass = false;
    }

    if (curatedCount !== 3) {
      console.log(`❌ FAIL: Curated count is ${curatedCount}, expected 3!`);
      pass = false;
    }

    if (apiCount !== 2) {
      console.log(`❌ FAIL: YouTube API count is ${apiCount}, expected 2!`);
      pass = false;
    }

    // Check for forbidden cross-category keywords
    const violations = [];
    videos.forEach(v => {
      const titleLower = (v.title || '').toLowerCase();
      tc.forbiddenKeywords.forEach(kw => {
        if (titleLower.includes(kw)) {
          violations.push({ videoId: v.id, title: v.title, forbiddenKeyword: kw });
        }
      });
    });

    if (violations.length > 0) {
      console.log(`❌ FAIL: Forbidden cross-category keywords detected:`, violations);
      pass = false;
    }

    if (pass) {
      console.log(`✅ PASS: Reason correct, 5 videos total (3 curated + 2 youtube_api), 0 cross-category pollution!\n`);
      passed++;
    } else {
      console.log(`❌ FAIL\n`);
    }
  }

  console.log('==================================================');
  console.log(`SUMMARY: ${passed} / ${TEST_CASES.length} Passed`);
  console.log('==================================================');
}

runTests();

