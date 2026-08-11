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
      'isn\'t drinking milk'
    ],
    keywords: [
      'feed', 'feeding', 'milk', 'breastfeed', 'breastfeeding', 'formula', 'bottle',
      'hungry', 'latch', 'latching', 'burp', 'burping', 'nursing', 'pump', 'pumping',
      'spit up', 'reflux'
    ]
  },

  'Baby Bathing': {
    phrases: [
      'wash my baby', 'clean my baby', 'first bath', 'newborn bath', 'don\'t know how to bath',
      'dont know how to bath', 'how can i bath', 'how to bath', 'bath my newborn',
      'bath my baby', 'bathing baby', 'sponge bath', 'umbilical cord', 'baby bath',
      'bathe my baby', 'bath my newborn baby', 'bathe my newborn baby', 'wash baby', 'clean baby'
    ],
    keywords: [
      'bath', 'bathe', 'bathing', 'wash', 'clean', 'soap', 'shampoo', 'water',
      'sponge', 'umbilical'
    ]
  },

  'Baby Diapering': {
    phrases: [
      'dress diaper', 'wear diaper', 'change nappy', 'change diaper', 'changing diaper',
      'put diaper', 'remove diaper', 'put on diaper', 'diaper to my child', 'diaper rash',
      'dirty diaper', 'wet diaper', 'change napkin', 'dress diaper to my child',
      'diaper to my baby', 'wearing a diaper'
    ],
    keywords: [
      'diaper', 'diapers', 'nappy', 'napkin', 'rash', 'poop', 'stool', 'wipes', 'pee'
    ]
  },

  'Baby Sleeping': {
    phrases: [
      'cry at night', 'cries at night', 'won\'t sleep', 'wont sleep', 'sleep through night',
      'can\'t sleep', 'cant sleep', 'sleep schedule', 'nap time', 'stay awake',
      'cry every night', 'cries every night'
    ],
    keywords: [
      'sleep', 'sleeping', 'night', 'nap', 'napping', 'awake', 'wake', 'restless',
      'bedtime', 'routine', 'insomnia'
    ]
  },

  'Baby Crying': {
    phrases: [
      'won\'t stop crying', 'wont stop crying', 'cries every night', 'cries all time',
      'crying baby', 'stop crying', 'calm crying baby', 'soothe baby', 'cry every night'
    ],
    keywords: [
      'cry', 'crying', 'cries', 'fussy', 'fussing', 'colic', 'soothe', 'soothing',
      'screaming', 'unsettled'
    ]
  },

  'Baby Health': {
    phrases: [
      'has fever', 'high temperature', 'baby is sick', 'vomiting milk', 'turned yellow',
      'medical help', 'diaper rash', 'has a fever'
    ],
    keywords: [
      'fever', 'temperature', 'sick', 'ill', 'cold', 'cough', 'vomit', 'vomiting',
      'diarrhea', 'infection', 'medicine', 'doctor', 'hospital', 'jaundice', 'yellow', 'rash'
    ]
  },

  'Baby Development': {
    phrases: [
      'tummy time', 'weight gain', 'developmental milestones', 'learning to sit',
      'learning to crawl', 'first smile'
    ],
    keywords: [
      'growth', 'weight', 'gain', 'milestone', 'milestones', 'crawling', 'crawl',
      'sitting', 'sit', 'walking', 'walk', 'standing', 'talking', 'rolling', 'roll', 'smile'
    ]
  },

  'Vaccination': {
    phrases: [
      'baby vaccination', 'clinic visit', 'baby shots', 'immunization schedule'
    ],
    keywords: [
      'vaccine', 'vaccines', 'vaccination', 'immunization', 'shot', 'shots',
      'injection', 'clinic', 'needle'
    ]
  },

  'Baby Safety': {
    phrases: [
      'bathe safely', 'safe sleep', 'sleep position', 'prevent choking', 'head bump',
      'bathe my baby safely'
    ],
    keywords: [
      'safe', 'safety', 'fall', 'choking', 'car seat', 'blanket', 'emergency',
      'danger', 'accident'
    ]
  },

  'Mother Care': {
    phrases: [
      'breast pain', 'c-section recovery', 'postpartum recovery', 'perineal pain',
      'postpartum pain'
    ],
    keywords: [
      'recovery', 'c-section', 'cesarean', 'stitch', 'stitches', 'bleeding',
      'postpartum', 'tired', 'soreness', 'pelvic', 'breast'
    ]
  }
};

const HIGH_RISK_HEALTH_KEYWORDS = [
  'high fever', 'convulsion', 'seizure', 'hard to breathe', 'breathless',
  'unresponsive', 'dehydrated', 'severe bleeding', 'severe pain', 'emergency'
];

/**
 * Detects multiple baby care topics and intents from diary text.
 * @param {string} text - Input diary entry
 * @returns {object} { topics: string[], topic: string|null, isEmergency: boolean, age: number|null }
 */
export const detectBabyTopics = (text = '') => {
  if (!text || typeof text !== 'string') {
    return { topics: [], topic: null, isEmergency: false, age: null };
  }

  // Normalize text: lowercase and strip special characters except spaces
  const cleanText = text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^\w\s]/g, ' ');

  // Check emergency health signs
  const isEmergency = HIGH_RISK_HEALTH_KEYWORDS.some(kw => cleanText.includes(kw));

  // Score each category
  const categoryScores = [];

  Object.entries(CATEGORY_RULES).forEach(([category, rule]) => {
    let score = 0;

    // Phrase matches (higher weight)
    rule.phrases.forEach(phrase => {
      const normPhrase = phrase.replace(/['’]/g, '');
      if (cleanText.includes(normPhrase)) {
        score += 3;
      }
    });

    // Keyword matches
    rule.keywords.forEach(kw => {
      const normKw = kw.replace(/['’]/g, '');
      const regex = new RegExp(`\\b${normKw}\\b`, 'i');
      if (regex.test(cleanText)) {
        score += 1;
      }
    });

    if (score > 0) {
      categoryScores.push({ category, score });
    }
  });

  // Sort descending by match score
  categoryScores.sort((a, b) => b.score - a.score);

  // Return top matching topics (up to top 3 matching categories)
  const detectedTopics = categoryScores.slice(0, 3).map(item => item.category);

  // Extract baby age (1-12 months)
  let detectedAge = null;
  const ageRegex = /\b([1-9]|1[0-2])\s*(?:month|months|moth|mo)\b/i;
  const ageMatch = text.match(ageRegex);
  if (ageMatch && ageMatch[1]) {
    detectedAge = parseInt(ageMatch[1], 10);
  }

  return {
    topics: detectedTopics,
    topic: detectedTopics[0] || null,
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
