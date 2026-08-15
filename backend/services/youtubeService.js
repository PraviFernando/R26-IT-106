const axios = require('axios');

/**
 * Generates a meaningful YouTube search query based on the prediction context.
 */
function generateQuery(reason, emotion, riskLevel, babyIntent) {
  const normReason = reason ? reason.toLowerCase().trim() : '';
  const normEmotion = emotion ? emotion.toLowerCase().trim() : '';
  const isBaby = (babyIntent === 'true' || babyIntent === true || normReason.includes('baby') || normReason.includes('feeding') || normReason.includes('crying'));

  // 1. PRIORITIZE BABY CARE INTENTS FIRST
  if (isBaby) {
    if (normReason.includes('sleep')) {
      return "baby sleep care tips for mothers";
    }
    if (normReason.includes('feeding') || normReason.includes('breastfeeding')) {
      return "baby feeding guidance for mothers";
    }
    if (normReason.includes('crying')) {
      return "how to calm baby how to stop crying baby identify why baby crying";
    }
    if (normReason.includes('needs') || normReason.includes('understanding') || normReason.includes('cue')) {
      return "understanding baby cues why baby crying how to calm baby";
    }
    if (normReason.includes('health') || normReason.includes('fever')) {
      return "newborn baby health and wellness care tips";
    }
    if (normReason.includes('bonding') || normReason.includes('connection')) {
      return "mother and baby bonding techniques and activities";
    }
    return "newborn baby care and parenting guidance for mothers";
  }

  // 2. MOTHER-SPECIFIC EMOTIONS & REASONS
  if (normReason.includes('anxiety') || normEmotion.includes('anxious')) {
    return "relaxation and stress relief techniques for mothers";
  }
  if (normReason.includes('lonely') || normReason.includes('loneliness') || normEmotion.includes('sad')) {
    return "emotional support and motivation for mothers";
  }
  if (normReason.includes('overwhelmed') || normEmotion.includes('stressed') || normReason.includes('stress')) {
    return "stress management and calming techniques for mothers";
  }
  if (normReason.includes('confidence') || normReason.includes('self-doubt')) {
    return "building confidence and overcoming self doubt for new mothers";
  }
  if (normReason.includes('support') || normReason.includes('family')) {
    return "encouragement and emotional support for new mothers";
  }
  if (normReason.includes('fatigue') || normReason.includes('tired') || normReason.includes('exhausted')) {
    return "energy recovery and rest techniques for tired mothers";
  }
  if (normReason.includes('recovery') || normReason.includes('pain') || normReason.includes('discomfort')) {
    return "postpartum physical recovery and gentle self care for mothers";
  }
  if (normReason.includes('negative')) {
    return "overcoming negative thoughts and mental wellbeing for mothers";
  }

  return "postpartum emotional wellness and self care for new mothers";
}

/**
 * Ranks candidate videos using a lightweight scoring algorithm.
 */
