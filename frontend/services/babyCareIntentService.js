// ================================================================
// BABY CARE INTENT DETECTION SERVICE
// Detects baby care topics from diary text using keyword matching.
// ================================================================

export const BABY_TOPICS = {
  FEEDING: 'Baby Feeding',
  FOOD: 'Baby Food',
  SLEEP: 'Baby Sleep',
  HEALTH: 'Baby Health',
  DEVELOPMENT: 'Baby Development',
  MOTHER_CARE: 'Mother Care',
};

const KEYWORD_MAP = [
  {
    topic: BABY_TOPICS.FEEDING,
    keywords: ['feed', 'feeding', 'milk', 'bottle', 'breast', 'breastfeeding', 'burp', 'latch', 'formula', 'pump'],
  },
  {
    topic: BABY_TOPICS.FOOD,
    keywords: ['solid', 'solids', 'puree', 'purée', 'food', 'eat', 'eating', 'weaning', 'meal'],
  },
  {
    topic: BABY_TOPICS.SLEEP,
    keywords: ['sleep', 'sleeping', 'nap', 'naps', 'awake', 'wake', 'crying night', 'night time', 'tired', 'schedule', 'routine'],
  },
  {
    topic: BABY_TOPICS.HEALTH,
    keywords: ['fever', 'cough', 'cold', 'sick', 'ill', 'vomit', 'diarrhea', 'doctor', 'hospital', 'health', 'temperature', 'rash', 'vaccine', 'vaccination'],
  },
  {
    topic: BABY_TOPICS.DEVELOPMENT,
    keywords: ['milestone', 'crawl', 'crawling', 'sit', 'sitting', 'walk', 'walking', 'stand', 'tummy time', 'smile', 'roll', 'grow', 'development'],
  },
  {
    topic: BABY_TOPICS.MOTHER_CARE,
    keywords: ['recovery', 'breast care', 'self care', 'stress', 'postpartum', 'body', 'pain', 'stitches', 'healing'],
  },
];

/**
 * Analyzes the text and returns the detected topic and age, if any.
 * If multiple topics match, returns the one with the most keyword hits,
 * or simply the first one found.
 * @param {string} text - The diary entry text
 * @returns {object} { topic: string|null, age: number|null }
 */
export const detectBabyTopic = (text) => {
  if (!text) return { topic: null, age: null };
  const lowerText = text.toLowerCase();
  
  // Strict check: must contain baby-related contextual words to trigger baby recommendations.
  const babyContextWords = [
    'baby', 'babies', 'newborn', 'infant', 'child', 'kid', 'son', 'daughter', 
    'month', 'months', 'moth', 'mo', 'latch', 'breastfeeding', 'formula', 
    'weaning', 'diaper', 'jaundice', 'puree', 'solids', 'burp'
  ];
  
  const hasBabyContext = babyContextWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
  
  if (!hasBabyContext) {
    return { topic: null, age: null };
  }
  
  let bestMatch = null;
  let maxHits = 0;

  KEYWORD_MAP.forEach((category) => {
    let hits = 0;
    category.keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerText)) {
        hits++;
      }
    });

    if (hits > maxHits) {
      maxHits = hits;
      bestMatch = category.topic;
    }
  });

  // Extract baby age (1-12 months)
  let detectedAge = null;
  const ageRegex = /\b([1-9]|1[0-2])\s*(?:month|months|moth|mo)\b/i;
  const ageMatch = text.match(ageRegex);
  if (ageMatch && ageMatch[1]) {
    detectedAge = parseInt(ageMatch[1], 10);
  }

  return { topic: bestMatch, age: detectedAge };
};
