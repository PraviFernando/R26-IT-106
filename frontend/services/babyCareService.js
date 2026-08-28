// ================================================================
// BABY CARE SERVICE — babyCareService.js
// Multi-Topic & Intent Detection for Baby Care (Independent of Emotion Engine)
// ================================================================

export const BABY_TOPIC_CATEGORIES = {
  BABY_FEEDING: 'Baby Feeding',
  BABY_BATHING: 'Baby Bathing',
  BABY_DIAPERING: 'Baby Diapering',
  BABY_SLEEPING: 'Baby Sleeping',
  BABY_CRYING: 'Baby Crying',
  BABY_HEALTH: 'Baby Health',
  BABY_DEVELOPMENT: 'Baby Development',
  VACCINATION: 'Vaccination',
  BABY_SAFETY: 'Baby Safety',
  MOTHER_CARE: 'Mother Care',
};

const CATEGORY_RULES = {
  'Baby Feeding': {
    phrases: [
      'baby refuses milk', 'won\'t drink milk', 'wont drink milk', 'breastfeeding problem',
      'cannot latch', 'cant latch', 'feeding difficulty', 'feed my baby', 'breast feeding',
      'formula milk', 'bottle feeding', 'not drinking milk', 'refuses to feed', 'won\'t feed',
      'wont feed', 'drinking milk', 'don\'t drink milk', 'dont drink milk', 'isnt drinking milk',
      'isn\'t drinking milk', 'how to feed', 'how to feed him',
      'කිරි දෙන්නේ කොහොමද', 'කිරි දෙන්න මම දන්නේ නැහැ', 'කිරි දෙන්නේ කොහොමද කියලා',
      'කිරි බොන්නේ නැහැ', 'කිරි දෙන්න අමාරුයි', 'කිරි දෙන්න බෑ', 'කිරි දෙන්න',
      'kiri bonna naha', 'kiri denna baha', 'kiri bonna ba', 'kiri denna amaruwi', 'kiri denne kohomada'
    ],
    keywords: [
      'feed', 'feeding', 'milk', 'breastfeed', 'breastfeeding', 'formula', 'bottle',
      'hungry', 'latch', 'latching', 'burp', 'burping', 'nursing', 'pump', 'pumping',
      'spit up', 'reflux',
      'kiri', 'කිරි', 'කිරිදීම'
    ]
  },

  'Baby Bathing': {
    phrases: [
      'wash my baby', 'clean my baby', 'first bath', 'newborn bath', 'don\'t know how to bath',
      'dont know how to bath', 'how can i bath', 'how to bath', 'bath my newborn',
      'bath my baby', 'bathing baby', 'sponge bath', 'umbilical cord', 'baby bath',
      'bathe my baby', 'bath my newborn baby', 'bathe my newborn baby', 'wash baby', 'clean baby',
      'නාන්න', 'නාගන්න', 'නාවන්න', 'බබාව නාවන්න', 'nawanna', 'baba nawanna'
    ],
    keywords: [
      'bath', 'bathe', 'bathing', 'wash', 'clean', 'soap', 'shampoo', 'water',
      'sponge', 'umbilical', 'නාවන්න', 'නෑම', 'nawanna'
    ]
  },

  'Baby Diapering': {
    phrases: [
      'dress diaper', 'wear diaper', 'change nappy', 'change diaper', 'changing diaper',
      'put diaper', 'remove diaper', 'put on diaper', 'diaper to my child', 'diaper rash',
      'dirty diaper', 'wet diaper', 'change napkin', 'dress diaper to my child',
      'diaper to my baby', 'wearing a diaper',
      'ඩයපර්', 'ඩයපර් මාරු', 'නැප්කින්', 'diaper maru'
    ],
    keywords: [
      'diaper', 'diapers', 'nappy', 'napkin', 'rash', 'poop', 'stool', 'wipes', 'pee',
      'ඩයපර්', 'diaper'
    ]
  },

  'Baby Sleeping': {
    phrases: [
      'cry at night', 'cries at night', 'won\'t sleep', 'wont sleep', 'sleep through night',
      'can\'t sleep', 'cant sleep', 'sleep schedule', 'nap time', 'stay awake',
      'cry every night', 'cries every night', 'not sleep at night', 'is not sleep',
      'රාත්රියේ නිදාගන්නේ නැතුව', 'රාත්‍රියේ නිදාගන්නේ නැතුව', 'නිදාගන්නේ නැතුව',
      'නිදාගන්නේ නැහැ', 'නිදාගන්නෙ නෑ', 'රෑට නිදාගන්නේ නැහැ', 'නින්දක් නෑ',
      'nida ganne naha', 'nida na', 'rata nida ganne naha', 'ninda naha'
    ],
    keywords: [
      'sleep', 'sleeping', 'night', 'nap', 'napping', 'awake', 'wake', 'restless',
      'bedtime', 'routine', 'insomnia',
      'ninda', 'නින්ද', 'නිදා', 'නිදාගන්න', 'නිදාගන්නේ', 'රාත්රියේ', 'රාත්‍රියේ'
    ]
  },

  'Baby Crying': {
    phrases: [
      'won\'t stop crying', 'wont stop crying', 'cries every night', 'cries all time',
      'crying baby', 'stop crying', 'calm crying baby', 'soothe baby', 'cry every night',
      'නැතුව අඬනවා', 'ගොඩක් අඬනවා', 'නිතරම අඬනවා', 'නවත්තන්න බැරි තරම් අඬනවා', 'ඇයි කියලා මට තේරෙන්නේ නැහැ',
      'godak andanawa', 'nitharama andanawa', 'baba godak andanawa', 'adanawa'
    ],
    keywords: [
      'cry', 'crying', 'cries', 'fussy', 'fussing', 'colic', 'soothe', 'soothing',
      'screaming', 'unsettled',
      'andanawa', 'andana', 'adanawa', 'අඬනවා', 'අඬන', 'ඇඬීම', 'කෑගහනවා'
    ]
  },

  'Baby Health': {
    phrases: [
      'has fever', 'high temperature', 'baby is sick', 'vomiting milk', 'turned yellow',
      'medical help', 'diaper rash', 'has a fever',
      'උණ තියෙනවා', 'අසනීප වෙලා', 'ලෙඩ වෙලා', 'ලෙඩයි',
      'una thiyenawa', 'asanipa wela', 'leda wela', 'leda'
    ],
    keywords: [
      'fever', 'temperature', 'sick', 'ill', 'cold', 'cough', 'vomit', 'vomiting',
      'diarrhea', 'infection', 'medicine', 'doctor', 'hospital', 'jaundice', 'yellow', 'rash',
      'una', 'උණ', 'අසනීප', 'ලෙඩ', 'asanipa', 'leda'
    ]
  },

  'Baby Development': {
    phrases: [
      'tummy time', 'weight gain', 'developmental milestones', 'learning to sit',
      'learning to crawl', 'first smile',
      'වර්ධනය', 'බර වැඩිවීම', 'ඉඳගන්න', 'ඇවිදින්න'
    ],
    keywords: [
      'growth', 'weight', 'gain', 'milestone', 'milestones', 'crawling', 'crawl',
      'sitting', 'sit', 'walking', 'walk', 'standing', 'talking', 'rolling', 'roll', 'smile'
    ]
  },

  'Vaccination': {
    phrases: [
      'baby vaccine', 'vaccine schedule', 'immunization', 'fever after vaccine',
      'එන්නත්', 'වැක්සින්'
    ],
    keywords: ['vaccine', 'vaccination', 'immunization', 'injection', 'එන්නත', 'එන්නත්']
  },

  'Baby Safety': {
    phrases: [
      'baby safe', 'safe sleeping position', 'car seat', 'baby proofing',
      'ආරක්ෂාව', 'පරිස්සම්'
    ],
    keywords: ['safety', 'safe', 'choking', 'carseat', 'proof', 'ආරක්ෂාව']
  },

  'Mother Care': {
    phrases: [
      'mother recovery', 'postpartum care', 'mom health', 'mother diet',
      'අම්මාගේ සෞඛ්‍යය', 'පශ්චාත් ප්‍රසව'
    ],
    keywords: ['mother', 'mom', 'mama', 'postpartum', 'recovery', 'diet', 'අම්මා']
  }
};