function rankVideos(videos, reason, emotion, riskLevel, babyIntent, query) {
  const normReason = reason ? reason.toLowerCase().trim() : '';
  const normEmotion = emotion ? emotion.toLowerCase().trim() : '';
  const isBaby = (babyIntent === 'true' || babyIntent === true || normReason.includes('baby') || normReason.includes('feeding') || normReason.includes('crying'));

  const reasonKws = {
    anxiety: ['anxiety', 'anxious', 'panic', 'scared', 'worry', 'worried', 'calm', 'relax', 'breathing'],
    loneliness: ['lonely', 'loneliness', 'alone', 'support', 'motivation', 'depressed', 'sad'],
    overwhelmed: ['overwhelmed', 'stress', 'stressed', 'calming', 'cope', 'manage', 'relief'],
    sleep: ['sleep', 'insomnia', 'night', 'rest', 'sleepy', 'fatigue', 'tired'],
    feeding: ['feed', 'feeding', 'breastfeed', 'breastfeeding', 'lactation', 'milk'],
    crying: ['cry', 'crying', 'cries', 'soothe', 'calm', 'settle', 'stop', 'identify', 'why'],
    health: ['health', 'fever', 'sick', 'wellness', 'temp', 'doctor'],
    bonding: ['bond', 'bonding', 'connect', 'attachment', 'love', 'motherhood'],
    confidence: ['confidence', 'self-doubt', 'failure', 'capable', 'strong']
  };

  let targetReasonKws = [];
  Object.keys(reasonKws).forEach(key => {
    if (normReason.includes(key)) {
      targetReasonKws = targetReasonKws.concat(reasonKws[key]);
    }
  });
  if (targetReasonKws.length === 0) {
    targetReasonKws = ['postpartum', 'mother', 'mom', 'parent'];
  }

  const emotionKws = {
    sad: ['sad', 'unhappy', 'cry', 'depressed', 'mood', 'emotional', 'tear'],
    anxious: ['anxious', 'anxiety', 'panic', 'worry', 'scared', 'fear'],
    stressed: ['stress', 'stressed', 'pressure', 'overwhelmed', 'tension'],
    tired: ['tired', 'fatigue', 'exhausted', 'sleepy', 'rest', 'energy'],
    angry: ['angry', 'anger', 'frustrated', 'irritated', 'calm']
  };

  let targetEmotionKws = emotionKws[normEmotion] || [];
  const babyKws = ['baby', 'newborn', 'infant', 'child', 'toddler', 'feeding', 'crying', 'lullaby', 'motherhood', 'parenting'];

  const queryWords = query.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !['for', 'and', 'the', 'techniques', 'tips', 'guide', 'how', 'with', 'mothers', 'moms'].includes(w));

  return videos.map(video => {
    const title = (video.title || '').toLowerCase();
    const desc = (video.description || '').toLowerCase();

    // 1. Reason Relevance
    let reasonRelevance = 0;
    targetReasonKws.forEach(kw => {
      if (title.includes(kw)) reasonRelevance += 5;
      else if (desc.includes(kw)) reasonRelevance += 2;
    });

    // 2. Emotion Relevance
    let emotionRelevance = 0;
    targetEmotionKws.forEach(kw => {
      if (title.includes(kw)) emotionRelevance += 3;
      else if (desc.includes(kw)) emotionRelevance += 1;
    });

    // 3. Baby Intent Relevance
    let babyIntentRelevance = 0;
    if (isBaby) {
      babyKws.forEach(kw => {
        if (title.includes(kw)) babyIntentRelevance += 4;
        else if (desc.includes(kw)) babyIntentRelevance += 1;
      });
    }

    // 4. Keyword Relevance
    let keywordRelevance = 0;
    queryWords.forEach(word => {
      if (title.includes(word)) keywordRelevance += 3;
      if (desc.includes(word)) keywordRelevance += 1;
    });

    const score = reasonRelevance + emotionRelevance + babyIntentRelevance + keywordRelevance;

    return {
      ...video,
      score,
      scoreBreakdown: {
        reasonRelevance,
        emotionRelevance,
        babyIntentRelevance,
        keywordRelevance
      }
    };
  });
}

/**
 * Helper to fetch candidates from YouTube Search API.
 */
async function fetchYouTubeItems(query, apiKey) {
  const url = 'https://www.googleapis.com/youtube/v3/search';
  const response = await axios.get(url, {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 10,
      key: apiKey
    }
  });
  return response.data?.items || [];
}

/**
 * Helper to normalize raw search results from YouTube.
 */
function normalizeVideoItem(item) {
  const videoId = item.id?.videoId;
  return {
    id: videoId,
    title: item.snippet?.title || '',
    description: item.snippet?.description || '',
    thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
    channelTitle: item.snippet?.channelTitle || '',
    publishedAt: item.snippet?.publishedAt || '',
    url: `https://www.youtube.com/watch?v=${videoId}`
  };
}

/**
 * Returns a baby care specific search query.
 */
