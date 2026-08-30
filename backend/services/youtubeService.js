const axios = require('axios');

// ============================================================
// ALL CURATED VIDEOS REPOSITORY (Flat Store)
// ============================================================
const ALL_CURATED_VIDEOS = {
  // Baby Feeding / Breastfeeding
  'qdXehiELnIA': {
    id: 'qdXehiELnIA',
    title: 'මව්කිරි දීම සහ කිරි වමනය (Breastfeeding & Milk Vomiting)',
    description: 'නිවැරදිව කිරි දෙන ආකාරය සහ කිරි වමනය යාම පාලනය කරන අයුරු.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/qdXehiELnIA',
    thumbnail: 'https://img.youtube.com/vi/qdXehiELnIA/0.jpg'
  },
  'n2Iu6NooqgE': {
    id: 'n2Iu6NooqgE',
    title: 'බබාට නිවැරදිව බර්ප් (ගුඩුස්) යවන විදිහ (How to Burp your Baby Correctly)',
    description: 'බබාට නිවැරදිව බර්ප් (ගුඩුස්) යවන ආකාරය පිළිබඳ පියවරෙන් පියවර මඟ පෙන්වීම.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/n2Iu6NooqgE',
    thumbnail: 'https://img.youtube.com/vi/n2Iu6NooqgE/0.jpg'
  },
  '_FsNGM2cIpI': {
    id: '_FsNGM2cIpI',
    title: 'මව්කිරි දීමේදී මවට නිවැරදි ඉරියව් (Proper Breastfeeding Positions)',
    description: 'මව්කිරි දෙන විට මව සහ දරුවා තබාගත යුතු නිවැරදි ඉරියව්.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/_FsNGM2cIpI',
    thumbnail: 'https://img.youtube.com/vi/_FsNGM2cIpI/0.jpg'
  },

  // Baby Crying
  'kmbKaSRyZ-c': {
    id: 'kmbKaSRyZ-c',
    title: 'අඬන බබා නලවගන්න ක්‍රම (How to Soothe a Colic Baby)',
    description: 'අලුත උපන් බබා නොනවත්වා හැඬීම සහ කොලික් තත්ත්වය කළමනාකරණය කරන අයුරු.',
    channelTitle: 'DP Education - Public Health',
    url: 'https://www.youtube.com/watch?v=kmbKaSRyZ-c',
    thumbnail: 'https://img.youtube.com/vi/kmbKaSRyZ-c/0.jpg'
  },
  'n1NGKj2B2eU': {
    id: 'n1NGKj2B2eU',
    title: 'අලුත උපන් ඔබේ පැටියා නොනවත්වා හඩනවාද? (How to Soothe a Crying Baby)',
    description: 'Baby colic, baby reflux සහ අඬන බබෙකු නලවා ගැනීමට ප්‍රායෝගික උපදෙස්.',
    channelTitle: 'Suwahas Clinic',
    url: 'https://www.youtube.com/watch?v=n1NGKj2B2eU',
    thumbnail: 'https://img.youtube.com/vi/n1NGKj2B2eU/0.jpg'
  },

  // Baby Sleep
  'j2C8MkY7Co8': {
    id: 'j2C8MkY7Co8',
    title: 'ළදරුවාට සුව නින්දක් ලබාදීමේ ක්‍රමවේද (Baby Sleep Care Tips)',
    description: 'ළදරුවාට සුව නින්දක් ලබාදීමට මවකට කළ හැකි දේ පිළිබඳ මඟ පෙන්වීම්.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/j2C8MkY7Co8',
    thumbnail: 'https://img.youtube.com/vi/j2C8MkY7Co8/0.jpg'
  },
  'JePLWMMw3z0': {
    id: 'JePLWMMw3z0',
    title: 'ළදරු නින්ද පිළිබඳ උපදෙස් (Newborn Bedtime Routine Guide)',
    description: 'ළදරුවාගේ නින්ද ක්‍රමවත් කරන ආකාරය සහ නින්ද වර්ධනය කරන අයුරු.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/JePLWMMw3z0',
    thumbnail: 'https://img.youtube.com/vi/JePLWMMw3z0/0.jpg'
  },

  // Mother Sleep Problems
  't0kACis_dJE': {
    id: 't0kACis_dJE',
    title: '6 tips for better sleep | Sleeping with Science, a TED series',
    description: 'Sleep scientist Matt Walker explains how room factors can set the stage for a better night\'s rest.',
    channelTitle: 'TED',
    url: 'https://youtu.be/t0kACis_dJE',
    thumbnail: 'https://img.youtube.com/vi/t0kACis_dJE/0.jpg'
  },
  '-aqpq-9UcH8': {
    id: '-aqpq-9UcH8',
    title: 'TOP 10 Tips for Better Sleep For Parents With A Newborn Baby',
    description: 'Get Better Sleep as a New Parent. Postpartum sleep tips to help improve your healing and mood.',
    channelTitle: 'Bridget Teyler',
    url: 'https://youtu.be/-aqpq-9UcH8',
    thumbnail: 'https://img.youtube.com/vi/-aqpq-9UcH8/0.jpg'
  },
  'e_3UoecZlxY': {
    id: 'e_3UoecZlxY',
    title: '14 Tips to Fall Asleep Faster & Sleep Better',
    description: 'Small decisions and micro-habits you can implement right now to dramatically increase sleep quality.',
    channelTitle: 'Sleep Doctor',
    url: 'https://youtu.be/e_3UoecZlxY',
    thumbnail: 'https://img.youtube.com/vi/e_3UoecZlxY/0.jpg'
  },

  // Understanding Baby / Development
  'fpiYNkkNmEo': {
    id: 'fpiYNkkNmEo',
    title: 'ළදරුවන් කහ වීම පිළිබඳ දැනුවත් වෙමු (Understanding Newborn Jaundice)',
    description: 'ළදරුවන් කහ වීම පිළිබඳ දෙමාපියන් දැනුවත් විය යුතු මූලික කරුණු.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/fpiYNkkNmEo',
    thumbnail: 'https://img.youtube.com/vi/fpiYNkkNmEo/0.jpg'
  },
  '6rx_-__NsjU': {
    id: '6rx_-__NsjU',
    title: '5 Simple Ways to Boost Your Baby’s Cognitive Brain Development',
    description: 'Help your baby thrive with 5 brain-boosting tips from a pediatrician! Simple, everyday ways to support learning from day one.',
    channelTitle: 'PedsDocTalk',
    url: 'https://youtu.be/6rx_-__NsjU',
    thumbnail: 'https://img.youtube.com/vi/6rx_-__NsjU/0.jpg'
  },
  'dEQOWf-NuKs': {
    id: 'dEQOWf-NuKs',
    title: '9 Biggest Baby Development Myths, Debunked',
    description: 'Understanding baby development myths will help you understand what to expect and what to do when you see certain behaviors.',
    channelTitle: 'Emma Hubbard',
    url: 'https://youtu.be/dEQOWf-NuKs',
    thumbnail: 'https://img.youtube.com/vi/dEQOWf-NuKs/0.jpg'
  },
  'SQX5Nwr4ekc': {
    id: 'SQX5Nwr4ekc',
    title: 'නවජන්ම දරුවන්ගේ කහ පැහැය (Newborn Skin Yellowness Guide)',
    description: 'නවජන්ම දරුවන්ගේ කහ පැහැය හඳුනාගැනීම සහ නිසි වෛද්‍ය උපදෙස් ලබාගැනීම.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/SQX5Nwr4ekc',
    thumbnail: 'https://img.youtube.com/vi/SQX5Nwr4ekc/0.jpg'
  },

  // General / Support Categories
  'jzGyjLGbAUc': {
    id: 'jzGyjLGbAUc',
    title: 'ළදරු සෞඛ්‍යය සහ රැකවරණය (Newborn Baby Health Care Guide)',
    description: 'නවජන්ම දරුවාගේ සෞඛ්‍යය ආරක්‍ෂා කරගැනීමේ මූලික උපදෙස්.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=jzGyjLGbAUc',
    thumbnail: 'https://img.youtube.com/vi/jzGyjLGbAUc/0.jpg'
  },
  'hrozJ-EbdGI': {
    id: 'hrozJ-EbdGI',
    title: 'ප්‍රසව කාංසාව සහ බිය පාලනය කිරීම (Relieving Postpartum Anxiety)',
    description: 'බිය සහ කාංසාව පාලනය කිරීමට උපකාරී වන මෘදු හුස්ම ගැනීමේ අභ්‍යාස.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=hrozJ-EbdGI',
    thumbnail: 'https://img.youtube.com/vi/hrozJ-EbdGI/0.jpg'
  },
  'fm5ZnhqWkO8': {
    id: 'fm5ZnhqWkO8',
    title: 'ප්‍රසව තෙහෙට්ටුව මඟහැරීමට මවට මෘදු සංගීතය (Soothing Postpartum Relaxation Music)',
    description: 'තෙහෙට්ටුව සහ ආතතිය දුරු කර මනස සන්සුන් කරන මෘදු සංගීතය.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=fm5ZnhqWkO8',
    thumbnail: 'https://img.youtube.com/vi/fm5ZnhqWkO8/0.jpg'
  },
  '2OEL4P1Rz04': {
    id: '2OEL4P1Rz04',
    title: 'තනිකම සහ හුදකලා බව මඟහරවා ගැනීම (Overcoming Loneliness in Motherhood)',
    description: 'මවක් වූ පසු දැනෙන තනිකම සහ ඒ සඳහා කළ හැකි දේ පිළිබඳ මඟ පෙන්වීම.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04',
    thumbnail: 'https://img.youtube.com/vi/2OEL4P1Rz04/0.jpg'
  },
  '1n46HPsYsHM': {
    id: '1n46HPsYsHM',
    title: 'දරාගත නොහැකි පීඩනය කළමනාකරණය (Coping with Overwhelm)',
    description: 'වැඩ අධික වීම නිසා ඇතිවන පීඩනය පාලනය කිරීමට නව මව්වරුන් සඳහා උපදෙස්.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=1n46HPsYsHM',
    thumbnail: 'https://img.youtube.com/vi/1n46HPsYsHM/0.jpg'
  },
  'sF80I-TQiW0': {
    id: 'sF80I-TQiW0',
    title: 'සහයෝගය නොමැති විට කළ හැකි දේ (Coping with Lack of Support)',
    description: 'පවුලෙන් හෝ සැමියාගෙන් සහයෝගය නොලැබෙන විට මනස සන්සුන්ව තබාගැනීම.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=sF80I-TQiW0',
    thumbnail: 'https://img.youtube.com/vi/sF80I-TQiW0/0.jpg'
  },
  '9Q634rbsypE': {
    id: '9Q634rbsypE',
    title: 'අඳුරු සිතුවිලි සහ ජීවිතය ජය ගැනීම (Overcoming Negative Thoughts)',
    description: 'ප්‍රසූතියෙන් පසු සිතට එන අශුභවාදී සිතුවිලි දුරු කර සුවය ලබාගන්නා ආකාරය.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=9Q634rbsypE',
    thumbnail: 'https://img.youtube.com/vi/9Q634rbsypE/0.jpg'
  },
  'ZToicYcHIOU': {
    id: 'ZToicYcHIOU',
    title: 'ප්‍රසව ශාරීරික සුවතාවය (Postpartum Physical Recovery Guide)',
    description: 'ප්‍රසූතියෙන් පසු ශාරීරික සුවතාවය ලබාගන්නා ආකාරය.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    thumbnail: 'https://img.youtube.com/vi/ZToicYcHIOU/0.jpg'
  }
};

