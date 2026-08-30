// ================================================================
// KNOWLEDGE LIBRARY — knowledgeLibrary.js
// Centralized Educational Resources for Postpartum & Baby Care
// ================================================================

export const KNOWLEDGE_CATEGORIES = [
  { id: 'all', label: 'සියල්ල', icon: '✨' },
  { id: 'baby_care', label: 'දරුවාගේ රැකවරණය', icon: '👶' },
  { id: 'mother_care', label: 'මවගේ සුවසෙත', icon: '🌸' },
  { id: 'mental_wellbeing', label: 'මානසික සුවය', icon: '🧘' },
  { id: 'podcasts', label: 'පොඩ්කාස්ට්', icon: '🎙️' },
  { id: 'books_audio', label: 'පොත් සහ ශ්‍රව්‍ය', icon: '📚' },
  { id: 'learning', label: 'ඉගෙනුම් පාඨමාලා', icon: '🎓' },
  { id: 'social_support', label: 'සමාජීය සහය', icon: '🤝' },
  { id: 'lifestyle', label: 'ජීවන රටාව', icon: '🌿' },
  { id: 'useful_apps', label: 'වැදගත් ඇප්ස්', icon: '📱' },
];

export const KNOWLEDGE_RESOURCES = [
  // ── BABY CARE ──────────────────────────────────────────────
  {
    id: 'kb_b1',
    title: 'මව්කිරි දීමේ නිවැරදි ක්‍රම සහ ඉරියව්',
    titleEn: 'Breastfeeding Basics & Positioning',
    description: 'මව්කිරි දීමේදී දරුවා නිවැරදිව තබාගන්නා ආකාරය සහ ගැටලු මගහරවා ගැනීම.',
    category: 'baby_care',
    subCategory: 'Feeding',
    type: 'article',
    tags: ['breastfeeding', 'latch', 'feeding', 'mother milk', 'මව්කිරි'],
    thumbnail: '🤱',
    url: 'https://www.who.int/health-topics/breastfeeding',
    duration: 'විනාඩි 5 කියවීම',
    age_group: '0-6 මාස',
    language: 'si',
    source: 'WHO / MOH Sri Lanka'
  },
  {
    id: 'kb_b1_unicef_soothe',
    title: 'අඬන බබාව සන්සුන් කරන්නේ කෙසේද',
    titleEn: 'How to Soothe a Crying Baby - UNICEF Guide',
    description: 'ළදරු ඇඬීම, සංඥා සහ බබාව සන්සුන් කිරීම සඳහා UNICEF මඟින් ලබාදෙන නිල උපදෙස්.',
    category: 'baby_care',
    subCategory: 'Crying & Soothing',
    type: 'article',
    tags: ['soothe baby', 'crying', 'baby cues', 'baby needs', 'unicef', 'සන්සුන් කිරීම'],
    thumbnail: '👶',
    url: 'https://www.unicef.org/parenting/child-care/how-soothe-baby',
    duration: 'විනාඩි 5 කියවීම',
    age_group: '0-12 මාස',
    language: 'si',
    source: 'UNICEF Parenting'
  },
  {
    id: 'kb_b2',
    title: 'ප්‍රථම ඝන ආහාර ලබාදීම (මාස 6 සිට)',
    titleEn: 'Introducing Solid Foods from 6 Months',
    description: 'මාස 6 පිරුණු පසු දරුවාට ආරක්ෂිතව පෝෂ්‍යදායී ඝන ආහාර හඳුන්වා දීම.',
    category: 'baby_care',
    subCategory: 'Solid Foods',
    type: 'article',
    tags: ['solid foods', 'weaning', 'nutrition', '6 months', 'ආහාර'],
    thumbnail: '🥣',
    url: 'https://www.unicef.org/parenting/food-nutrition/feeding-your-baby-6-12-months',
    duration: 'විනාඩි 7 කියවීම',
    age_group: '6-12 මාස',
    language: 'si',
    source: 'UNICEF Parenting'
  },
  {
    id: 'kb_b3',
    title: 'දරුවාගේ රාත්‍රී නින්ද සදහා සාර්ථක ක්‍රමවේද',
    titleEn: 'Infant Sleep Routine & Safe Sleep',
    description: 'දරුවාට ආරක්ෂිතව හා සුවපහසුව රාත්‍රියේ නිදාගැනීමට උපකාරී වන පුරුදු.',
    category: 'baby_care',
    subCategory: 'Sleep',
    type: 'article',
    tags: ['sleep', 'routine', 'crying', 'night sleep', 'නින්ද'],
    thumbnail: '🌙',
    url: 'https://www.sleepfoundation.org/baby-sleep',
    duration: 'විනාඩි 6 කියවීම',
    age_group: '0-12 මාස',
    language: 'si',
    source: 'Sleep Foundation'
  },
  {
    id: 'kb_b4',
    title: 'ළදරු උණ තත්ත්වයන් සහ හදිසි අවස්ථා',
    titleEn: 'Managing Baby Fever & Emergency Signs',
    description: 'උණ පරීක්ෂා කිරීම, නිවසේදී කළ යුතු දේ සහ වෛද්‍යවරයකු හමුවිය යුතු අවස්ථා.',
    category: 'baby_care',
    subCategory: 'Health & Fever',
    type: 'article',
    tags: ['fever', 'health', 'emergency', 'doctor', 'උණ', 'වෛද්‍ය'],
    thumbnail: '🌡️',
    url: 'https://www.health.gov.lk',
    duration: 'විනාඩි 4 කියවීම',
    age_group: '0-12 මාස',
    language: 'si',
    source: 'MOH Sri Lanka'
  },
  {
    id: 'kb_b5',
    title: 'ශ්‍රී ලංකාවේ ප්‍රතිශක්තිකරණ එන්නත් සටහන',
    titleEn: 'National Immunization Schedule Sri Lanka',
    description: 'උපතේ සිට දරුවාට ලබාදිය යුතු අනිවාර්ය එන්නත් සහ කාලසටහන.',
    category: 'baby_care',
    subCategory: 'Vaccination',
    type: 'article',
    tags: ['vaccination', 'immunization', 'clinic', 'එන්නත්'],
    thumbnail: '💉',
    url: 'http://www.epid.gov.lk',
    duration: 'විනාඩි 5 කියවීම',
    age_group: '0-12 මාස',
    language: 'si',
    source: 'Epidemiology Unit Sri Lanka'
  },

  // ── MOTHER CARE ───────────────────────────────────────────
  {
    id: 'kb_m1',
    title: 'පශ්චාත් ප්‍රසව ශාරීරික සුවය සහ පෝෂණය',
    titleEn: 'Postpartum Physical Recovery & Nutrition',
    description: 'ප්‍රසවයෙන් පසු මවගේ ශරීරය නැවත ශක්තිමත් කරගැනීමට අවශ්‍ය ආහාර හා විශ්‍රාමය.',
    category: 'mother_care',
    subCategory: 'Recovery',
    type: 'article',
    tags: ['recovery', 'postpartum', 'nutrition', 'c-section', 'ප්‍රසවය'],
    thumbnail: '🌸',
    url: 'https://www.acog.org/womens-health/faqs/postpartum-recovery',
    duration: 'විනාඩි 8 කියවීම',
    age_group: 'Mothers',
    language: 'si',
    source: 'ACOG Healthcare Guidance'
  },
  {
    id: 'kb_m2',
    title: 'ප්‍රසවයෙන් පසු මානසික පීඩනය සහ Baby Blues',
    titleEn: 'Understanding Postpartum Mood Shifts',
    description: 'හෝමෝන වෙනස්වීම් නිසා ඇතිවන මානසික වෙනස්කම් හඳුනාගැනීම සහ සහනය.',
    category: 'mother_care',
    subCategory: 'Mental Health',
    type: 'article',
    tags: ['postpartum depression', 'baby blues', 'mental health', 'ආතතිය'],
    thumbnail: '💜',
    url: 'https://www.postpartum.net',
    duration: 'විනාඩි 6 කියවීම',
    age_group: 'Mothers',
    language: 'si',
    source: 'Postpartum Support International'
  },

  // ── MENTAL WELLBEING ──────────────────────────────────────
  {
    id: 'kb_w1',
    title: 'විනාඩි 5ක ගැඹුරු ශ්වසන අභ්‍යාසය (Box Breathing)',
    titleEn: '5-Minute Box Breathing Technique',
    description: 'ක්ෂණිකව සිත සන්සුන් කරගැනීමට හා කනස්සල්ල දුරු කරගැනීමට ශ්වසන ක්‍රමය.',
    category: 'mental_wellbeing',
    subCategory: 'Breathing',
    type: 'article',
    tags: ['breathing', 'mindfulness', 'anxiety', 'calm', 'ශ්වසනය'],
    thumbnail: '🧘',
    url: 'https://www.healthline.com/health/box-breathing',
    duration: 'විනාඩි 5 අභ්‍යාසය',
    age_group: 'All',
    language: 'si',
    source: 'Mindfulness Practice'
  },

  // ── PODCASTS ──────────────────────────────────────────────
  {
    id: 'kb_p1',
    title: 'The Birth Hour — Maternal Support Podcast',
    titleEn: 'The Birth Hour',
    description: 'නව මව්වරුන්ගේ සැබෑ අත්දැකීම් සහ ශක්තිමත් වීමේ කතාන්දර.',
    category: 'podcasts',
    subCategory: 'Parenting Podcasts',
    type: 'podcast',
    tags: ['podcast', 'stories', 'motherhood', 'පොඩ්කාස්ට්'],
    thumbnail: '🎙️',
    url: 'https://thebirthhour.com',
    duration: 'විනාඩි 45',
    age_group: 'Mothers',
    language: 'en',
    source: 'The Birth Hour'
  },

  // ── BOOKS & AUDIO ─────────────────────────────────────────
  {
    id: 'kb_bk1',
    title: 'The Fourth Trimester — Postpartum Guide',
    titleEn: 'The Fourth Trimester',
    description: 'ප්‍රසවයෙන් පසු පළමු මාස 3 තුළ මවගේ හා දරුවාගේ සුවසෙත පිළිබඳ පරිපූර්ණ මඟපෙන්වීම.',
    category: 'books_audio',
    subCategory: 'Books',
    type: 'book',
    tags: ['book', 'postpartum', 'fourth trimester', 'පොත්'],
    thumbnail: '📖',
    url: 'https://www.audible.com',
    duration: 'පොත / ශ්‍රව්‍ය',
    age_group: 'Mothers',
    language: 'en',
    source: 'Audible / Books'
  },

  // ── LEARNING & TED TALKS ──────────────────────────────────
  {
    id: 'kb_l1',
    title: 'TED Talk: How Caregiving Shapes the Brain',
    titleEn: 'Parenting & Neuroplasticity TED Talk',
    description: 'මව්පිය රැකවරණය දරුවාගේ මොළයේ වර්ධනයට බලපාන ආකාරය.',
    category: 'learning',
    subCategory: 'TED Talks',
    type: 'video',
    tags: ['ted', 'talk', 'learning', 'brain', 'child development'],
    thumbnail: '🎬',
    url: 'https://www.ted.com/talks',
    duration: 'විනාඩි 15',
    age_group: 'Parents',
    language: 'en',
    source: 'TED Conferences'
  },

  // ── SOCIAL SUPPORT ────────────────────────────────────────
  {
    id: 'kb_s1',
    title: 'ශ්‍රී ලංකා ජාතික මානසික සෞඛ්‍ය උපකාරක සේවාව (1926)',
    titleEn: 'National Mental Health Helpline 1926',
    description: 'පැය 24 පුරා නොමිලේ ලබාගත හැකි රහස්‍ය මානසික සෞඛ්‍ය උපදේශනය.',
    category: 'social_support',
    subCategory: 'Helplines',
    type: 'article',
    tags: ['helpline', 'support', '1926', 'mental health', 'උපකාරක සේවය'],
    thumbnail: '📞',
    url: 'tel:1926',
    duration: 'ක්ෂණික ඇමතුම්',
    age_group: 'All',
    language: 'si',
    source: 'NIMH Sri Lanka'
  },

  // ── USEFUL APPS ───────────────────────────────────────────
  {
    id: 'kb_a1',
    title: 'Insight Timer — නොමිලේ ධ්‍යාන සහ සන්සුන් සංගීතය',
    titleEn: 'Insight Timer Meditation App',
    description: 'සන්සුන් නින්දක් සහ ආතතිය දුරුකර ගැනීමට නොමිලේ භාවිත කළ හැකි ඇප් එකක්.',
    category: 'useful_apps',
    subCategory: 'Mindfulness Apps',
    type: 'app',
    tags: ['app', 'insight timer', 'meditation', 'sleep', 'ඇප්'],
    thumbnail: '📱',
    url: 'https://insighttimer.com',
    duration: 'නොමිලේ ඇප් එක',
    age_group: 'All',
    language: 'en/si',
    source: 'App Store / Play Store'
  }
];