function getBabyQuery(reason, emotion) {
  const normReason = reason ? reason.toLowerCase().trim() : '';
  if (normReason.includes('sleep')) {
    return "baby sleep care tips for mothers";
  }
  if (normReason.includes('feeding') || normReason.includes('breastfeeding')) {
    return "baby feeding guidance for mothers";
  }
  if (normReason.includes('crying')) {
    return "how to calm baby how to stop crying baby identify why baby crying";
  }
  if (normReason.includes('needs') || normReason.includes('understanding') || normReason.includes('cue')) {
    return "understanding baby cues why baby crying how to calm baby";
  }
  if (normReason.includes('health') || normReason.includes('fever')) {
    return "newborn baby health and wellness care tips";
  }
  if (normReason.includes('bonding') || normReason.includes('connection')) {
    return "mother and baby bonding techniques and activities";
  }
  return "newborn baby care and parenting guidance for mothers";
}

/**
 * Returns a mother recovery and relaxation specific search query.
 */
function getMotherQuery(reason, emotion) {
  const normReason = reason ? reason.toLowerCase().trim() : '';
  const normEmotion = emotion ? emotion.toLowerCase().trim() : '';

  if (normReason.includes('anxiety') || normEmotion.includes('anxious')) {
    return "relaxation and stress relief techniques for mothers";
  }
  if (normReason.includes('lonely') || normReason.includes('loneliness') || normEmotion.includes('sad')) {
    return "emotional support and motivation for mothers";
  }
  if (normReason.includes('overwhelmed') || normEmotion.includes('stressed') || normReason.includes('stress')) {
    return "stress management and calming techniques for mothers";
  }
  if (normReason.includes('fatigue') || normReason.includes('tired') || normReason.includes('exhausted') || normEmotion.includes('tired')) {
    return "energy recovery and rest techniques for tired mothers";
  }
  if (normReason.includes('recovery') || normReason.includes('pain') || normReason.includes('discomfort')) {
    return "postpartum physical recovery and gentle self care for mothers";
  }
  if (normReason.includes('negative')) {
    return "overcoming negative thoughts and mental wellbeing for mothers";
  }
  return "postpartum emotional wellness and self care for new mothers";
}

/**
 * Dynamic YouTube Service: Fetch candidates and return top 4 ranked videos.
 * Alternates between baby care and mother support when both contexts are active.
 */
const PREFERRED_BABY_VIDEOS = {
  crying: {
    id: 'UrfpkvvRTns',
    title: 'බබා ඇඬීම නැවැත්වීමට සහ සන්සුන් කිරීමට මඟ පෙන්වීම් (Calming a Crying Baby Guide)',
    description: 'බබා ඇඬීමට හේතු හඳුනාගෙන ඉක්මනින් සන්සුන් කරන ආකාරය.',
    thumbnail: 'https://img.youtube.com/vi/UrfpkvvRTns/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=UrfpkvvRTns'
  },
  feeding: {
    id: 'Uz978b7Gsm4',
    title: 'නවජන්ම දරුවාට කිරි දීම සහ නිවැරදිව තබාගැනීම (Breastfeeding Latch Tips for Newborn)',
    description: 'නිවැරදිව කිරි දෙන ආකාරය සහ ගැටලු මඟහරවා ගන්නා ආකාරය පිළිබඳ උපදෙස්.',
    thumbnail: 'https://img.youtube.com/vi/Uz978b7Gsm4/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=Uz978b7Gsm4'
  },
  sleep: {
    id: 'y23E11d8p08',
    title: 'ළදරුවාට සුව නින්දක් ලබාදීමේ ක්‍රමවේද (Baby Sleep Care Tips)',
    description: 'බබාට රාත්‍රියේ හොඳින් නිදා ගැනීමට උපකාරී වන ක්‍රමවේද සහ උපදෙස්.',
    thumbnail: 'https://img.youtube.com/vi/y23E11d8p08/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=y23E11d8p08'
  },
  health: {
    id: 'jzGyjLGbAUc',
    title: 'ළදරු සෞඛ්‍යය සහ රැකවරණය (Newborn Baby Health Care Guide)',
    description: 'නවජන්ම දරුවාගේ සෞඛ්‍යය ආරක්‍ෂා කරගැනීමේ මූලික උපදෙස්.',
    thumbnail: 'https://img.youtube.com/vi/jzGyjLGbAUc/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=jzGyjLGbAUc'
  },
  bonding: {
    id: 'jzGyjLGbAUc',
    title: 'බබා සහ මව අතර බැඳීම ශක්තිමත් කිරීම (Building Bond with Baby)',
    description: 'නවජන්ම දරුවා සමඟ ආදරණීය සම්බන්ධතාවය වර්ධනය කරගන්නා අයුරු.',
    thumbnail: 'https://img.youtube.com/vi/jzGyjLGbAUc/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=jzGyjLGbAUc'
  }
};