// ============================================================
// CURATED VIDEO LIBRARY (Nested Mapping structure)
// ============================================================
const CURATED_VIDEO_LIBRARY = {
  baby_feeding: {
    default: ['qdXehiELnIA', 'n2Iu6NooqgE', '_FsNGM2cIpI'],
    anxious: ['hrozJ-EbdGI', 'sF80I-TQiW0'],
    sad: ['2OEL4P1Rz04', '9Q634rbsypE'],
    stressed: ['1n46HPsYsHM', 'fm5ZnhqWkO8']
  },
  baby_crying: {
    default: ['kmbKaSRyZ-c', 'n1NGKj2B2eU'],
    stressed: ['1n46HPsYsHM', 'fm5ZnhqWkO8'],
    anxious: ['hrozJ-EbdGI', 'sF80I-TQiW0']
  },
  baby_sleep: {
    default: ['j2C8MkY7Co8', 'n1NGKj2B2eU', 'JePLWMMw3z0'],
    stressed: ['1n46HPsYsHM', 'fm5ZnhqWkO8']
  },
  mother_sleep_problems: {
    default: ['t0kACis_dJE', '-aqpq-9UcH8', 'e_3UoecZlxY'],
    stressed: ['1n46HPsYsHM', 'fm5ZnhqWkO8']
  },
  understanding_baby: {
    default: ['fpiYNkkNmEo', '6rx_-__NsjU', 'dEQOWf-NuKs'],
    anxious: ['hrozJ-EbdGI', 'sF80I-TQiW0']
  },
  baby_health: {
    default: ['jzGyjLGbAUc'],
    anxious: ['hrozJ-EbdGI', 'sF80I-TQiW0']
  },
  bonding_issues: {
    default: ['jzGyjLGbAUc'],
    sad: ['2OEL4P1Rz04', '9Q634rbsypE']
  },
  anxiety: {
    default: ['hrozJ-EbdGI', 'sF80I-TQiW0']
  },
  loneliness: {
    default: ['2OEL4P1Rz04', '9Q634rbsypE']
  },
  fatigue: {
    default: ['fm5ZnhqWkO8', '1n46HPsYsHM']
  },
  stress: {
    default: ['1n46HPsYsHM', 'fm5ZnhqWkO8']
  },
  lack_of_support: {
    default: ['sF80I-TQiW0', '2OEL4P1Rz04']
  },
  negative_thoughts: {
    default: ['9Q634rbsypE', 'hrozJ-EbdGI']
  },
  physical_recovery: {
    default: ['ZToicYcHIOU', 'fm5ZnhqWkO8']
  }
};

