// ================================================================
// EMOTION ENGINE — emotionEngine.js
// ================================================================
// EXACT LOGIC:
//   diary text → detectEmotion + detectReason → riskLevel
//   reason + riskLevel → getRecommendationRule()
//   → specific music, video, activities, game
//
// EXAMPLES:
//   Reason=Anxiety,  Mood=Stressed, Risk=Medium → breathing_478, guided_meditation + bubble_pop
//   Reason=Bonding,  Mood=Sad,      Risk=Medium → baby_mood + baby_interaction
//   Reason=Sleep,    Mood=Stressed, Risk=Medium → night_breathing, rest_meditation + colouring
//   Reason=LackSupp, Mood=Sad,      Risk=Low    → gratitude_writing + affirmation_game
// ================================================================

import { getEnhancedRecommendationRule, getPersonalizedRecommendations, isBabyRelatedReason, isBabyRelatedContent } from './activitiesLibrary.js';
import { MUSIC_LIBRARY, VIDEO_LIBRARY } from './mediaLibrary.js';

export { getPersonalizedRecommendations, isBabyRelatedReason, isBabyRelatedContent };

export const RISK = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };

// ── KEYWORD MAPS (Sinhala, English & Singlish) ─────────────
const REASON_KW = {
  baby_crying:          ['crying', 'cries', 'cry all night', 'crying all night', 'keeps crying', 'restless', 'she keeps crying', 'he keeps crying',
                         'අඬනවා', 'ගොඩක් අඬනවා', 'නවත්තන්න බැහැ', 'අඬන බබා', 'බබා අඬනවා', 'දරුවා අඬනවා', 'අඬලා', 'අඬන', 'නොසන්සුන්', 'කරදරයි',
                         'andanawa', 'andana', 'andala'],
  baby_feeding:         ['feeding', 'breastfeeding', 'nursing', 'bottle', 'milk', 'not feeding', 'hungry',
                         'කිරි', 'කිරි දෙනවා', 'කිරි බොන්නේ නැහැ', 'කිරි දීම', 'මව්කිරි', 'බෝතලයෙන් කිරි', 'බබා කිරි බොන්නේ නැහැ', 'බබාට කිරි දෙන්න', 'බබාට බඩගිනියි', 'කිරි දෙන්න', 'බඩගිනි',
                         'kiri', 'kiri denawa', 'kiri bonne naha'],
  baby_sleep:           ['baby sleep', 'newborn sleep', 'won\'t sleep', 'wont sleep', 'not sleeping', 'awake all night', 'waking up', 'wakes up',
                         'නින්ද', 'නිදාගන්නේ නැහැ', 'නිදාගන්නෙ නැහැ', 'රෑට නිදාගන්නේ නැහැ', 'බබා නිදාගන්නේ නැහැ', 'බබාට නින්ද යන්නේ නැහැ', 'නින්ද නැහැ', 'නිදාගන්න', 'නින්දක්වත් නැහැ', 'ඇහැරෙනවා',
                         'ninda', 'nidaganne naha', 'ninda yanne naha'],
  baby_health:          ['fever', 'cough', 'sick', 'vomiting', 'temperature', 'baby health', 'baby fever',
                         'උණ', 'උණ තියෙනවා', 'කැස්ස', 'සෙම්ප්‍රතිශ්‍යාව', 'සෙම්ප්රතිශ්යාව', 'අසනීප', 'වමනය', 'ශරීර උෂ්ණත්වය', 'බබාට උණ', 'දරුවා අසනීපයි',
                         'una', 'asaneepa', 'kassa'],
  caring_for_baby:      ['understanding baby', 'caring for baby', 'baby needs', 'don\'t know what baby needs', 'how to care', 'don\'t know what she wants', 'don\'t know what he wants', 'dont know what she wants', 'dont know what he wants', 'baby cues', 'baby signals',
                         'understand', 'cannot understand', 'i don\'t know', 'i dont know', 'confused about',
                         'බලාගන්න අමාරුයි', 'බබාව බලාගන්න', 'දරුවා බලාගන්න', 'මොනවා කරන්නද දන්නේ නැහැ', 'තේරෙන්නේ නැහැ', 'බබාගේ අවශ්‍යතා', 'දරුවාගේ අවශ්‍යතා', 'අවශ්‍යතා', 'දන්නේ නැහැ',
                         'balaganna amarui', 'therenne naha'],
  loneliness:           ['alone', 'lonely', 'isolated', 'nobody', 'no one', 'miss', 'empty', 'no friends', 'left out',
                         'තනිකම', 'තනියි', 'මට කතා කරන්න කෙනෙක් නැහැ', 'කවුරුත් නැහැ', 'තනියම', 'හිතට සහාය නැහැ', 'කෙනෙකු නැහැ',
                         'thanikama', 'thaniyi'],
  fatigue:              ['tired', 'exhausted', 'drained', 'no energy', 'worn out', 'sleepy', 'burnt out', 'sluggish',
                         'මහන්සියි', 'ගොඩක් මහන්සියි', 'අමාරුයි', 'හරිම මහන්සියි', 'මහන්සි', 'වෙහෙසෙනවා', 'ශක්තිය නැහැ', 'ඉවසන්න බැහැ',
                         'mahansiyi', 'mahansi', 'hari mahansiy'],
  anxiety:              ['anxious', 'worried', 'panic', 'scared', 'nervous', 'overthinking', 'heart racing', 'restless', 'fussy',
                         'බයයි', 'කනස්සල්ල', 'කලබලයි', 'හිතට බයයි', 'හිත කරදරයි', 'ගොඩක් කනස්සල්ලෙන්', 'මට බය හිතෙනවා', 'බය', 'කනස්සල්ලෙන්', 'හිතේ සැරදෙනවා',
                         'bayayi', 'kanassalla', 'kalabalai', 'baya'],
  bonding_issues:       ['bond', 'bonding', 'feel nothing', 'not attached', 'distant from baby', 'no connection', 'indifferent',
                         'සම්බන්ධයක් නැහැ', 'ළදරුවා සමඟ සම්බන්ධ නොවෙනවා', 'හැඟීමක් නැහැ', 'ළදරුවාට ආදරයක් නැහැ', 'බබාව ආදරය කරන්න බැහැ'],
  lack_of_support:      ['husband', 'partner', 'no help', 'unsupported', 'nobody helps', 'no family', 'doing it alone',
                         'සහාය නැහැ', 'කෙනෙකු උදව් කරන්නේ නැහැ', 'ස්වාමිපුරුෂයා', 'පවුල නැහැ', 'තනියම කරන්නේ', 'උදව් නැහැ', 'හාමිගෙ සහාය නැහැ'],
  sleep_problems:       ['sleep', 'insomnia', 'awake all night', 'sleep deprived', 'cant sleep', 'no sleep', 'exhausted',
                         'නිදාගන්නේ නැහැ', 'නින්ද නොයාම', 'නිදාගන්න බැහැ', 'රෑ නිදාගන්නේ නැහැ', 'නින්දක්වත් නැහැ'],
  loss_of_confidence:   ['confidence', 'self-doubt', 'failure', 'bad mother', 'useless', 'not capable', 'worthless',
                         'විශ්වාසය නැහැ', 'අසාර්ථකයි', 'නරක අම්මා', 'කරගන්න බැහැ', 'කිසිවක් දන්නේ නැහැ', 'ලොකු වරදක්', 'ආත්ම විශ්වාසය නැහැ'],
  overwhelmed:          ['overwhelmed', 'too much', 'drowning', 'breaking down', 'cant cope', 'too hard', 'falling apart',
                         'දරාගන්න අමාරුයි', 'හරිම බරයි', 'හැමදේම වැඩියි', 'කිසි දෙයක් කරගන්න බැහැ', 'වැඩියි', 'හිත ගෙවෙනවා', 'ඉවසන්න බැහැ', 'ගොඩ ගන්නේ නැහැ',
                         'daraganna amarui'],
  physical_discomfort:  ['pain', 'hurt', 'sore', 'c-section', 'recovery', 'stitches', 'body aches', 'discomfort',
                         'වේදනාව', 'රිදෙනවා', 'ශරීරේ රිදෙනවා', 'සීසේරියන්', 'සුව වෙනවා', 'ශරීරය', 'දරුව ලැබුණාට පස්සේ', 'රිදීම'],
  negative_thoughts:    ['hopeless', 'hate myself', 'dark', 'disappear', 'dark thoughts', 'no point', 'worthless',
                         'බලාපොරොත්තු නැහැ', 'මා ගැනම වෛරයි', 'අඳුරු හිතුවිලි', 'නැතිව යන්නත් හිතෙනවා', 'ජීවිතේ නිෂ්ඵලයි', 'ඉවරයි'],
};