const PREFERRED_MOTHER_VIDEOS = {
  anxiety: {
    id: 'hrozJ-EbdGI',
    title: 'ප්‍රසව කාංසාව සහ බිය පාලනය කිරීම (Relieving Postpartum Anxiety)',
    description: 'බිය සහ කාංසාව පාලනය කිරීමට උපකාරී වන මෘදු හුස්ම ගැනීමේ අභ්‍යාස.',
    thumbnail: 'https://img.youtube.com/vi/hrozJ-EbdGI/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=hrozJ-EbdGI'
  },
  fatigue: {
    id: 'fm5ZnhqWkO8',
    title: 'ප්‍රසව තෙහෙට්ටුව මඟහැරීමට මවට මෘදු සංගීතය (Soothing Postpartum Relaxation Music)',
    description: 'තෙහෙට්ටුව සහ ආතතිය දුරු කර මනස සන්සුන් කරන මෘදු සංගීතය.',
    thumbnail: 'https://img.youtube.com/vi/fm5ZnhqWkO8/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=fm5ZnhqWkO8'
  },
  loneliness: {
    id: '2OEL4P1Rz04',
    title: 'තනිකම සහ හුදකලා බව මඟහරවා ගැනීම (Overcoming Loneliness in Motherhood)',
    description: 'මවක් වූ පසු දැනෙන තනිකම සහ ඒ සඳහා කළ හැකි දේ පිළිබඳ මඟ පෙන්වීම.',
    thumbnail: 'https://img.youtube.com/vi/2OEL4P1Rz04/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04'
  },
  overwhelmed: {
    id: '1n46HPsYsHM',
    title: 'දරාගත නොහැකි පීඩනය කළමනාකරණය (Coping with Overwhelm)',
    description: 'වැඩ අධික වීම නිසා ඇතිවන පීඩනය පාලනය කිරීමට නව මව්වරුන් සඳහා උපදෙස්.',
    thumbnail: 'https://img.youtube.com/vi/1n46HPsYsHM/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=1n46HPsYsHM'
  },
  support: {
    id: 'sF80I-TQiW0',
    title: 'සහයෝගය නොමැති විට කළ හැකි දේ (Coping with Lack of Support)',
    description: 'පවුලෙන් හෝ සැමියාගෙන් සහයෝගය නොලැබෙන විට මනස සන්සුන්ව තබාගැනීම.',
    thumbnail: 'https://img.youtube.com/vi/sF80I-TQiW0/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=sF80I-TQiW0'
  },
  negative: {
    id: '9Q634rbsypE',
    title: 'අඳුරු සිතුවිලි සහ ජීවිතය ජය ගැනීම (Overcoming Negative Thoughts)',
    description: 'ප්‍රසූතියෙන් පසු සිතට එන අශුභවාදී සිතුවිලි දුරු කර සුවය ලබාගන්නා ආකාරය.',
    thumbnail: 'https://img.youtube.com/vi/9Q634rbsypE/0.jpg',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://www.youtube.com/watch?v=9Q634rbsypE'
  }
};

function isLowQuality(video) {
  const title = (video.title || '').toLowerCase();
  const desc = (video.description || '').toLowerCase();
  
  // Unwanted keywords matching clickbait/shorts/irrelevant videos
  const unwanted = [
    '#shorts', '#status', '#broken', '#sad', '#emotional', 'my mom once said', 
    'unavailable mothers', 'immature parents', '2gIwyFQfzsI', 'steve harvey', 'short'
  ];
  return unwanted.some(kw => title.includes(kw) || desc.includes(kw) || video.id === '2gIwyFQfzsI');
}

