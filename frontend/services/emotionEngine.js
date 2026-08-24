// ================================================================
// EMOTION ENGINE — emotionEngine.js (Multilingual: EN + SI + Singlish)
// ================================================================

import { getEnhancedRecommendationRule, getPersonalizedRecommendations, isBabyRelatedReason, isBabyRelatedContent } from './activitiesLibrary.js';
import { MUSIC_LIBRARY, VIDEO_LIBRARY } from './mediaLibrary.js';

export { getPersonalizedRecommendations, isBabyRelatedReason, isBabyRelatedContent };

export const RISK = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };

// ── MULTILINGUAL TEXT NORMALIZATION ─────────────────────────
export const normalizeMultilingualText = (text = '') => {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.toLowerCase().trim();

  // Normalize common Singlish spelling variations to standard forms
  cleaned = cleaned
    .replace(/adanawa/g, 'andanawa')
    .replace(/andanne/g, 'andanawa')
    .replace(/andana/g, 'andanawa')
    .replace(/ada\s*nawa/g, 'andanawa')
    .replace(/ada\s*na/g, 'andanawa')
    .replace(/therenne\s*na\b/g, 'therenne naha')
    .replace(/therenne\s*nehe/g, 'therenne naha')
    .replace(/therum\s*ganna\s*ba\b/g, 'therum ganna baha')
    .replace(/therum\s*ganna\s*nehe/g, 'therum ganna baha')
    .replace(/nida\s*na\b/g, 'nida ganne naha')
    .replace(/nida\s*nehe/g, 'nida ganne naha')
    .replace(/ninda\s*yanne\s*na\b/g, 'ninda yanne naha')
    .replace(/nidaganne\s*na\b/g, 'nida ganne naha')
    .replace(/nidaganne\s*naha/g, 'nida ganne naha')
    .replace(/bonne\s*na\b/g, 'bonna naha')
    .replace(/bonne\s*naha/g, 'bonna naha')
    .replace(/baya\s*hithenawa/g, 'baya')
    .replace(/mahansi\b/g, 'mahansiyi')
    // Singlish/Sinhala spelling variations:
    .replace(/there\s*nne/g, 'therenne')
    .replace(/there\s*ne/g, 'therenne')
    .replace(/therennet\s*na/g, 'therenne naha')
    .replace(/therenneth\s*na/g, 'therenne naha')
    .replace(/තෙරේන්නේ/g, 'තේරෙන්නේ')
    .replace(/තේරෙන්නෙ/g, 'තේරෙන්නේ')
    .replace(/අඩනවා/g, 'අඬනවා')
    .replace(/අඩන/g, 'අඬන')
    // Stress / Anger mappings
    .replace(/stress\s*ekak/g, 'stress')
    .replace(/stress\s*eka/g, 'stress')
    .replace(/ස්ට්රෙස්/g, 'stress')
    .replace(/කේන්තියක්/g, 'kenthia')
    .replace(/කේන්ති/g, 'kenthia')
    .replace(/කේන්තිය/g, 'kenthia')
    .replace(/kenthiyen/g, 'kenthia')
    .replace(/kenthiyak/g, 'kenthia')
    .replace(/['’]/g, '');

  // Keep alphanumeric, spaces, and Sinhala Unicode range (\u0D80-\u0DFF)
  cleaned = cleaned.replace(/[^\w\s\u0D80-\u0DFF]/g, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
};

// ── KEYWORD MAPS (EN + SI + SINGLISH) ─────────────────────────
const REASON_KW = {
  loneliness: [
    'alone', 'lonely', 'isolated', 'nobody', 'no one', 'miss', 'empty', 'no friends', 'left out',
    'තනිවෙලා', 'පාළුයි', 'පාළුවක්', 'කවුරුත් නෑ', 'කවුරුත් නැහැ', 'තනියම', 'පාළු',
    'paluyi', 'taniyen', 'taniwela', 'kugewat na', 'kawuruth naha', 'palu'
  ],
  fatigue: [
    'tired', 'exhausted', 'drained', 'no energy', 'worn out', 'sleepy', 'burnt out', 'sluggish',
    'මහන්සියි', 'වෙහෙසයි', 'වෙහෙස', 'නින්ද මදි', 'ශක්තියක් නෑ', 'අමාරුයි',
    'mahansiyi', 'wehesayi', 'mahansi', 'shakthiyak naha', 'hondata mahansiyi'
  ],
  anxiety: [
    'anxious', 'worried', 'panic', 'scared', 'nervous', 'overthinking', 'heart racing', 'restless',
    'බයයි', 'කාංසාව', 'ලොකු බයක්', 'කනස්සල්ල', 'බියක්', 'බය හිතෙනවා',
    'baye', 'baya', 'baya hithenawa', 'bayaයි', 'kansawa'
  ],
  bonding_issues: [
    'bond', 'bonding', 'feel nothing', 'not attached', 'distant from baby', 'no connection', 'indifferent',
    'බැඳීමක් නෑ', 'ආදරයක් දැනෙන්නේ නෑ', 'සම්බන්ධයක් නෑ', 'කිසිම හැඟීමක් නෑ',
    'bandimak naha', 'daranne naha', 'connection ekak naha'
  ],
  lack_of_support: [
    'husband', 'partner', 'no help', 'unsupported', 'nobody helps', 'no family', 'doing it alone',
    'සැමියා උදව් කරන්නේ නැහැ', 'සැමියා උදව් කරන්නේ නෑ', 'උදව්වක් නෑ', 'කාගෙවත් සහයක් නෑ', 'උදව් නෑ',
    'husband udaw naha', 'udawwak naha', 'kagegenwat support naha'
  ],
  sleep_problems: [
    'sleep', 'insomnia', 'awake all night', 'sleep deprived', 'cant sleep', 'no sleep',
    'නින්ද', 'නිදාගන්නේ නැහැ', 'නිදාගන්නෙ නෑ', 'නින්දක් නෑ', 'නින්ද යන්නෙ නෑ', 'රාත්‍රියට නිදි නෑ',
    'ninda', 'nida ganne naha', 'nida na', 'ninda yanne naha', 'nidaganna baha',
    'මට නිදා නෑමට මහන්සියි', 'මට නින්ද නොයෑම', 'මවගේ නින්ද නොයාම', 'අම්මාට නින්ද නැහැ', 
    'අම්මාට නින්ද නොයෑම', 'අම්මාට නිදිමත දැනීම', 'අම්මාගේ නින්ද', 'අම්මාට නින්ද ප්රශ්න', 
    'නිදි නැති රාත්රිය', 'නිදි නැති රාත්රී', 'sleepless night', 'sleepless nights', 
    'mother sleep problems', 'mothers sleep problems', 'maternal sleep problems', 
    'mom sleep problems', 'mother cant sleep', 'mother cannot sleep', 'difficulty sleeping', 
    'trouble sleeping', 'poor sleep', 'lack of sleep', 'sleep deprivation', 'tired mother', 
    'exhausted mother', 'maternal sleep', 'mothers sleep'
  ],
  loss_of_confidence: [
    'confidence', 'self-doubt', 'failure', 'bad mother', 'useless', 'not capable', 'worthless',
    'විශ්වාසයක් නෑ', 'නරක අම්මා කෙනෙක්', 'මට බැහැ', 'අසාර්ථකයි',
    'naraka amma', 'mata baha', 'confidence naha'
  ],
  overwhelmed: [
    'overwhelmed', 'too much', 'drowning', 'breaking down', 'cant cope', 'too hard', 'falling apart',
    'දරාගන්න බැහැ', 'දරාගන්න බෑ', 'ඔළුව රිදෙනවා', 'ඔක්කොම වැඩ', 'අමාරුයි',
    'daraganna baha', 'daraganna ba', 'amaruwi', 'godak wada'
  ],
  physical_discomfort: [
    'pain', 'hurt', 'sore', 'c-section', 'recovery', 'stitches', 'body aches', 'discomfort',
    'කැක්කුමයි', 'රිදෙනවා', 'තුවාලය', 'සිරුරේ කැක්කුම',
    'kakkumai', 'ridenawa', 'thuwala', 'kakul ridenawa'
  ],
  negative_thoughts: [
    'hopeless', 'hate myself', 'dark', 'disappear', 'dark thoughts', 'no point', 'worthless',
    'ජීවිතේ එපා වෙලා', 'මැරෙන්න හිතෙනවා', 'කිසිම තේරුමක් නෑ', 'අඳුරු සිතුවිලි',
    'jeewithe epa wela', 'merenna hithenawa', 'therumak naha'
  ],
};

const EMOTION_KW = {
  happy: [
    'happy', 'joy', 'smile', 'grateful', 'wonderful', 'positive', 'hopeful', 'great', 'good day',
    'සතුටුයි', 'සතුටක්', 'ආසයි', 'සන්තෝෂයි', 'සුන්දරයි',
    'sathutuyi', 'sathuta', 'gasp', 'good day'
  ],
  sad: [
    'sad', 'cry', 'unhappy', 'depressed', 'hopeless', 'hurt', 'empty', 'down', 'devastated',
    'දුකයි', 'කඳුළු', 'අඬනවා', 'කනගාටුයි', 'වේදනාව',
    'dukai', 'dukayi', 'andana', 'kandulu'
  ],
  stressed: [
    'stress', 'overwhelmed', 'tense', 'frustrated', 'on edge', 'pressure', 'anxious', 'irritated',
    'kenthia', 'angry', 'anger', 'frustrated', 'frustration',
    'ආතතිය', 'මහන්සියි', 'බයයි', 'කලබලයි', 'පීඩනය',
    'stress', 'athathiya', 'baya', 'mahansi'
  ],
};

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
  let motherSecondaryReason = sortedReasons[1]?.[1] > 0 ? sortedReasons[1][0] : null;

  const babyIntents = detectBabyIntents(text);

  // Step 3: Determine primary reason priority
  let primaryReason = motherReason;
  let secondaryReason = motherSecondaryReason !== primaryReason ? motherSecondaryReason : null;

  if (babyIntents.baby_related) {
    const intentsList = [
      { id: 'baby_crying', kws: ['crying', 'cries', 'cry', 'andana', 'andanawa', 'adanawa', 'අඬනවා', 'අඬන', 'ඇඬීම', 'කෑගහනවා'] },
      { id: 'baby_needs', kws: ['needs', 'want', 'wants', 'understand', 'therenne naha', 'therenne na', 'therum ganna baha', 'one kiyala', 'mokakda one', 'monawada one', 'තේරෙන්නේ නැහැ', 'තේරෙන්නේ නෑ', 'ඕන කියලා'] },
      { id: 'baby_sleep', kws: ['sleep', 'sleeping', 'ninda', 'nida ganne', 'නින්ද', 'නිදා', 'නිදාගන්නේ'] },
      { id: 'baby_feeding', kws: ['feeding', 'feed', 'breastfeeding', 'milk', 'kiri', 'කිරි', 'කිරි දෙන්න', 'කිරි බොන්නේ'] },
      { id: 'baby_health', kws: ['fever', 'sick', 'health', 'unwell', 'baya', 'බයයි', 'ලෙඩ', 'උණ', 'අසනීප', 'asanipa', 'una', 'leda'] }
    ];

    const activeBabyIntents = [];
    intentsList.forEach(item => {
      if (babyIntents[item.id]) {
        let earliestPos = -1;
        item.kws.forEach(kw => {
          const pos = norm.indexOf(kw);
          if (pos !== -1 && (earliestPos === -1 || pos < earliestPos)) {
            earliestPos = pos;
          }
        });
        activeBabyIntents.push({ id: item.id, pos: earliestPos !== -1 ? earliestPos : 9999 });
      }
    });

    activeBabyIntents.sort((a, b) => a.pos - b.pos);

    if (activeBabyIntents.length > 0) {
      primaryReason = activeBabyIntents[0].id;
      if (activeBabyIntents.length > 1) {
        secondaryReason = activeBabyIntents[1].id;
      } else {
        secondaryReason = motherReason !== primaryReason ? motherReason : (motherSecondaryReason || null);
      }
    } else {
      primaryReason = 'caring_for_baby';
    }
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

  const isSinhala = /[\u0D80-\u0DFF]/.test(text);
  const isSinglish = !isSinhala && /(baba|andanawa|ninda|kiri|daruwa|putha|duwa|mahansi|baya|duk)/i.test(text);

  // DEBUG LOGGING REQUIREMENT
  console.log('\n[DIARY ANALYSIS]');
  console.log(`Original text: "${text}"`);
  console.log(`Normalized text: "${norm}"`);
  console.log(`Emotion: "${detectedEmotion}"`);
  console.log(`Primary reason: "${primaryReason}"`);
  console.log(`Secondary reason: "${secondaryReason}"`);
  console.log(`Baby context: "${babyIntents.baby_related}"`);
  console.log(`Baby intents:`, JSON.stringify(babyIntents));

  return {
    detectedEmotion,
    primaryReason,
    secondaryReason: secondaryReason !== primaryReason ? secondaryReason : null,
    riskLevel,
    babyIntents,
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
  const { detectedEmotion, primaryReason, riskLevel } = analysisResult;

  const rule = getEnhancedRecommendationRule(detectedEmotion, primaryReason, riskLevel, preferredActivities, preferredGames, diaryText);

  const musicKey = rule.musicKey || (primaryReason.includes('baby') ? 'bonding_issues' : primaryReason);
  const videoKey = rule.videoKey || (primaryReason.includes('baby') ? 'bonding_issues' : primaryReason);

  const music = MUSIC_LIBRARY[musicKey] || MUSIC_LIBRARY.loneliness;
  const videos = VIDEO_LIBRARY[videoKey] || VIDEO_LIBRARY.loneliness;
  const messages = SUPPORT_MESSAGES[primaryReason] || SUPPORT_MESSAGES.overwhelmed;

  const urgencyMessage = riskLevel === RISK.MEDIUM
    ? 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'
    : null;

  const cappedGames = (rule.games || []).slice(0, 4);
  const cappedMusic = (music || []).slice(0, 3);

  // DEBUG LOGGING REQUIREMENT
  console.log('[GAME RANKING]');
  console.log('Selected games:', JSON.stringify(cappedGames.map(g => g.id || g)));
  console.log('[MUSIC RANKING]');
  console.log('Selected music:', JSON.stringify(cappedMusic));

  return {
    detectedEmotion,
    riskLevel,
    music: cappedMusic,
    videos,
    activities: rule.activities,
    newActivities: rule.newActivities,
    games: cappedGames,
    game: rule.game,
    messages,
    urgencyMessage,
    supportMsg: rule.supportMsg,
    _internal: { primaryReason },
  };
};