const EMOTION_KW = {
  happy:    ['happy', 'joy', 'smile', 'grateful', 'wonderful', 'positive', 'hopeful', 'great', 'good day',
             'සතුටුයි', 'සතුටින්', 'ලස්සන දවසක්', 'සන්තෝෂයි', 'හොඳ දවසක්', 'ප්‍රීතිමත්',
             'satutuyi'],
  sad:      ['sad', 'cry', 'unhappy', 'depressed', 'hopeless', 'hurt', 'empty', 'down', 'devastated',
             'දුකයි', 'දුකින්', 'හිත දුකයි', 'අඬන්න හිතෙනවා', 'අසරණයි', 'ශෝකයෙන්', 'හිත හිරිවෙලා',
             'dukai', 'dukin'],
  stressed: ['stress', 'overwhelmed', 'tense', 'frustrated', 'on edge', 'pressure', 'anxious', 'irritated',
             'කේන්තියි', 'කෝපයි', 'තරහයි', 'හරිම තරහයි', 'ආතතිය', 'කලබලෙන්', 'නොසන්සුන්', 'බරයි', 'කරදරයි', 'ගොඩ ගන්නේ නැහැ',
             'kenthayi', 'tarahai'],
};


// These reasons + sad mood = medium risk automatically
const HIGH_RISK_REASONS = new Set([
  'negative_thoughts', 'bonding_issues', 'loss_of_confidence', 'lack_of_support',
]);

