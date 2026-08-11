// ================================================================
// ACTIVITIES LIBRARY — activitiesLibrary.js
// ================================================================
//
// EXACT IF-THEN RECOMMENDATION RULES:
// ─────────────────────────────────────────────────────────────
// Each reason gets:
//   - 1 specific Music type
//   - 1 specific Video type
//   - Activities filtered by risk level
//   - 1 specific Game
//
// risk=medium → ONLY calming low-effort items (breathing first)
// risk=low    → full range for that reason
//
// CONTENT MAP (from your specification):
// Loneliness    → Calm piano | "You are not alone" video | Write 3 positive thoughts | Puzzle game
// Fatigue       → Relaxation audio | Rest guidance video | Short breathing | Bubble pop
// Anxiety       → Meditation music | Anxiety calming video | Guided meditation | Focus tapping
// Bonding Issue → Mother-baby songs | Parenting bonding video | Talk with baby | Baby interaction
// Lack Support  → Emotional healing music | Encouragement video | Gratitude writing | Affirmation game
// Sleep Problem → Sleep music/rain | Sleep meditation video | Night relaxation | Calm visual game
// Loss Confid.  → Motivational songs | Confidence video | Positive affirmations | Achievement game
// Overwhelmed   → Nature sounds | Stress relief video | Deep breathing | Stress relief tapping
// Physical Disc.→ Soft calming music | Light exercise video | Gentle stretching | Light interaction
// Negative Tht. → Emotional healing music | Positive mindset video | Journaling | Positive thinking
// ================================================================