const HIGH_RISK_HEALTH_KEYWORDS = [
  'high fever', 'convulsion', 'seizure', 'hard to breathe', 'breathless',
  'unresponsive', 'dehydrated', 'severe bleeding', 'severe pain', 'emergency'
];

const normalizeText = (text = '') => {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.toLowerCase().trim();

  // Normalize common Singlish spelling variations to standard forms
  cleaned = cleaned
    .replace(/adanawa/g, 'andanawa')
    .replace(/andanne/g, 'andanawa')
    .replace(/andana/g, 'andanawa')
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
    .replace(/['’]/g, '');

  // Keep alphanumeric, spaces, and Sinhala Unicode range (\u0D80-\u0DFF)
  cleaned = cleaned.replace(/[^\w\s\u0D80-\u0DFF]/g, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
};

/**
 * Detects multiple baby care topics and intents from diary text.
 * @param {string} text - Input diary entry
 * @returns {object} { topics: string[], topic: string|null, isEmergency: boolean, age: number|null }
 */
export const detectBabyTopics = (text = '') => {
  if (!text || typeof text !== 'string') {
    return { topics: [], topic: null, isEmergency: false, age: null };
  }

  // Normalize text
  const cleanText = normalizeText(text);

  // Check emergency health signs
  const isEmergency = HIGH_RISK_HEALTH_KEYWORDS.some(kw => cleanText.includes(kw));

  // Score each category
  const categoryScores = [];

  Object.entries(CATEGORY_RULES).forEach(([category, rule]) => {
    let score = 0;
    let earliestPos = -1;

    // Phrase matches (higher weight)
    rule.phrases.forEach(phrase => {
      const normPhrase = phrase.replace(/['’]/g, '');
      const pos = cleanText.indexOf(normPhrase);
      if (pos !== -1) {
        score += 3;
        if (earliestPos === -1 || pos < earliestPos) {
          earliestPos = pos;
        }
      }
    });

    // Keyword matches
    rule.keywords.forEach(kw => {
      const normKw = kw.replace(/['’]/g, '');
      const regex = new RegExp(`\\b${normKw}\\b`, 'i');
      const match = cleanText.match(regex);
      if (match) {
        score += 1;
        const pos = match.index;
        if (earliestPos === -1 || pos < earliestPos) {
          earliestPos = pos;
        }
      }
    });

    if (score > 0) {
      categoryScores.push({ category, score, earliestPos });
    }
  });

  // Sort descending by match score, and if equal, by earliestPos ascending
  categoryScores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.earliestPos - b.earliestPos;
  });

  // Return top matching topics (up to top 3 matching categories)
  let detectedTopics = categoryScores.slice(0, 3).map(item => item.category);

  // Refine Baby Health if detected as primary topic
  let primaryTopic = detectedTopics[0] || null;
  if (primaryTopic === 'Baby Health') {
    const textLower = cleanText.toLowerCase();
    const hasFever = ['fever', 'temperature', 'hot', 'feverish', 'උණ', 'una', 'temperature eka', 'ඇඟ රුක් වෙලා', 'ඇඟ රත් වෙලා'].some(kw => textLower.includes(kw));
    const hasIllness = ['sick', 'ill', 'cold', 'cough', 'vomit', 'vomiting', 'diarrhea', 'flu', 'අසනීප', 'ලෙඩ', 'leda', 'asanipa', 'una gasila', 'වමනය'].some(kw => textLower.includes(kw));
    if (hasFever) {
      primaryTopic = 'Baby Health & Fever';
      detectedTopics[0] = 'Baby Health & Fever';
    } else if (hasIllness) {
      primaryTopic = 'Baby Health & Illness';
      detectedTopics[0] = 'Baby Health & Illness';
    }
  }

  // Extract baby age (1-12 months)
  let detectedAge = null;
  const ageRegex = /\b([1-9]|1[0-2])\s*(?:month|months|moth|mo)\b/i;
  const ageMatch = text.match(ageRegex);
  if (ageMatch && ageMatch[1]) {
    detectedAge = parseInt(ageMatch[1], 10);
  }

  return {
    topics: detectedTopics,
    topic: primaryTopic,
    isEmergency,
    age: detectedAge,
    scores: categoryScores
  };
};

/**
 * Backward-compatible single-topic detection wrapper.
 */
export const detectBabyTopic = (text = '') => {
  return detectBabyTopics(text);
};