const HIGH_CRISIS_KW = [
  'hopeless', 'want to die', 'end it all', 'cannot control my emotions',
  'cant control my emotions', 'panic very easily', 'failing as a mother',
  'disappear', 'hate myself', 'dark thoughts', 'panic',
  'මැරෙන්න හිතෙනවා', 'ජීවිතේ එපා වෙලා', 'merenna hithenawa'
];

const MEDIUM_CRISIS_KW = [
  'exhausted', 'overwhelmed', 'lonely', 'isolated', 'scared', 'worried',
  'barely sleep', 'cries every', 'not feeding well', 'fever', 'stress',
  'මහන්සියි', 'බයයි', 'ආතතිය', 'උණ', 'අසනීප'
];

const SUPPORT_MESSAGES = {
  loneliness:          ['ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  fatigue:             ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌙', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  anxiety:             ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ. 🌿'],
  bonding_issues:      ['ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  lack_of_support:     ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ 🌸'],
  sleep_problems:      ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌙', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  loss_of_confidence:  ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  overwhelmed:         ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  physical_discomfort: ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  negative_thoughts:   ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  baby_crying:         ['ඔබේ බබාගේ ඇඬීම ස්වාභාවිකය. ඔබ හොඳින් සැලකිලිමත් වෙනවා 💜', 'බබා සමඟ සන්සුන්ව සිටින්න 🌸'],
  baby_needs:          ['බබාගේ සංඥා තේරුම් ගැනීමට කාලය දෙන්න 💜', 'ඔබ ඔබේ බබා වෙනුවෙන් ඉගෙන ගනිමින් සිටිනවා 🌸'],
  baby_feeding:        ['කිරි දීම කාලය සමඟ පහසු වෙයි 💜', 'ඔබේ මෘදු බව බබාට සහනයකි 🌸'],
  baby_sleep:          ['බබාගේ නින්ද රටාව වර්ධනය වෙමින් පවතී 🌙', 'කෙටි විවේක පවා ඔබට උපකාරී වෙයි 💜'],
  baby_health:         ['සෞඛ්‍යය කෙරෙහි සැලකිලිමත් වීම අගනේය 💜', 'වෛද්‍ය උපදෙස් ලබා ගැනීම සැමවිටම සුදුසුයි 🌸'],
  caring_for_baby:     ['දරුවා රැකබලා ගැනීම උතුම් කාර්යයකි 💜', 'ඔබ අද්භූත මවකි 🌸'],
};

export const detectBabyIntents = (text = '') => {
  if (!text || typeof text !== 'string') {
    return { baby_related: false, baby_crying: false, baby_needs: false, baby_sleep: false, baby_feeding: false, baby_health: false };
  }
  const norm = normalizeMultilingualText(text);
  const isBabyRelated = isBabyRelatedContent(text);

  const cryingKW = [
    'crying', 'cries', 'cry', 'andana', 'andanawa', 'adanawa',
    'අඬනවා', 'අඬන', 'අඬන බබා', 'ඇඬීම', 'කෑගහනවා', 'නවත්තන්න බැරි තරම් අඬනවා'
  ];
  const needsKW = [
    'needs', 'want', 'wants', 'understand', 'dont know what', 'dont understand',
    'therenne naha', 'therenne na', 'therum ganna baha', 'one kiyala', 'mokakda one', 'monawada one',
    'තේරෙන්නේ නැහැ', 'තේරෙන්නේ නෑ', 'ඕන කියලා', 'අවශ්යතා', 'තේරුම් ගන්න', 'මොනවා කරන්නද', 'දන්නේ නැහැ', 'දන්නෙ නෑ'
  ];
  const sleepKW = [
    'sleep', 'sleeping', 'ninda', 'ninda yanne', 'nida', 'nida ganne',
    'නින්ද', 'නිදා', 'නිදාගන්නේ', 'නිදාගන්නෙ නෑ'
  ];
  const feedingKW = [
    'feeding', 'feed', 'breastfeeding', 'milk', 'kiri', 'kiri denna',
    'කිරි', 'කිරි දෙන්න', 'කිරි බොන්නේ', 'කිරි දීම'
  ];
  const healthKW = [
    'fever', 'sick', 'health', 'unwell', 'baya', 'bayaයි', 'බයයි', 'ලෙඩ', 'උණ', 'අසනීප', 'asanipa', 'una', 'leda'
  ];

  return {
    baby_related: isBabyRelated,
    baby_crying: isBabyRelated && cryingKW.some(k => norm.includes(k)),
    baby_needs: isBabyRelated && needsKW.some(k => norm.includes(k)),
    baby_sleep: isBabyRelated && sleepKW.some(k => norm.includes(k)),
    baby_feeding: isBabyRelated && feedingKW.some(k => norm.includes(k)),
    baby_health: isBabyRelated && healthKW.some(k => norm.includes(k)),
  };
};

// ── MULTI-INTENT DETECTION ─────────────────────────────────────
export const detectIntents = (text = '') => {
  if (!text || typeof text !== 'string') {
    return {
      baby_related: false, baby_crying: false, baby_feeding: false,
      baby_sleep: false, baby_health: false, baby_needs: false,
      mother_fatigue: false, mother_overwhelm: false, loneliness: false, anxiety: false
    };
  }
  const t = text.toLowerCase();

  const baby_related = isBabyRelatedContent(text);

  const baby_crying = baby_related && (
    t.includes('cry') || t.includes('crying') || t.includes('cries') || t.includes('restless') ||
    t.includes('අඬනවා') || t.includes('අඬනව') || t.includes('අඬන') || t.includes('අඬලා') ||
    t.includes('andanawa') || t.includes('andana') || t.includes('andala')
  );

  const baby_feeding = baby_related && (
    t.includes('feed') || t.includes('feeding') || t.includes('breastfeeding') || t.includes('nursing') || t.includes('milk') || t.includes('bottle') ||
    t.includes('කිරි') || t.includes('මව්කිරි') || t.includes('බඩගිනියි') ||
    t.includes('kiri') || t.includes('kiri denawa') || t.includes('kiri bonne naha')
  );

  const baby_sleep = baby_related && (
    t.includes('sleep') || t.includes('sleeping') || t.includes('restless') || t.includes('awake') ||
    t.includes('නින්ද') || t.includes('නිදාගන්නේ') || t.includes('නිදාගන්නෙ') ||
    t.includes('ninda') || t.includes('nidaganne')
  );

  const baby_health = baby_related && (
    t.includes('fever') || t.includes('sick') || t.includes('cough') || t.includes('vomit') || t.includes('temperature') ||
    t.includes('උණ') || t.includes('කැස්ස') || t.includes('අසනීප') || t.includes('වමනය') ||
    t.includes('una') || t.includes('asaneepa')
  );

  const baby_needs = baby_related && (
    t.includes('need') || t.includes('needs') || t.includes('want') || t.includes('wants') || t.includes('understand') || t.includes('don\'t know') || t.includes('dont know') || t.includes('care') || t.includes('caring') || t.includes('difficult') || t.includes('hard') ||
    t.includes('තේරෙන්නේ නැහැ') || t.includes('තේරෙන්නෙ නැහැ') || t.includes('අවශ්‍යතා') || t.includes('අවශ්යතා') || t.includes('බලාගන්න') || t.includes('දන්නේ නැහැ') || t.includes('අමාරුයි') ||
    t.includes('therenne naha') || t.includes('balaganna') || t.includes('needs')
  );

  const mother_fatigue = t.includes('tired') || t.includes('exhausted') || t.includes('drained') || t.includes('මහන්සියි') || t.includes('මහන්සි') || t.includes('mahansiy') || t.includes('mahansi');

  const mother_overwhelm = t.includes('overwhelmed') || t.includes('too much') || t.includes('cant cope') || t.includes('දරාගන්න අමාරුයි') || t.includes('හැමදේම වැඩියි') || t.includes('daraganna amarui');

  const loneliness = t.includes('lonely') || t.includes('alone') || t.includes('isolated') || t.includes('තනිකම') || t.includes('තනියි') || t.includes('thanikama');

  const anxiety = t.includes('anxious') || t.includes('worried') || t.includes('panic') || t.includes('scared') || t.includes('බයයි') || t.includes('කනස්සල්ල') || t.includes('bayayi') || t.includes('kanassalla');

  return {
    baby_related,
    baby_crying,
    baby_feeding,
    baby_sleep,
    baby_health,
    baby_needs,
    mother_fatigue,
    mother_overwhelm,
    loneliness,
    anxiety
  };
};

// ── ANALYZE DIARY ─────────────────────────────────────────────
export const analyzeDiary = (text) => {
  const norm = normalizeMultilingualText(text);

  // Step 1: Score emotions
  let eScores = {};
  Object.entries(EMOTION_KW).forEach(([e, kws]) => {
    eScores[e] = kws.filter(k => norm.includes(k)).length;
  });
  const totalE = Object.values(eScores).reduce((a, b) => a + b, 0);
  const detectedEmotion = totalE > 0
    ? Object.entries(eScores).sort((a, b) => b[1] - a[1])[0][0]
    : 'stressed';

  // Step 2: Score reasons
  let rScores = {};
  Object.entries(REASON_KW).forEach(([r, kws]) => {
    rScores[r] = kws.filter(k => norm.includes(k)).length;
  });
  const sortedReasons = Object.entries(rScores).sort((a, b) => b[1] - a[1]);
  const motherReason = sortedReasons[0][1] > 0 ? sortedReasons[0][0] : 'fatigue';
  const secondaryReason = sortedReasons[1]?.[1] > 0 ? sortedReasons[1][0] : null;

  const babyIntents = detectBabyIntents(text);

  // Step 3: Determine primary reason priority
  let primaryReason = motherReason;
  if (babyIntents.baby_crying) {
    primaryReason = 'baby_crying';
  } else if (babyIntents.baby_needs) {
    primaryReason = 'baby_needs';
  } else if (babyIntents.baby_health) {
    primaryReason = 'baby_health';
  } else if (babyIntents.baby_feeding) {
    primaryReason = 'baby_feeding';
  } else if (babyIntents.baby_sleep) {
    primaryReason = 'baby_sleep';
  } else if (babyIntents.baby_related) {
    primaryReason = 'caring_for_baby';
  }

  // Step 4: Determine risk level
  const hasHighCrisis = HIGH_CRISIS_KW.some(k => norm.includes(k));
  const hasMediumCrisis = MEDIUM_CRISIS_KW.some(k => norm.includes(k));
  const isHighReason = HIGH_RISK_REASONS.has(primaryReason) || HIGH_RISK_REASONS.has(motherReason);
  const isSad = detectedEmotion === 'sad';

  let riskLevel = RISK.LOW;
  if (hasHighCrisis) {
    riskLevel = RISK.HIGH;
  } else if (hasMediumCrisis || (isHighReason && isSad) || babyIntents.baby_health) {
    riskLevel = RISK.MEDIUM;
  }

  const intents = detectIntents(text);

  return {
    detectedEmotion,
    primaryReason,
    secondaryReason: secondaryReason !== primaryReason ? secondaryReason : null,
    riskLevel,
    intents,
    scores: { eScores, rScores },
    _debug: {
      originalText: text,
      normalizedText: norm,
      detectedLanguageSignals: isSinhala ? ['sinhala'] : isSinglish ? ['singlish'] : ['english'],
      keywordMatches: babyIntents,
      finalClassification: {
        emotion: detectedEmotion,
        primaryReason,
        secondaryReason,
        riskLevel
      }
    }
  };
};

// ── GET RECOMMENDATIONS ───────────────────────────────────────
export const getRecommendations = (analysisResult, preferredActivities = [], preferredGames = [], diaryText = '') => {
  const { detectedEmotion, primaryReason, riskLevel, intents } = analysisResult;
  const activeIntents = intents || detectIntents(diaryText);

  // Get the rule for this exact reason + risk combination
  const rule = getEnhancedRecommendationRule(detectedEmotion, primaryReason, riskLevel, preferredActivities, preferredGames, diaryText, activeIntents);

  const musicKey = rule.musicKey || (primaryReason.includes('baby') ? 'bonding_issues' : primaryReason);
  const videoKey = rule.videoKey || (primaryReason.includes('baby') ? 'bonding_issues' : primaryReason);

  const music = MUSIC_LIBRARY[musicKey] || MUSIC_LIBRARY.loneliness;
  const videos = VIDEO_LIBRARY[videoKey] || VIDEO_LIBRARY.loneliness;
  const messages = SUPPORT_MESSAGES[primaryReason] || SUPPORT_MESSAGES.overwhelmed;

  const urgencyMessage = riskLevel === RISK.MEDIUM
    ? 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'
    : null;

  return {
    detectedEmotion,
    riskLevel,
    music,
    videos,
    activities: rule.activities,
    newActivities: rule.newActivities,
    games: rule.games,
    game: rule.game,
    messages,
    urgencyMessage,
    supportMsg: rule.supportMsg,
    _internal: { primaryReason },
  };
};