// ============================================================
// SPECIFIC VIDEO SEARCH QUERIES
// ============================================================
const VIDEO_SEARCH_QUERIES = {
  baby_feeding: {
    anxious: "breastfeeding difficulties support for new mothers",
    stressed: "breastfeeding problems and stress support for mothers",
    sad: "breastfeeding support for postpartum mothers",
    default: "breastfeeding latch technique tips guidelines"
  },
  baby_crying: {
    stressed: "how to soothe crying newborn baby for stressed parents",
    anxious: "understanding why newborn babies cry and calming techniques",
    default: "how to soothe colic crying baby newborn"
  },
  baby_sleep: {
    stressed: "baby sleep tips for exhausted new mothers",
    default: "safe baby sleep tips newborn"
  },
  mother_sleep_problems: {
    stressed: "mother sleep problems new mother sleep deprivation postpartum sleep support",
    default: "maternal sleep problems new mother sleeping guidelines"
  },
  understanding_baby: {
    anxious: "understanding baby cues body language anxiety support mothers",
    default: "understanding baby milestones body language cues"
  },
  baby_health: {
    anxious: "newborn baby health wellness care tips anxiety support",
    default: "newborn baby health wellness care tips"
  },
  loneliness: {
    default: "postpartum loneliness emotional support for new mothers"
  },
  anxiety: {
    default: "postpartum anxiety calming and emotional support"
  },
  fatigue: {
    default: "self care and rest tips for exhausted new mothers"
  },
  stress: {
    default: "stress relief and management for new mothers guide"
  },
  bonding_issues: {
    default: "how to build a bond connection with newborn baby"
  },
  lack_of_support: {
    default: "coping with lack of support postpartum new mother"
  },
  negative_thoughts: {
    default: "postpartum intrusive thoughts and mental health help"
  },
  physical_recovery: {
    default: "postpartum c section healing physical recovery tips"
  }
};