/**
 * Dynamic YouTube Service: Fetch candidates and return top 4 ranked videos.
 * Alternates between baby care and mother support when both contexts are active.
 */
async function fetchAndRankVideos(reason, emotion, riskLevel, babyIntent) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not defined in environment variables');
  }

  const normReason = reason ? reason.toLowerCase().trim() : '';
  const normEmotion = emotion ? emotion.toLowerCase().trim() : '';
  const isBaby = (babyIntent === 'true' || babyIntent === true || normReason.includes('baby') || normReason.includes('feeding') || normReason.includes('crying'));
  
  // Detect if we need a hybrid query (both baby care and mother wellness are active)
  const isHybrid = isBaby && (
    normEmotion === 'sad' || normEmotion === 'anxious' || normEmotion === 'stressed' || normEmotion === 'tired' ||
    normReason.includes('fatigue') || normReason.includes('anxiety') || normReason.includes('lonely') || normReason.includes('overwhelmed')
  );

  try {
    if (isHybrid) {
      const babyQuery = getBabyQuery(reason, emotion);
      const motherQuery = getMotherQuery(reason, emotion);

      // Fetch candidates for both queries in parallel
      const [babyItems, motherItems] = await Promise.all([
        fetchYouTubeItems(babyQuery, apiKey),
        fetchYouTubeItems(motherQuery, apiKey)
      ]);

      // Normalize candidates and filter out low quality videos
      let babyCandidates = babyItems.map(item => normalizeVideoItem(item)).filter(v => v.id && !isLowQuality(v));
      let motherCandidates = motherItems.map(item => normalizeVideoItem(item)).filter(v => v.id && !isLowQuality(v));

      // 1. Resolve preferred baby video dynamically based on topic
      let prefBaby = null;
      if (normReason.includes('crying')) {
        prefBaby = PREFERRED_BABY_VIDEOS.crying;
      } else if (normReason.includes('feeding') || normReason.includes('breastfeeding')) {
        prefBaby = PREFERRED_BABY_VIDEOS.feeding;
      } else if (normReason.includes('sleep')) {
        prefBaby = PREFERRED_BABY_VIDEOS.sleep;
      } else if (normReason.includes('health') || normReason.includes('fever')) {
        prefBaby = PREFERRED_BABY_VIDEOS.health;
      } else {
        prefBaby = PREFERRED_BABY_VIDEOS.bonding;
      }

      if (prefBaby && !babyCandidates.some(v => v.id === prefBaby.id)) {
        babyCandidates.unshift(prefBaby);
      }

      // 2. Resolve preferred mother video dynamically based on topic/emotion
      let prefMother = null;
      if (normReason.includes('fatigue') || normReason.includes('tired') || normEmotion.includes('tired')) {
        prefMother = PREFERRED_MOTHER_VIDEOS.fatigue;
      } else if (normReason.includes('anxiety') || normEmotion.includes('anxious') || normEmotion.includes('baya')) {
        prefMother = PREFERRED_MOTHER_VIDEOS.anxiety;
      } else if (normReason.includes('lonely') || normReason.includes('loneliness') || normEmotion.includes('sad')) {
        prefMother = PREFERRED_MOTHER_VIDEOS.loneliness;
      } else if (normReason.includes('overwhelmed') || normEmotion.includes('stressed') || normEmotion.includes('stress')) {
        prefMother = PREFERRED_MOTHER_VIDEOS.overwhelmed;
      } else if (normReason.includes('support')) {
        prefMother = PREFERRED_MOTHER_VIDEOS.support;
      } else if (normReason.includes('negative')) {
        prefMother = PREFERRED_MOTHER_VIDEOS.negative;
      } else {
        prefMother = PREFERRED_MOTHER_VIDEOS.fatigue; // fallback
      }

      if (prefMother && !motherCandidates.some(v => v.id === prefMother.id)) {
        motherCandidates.unshift(prefMother);
      }

      // Rank them separately
      const rankedBaby = rankVideos(babyCandidates, reason, emotion, riskLevel, babyIntent, babyQuery);
      const rankedMother = rankVideos(motherCandidates, reason, emotion, riskLevel, babyIntent, motherQuery);

      // Force injected preferred videos to have highest scores so they always win
      const allPrefIds = [
        ...Object.values(PREFERRED_BABY_VIDEOS).map(v => v.id),
        ...Object.values(PREFERRED_MOTHER_VIDEOS).map(v => v.id)
      ];

      rankedBaby.forEach(v => {
        if (allPrefIds.includes(v.id)) v.score = 999;
      });
      rankedMother.forEach(v => {
        if (allPrefIds.includes(v.id)) v.score = 999;
      });

      // Sort descending by score
      rankedBaby.sort((a, b) => b.score - a.score);
      rankedMother.sort((a, b) => b.score - a.score);

      // Alternating selection to guarantee a hybrid mix
      const finalVideos = [];
      const maxLen = Math.max(rankedBaby.length, rankedMother.length);
      for (let i = 0; i < maxLen; i++) {
        if (rankedBaby[i]) finalVideos.push(rankedBaby[i]);
        if (rankedMother[i]) finalVideos.push(rankedMother[i]);
        if (finalVideos.length >= 4) break;
      }

      return finalVideos.slice(0, 4);
    } else {
      // Standard single query path
      const query = generateQuery(reason, emotion, riskLevel, babyIntent);
      const items = await fetchYouTubeItems(query, apiKey);
      let candidates = items.map(item => normalizeVideoItem(item)).filter(v => v.id && !isLowQuality(v));

      if (isBaby) {
        let prefBaby = null;
        if (normReason.includes('crying')) prefBaby = PREFERRED_BABY_VIDEOS.crying;
        else if (normReason.includes('feeding') || normReason.includes('breastfeeding')) prefBaby = PREFERRED_BABY_VIDEOS.feeding;
        else if (normReason.includes('sleep')) prefBaby = PREFERRED_BABY_VIDEOS.sleep;
        else if (normReason.includes('health') || normReason.includes('fever')) prefBaby = PREFERRED_BABY_VIDEOS.health;
        else prefBaby = PREFERRED_BABY_VIDEOS.bonding;

        if (prefBaby && !candidates.some(v => v.id === prefBaby.id)) {
          candidates.unshift(prefBaby);
        }
      } else {
        let prefMother = null;
        if (normReason.includes('fatigue') || normReason.includes('tired') || normEmotion.includes('tired')) prefMother = PREFERRED_MOTHER_VIDEOS.fatigue;
        else if (normReason.includes('anxiety') || normEmotion.includes('anxious')) prefMother = PREFERRED_MOTHER_VIDEOS.anxiety;
        else if (normReason.includes('lonely') || normReason.includes('loneliness') || normEmotion.includes('sad')) prefMother = PREFERRED_MOTHER_VIDEOS.loneliness;
        else if (normReason.includes('overwhelmed') || normEmotion.includes('stressed')) prefMother = PREFERRED_MOTHER_VIDEOS.overwhelmed;
        else if (normReason.includes('support')) prefMother = PREFERRED_MOTHER_VIDEOS.support;
        else if (normReason.includes('negative')) prefMother = PREFERRED_MOTHER_VIDEOS.negative;
        else prefMother = PREFERRED_MOTHER_VIDEOS.fatigue;

        if (prefMother && !candidates.some(v => v.id === prefMother.id)) {
          candidates.unshift(prefMother);
        }
      }

      const scoredVideos = rankVideos(candidates, reason, emotion, riskLevel, babyIntent, query);
      const allPrefIds = [
        ...Object.values(PREFERRED_BABY_VIDEOS).map(v => v.id),
        ...Object.values(PREFERRED_MOTHER_VIDEOS).map(v => v.id)
      ];
      scoredVideos.forEach(v => {
        if (allPrefIds.includes(v.id)) v.score = 999;
      });

      scoredVideos.sort((a, b) => b.score - a.score);
      return scoredVideos.slice(0, 4);
    }
  } catch (error) {
    console.error('YouTube Service API error:', error.message);
    throw new Error('Failed to fetch videos from YouTube');
  }
}

module.exports = {
  generateQuery,
  fetchAndRankVideos
};
