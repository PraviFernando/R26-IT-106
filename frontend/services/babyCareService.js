// ================================================================
// BABY CARE SERVICE — babyCareService.js
// Dedicated service for Baby Topic & Intent Detection (Independent of Emotion Engine)
// ================================================================

const BABY_TOPIC_KEYWORDS = {
  'Baby Feeding': [
    'feed', 'feeding', 'breastfeed', 'breastfeeding', 'latch', 'latching',
    'milk', 'mother milk', 'formula', 'bottle', 'hungry', 'nursing',
    'burp', 'burping', 'spit up', 'reflux'
  ],
  'Solid Foods': [
    'solid', 'solids', 'weaning', 'first foods', 'puree', 'finger food',
    'eating', 'food', 'diet', 'meal'
  ],
  'Baby Sleep': [
    'sleep', 'sleeping', 'nap', 'napping', 'night', 'awake', 'woke up',
    'restless', 'sleep schedule', 'routine', 'bedtime', 'insomnia'
  ],
  'Baby Crying & Colic': [
    'cry', 'crying', 'cries', 'soothe', 'soothing', 'colic', 'fussing',
    'fussy', 'screaming', 'unsettled'
  ],
  'Baby Health & Fever': [
    'fever', 'temperature', 'sick', 'unwell', 'cold', 'cough', 'vomit',
    'vomiting', 'jaundice', 'yellow', 'doctor', 'hospital', 'medicine',
    'infection', 'rash', 'diarrhea'
  ],
  'Vaccination': [
    'vaccine', 'vaccination', 'immunization', 'shot', 'injection', 'clinic'
  ],
  'Growth & Development': [
    'growth', 'weight', 'gain', 'height', 'milestone', 'crawling',
    'sitting', 'standing', 'smile', 'rolling'
  ],
  'Bathing & Hygiene': [
    'bath', 'bathing', 'hygiene', 'clean', 'sponge bath', 'soap', 'shampoo'
  ],
  'Diaper Care & Skin': [
    'diaper', 'diapers', 'nappy', 'rash', 'diaper rash', 'poop', 'stool', 'wipes'
  ],
  'Safety & Emergency': [
    'safety', 'emergency', 'choking', 'fall', 'head bump', 'accident', 'danger'
  ],
  'Mother Recovery': [
    'recovery', 'c-section', 'stitch', 'stitches', 'perineal', 'bleeding',
    'postpartum pain', 'soreness', 'pelvic'
  ]
};

const HIGH_RISK_HEALTH_KEYWORDS = [
  'high fever', 'convulsion', 'seizure', 'hard to breathe', 'breathless',
  'unresponsive', 'dehydrated', 'bleeding', 'severe pain', 'emergency'
];

/**
 * Detects baby care topics and intents from diary text using keyword matching.
 * @param {string} text - The input diary text
 * @returns {object} { topic, subTopic, isEmergency, confidence }
 */
export const detectBabyTopic = (text = '') => {
  if (!text || typeof text !== 'string') {
    return { topic: null, isEmergency: false };
  }

  const cleanText = text.toLowerCase();

  // Check emergency health signs
  const isEmergency = HIGH_RISK_HEALTH_KEYWORDS.some(kw => cleanText.includes(kw));

  let matchedTopic = null;
  let maxMatches = 0;

  Object.entries(BABY_TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
    const matchCount = keywords.filter(kw => cleanText.includes(kw)).length;
    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      matchedTopic = topic;
    }
  });

  return {
    topic: matchedTopic,
    matchCount: maxMatches,
    isEmergency,
  };
};