// ============================================================
// RELEVANCE SCORE KEYWORDS
// ============================================================
const POSITIVE_KEYWORDS = {
  baby_feeding: ['feed', 'feeding', 'breastfeed', 'breastfeeding', 'lactation', 'milk', 'latch', 'latching', 'burp', 'burping', 'vomit', 'vomiting', 'කිරි', 'මව්කිරි', 'ගුඩුස්'],
  baby_sleep: ['sleep', 'sleeping', 'bedtime', 'settle', 'soothe', 'night', 'nap', 'routine', 'නින්ද', 'නිදාගන්න'],
  mother_sleep_problems: ['sleep', 'insomnia', 'night', 'rest', 'sleepy', 'fatigue', 'tired', 'sleepless', 'deprivation', 'නින්ද', 'නිදි', 'නොයාම', 'නොයෑම', 'රාත්රී', 'රාත්‍රිය'],
  baby_crying: ['cry', 'crying', 'cries', 'soothe', 'calm', 'settle', 'stop', 'why', 'ඇඬීම', 'අඬනවා', 'අඬන', 'newborn crying'],
  understanding_baby: ['cue', 'cues', 'understand', 'needs', 'body language', 'jaundice', 'yellow', 'yellowness', 'කහ', 'සංඥා', 'milestones', 'development', 'cognitive', 'myth', 'myths'],
  baby_health: ['health', 'fever', 'sick', 'wellness', 'temp', 'doctor', 'medicine', 'සෞඛ්‍යය', 'උණ', 'අසනීප'],
  anxiety: ['anxiety', 'anxious', 'panic', 'scared', 'worry', 'worried', 'calm', 'relax', 'breathing', 'කාංසාව', 'බය'],
  loneliness: ['lonely', 'loneliness', 'alone', 'support', 'motivation', 'depressed', 'sad', 'තනිකම', 'පාළු'],
  fatigue: ['tired', 'fatigue', 'exhausted', 'sleepy', 'rest', 'energy', 'මහන්සි', 'වෙහෙස'],
  stress: ['stress', 'stressed', 'pressure', 'overwhelmed', 'tension', 'management', 'පීඩනය', 'ආතතිය'],
  lack_of_support: ['support', 'help', 'family', 'husband', 'encouragement', 'සහයෝගය', 'උදව්'],
  negative_thoughts: ['negative', 'thoughts', 'hopeless', 'self-doubt', 'අඳුරු', 'සිතුවිලි'],
  bonding_issues: ['bond', 'bonding', 'connect', 'attachment', 'love', 'motherhood', 'බැඳීම', 'ආදරය'],
  physical_recovery: ['recovery', 'pain', 'physical', 'exercise', 'healing', 'stitches', 'වේදනාව', 'සුවය'],
  general: ['postpartum', 'mother', 'mom', 'parent', 'parenting', 'wellness', 'self care', 'අම්මා', 'මව'],
  happy: ['happy', 'joy', 'smile', 'grateful', 'positive', 'hopeful', 'good day', 'සතුටුයි', 'සතුටක්'],
  sad: ['sad', 'cry', 'unhappy', 'depressed', 'empty', 'down', 'දුකයි', 'කඳුළු', 'අඬනවා'],
  stressed: ['stress', 'stressed', 'pressure', 'tension', 'calm', 'relax', 'ආතතිය', 'පීඩනය'],
  anxious: ['anxious', 'anxiety', 'worry', 'worried', 'panic', 'scared', 'බයයි', 'කනස්සල්ල']
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const normalizeReasonKey = (reason) => {
  if (!reason) return 'general';
  const r = reason.toLowerCase().trim();
  if (r.includes('baby_feeding') || r.includes('baby feeding') || r.includes('breastfeeding_concerns')) return 'baby_feeding';
  if (r.includes('baby_sleep') || r.includes('baby sleep')) return 'baby_sleep';
  if (r.includes('sleep_problems') || r.includes('mother_sleep') || r.includes('mother sleep') || r.includes('sleepless')) return 'mother_sleep_problems';
  if (r.includes('crying') || r.includes('andanawa')) return 'baby_crying';
  if (r.includes('understanding') || r.includes('needs') || r.includes('caring') || r.includes('kaha')) return 'understanding_baby';
  if (r.includes('health') || r.includes('fever') || r.includes('una')) return 'baby_health';
  if (r.includes('anxiety') || r.includes('anxious') || r.includes('baya')) return 'anxiety';
  if (r.includes('lonely') || r.includes('loneliness')) return 'loneliness';
  if (r.includes('fatigue') || r.includes('tired') || r.includes('exhausted') || r.includes('mahansi')) return 'fatigue';
  if (r.includes('overwhelmed') || r.includes('stressed') || r.includes('stress')) return 'stress';
  if (r.includes('support')) return 'lack_of_support';
  if (r.includes('negative')) return 'negative_thoughts';
  if (r.includes('bonding')) return 'bonding_issues';
  if (r.includes('recovery') || r.includes('pain') || r.includes('discomfort') || r.includes('physical')) return 'physical_recovery';
  return 'general';
};

const normalizeEmotionKey = (emotion) => {
  if (!emotion) return 'default';
  const e = emotion.toLowerCase().trim();
  if (e === 'crying') return 'sad';
  if (e === 'tired') return 'fatigue';
  if (e === 'angry' || e === 'frustrated') return 'stressed';
  if (e === 'sleepy') return 'fatigue';
  if (e === 'calm') return 'happy';
  if (['happy', 'sad', 'stressed', 'anxious'].includes(e)) return e;
  return 'default';
};

// ============================================================
// CURATED VIDEO SELECTION PRIORITY LOGIC
// ============================================================
function getCuratedVideos(reason, emotion, babyContext) {
  const normReason = normalizeReasonKey(reason);
  const normEmotion = normalizeEmotionKey(emotion);

  const curatedList = [];
  const seenIds = new Set();

  const addVideo = (vId) => {
    if (!vId) return;
    if (seenIds.has(vId)) return;
    const details = ALL_CURATED_VIDEOS[vId];
    if (details) {
      curatedList.push({
        ...details,
        reason: normReason,
        source: 'curated'
      });
      seenIds.add(vId);
    }
  };

  const reasonConfig = CURATED_VIDEO_LIBRARY[normReason] || CURATED_VIDEO_LIBRARY.stress;

  // 1. Primary Reason Video (Video 1)
  const primaryId = reasonConfig.default?.[0];
  addVideo(primaryId);

  // 2. Emotion Specific Video (Video 2)
  const emotionSpecificId = reasonConfig[normEmotion]?.[0];
  if (emotionSpecificId) {
    addVideo(emotionSpecificId);
  } else {
    // Try the general emotion category default
    const fallbackEmotionCat = CURATED_VIDEO_LIBRARY[normEmotion];
    if (fallbackEmotionCat && fallbackEmotionCat.default?.[0]) {
      addVideo(fallbackEmotionCat.default[0]);
    }
  }

  // 3. Supportive / Relaxation Video (Video 3)
  const emotionSpecificSecondId = reasonConfig[normEmotion]?.[1];
  if (emotionSpecificSecondId) {
    addVideo(emotionSpecificSecondId);
  } else {
    // Fallback to relaxation/stress reduction video as default
    const supportiveId = 'fm5ZnhqWkO8'; // Soothing Postpartum Relaxation Music
    addVideo(supportiveId);
  }

  // If still fewer than 3, fill from the reason's default list
  if (curatedList.length < 3 && reasonConfig.default) {
    reasonConfig.default.forEach(vId => {
      if (curatedList.length < 3) {
        addVideo(vId);
      }
    });
  }

  return curatedList.slice(0, 3);
}

// ============================================================
// SEARCH QUERY GENERATION
// ============================================================
function getSearchQuery(reason, emotion, babyContext) {
  const normReason = normalizeReasonKey(reason);
  const normEmotion = normalizeEmotionKey(emotion);

  const reasonQueries = VIDEO_SEARCH_QUERIES[normReason] || VIDEO_SEARCH_QUERIES.loneliness;
  let query = reasonQueries[normEmotion] || reasonQueries.default;
  if (!query) {
    query = reasonQueries.default || "postpartum emotional wellness self care tips mothers sinhala";
  }
  return query;
}

// ============================================================
// RELEVANCE SCORING
// ============================================================
function scoreApiVideo(video, normReason, normEmotion, babyContext) {
  let score = 0;
  const title = (video.title || '').toLowerCase();
  const desc = (video.description || '').toLowerCase();
  const fullText = title + ' ' + desc;

  // 1. Negative Filtering / Hard exclusion (-50)
  const negativeKws = [
    'workout', 'weight loss', 'exercise routine', 'pregnancy workout', 'gym', 'fitness',
    'shorts', '#shorts', 'broken', 'status', 'whatsapp status', 'funny', 'fail', 'movie', 
    'trailer', 'song', 'music video', 'cover', 'unrelated', 'comedy', 'prank', 'celebrity',
    'gossip', 'drama', 'official video', 'teaser'
  ];
  const hasNegative = negativeKws.some(kw => title.includes(kw) || desc.includes(kw));
  if (hasNegative) {
    return -50; // Heavily penalize or reject
  }

  // 2. Reason Match (+5)
  const reasonKeywords = POSITIVE_KEYWORDS[normReason] || POSITIVE_KEYWORDS.general;
  const matchesReason = reasonKeywords.some(kw => title.includes(kw));
  if (matchesReason) {
    score += 5;
  }
  
  // 3. Description Match (+3)
  const matchesDesc = reasonKeywords.some(kw => desc.includes(kw));
  if (matchesDesc) {
    score += 3;
  }

  // 4. Emotion Match (+2)
  const emotionKeywords = POSITIVE_KEYWORDS[normEmotion] || [];
  const matchesEmotion = emotionKeywords.some(kw => fullText.includes(kw));
  if (matchesEmotion) {
    score += 2;
  }

  // 5. Baby Context Match (+4 when babyContext is active)
  if (babyContext || ['baby_feeding', 'baby_sleep', 'baby_crying', 'understanding_baby', 'baby_health', 'bonding_issues'].includes(normReason)) {
    const babyWords = ['baby', 'newborn', 'infant', 'child', 'toddler', 'ළදරු', 'බබා', 'දරුවා'];
    const hasBabyWord = babyWords.some(w => fullText.includes(w));
    if (hasBabyWord) {
      score += 4;
    }
  }

  // 6. Localized/Sinhala Relevance (+2)
  const hasSinhalaScript = /[\u0D80-\u0DFF]/.test(fullText);
  if (hasSinhalaScript) {
    score += 2;
  }

  // 7. Relevant content keyword booster (+2)
  const wellnessKeywords = ['care', 'parenting', 'maternal', 'postpartum', 'health', 'guide', 'tips', 'advice', 'soothe', 'education'];
  const hasWellness = wellnessKeywords.some(w => fullText.includes(w));
  if (hasWellness) {
    score += 2;
  }

  return score;
}

async function fetchYouTubeItems(query, apiKey, maxResults = 10) {
  const url = 'https://www.googleapis.com/youtube/v3/search';
  const response = await axios.get(url, {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults,
      key: apiKey
    }
  });
  return response.data?.items || [];
}

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