// ── ALL ACTIVITIES ───────────────────────────────────────────
export const ALL_ACTIVITIES = [
  {
    id:'breathing_478', icon:'🌬️',
    label:'4-7-8 ශ්වාසය', labelEn:'4-7-8 Breathing',
    desc:'කාංසාව ක්ෂණිකව සන්සිඳවීම', duration:'විනාඩි 5',
    category:'ශ්වාස', color:['#EDE7F6','#D1C4E9'], accent:'#7E57C2',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:4, instruction:'නාසය දිගේ සෙමෙන් ශ්වාස ගන්න', scale:1.6},
      {name:'රඳවා ගන්න',     seconds:7, instruction:'ශ්වාසය මෘදුව රඳවා ගන්න',       scale:1.6},
      {name:'ශ්වාස හළ ගන්න', seconds:8, instruction:'මුඛය දිගේ සෙමෙන් ශ්වාස හළ ගන්න', scale:1.0},
    ],
    cycles:4,
    intro:'ස්නායු පද්ධතිය සක්‍රිය කර කාංසාව මිනිත්තු කිහිපයකින් අඩු කරයි. රාත්‍රියේ නිදා ගැනීමට ද ශ්‍රේෂ්ඨ.',
  },
  {
    id:'box_breathing', icon:'📦',
    label:'කොටු ශ්වාසය', labelEn:'Box Breathing',
    desc:'ස්නායු පද්ධතිය සමතුලිත කිරීම', duration:'විනාඩි 4',
    category:'ශ්වාස', color:['#E3F2FD','#BBDEFB'], accent:'#1565C0',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:4, instruction:'නාසය දිගේ ශ්වාස ගන්න',        scale:1.5},
      {name:'රඳවා ගන්න',     seconds:4, instruction:'රඳවා ගන්න',                    scale:1.5},
      {name:'ශ්වාස හළ ගන්න', seconds:4, instruction:'සෙමෙන් ශ්වාස හළ ගන්න',        scale:1.0},
      {name:'රඳවා ගන්න',     seconds:4, instruction:'ඊළඟ ශ්වාසයට පෙර රඳවා ගන්න',   scale:1.0},
    ],
    cycles:5,
    intro:'ශ්‍රේෂ්ඨ. ආතතිය ඉහළ දිනවලට.',
  },
  {
    id:'short_breathing', icon:'💨',
    label:'කෙටි ශ්වාස ව්‍යායාම', labelEn:'Short Breathing Exercise',
    desc:'ශ්‍රාන්තතාවෙදී ශීඝ්‍ර සහනය', duration:'විනාඩි 2',
    category:'ශ්වාස', color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:4, instruction:'නාසය දිගේ ශ්වාස ගන්න',        scale:1.4},
      {name:'ශ්වාස හළ ගන්න', seconds:6, instruction:'මුඛය දිගේ ශ්වාස හළ ගන්න',    scale:1.0},
    ],
    cycles:3,
    intro:'ශ්‍රාන්තතාවෙදී ලේසියෙන් කළ හැකි ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'night_breathing', icon:'🌙',
    label:'රාත්‍රී ශ්වාස ව්‍යායාම', labelEn:'Night Relaxation Exercise',
    desc:'නිදා ගැනීමට සූදානම', duration:'විනාඩි 5',
    category:'ශ්වාස', color:['#E8EAF6','#C5CAE9'], accent:'#3949AB',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:4, instruction:'සෙමෙන් ශ්වාස ගන්න',           scale:1.4},
      {name:'රඳවා ගන්න',     seconds:6, instruction:'රඳවා ගන්න',                    scale:1.4},
      {name:'ශ්වාස හළ ගන්න', seconds:8, instruction:'ඉතා සෙමෙන් ශ්වාස හළ ගන්න',   scale:1.0},
    ],
    cycles:3,
    intro:'නිදා ගැනීමට පෙර කරන ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශරීරය ශ්‍රාන්ත කරයි.',
  },
  {
    id:'guided_meditation', icon:'🧘',
    label:'ශ්‍රේෂ්ඨ සිහිකල්පනාව', labelEn:'Guided Meditation',
    desc:'සිත සන්සිඳවීම', duration:'විනාඩි 10',
    category:'සිහිකල්පනාව', color:['#F3E5F5','#E1BEE7'], accent:'#8E24AA',
    type:'guided',
    steps:[
      {label:'ස්ථාවරව සිටීම',  duration:30,  text:'සුවපහසු ලෙස සිටින්න. ඇස් වසන්න. ගැඹුරු ශ්වාස 3ක් ගන්න.'},
      {label:'සිත ශ්‍රේෂ්ඨ',   duration:60,  text:'ඔබේ සිතිවිලි ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශරීරය ශ්‍රේෂ්ඨ',  duration:90,  text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:120, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'සෙමෙන් නැවත',    duration:30,  text:'ඇඟිලි සොළවන්න. ගැඹුරු ශ්වාස. ඇස් ඇරෙන්න. 🌸'},
    ],
    intro:'කාංසාව සිදිරි ගිය කල සිත සන්සිඳවීමේ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'grounding_54321', icon:'🌿',
    label:'5-4-3-2-1 ගොඩ නැගීම', labelEn:'5-4-3-2-1 Grounding',
    desc:'වර්තමානයට නැඟ බැඳීම', duration:'විනාඩි 5',
    category:'ගොඩ නැගීම', color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32',
    type:'guided',
    steps:[
      {label:'දිය හැකි 5ක්',   duration:60, text:'දැන් ඔබ දකින ඕනෑම දේ 5ක් නම් කරන්න.'},
      {label:'ස්පර්ශ 4ක්',     duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 4ක් ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රවණය 3ක්',    duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 3ක් ශ්‍රේෂ්ඨ.'},
      {label:'සුවඳ 2ක්',       duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 2ක් ශ්‍රේෂ්ඨ.'},
      {label:'රස 1ක්',         duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ඔබ ආරක්ෂිතයි. 💜'},
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'deep_breathing', icon:'💪',
    label:'ගැඹුරු ශ්වාස', labelEn:'Deep Breathing',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 5',
    category:'ශ්වාස', color:['#FFF3E0','#FFE0B2'], accent:'#E65100',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:5, instruction:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', scale:1.6},
      {name:'ශ්වාස හළ ගන්න', seconds:7, instruction:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', scale:1.0},
    ],
    cycles:6,
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'journaling', icon:'📓',
    label:'දිනපොත් ශ්‍රේෂ්ඨ', labelEn:'Journaling Activity',
    desc:'හැඟීම් ප්‍රකාශ කිරීම', duration:'විනාඩි 10',
    category:'ලිවීම', color:['#FFF9C4','#FFF3A0'], accent:'#F57F17',
    type:'prompts',
    prompts:[
      'දැන් මා දකින හැඟීම කුමක්ද?',
      'අද දරුවාට හෝ මට ආදරය දැක්වූ මොහොතක්?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'write_positive', icon:'✍️',
    label:'ශ්‍රේෂ්ඨ 3ක් ලියන්න', labelEn:'Write 3 Positive Thoughts',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 5',
    category:'ලිවීම', color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32',
    type:'prompts',
    prompts:[
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 1 ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 2 ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 3 ශ්‍රේෂ්ඨ?',
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'gratitude_writing', icon:'🙏',
    label:'ශ්‍රේෂ්ඨ ලිවීම', labelEn:'Gratitude Writing',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 8',
    category:'ලිවීම', color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32',
    type:'prompts',
    prompts:[
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 3ක් ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'gentle_stretch', icon:'🌸',
    label:'මෘදු ශ්‍රේෂ්ඨ', labelEn:'Gentle Stretching',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 8',
    category:'ව්‍යායාම', color:['#FCE4EC','#F8BBD9'], accent:'#C2185B',
    type:'guided',
    steps:[
      {label:'බෙල්ල ශ්‍රේෂ්ඨ', duration:60, text:'හිස සෙමෙන් ශ්‍රේෂ්ඨ. 5ක්.'},
      {label:'උරහිස් ශ්‍රේෂ්ඨ', duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:90, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'rest_meditation', icon:'😴',
    label:'ශ්‍රාන්ත සිහිකල්පනාව', labelEn:'Rest Meditation',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 15',
    category:'නිදා ගැනීම', color:['#E8EAF6','#C5CAE9'], accent:'#3949AB',
    type:'guided',
    steps:[
      {label:'ශ්‍රේෂ්ඨ', duration:60,  text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රේෂ්ඨ', duration:120, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රේෂ්ඨ', duration:300, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'affirmation_activity', icon:'✨',
    label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', labelEn:'Positive Affirmation Activity',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 7',
    category:'සිහිකල්පනාව', color:['#FFF3E0','#FFE0B2'], accent:'#E65100',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:4, instruction:'"මම ශ්‍රේෂ්ඨ" සිතමින්',    scale:1.5},
      {name:'රඳවා ගන්න',     seconds:4, instruction:'"මට හැකිය" සිතමින්',        scale:1.5},
      {name:'ශ්වාස හළ ගන්න', seconds:6, instruction:'"මම ප්‍රමාණවත්" සිතමින්',  scale:1.0},
    ],
    cycles:6,
    affirmations:['මම ශ්‍රේෂ්ඨ 💜','ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸','ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ✨','ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌿'],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },

  {
    id:'positive_thinking_act', icon:'🌈',
    label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', labelEn:'Positive Thinking Activity',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 8',
    category:'ලිවීම', color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32',
    type:'prompts',
    prompts:[
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
];

// ── NEW EMOTIONAL SUPPORT ACTIVITIES ─────────────────────────
export const NEW_ACTIVITIES = [
  {
    id: 'new_deep_breathing', icon: '🌬️', label: 'ගැඹුරු ශ්වාස ව්‍යායාමය', purpose: 'කාංසාව සහ ආතතිය අඩු කරයි.', duration: 'විනාඩි 5',
    instructions: ['සුවපහසුව අසුන්ගන්න.', 'උරහිස් ලිහිල් කරන්න.', 'තත්පර 4ක් ශ්වාසය ඇතුළට ගන්න.', 'තත්පර 4ක් ශ්වාසය රඳවා ගන්න.', 'තත්පර 6ක් ශ්වාසය පිට කරන්න.', '10 වරක් නැවත නැවත කරන්න.'],
    benefits: ['කාංසාව අඩු කරයි', 'විවේකය ලබා දෙයි', 'හැඟීම් පාලනය වැඩි දියුණු කරයි'], isNewFormat: true
  },
  {
    id: 'new_478_breathing', icon: '🍃', label: '4-7-8 ශ්වාස ව්‍යායාමය', purpose: 'ස්නායු පද්ධතිය සන්සුන් කර ආතතිය අඩු කරයි.', duration: 'විනාඩි 5–8',
    instructions: ['නාසයෙන් තත්පර 4ක් ශ්වාසය ඇතුළට ගන්න.', 'තත්පර 7ක් ශ්වාසය රඳවා ගන්න.', 'මුඛයෙන් තත්පර 8ක් සෙමෙන් ශ්වාසය පිට කරන්න.', '5–8 වරක් නැවත නැවත කරන්න.'],
    benefits: ['කාංසාව අඩු කරයි', 'ආතතිය අඩු කරයි', 'හැඟීම් පාලනය වැඩි දියුණු කරයි', 'සහනය ලබා දෙයි'], isNewFormat: true
  },
  {
    id: 'new_box_breathing', icon: '📦', label: 'සමචතුරස්‍ර ශ්වාසය', purpose: 'අවධානය වැඩි දියුණු කර මානසික ආතතිය අඩු කරයි.', duration: 'විනාඩි 5',
    instructions: ['තත්පර 4ක් ශ්වාසය ඇතුළට ගන්න.', 'තත්පර 4ක් රඳවා ගන්න.', 'තත්පර 4ක් පිට කරන්න.', 'නැවත තත්පර 4ක් රඳවා ගන්න.', 'කිහිප වරක් නැවත කරන්න.'],
    benefits: ['අවධානය වැඩි කරයි', 'ආතතිය අඩු කරයි', 'මනස සන්සුන් කරයි'], isNewFormat: true
  },
  {
    id: 'new_gratitude_journal', icon: '📓', label: 'කෘතඥතා සටහන', purpose: 'ධනාත්මක චින්තනය දිරිමත් කරයි.', duration: 'විනාඩි 5–10',
    instructions: ['පහත දෑ ලියන්න:', 'අද ඔබ කෘතඥ වන කරුණු තුනක්.', 'ඔබේ දරුවා හෝ පවුල සමඟ වූ එක් සුන්දර මොහොතක්.', 'අද ඔබ ආඩම්බර වන එක් දෙයක්.'],
    benefits: ['ධනාත්මක බව වර්ධනය කරයි', 'සතුට වැඩි කරයි', 'මනෝභාවය යහපත් කරයි'], isNewFormat: true
  },
  {
    id: 'new_positive_affirmations', icon: '✨', label: 'ධනාත්මක ප්‍රකාශ', purpose: 'ආත්ම විශ්වාසය ගොඩනඟා ඍණාත්මක සිතුවිලි අඩු කරයි.', duration: 'විනාඩි 5',
    instructions: ['එක් එක් ප්‍රකාශය සෙමෙන් කියවන්න.', 'උදාහරණ:', 'මම මගේ උපරිමය කරමි.', 'මා සහ මගේ දරුවා එක්ව ඉගෙන ගනිමින් සිටිමු.', 'උදව් ඉල්ලා සිටීම වරදක් නොවේ.', 'සෑම දිනකම නව ආරම්භයකි.', 'මම සිතනවාට වඩා ශක්තිමත් ය.'],
    benefits: ['ආත්ම විශ්වාසය ගොඩනඟයි', 'ඍණාත්මක සිතුවිලි අඩු කරයි', 'ස්වයං ආදරය දිරිමත් කරයි'], isNewFormat: true
  },
  {
    id: 'new_emotion_check_in', icon: '😊', label: 'හැඟීම් පරීක්ෂාව', purpose: 'මව්වරුන්ට ඔවුන්ගේ හැඟීම් පිළිබඳ අවබෝධයක් ලබා දෙයි.', duration: 'විනාඩි 2–3',
    instructions: ['අදට අදාළ ඉමොජිය තෝරන්න.', 'ඔබේ මනෝභාවය තෝරන්න.', 'මෙලෙස හැඟීමට හේතුව එක් වාක්‍යයකින් ලියන්න.', 'සටහන සුරකින්න.'],
    benefits: ['හැඟීම් පිළිබඳ දැනුවත්භාවය වැඩි කරයි', 'ආරක්ෂිතව අදහස් ප්‍රකාශ කිරීමට ඉඩ දෙයි', 'මනෝභාවය නිරීක්ෂණය කිරීමට උපකාරී වේ'], isNewFormat: true
  },
  {
    id: 'new_five_senses_grounding', icon: '🖐️', label: 'ඉන්ද්‍රියන් 5 ගොඩනැගීම', purpose: 'කාංසාව සහ කලබලය අඩු කිරීමට උපකාරී වේ.', duration: 'විනාඩි 5',
    instructions: ['පහත දෑ සොයන්න:', 'ඔබට පෙනෙන දේවල් 5ක්', 'ඔබට ස්පර්ශ කළ හැකි දේවල් 4ක්', 'ඔබට ඇසෙන දේවල් 3ක්', 'ඔබට සුවඳ දැනෙන දේවල් 2ක්', 'ඔබට රස දැනෙන 1 දෙයක්'],
    benefits: ['කාංසාව අඩු කරයි', 'වර්තමානයට යොමු කරයි', 'කලබලය නවතයි'], isNewFormat: true
  },
  {
    id: 'new_calm_coloring', icon: '🖍️', label: 'සන්සුන්ව වර්ණ ගැන්වීම', purpose: 'සහනය ලබා දෙයි.', duration: 'විනාඩි 10–20',
    instructions: ['යෙදුම මගින් සරල මණ්ඩලයක් හෝ මල් රටාවක් පෙන්වයි.', 'වර්ණ තෝරා රූපය වර්ණ ගන්වන්න.', 'අවසන් වූ පසු "විශිෂ්ටයි! ඔබ අද දින සහන ක්‍රියාකාරකම සම්පූර්ණ කළා" ලෙස පෙන්වයි.'],
    benefits: ['සහනය ලබා දෙයි', 'මනස වෙනතකට යොමු කරයි', 'නිර්මාණශීලිත්වය දිරිමත් කරයි'], isNewFormat: true
  },
  {
    id: 'new_bubble_pop', icon: '🫧', label: 'බුබුළු පිපිරවීම', purpose: 'ආතතිය අඩු කර කෙටි විවේකයක් ලබා දෙයි.', duration: 'විනාඩි 3–5',
    instructions: ['බුබුළු ඉහළට පාවී යයි.', 'ඒවා අතුරුදහන් වීමට පෙර ස්පර්ශ කරන්න.', 'සෑම පිපිරවීමකටම එක් ලකුණක් ලැබේ.', 'සන්සුන් පසුබිම් සංගීතයක් වාදනය වේ.', 'පරාජයක් නොමැත.'],
    benefits: ['ආතතිය අඩු කරයි', 'කෙටි විවේකයක් ලබා දෙයි', 'විනෝදජනකයි'], isNewFormat: true
  },
  {
    id: 'new_memory_card', icon: '🃏', label: 'මතක ගැළපීම', purpose: 'අවධානය සහ සාන්ද්‍රණය වැඩි දියුණු කරයි.', duration: 'විනාඩි 5',
    instructions: ['කාඩ්පත් මුහුණත පහළට හැරී ඇත.', 'කාඩ්පත් දෙකක් ස්පර්ශ කරන්න.', 'සමාන යුගල ගළපන්න.', 'සියලු යුගල ගළපා අවසන් කරන්න.', 'මෘදු ළදරු රූප භාවිතා වේ.'],
    benefits: ['සාන්ද්‍රණය වැඩි කරයි', 'අවධානය යොමු කරයි', 'මෘදු මානසික ව්‍යායාමයකි'], isNewFormat: true
  },
  {
    id: 'new_baby_interaction_ideas', icon: '👶', label: 'ළදරුවා සමඟ බැඳීම', purpose: 'නිරෝගී බැඳීමක් දිරිමත් කරයි.', duration: 'විනාඩි 10',
    instructions: ['යෙදුම අහඹු ලෙස ක්‍රියාකාරකම් යෝජනා කරයි:', 'ඔබේ දරුවාට සිනාසෙන්න.', 'දරුවා සමඟ කතා කරන්න.', 'නැළවිලි ගීතයක් ගායනා කරන්න.', 'කෙටි කතාවක් කියවන්න.', 'දරුවා තුරුලු කරගන්න.', 'කිරි දෙන අතරතුර ඇස් දෙස බලන්න.', 'අවසන් වූ පසු සම්පූර්ණ කළා යන්න ස්පර්ශ කරන්න.'],
    benefits: ['නිරෝගී බැඳීමක් ඇති කරයි', 'දරුවාගේ මනෝභාවය යහපත් කරයි', 'ආදරය වැඩි කරයි'], isNewFormat: true
  },
  {
    id: 'new_relaxing_music', icon: '🎵', label: 'සන්සුන් සංගීතය', purpose: 'මානසික විවේකය ලබා දෙයි.', duration: 'විනාඩි 10–20',
    instructions: ['පහසු නම් හෙඩ්ෆෝන් පළඳින්න.', 'නිශ්ශබ්දව අසුන් ගන්න.', 'සන්සුන් සංගීතය වාදනය කරන්න.', 'ඇස් වසා ගන්න.', 'ශ්වසනය කෙරෙහි අවධානය යොමු කරන්න.'],
    benefits: ['මානසික විවේකය ලබා දෙයි', 'හෘද ස්පන්දන වේගය අඩු කරයි', 'සහනය ගෙන දෙයි'], isNewFormat: true
  },
  {
    id: 'new_guided_meditation', icon: '🧘', label: 'මඟ පෙන්වන භාවනාව', purpose: 'මනස සන්සුන් කිරීමට උපකාරී වේ.', duration: 'විනාඩි 10',
    instructions: ['ශ්‍රව්‍ය මඟ පෙන්වීම ආරම්භ කරන්න.', 'හොඳින් සවන් දෙන්න.', 'ශ්වසන උපදෙස් අනුගමනය කරන්න.', 'සැසිය සම්පූර්ණ කරන්න.'],
    benefits: ['මනස සන්සුන් කරයි', 'අවධානය වැඩි කරයි', 'ගැඹුරු විවේකය ලබා දෙයි'], isNewFormat: true
  },
  {
    id: 'new_drink_water', icon: '💧', label: 'ජලය පානය කිරීම', purpose: 'සිරුරේ ජල ප්‍රමාණය පවත්වා ගනී.', duration: 'විනාඩි 1',
    instructions: ['එක් ජල වීදුරුවක් පානය කරන්න.', 'සම්පූර්ණ කළා යන්න ස්පර්ශ කරන්න.'],
    benefits: ['ජල ප්‍රමාණය පවත්වා ගනී', 'ශාරීරික සෞඛ්‍යය නංවයි', 'ප්‍රබෝධමත් කරයි'], isNewFormat: true
  },
  {
    id: 'new_self_care_checklist', icon: '📋', label: 'ස්වයං-රැකවරණ ලැයිස්තුව', purpose: 'දෛනික සෞඛ්‍ය සම්පන්න පුරුදු දිරිමත් කරයි.', duration: 'විනාඩි 2',
    instructions: ['සම්පූර්ණ කළ අයිතම සලකුණු කරන්න.', 'උදාහරණ:', '☐ ප්‍රමාණවත් තරම් ජලය පානය කළා', '☐ උදෑසන ආහාරය ගත්තා', '☐ ඖෂධ ලබා ගත්තා', '☐ විවේක ගත්තා', '☐ යමෙකු සමඟ කතා කළා', '☐ කෙටි වේලාවකට හෝ පිටතට ගියා'],
    benefits: ['යහපත් පුරුදු දිරිමත් කරයි', 'තෘප්තියක් ලබා දෙයි', 'දෛනික කාලසටහනක් ගොඩනඟයි'], isNewFormat: true
  },
  {
    id: 'new_gentle_stretch', icon: '🤸', label: 'මෘදු ව්‍යායාම', purpose: 'වෛද්‍ය උපදෙස් මත සැහැල්ලු චලනයන් දිරිමත් කරයි.', duration: 'විනාඩි 5',
    instructions: ['යෙදුමේ පෙන්වා ඇති පරිදි බෙල්ල, උරහිස් සහ අත් මෘදු ලෙස දිගහරින්න.', 'සටහන: ගර්භණී සමයේදී හෝ දරු ප්‍රසූතියෙන් පසු ව්‍යායාම කිරීමට පෙර වෛද්‍ය උපදෙස් ලබාගන්න.'],
    benefits: ['සැහැල්ලු චලනය', 'ශාරීරික ආතතිය අඩු කරයි', 'රුධිර සංසරණය වැඩි දියුණු කරයි'], isNewFormat: true
  },
  {
    id: 'new_sleep_reflection', icon: '🌙', label: 'නින්ද පිළිබඳ පරීක්ෂාව', purpose: 'නින්දේ ගුණාත්මකභාවය නිරීක්ෂණය කරයි.', duration: 'විනාඩි 2',
    instructions: ['ප්‍රශ්න:', 'ඔබ කොපමණ පැය ගණනක් නිදා ගත්තාද?', '3ට අඩු, 3–5, 5–7, 7ට වැඩි', 'ඔබ නිතර අවදි වූවාද? ඔව්/නැත', 'ඔබට කොතරම් විවේකයක් දැනෙනවාද? ඉතා වෙහෙසකර, වෙහෙසකර, සාමාන්‍ය, ප්‍රබෝධමත්'],
    benefits: ['නින්දේ ගුණාත්මකභාවය නිරීක්ෂණය කරයි', 'රටා හඳුනා ගනී', 'හොඳ නින්දක් දිරිමත් කරයි'], isNewFormat: true
  },
  {
    id: 'new_smile_challenge', icon: '😁', label: 'සිනහවීමේ අභියෝගය', purpose: 'ධනාත්මක හැඟීම් දිරිමත් කරයි.', duration: 'විනාඩි 2',
    instructions: ['කැඩපතක් දෙස බලා සිනාසෙන්න.', 'ඉන්පසු ලියන්න', '"අද මා සිනාස්සවූ එක් දෙයක්."'],
    benefits: ['ධනාත්මක හැඟීම් දිරිමත් කරයි', 'මනෝභාවය උසස් කරයි', 'සරල සහ ඉක්මන් ක්‍රියාකාරකමකි'], isNewFormat: true
  },
  {
    id: 'new_breathing_balloon', icon: '🎈', label: 'බැලූන් ශ්වසන ක්‍රීඩාව', purpose: 'ශ්වසන ව්‍යායාම වඩාත් විනෝදජනක කරයි.', duration: 'විනාඩි 5',
    instructions: ['බැලූනයක් දිස්වේ.', 'ශ්වාසය ගන්න → බැලූනය සෙමෙන් පිම්බේ.', 'රඳවා ගන්න → බැලූනය නිශ්චලව පවතී.', 'ශ්වාසය පිට කරන්න → බැලූනය සෙමෙන් හැකිළේ.', 'යෙදුම සජීවිකරණ හරහා කාලය මඟ පෙන්වයි.'],
    benefits: ['ශ්වසන ව්‍යායාමයට ආකර්ෂණයක් එක් කරයි', 'දෘශ්‍ය මඟපෙන්වීමක් ලබා දෙයි', 'මනස සන්සුන් කරයි'], isNewFormat: true
  },
  {
    id: 'new_worry_box', icon: '📦', label: 'කනස්සල්ල බහාලන පෙට්ටිය', purpose: 'මව්වරුන්ට ඔවුන්ගේ කනස්සල්ල ප්‍රකාශ කිරීමට උපකාරී වේ.', duration: 'විනාඩි 5',
    instructions: ['එක් කනස්සල්ලක් ලියන්න.', 'ස්පර්ශ කරන්න', 'පෙට්ටියට දමන්න', 'යෙදුම සහයෝගය දක්වන පණිවිඩයක් ලබා දෙයි:', 'බෙදාගැනීම ගැන ස්තූතියි. ඔබේ හැඟීම් වැදගත්ය. හෙට යනු ඔබට සත්කාර කිරීමට ලැබෙන තවත් අවස්ථාවකි.'],
    benefits: ['කනස්සල්ල ප්‍රකාශ කිරීම', 'මානසික බර අඩු කිරීම', 'සහයෝගී ප්‍රතිපෝෂණ'], isNewFormat: true
  },
  {
    id: 'baby_mood', icon: '👶', label: 'ළදරු හැඟීම', labelEn: 'Baby Cues',
    purpose: 'ඔබේ බබා පෙන්වන විවිධ සංඥා හඳුනාගැනීමට මෙම ක්‍රියාකාරකම ඔබට උපකාරී වේ.', duration: 'විනාඩි 5–10',
    instructions: ['පින්තූරය දෙස බලන්න.', 'බබාගේ හැඟීම හෝ අවශ්‍යතාවය තෝරන්න.', 'පොදු ළදරු සංඥා හඳුනාගැනීමට ඉගෙන ගන්න.'],
    benefits: ['ළදරු සංඥා හඳුනාගැනීම', 'සන්නිවේදනය වැඩි දියුණු කිරීම', 'විශ්වාසය ඇතිකිරීම'],
    color: ['#FFF9C4', '#FFF3A0'], accent: '#F57F17',
    isNewFormat: true
  }
];

export const isBabyRelatedContent = (text = '') => {
  if (!text || typeof text !== 'string') return false;
  const t = text.toLowerCase().replace(/['’]/g, '');

  const babyTerms = [
    // English terms & phrases
    'baby', 'babies', 'babys', 'newborn', 'newborns', 'little one', 'little girl', 'little boy',
    'infant', 'infants', 'my child', 'my kid', 'caring for my baby', 'care for my baby',
    'taking care of my baby', 'taking care of my newborn',

    // Sinhala terms & phrases
    'බබා', 'බබාගේ', 'බබාව', 'බබාට', 'බබෙක්',
    'දරුවා', 'දරුවාගේ', 'දරුවාව', 'දරුවාට', 'දරුවෝ',
    'ළදරුවා', 'ළදරුවාගේ', 'ළදරුවාව', 'ළදරුවාට',
    'පුංචි එකා', 'පුංචි එකී', 'අලුත උපන්'
  ];

  return babyTerms.some(term => t.includes(term));
};

export const getNewRecommendations = (emotion, reason, riskLevel, diaryText = '') => {
  let recommendedIds = [];

  // 1. Risk Level
  if (riskLevel === 'high') {
    recommendedIds = ['new_deep_breathing', 'new_guided_meditation', 'new_worry_box', 'new_relaxing_music'];
  } else if (riskLevel === 'medium') {
    recommendedIds = ['new_guided_meditation', 'new_478_breathing', 'new_box_breathing', 'new_five_senses_grounding', 'new_sleep_reflection', 'new_worry_box', 'new_bubble_pop', 'new_memory_card', 'new_self_care_checklist'];
  } else {
    // Low risk
    recommendedIds = ['new_deep_breathing', 'new_gratitude_journal', 'new_positive_affirmations', 'new_relaxing_music', 'new_drink_water', 'new_smile_challenge', 'new_emotion_check_in', 'new_calm_coloring'];
  }

  // 2. Emotion
  let byEmotion = [];
  const emotNormalized = emotion ? emotion.toLowerCase() : '';
  if (emotNormalized.includes('sad')) {
    byEmotion = ['new_positive_affirmations', 'new_gratitude_journal', 'new_relaxing_music', 'new_smile_challenge'];
  } else if (emotNormalized.includes('anxi')) {
    byEmotion = ['new_478_breathing', 'new_box_breathing', 'new_guided_meditation', 'new_five_senses_grounding'];
  } else if (emotNormalized.includes('stress')) {
    byEmotion = ['new_deep_breathing', 'new_guided_meditation', 'new_bubble_pop', 'new_worry_box'];
  } else if (emotNormalized.includes('fatigue') || emotNormalized.includes('tired')) {
    byEmotion = ['new_drink_water', 'new_sleep_reflection', 'new_gentle_stretch', 'new_relaxing_music'];
  } else if (emotNormalized.includes('lonel')) {
    byEmotion = ['new_positive_affirmations', 'new_gratitude_journal', 'new_emotion_check_in', 'new_relaxing_music'];
  } else if (emotNormalized.includes('overwhelm')) {
    byEmotion = ['new_box_breathing', 'new_self_care_checklist', 'new_worry_box', 'new_guided_meditation'];
  }

  // 3. Reason
  let byReason = [];
  const reasonNormalized = reason ? reason.toLowerCase() : '';
  if (reasonNormalized.includes('sleep problem') || reasonNormalized.includes('sleep')) {
    byReason = ['new_sleep_reflection', 'new_relaxing_music', 'new_guided_meditation', 'new_deep_breathing'];
  } else if (reasonNormalized.includes('baby feeding')) {
    byReason = ['new_baby_interaction_ideas', 'new_positive_affirmations', 'new_gratitude_journal', 'new_emotion_check_in'];
  } else if (reasonNormalized.includes('baby sleep')) {
    byReason = ['new_baby_interaction_ideas', 'new_relaxing_music', 'new_sleep_reflection', 'new_deep_breathing'];
  } else if (reasonNormalized.includes('lack of support') || reasonNormalized.includes('support')) {
    byReason = ['new_positive_affirmations', 'new_emotion_check_in', 'new_gratitude_journal', 'new_worry_box'];
  } else if (reasonNormalized.includes('stress')) {
    byReason = ['new_guided_meditation', 'new_deep_breathing', 'new_bubble_pop', 'new_box_breathing'];
  } else if (reasonNormalized.includes('anxiety')) {
    byReason = ['new_478_breathing', 'new_five_senses_grounding', 'new_guided_meditation', 'new_memory_card'];
  } else if (reasonNormalized.includes('low motivation') || reasonNormalized.includes('motivation')) {
    byReason = ['new_smile_challenge', 'new_drink_water', 'new_self_care_checklist', 'new_gentle_stretch'];
  }
  
  // Re-prioritize based on Risk -> Reason -> Emotion
  let ordered = [];
  if (isBabyRelatedContent(diaryText)) {
    ordered.push('baby_mood');
  }
  recommendedIds.forEach(id => { if (!ordered.includes(id)) ordered.push(id); });
  byReason.forEach(id => { if (!ordered.includes(id)) ordered.push(id); });
  byEmotion.forEach(id => { if (!ordered.includes(id)) ordered.push(id); });

  ordered = ordered.slice(0, 4);
  return ordered.map(id => NEW_ACTIVITIES.find(a => a.id === id)).filter(Boolean);
};

export const ALL_GAMES = [
  { id:'bubble_pop',       icon:'🫧', label:'බුබුළු ෆොන් ෆොන්',      labelEn:'Bubble Pop',           color:['#E3F2FD','#BBDEFB'], accent:'#1565C0' },
  { id:'word_match',       icon:'💬', label:'වචන ගළපීම',              labelEn:'Word Match',            color:['#EDE7F6','#D1C4E9'], accent:'#7E57C2' },
  { id:'puzzle',           icon:'🧩', label:'ප්‍රහේලිකාව',            labelEn:'Simple Puzzle',         color:['#FFF9C4','#FFF3A0'], accent:'#F57F17' },
  { id:'affirmation_game', icon:'💜', label:'ධනාත්මක ප්‍රකාශ',       labelEn:'Positive Affirmations', color:['#FCE4EC','#F8BBD9'], accent:'#C2185B' },
  { id:'baby_mood',        icon:'😊', label:'ළදරු හැඟීම',            labelEn:'Baby Cues',             color:['#FFF9C4','#FFF3A0'], accent:'#F57F17' },
  { id:'mandala',          icon:'🔮', label:'මණ්ඩල කලා',              labelEn:'Mandala Art',           color:['#EDE7F6','#D1C4E9'], accent:'#7E57C2' },
  { id:'colouring',        icon:'🎨', label:'රූප පාටකිරීම',          labelEn:'Colouring Pages',       color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32' },
];

// ================================================================
// EXACT IF-THEN RECOMMENDATION RULES
// ================================================================
// Structure:
//   reason → {
//     low:    { activityIds:[], gameId:'', musicKey:'', videoKey:'' }
//     medium: { activityIds:[], gameId:'', musicKey:'', videoKey:'' }
//   }
//
// risk=medium: fewer, calmer activities only (breathing/meditation first)
// risk=low:    full set for that reason
//
// Music/Video keys match MUSIC_LIBRARY and VIDEO_LIBRARY keys exactly
// ================================================================

const RULES = {
  // ── LONELINESS ───────────────────────────────────────────────
  // Music: Calm piano | Video: "You are not alone" | Activity: Write 3 positive | Game: Puzzle
  loneliness: {
    low: {
      activityIds: ['write_positive', 'affirmation_activity', 'journaling', 'breathing_478'],
      gameId:    'puzzle',
      musicKey:  'loneliness',
      videoKey:  'loneliness',
      supportMsg:'ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
    medium: {
      activityIds: ['breathing_478', 'write_positive', 'affirmation_activity'],
      gameId:    'affirmation_game',
      musicKey:  'loneliness',
      videoKey:  'loneliness',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. 💜',
    },
  },

  // ── FATIGUE ──────────────────────────────────────────────────
  // Music: Relaxation audio | Video: Rest guidance | Activity: Short breathing | Game: Bubble pop
  fatigue: {
    low: {
      activityIds: ['short_breathing', 'rest_meditation', 'gentle_stretch'],
      gameId:    'bubble_pop',
      musicKey:  'fatigue',
      videoKey:  'fatigue',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌙',
    },
    medium: {
      activityIds: ['short_breathing', 'rest_meditation'],
      gameId:    'bubble_pop',
      musicKey:  'fatigue',
      videoKey:  'fatigue',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. 🌸',
    },
  },

  // ── ANXIETY ──────────────────────────────────────────────────
  // Music: Meditation music | Video: Anxiety calming | Activity: Guided meditation | Game: Focus tapping (bubble_pop)
  anxiety: {
    low: {
      activityIds: ['guided_meditation', 'breathing_478', 'grounding_54321', 'affirmation_activity'],
      gameId:    'bubble_pop',
      musicKey:  'anxiety',
      videoKey:  'anxiety',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
    medium: {
      activityIds: ['breathing_478', 'guided_meditation', 'grounding_54321'],
      gameId:    'bubble_pop',
      musicKey:  'anxiety',
      videoKey:  'anxiety',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. 🌿',
    },
  },

  // ── BONDING ISSUES ───────────────────────────────────────────
  // Music: Mother-baby bonding songs | Video: Parenting bonding | Activity: Talk with baby | Game: Baby Cues
  bonding_issues: {
    low: {
      activityIds: ['journaling', 'breathing_478', 'affirmation_activity'],
      gameId:    'baby_mood',
      musicKey:  'bonding_issues',
      videoKey:  'bonding_issues',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
    medium: {
      activityIds: ['breathing_478', 'journaling'],
      gameId:    'baby_mood',
      musicKey:  'bonding_issues',
      videoKey:  'bonding_issues',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
  },

  // ── LACK OF SUPPORT ──────────────────────────────────────────
  // Music: Emotional healing music | Video: Encouragement | Activity: Gratitude writing | Game: Affirmation game
  lack_of_support: {
    low: {
      activityIds: ['gratitude_writing', 'write_positive', 'affirmation_activity', 'breathing_478'],
      gameId:    'affirmation_game',
      musicKey:  'lack_of_support',
      videoKey:  'lack_of_support',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
    medium: {
      activityIds: ['breathing_478', 'gratitude_writing', 'affirmation_activity'],
      gameId:    'affirmation_game',
      musicKey:  'lack_of_support',
      videoKey:  'lack_of_support',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
  },

  // ── SLEEP PROBLEMS ───────────────────────────────────────────
  // Music: Sleep music/rain sounds | Video: Sleep meditation | Activity: Night relaxation | Game: Calm visual (colouring)
  sleep_problems: {
    low: {
      activityIds: ['night_breathing', 'rest_meditation', 'breathing_478', 'short_breathing'],
      gameId:    'colouring',
      musicKey:  'sleep_problems',
      videoKey:  'sleep_problems',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌙',
    },
    medium: {
      activityIds: ['night_breathing', 'breathing_478', 'rest_meditation'],
      gameId:    'colouring',
      musicKey:  'sleep_problems',
      videoKey:  'sleep_problems',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
  },

  // ── LOSS OF CONFIDENCE ───────────────────────────────────────
  // Music: Motivational songs | Video: Confidence building | Activity: Positive affirmations | Game: Achievement (affirmation_game)
  loss_of_confidence: {
    low: {
      activityIds: ['affirmation_activity', 'journaling', 'write_positive', 'breathing_478'],
      gameId:    'affirmation_game',
      musicKey:  'loss_of_confidence',
      videoKey:  'loss_of_confidence',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
    medium: {
      activityIds: ['breathing_478', 'affirmation_activity', 'write_positive'],
      gameId:    'affirmation_game',
      musicKey:  'loss_of_confidence',
      videoKey:  'loss_of_confidence',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
  },

  // ── OVERWHELMED ──────────────────────────────────────────────
  // Music: Nature sounds | Video: Stress relief | Activity: Deep breathing | Game: Stress relief tapping (bubble_pop)
  overwhelmed: {
    low: {
      activityIds: ['deep_breathing', 'breathing_478', 'grounding_54321', 'box_breathing'],
      gameId:    'bubble_pop',
      musicKey:  'overwhelmed',
      videoKey:  'overwhelmed',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
    medium: {
      activityIds: ['breathing_478', 'deep_breathing', 'box_breathing'],
      gameId:    'bubble_pop',
      musicKey:  'overwhelmed',
      videoKey:  'overwhelmed',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
  },

  // ── PHYSICAL DISCOMFORT ──────────────────────────────────────
  // Music: Soft calming music | Video: Light exercise | Activity: Gentle stretching | Game: Light interaction
  physical_discomfort: {
    low: {
      activityIds: ['gentle_stretch', 'rest_meditation', 'short_breathing', 'breathing_478'],
      gameId:    'colouring',
      musicKey:  'physical_discomfort',
      videoKey:  'physical_discomfort',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
    medium: {
      activityIds: ['gentle_stretch', 'breathing_478', 'rest_meditation'],
      gameId:    'colouring',
      musicKey:  'physical_discomfort',
      videoKey:  'physical_discomfort',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
  },

  // ── NEGATIVE THOUGHTS ────────────────────────────────────────
  // Music: Emotional healing music | Video: Positive mindset | Activity: Journaling | Game: Positive thinking (affirmation_game)
  negative_thoughts: {
    low: {
      activityIds: ['journaling', 'positive_thinking_act', 'breathing_478', 'write_positive'],
      gameId:    'affirmation_game',
      musicKey:  'negative_thoughts',
      videoKey:  'negative_thoughts',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
    medium: {
      activityIds: ['breathing_478', 'journaling', 'positive_thinking_act'],
      gameId:    'affirmation_game',
      musicKey:  'negative_thoughts',
      videoKey:  'negative_thoughts',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
  },
};

// ── PUBLIC API ────────────────────────────────────────────────
// Returns the exact recommendation set for reason + riskLevel
// Respects user preferences if set
export const getRecommendationRule = (reason, riskLevel, preferredActivities = [], preferredGames = []) => {
  const rules    = RULES[reason] || RULES.overwhelmed;
  const rule     = rules[riskLevel] || rules.low;

  // Get activity objects (maintain order from rule)
  let acts = rule.activityIds
    .map(id => ALL_ACTIVITIES.find(a => a.id === id))
    .filter(Boolean);

  // If user has preferences, filter to those — fallback to full list
  if (preferredActivities.length > 0) {
    const filtered = acts.filter(a => preferredActivities.includes(a.id));
    if (filtered.length > 0) acts = filtered;
  }

  // Get the single recommended game
  let game = ALL_GAMES.find(g => g.id === rule.gameId);

  // If user prefers different games, use first matching preference
  if (preferredGames.length > 0) {
    const prefGame = ALL_GAMES.find(g => preferredGames.includes(g.id));
    if (prefGame) game = prefGame;
  }

  return {
    activities:  acts,
    game:        game,
    games:       game ? [game] : [],  // also expose as array for UI
    musicKey:    rule.musicKey,
    videoKey:    rule.videoKey,
    supportMsg:  rule.supportMsg,
  };
};

export const getEnhancedRecommendationRule = (emotion, reason, riskLevel, preferredActivities = [], preferredGames = []) => {
  const existingRecommendations = getRecommendationRule(reason, riskLevel, preferredActivities, preferredGames);
  const newActivities = getNewRecommendations(emotion, reason, riskLevel);

  return {
    ...existingRecommendations,
    newActivities // Return the 4 personalized new activities
  };
};