// Keep legacy generateQuery for compatibility if needed elsewhere
function generateQuery(reason, emotion, riskLevel, babyIntent) {
  const normReason = normalizeReasonKey(reason);
  const queries = VIDEO_SEARCH_QUERIES[normReason] || VIDEO_SEARCH_QUERIES.loneliness;
  return queries.default;
}

// ============================================================
// MAIN HYBRID RECOMMENDATION PIPELINE
// ============================================================
async function fetchAndRankVideos(reason, emotion, riskLevel, babyIntent) {
  const normReason = normalizeReasonKey(reason);
  const normEmotion = normalizeEmotionKey(emotion);
  const isBaby = (babyIntent === 'true' || babyIntent === true || ['baby_feeding', 'baby_sleep', 'baby_crying', 'understanding_baby', 'baby_health', 'bonding_issues'].includes(normReason));

  console.log(`\n--- [HYBRID VIDEO RECOMS] ---`);
  console.log(`Inputs: reason=${reason}, emotion=${emotion}, babyIntent=${babyIntent}`);
  console.log(`Resolved: reason=${normReason}, emotion=${normEmotion}, babyContext=${isBaby}`);

  // 1. Get Curated Videos (Max 3)
  const curated = getCuratedVideos(reason, emotion, isBaby);
  console.log(`Curated videos resolved: ${curated.length}`);

  // 2. Determine search query
  const searchQuery = getSearchQuery(reason, emotion, isBaby);
  console.log(`Search query: ${searchQuery}`);

  let apiVideos = [];
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      console.log(`Calling YouTube API...`);
      // Fetch 10-15 candidate videos
      const items = await fetchYouTubeItems(searchQuery, apiKey, 15);
      console.log(`YouTube API candidate results received: ${items.length}`);

      const normalized = items.map(item => normalizeVideoItem(item)).filter(v => v.id);

      // Score and rank candidates
      let scored = normalized.map(v => {
        const score = scoreApiVideo(v, normReason, normEmotion, isBaby);
        return { ...v, score, source: 'youtube' };
      });

      // Filter by threshold & enforce safety exclusions globally
      const threshold = 5;
      let filtered = scored.filter(v => {
        const titleLower = v.title.toLowerCase();
        if (
          v.id === 'UrfpkvvRTns' || 
          v.id === 'LjdtfeVxRm0' || 
          v.id === 'pbKy4RPq6gI' ||
          titleLower.includes('grammarly') || 
          titleLower.includes('body language tricks')
        ) {
          console.log(`[DEBUG fetchAndRankVideos] Filtered out blacklisted video: ${v.title}`);
          return false;
        }
        return v.score >= threshold;
      });

      console.log(`Candidates filtered/rejected: ${scored.length - filtered.length}`);

      // De-duplicate against curated list
      const curatedIds = new Set(curated.map(c => c.id));
      filtered = filtered.filter(v => !curatedIds.has(v.id));

      // Sort descending by score
      filtered.sort((a, b) => b.score - a.score);

      // Select top 2
      apiVideos = filtered.slice(0, 2);
      console.log(`Final API results selected (Max 2): ${apiVideos.length}`);
    } catch (err) {
      console.error('YouTube Service API error:', err.message);
    }
  } else {
    console.log('No YOUTUBE_API_KEY. Returning curated videos only.');
  }

  // Combine curated + API
  const merged = [...curated, ...apiVideos];

  // Final deduplication & capping at 5
  const seenIds = new Set();
  const finalVideos = [];
  for (let v of merged) {
    if (!seenIds.has(v.id)) {
      seenIds.add(v.id);
      finalVideos.push(v);
    }
  }

  const capped = finalVideos.slice(0, 5);
  console.log(`Final recommendations merged: ${capped.length}`);
  return capped;
}

module.exports = {
  generateQuery,
  getCuratedVideos,
  fetchAndRankVideos
};
