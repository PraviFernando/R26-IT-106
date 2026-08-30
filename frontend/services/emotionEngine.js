// ================================================================
// EMOTION ENGINE — emotionEngine.js (Multilingual: EN + SI + Singlish)
// ================================================================

import { getEnhancedRecommendationRule, getPersonalizedRecommendations, isBabyRelatedReason, isBabyRelatedContent, normalizeReasonKey, normalizeEmotionKey, normalizeRiskLevel } from './activitiesLibrary.js';
import { MUSIC_LIBRARY, VIDEO_LIBRARY, getMusicForReason, getVideosForReason } from './mediaLibrary.js';

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
    .replace(/thanikama[k]?/g, 'paluyi')
    .replace(/tanikama[k]?/g, 'paluyi')
    .replace(/thanikam\b/g, 'paluyi')
    .replace(/tanikam\b/g, 'paluyi')
    .replace(/kavuruth\s*mata\s*na/g, 'kawuruth naha')
    .replace(/kavurth\s*mata\s*na/g, 'kawuruth naha')
    .replace(/kavuruth\s*na/g, 'kawuruth naha')
    .replace(/kavurth\s*na/g, 'kawuruth naha')
    .replace(/kavuruth/g, 'kauruth')
    .replace(/udavu/g, 'udaw')
    .replace(/udawu/g, 'udaw')
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
    .replace(/['’]/g, '')
    // Physical recovery Singlish normalizations
    .replace(/recover\s*wenne\s*nehe/g, 'recover wenne naha')
    .replace(/recover\s*wenne\s*na\b/g, 'recover wenne naha')
    .replace(/recover\s*wenna\s*one/g, 'recover wenna one')
    .replace(/recover\s*wenna\s*ona/g, 'recover wenna one')
    .replace(/passe\s*recover/g, 'passe recover')
    .replace(/delivery\s*eken\s*passe/g, 'delivery eken passe')
    .replace(/delivery\s*passe/g, 'delivery passe')
    .replace(/anga\s*amaru[i]?/g, 'anga amarui')
    .replace(/anga\s*weak/g, 'anga weak')
    .replace(/body\s*eka\s*recover/g, 'body eka recover')
    .replace(/back\s*pain\s*thiyenawa/g, 'back pain thiyenawa')
    // Mother sleep Singlish normalizations
    .replace(/nid\s*naha/g, 'ninda naha')
    .replace(/nid\s*na\b/g, 'ninda naha')
    .replace(/raata\s*nid/g, 'rata ninda')
    .replace(/rata\s*nid/g, 'rata ninda')
    .replace(/ninda\s*adui/g, 'ninda adui')
    .replace(/ninda\s*yanne\s*nehe/g, 'ninda yanne naha')
    .replace(/nindak\s*naha/g, 'ninda adui')
    .replace(/nida\s*ganna\s*ba\b/g, 'nida ganna baha')
    .replace(/nida\s*ganna\s*baha/g, 'nida ganna baha')
    .replace(/nidimathai/g, 'mata nidimathai')
    .replace(/hariyata\s*nindak/g, 'hariyata nindak naha')
    // Bonding Issues Singlish normalizations
    .replace(/adrae/g, 'adare')
    .replace(/adara/g, 'adare')
    .replace(/huratal/g, 'hurathal')
    .replace(/hithenne\s*na\b/g, 'hithenne naha')
    .replace(/hithenne\s*nehe/g, 'hithenne naha')
    .replace(/udaw\s*na\b/g, 'udaw naha')
    .replace(/udaw\s*nehe/g, 'udaw naha')
    .replace(/bandeemak/g, 'bandimak')
    .replace(/bandeema/g, 'bandima')
    .replace(/danenne\s*na\b/g, 'danenne naha')
    .replace(/danennee\s*na\b/g, 'danenne naha')
    .replace(/danenne\s*nehe/g, 'danenne naha')
    .replace(/daranne\s*naha/g, 'danenne naha');

  // Keep alphanumeric, spaces, and Sinhala Unicode range (\u0D80-\u0DFF)
  cleaned = cleaned.replace(/[^\w\s\u0D80-\u0DFF]/g, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
};

// ── KEYWORD MAPS (EN + SI + SINGLISH) ─────────────────────────
const REASON_KW = {
  loneliness: [
    'alone', 'lonely', 'isolated', 'nobody', 'no one', 'miss', 'empty', 'no friends', 'left out',
    'empty feeling', 'loku thanikamak', 'mukuth wadak', 'mukuth na', 'nobody cares', 'no one cares',
    'kauruth mata kohomada kiyala ahanne na', 'baby kohomada kiyala witharai ahanne', 'kauruth mata',
    'kohomada kiyala ahanne na', 'witharai ahanne', 'taniyama karagena yanawa',
    'ain wela wage', 'amma kenek widihata witharai', 'hiskamak', 'viswasa karanna kenek na',
    'තනිවෙලා', 'පාළුයි', 'පාළුවක්', 'කවුරුත් නෑ', 'කවුරුත් නැහැ', 'තනියම', 'පාළු', 'පාලුයි', 'පාලු', 'එන්නේ නැහැ', 'එන්නේ නෑ',
    'paluyi', 'taniyen', 'taniwela', 'kugewat na', 'kawuruth naha', 'palu',
    'thanikamak danenawa', 'thanikamak daneno', 'thainkamak daneo', 'thanikamak daneo',
    'karaganna ba', 'wadak na', 'wadak naha', 'wadak wath naha'
  ],
  fatigue: [
    'tired', 'exhausted', 'drained', 'no energy', 'worn out', 'sleepy', 'burnt out', 'sluggish',
    'shakthiya enne naha', 'shakthiyak naha', 'shakthiya', 'durwalai', 'angata aapahu shakthiya',
    'ඇඟට ආපහු ශක්තිය එන්නේ නැහැ', 'ශක්තිය එන්නේ නැහැ', 'ශක්තිය', 'ඇඟ දුර්වලයි',
    'මහන්සියි', 'වෙහෙසයි', 'වෙහෙස', 'ශක්තියක් නෑ',
    'mahansiyi', 'wehesayi', 'mahansi', 'shakthiyak naha', 'hondata mahansiyi'
  ],
  anxiety: [
    'anxious', 'worried', 'panic', 'scared', 'nervous', 'overthinking', 'heart racing', 'restless',
    'worrying', 'terrible will happen', 'chest feels tight', 'chest tight', 'can\'t stop worrying', 'cant stop worrying',
    'something terrible', 'heart is racing', 'prepared for something bad', 'cannot immediately reach',
    'whether my baby is okay', 'responsible for something important', 'could go wrong', 'warning me that something',
    'frightened by situations', 'difficult to calm my thoughts', 'plans change unexpectedly', 'wrong choice for my baby',
    'frightened', 'uneasy', 'narakadeyak wei', 'kanasallaten',
    'බයයි', 'කාංසාව', 'ලොකු බයක්', 'කනස්සල්ල', 'බියක්', 'බය හිතෙනවා', 'පපුවේ ගැස්මක්', 'නරක දෙයක් වෙයි',
    'කනස්සල්ලෙන්', 'බය වෙනවා', 'බයක් දැනෙනවා', 'නරක දෙයක් වෙයි කියලා', 'සිතුවිලි පාලනය',
    'baye', 'baya', 'baya hithenawa', 'bayaයි', 'kansawa', 'bayak thiyenawa', 'anxious wela', 'kisima shanthiyak na', 'monawa hari wei'
  ],
  bonding_issues: [
    'bond', 'bonding', 'feel nothing', 'not attached', 'distant from baby', 'no connection', 'indifferent',
    'cannot feel a real connection', 'emotionally distant', 'try to love my baby but feel nothing',
    'detached and disconnected', 'do not feel the bond', 'feel empty instead of love',
    'guilty because i am not attached', 'expected to feel overwhelming love', 'bond between me and my baby feels broken',
    'like a caregiver not a mother', 'scared i will never feel connected', 'never feel connected', 'baby feels like a stranger',
    'feel no instinct', 'care for my baby but do not feel', 'lack of bond makes me feel',
    'going through the motions with no feeling', 'feel emotionally numb', 'ashamed to admit i do not feel attached',
    'distant from my baby even when', 'do not enjoy holding my baby', 'no connection and it breaks my heart',
    'emotionally disconnected', 'disconnected', 'feel a bond', 'feel distant', 'feel closer', 'more connected',
    'don\'t feel a bond', 'dont feel a bond', 'motherly affection', 'terribly guilty', 'disconnected from my baby',
    ' struggle to feel', 'feel that motherly affection', 'not close to my baby', 'not close', 'feel close to my baby', 'feel close',
    'connection with my baby', 'attachment to my baby', 'can\'t connect with my baby',
    'cant connect with my baby', 'can\'t connect', 'cant connect', 'don\'t feel connected', 'dont feel connected', 'not attached to my baby',
    'not emotionally connected', 'emotionally connected', 'not connected', 'emotional connection',
    'special close feeling', 'emotional connection ekak naha', 'mokak hari aduwak', 'strong emotional attachment',
    'hithen ath wela', 'ath wela wage', 'close feeling eka enne naha', 'adara feeling eka adui', 'adare feeling', 'feeling eka adui', 'kalaya gathath adara feeling', 'feel empty instead of love',
    'adare hithenne na', 'adrae hithenne na', 'adare hithenne naha', 'adrae hithenne naha', 'magemai kiyala hithenne na',
    'magemai kiyala hithenne naha', 'hurathal karanna hithenne na', 'hurathal karanna hithenne naha', 'huratal karanna hithenne na',
    'adare danenne na', 'adare danenne naha', 'babata adare na', 'babata adare naha', 'babata adrae', 'babata adare',
    'ආදරයක් හිතෙන්නේ නැහැ', 'ආදරයක් හිතෙන්නේ නෑ', 'ආදරයක් හිතෙන්නෙ නැහැ', 'ආදරයක් හිතෙන්නෙ නෑ',
    'මගේමයි කියලා හිතෙන්නේ නැහැ', 'මගේමයි කියලා හිතෙන්නේ නෑ', 'මගේමයි කියලා හිතෙන්නෙ නැහැ', 'මගේමයි කියලා හිතෙන්නෙ නෑ',
    'හුරතල් කරන්න හිතෙන්නේ නැහැ', 'හුරතල් කරන්න හිතෙන්නේ නෑ', 'හුරතල් කරන්න හිතෙන්නෙ නැහැ', 'හුරතල් කරන්න හිතෙන්නෙ නෑ',
    'බැඳීමක් නෑ', 'බැඳීමක් නැහැ', 'ආදරයක් දැනෙන්නේ නෑ', 'ආදරයක් දැනෙන්නේ නැහැ', 'සම්බන්ධයක් නෑ', 'සම්බන්ධයක් නැහැ',
    'කිසිම හැඟීමක් නෑ', 'හැඟීමක් නැහැ', 'හැඟීමක් නෑ', 'ලං වෙලා නැහැ', 'ලං වෙලා නෑ', 'ලං වෙලා නැහැ වගේ',
    'ලොකු බැඳීමක්', 'බැඳීමක් දැනෙන්නේ නැහැ', 'බැඳීමක් දැනෙන්නේ නෑ', 'දැනෙන්නේ නැහැ', 'හොඳ අම්මා කෙනෙක් නෙවෙයිද',
    'අම්මා කෙනෙක් නෙවෙයිද', 'බැඳීමක් දැනෙන්නෙ නැහැ', 'බැඳීමක් දැනෙන්නෙ නෑ', 'බබා එක්ක ලොකු බැඳීමක්', 'බැඳීමක්',
    'සම්බන්ධ වෙන්න බැහැ', 'සම්බන්ධ වෙන්න බෑ', 'connection එකක් නැහැ', 'connection එකක් නෑ', 'ඈත් වෙලා වගේ', 'ඈත් වෙලා',
    'විශේෂ ලංවීමක්', 'ලංවීමක්', 'ලංවීම', 'ලංවීමක් දැනෙන්න',
    'special close feeling', 'special close feeling ekak', 'close feeling', 'close feeling ekak', 'lanweemak', 'langweemak',
    'sabaendiyawak', 'sabaendiyawak daenenne naha', 'sabaendiyawak daenenne na', 'sabaendiyawak naha', 'sabaendiyawak na',
    'baendimak', 'baendimak nah', 'baendimak naha', 'baendimak na', 'baendima', 'loku sabaendiyawak', 'loku baendimak',
    'baba ekka baendimak', 'baba ekka sabaendiyawak', 'baba ekka loku sabaendiyawak', 'baba ekka baendimak nah'
  ],
  lack_of_support: [
    'nobody i can depend on', 'take care of the baby for a while so i could rest', 'nobody to share', 'make every decision alone',
    'help with meals', 'household chores', 'partner does not share', 'nobody i can depend on when i become overwhelmed',
    'family would check on me', 'expect me to cope without offering any help', 'take over some of the baby care',
    'need practical help', 'manage the baby without assistance', 'partner does not share enough',
    'help me with ordinary things', 'nobody notices how much work', 'without assistance', 'no assistance',
    'difficult parts of parenting with', 'every decision alone', 'nobody notices how much work i am doing',
    'take over some of the baby care when i am exhausted',
    'husband udaw karanne naha', 'husband udaw naha', 'partner udaw naha', 'no help', 'unsupported', 'nobody helps', 'no family', 'doing it alone',
    'no one help me', 'no one helps me', 'no one help', 'no one helps', 'do everything alone',
    'do everything alone now', 'have to do everything alone', 'doing everything alone',
    'everything alone', 'all alone', 'no one to help me', 'do all the baby work and household work',
    'සැමියා උදව් කරන්නේ නැහැ', 'සැමියා උදව් කරන්නේ නෑ', 'උදව්වක් නෑ', 'කාගෙවත් සහයක් නෑ', 'උදව් නෑ',
    'කවුරුත් උදව් කරන්නේ නැහැ', 'කවුරුත් උදව් කරන්නේ නෑ', 'උදව් කරන්නේ නැහැ', 'උදව් කරන්නේ නෑ', 'කවුරුත් උදව්',
    'කිසිම උදව්වක්', 'උදව්වක් කරන්නේ නැහැ', 'උදව්වක් කරන්නේ නෑ', 'උදව්වක්', 'තනියම කරනවා',
    'මට උදව් කරන්න කවුරුත් නැහැ', 'මට උදව් කරන්න කවුරුත් නෑ', 'උදව් කරන්න කවුරුත් නැහැ', 'උදව් කරන්න කවුරුත් නෑ',
    'බබාගේ වැඩ සහ ගෙදර වැඩ ඔක්කොම මට තනියම කරන්න වෙලා තියෙන්නේ',
    'බබාගේ වැඩ සහ ගෙදර වැඩ ඔක්කොම මට තනියම කරන්න වෙලා',
    'ගෙදර වැඩ ඔක්කොම මට තනියම කරන්න වෙලා', 'වැඩ ඔක්කොම මට තනියම කරන්න වෙලා',
    'තනියම කරන්න වෙලා තියෙන්නේ', 'තනියම කරන්න වෙලා', 'මට තනියම කරන්න වෙලා',
    'husband udaw naha', 'udawwak naha', 'kagegenwat support naha',
    'mata udaw karanna kauruth naha', 'udaw karanna kauruth naha',
    'babage wada saha gedara wada okkoma mata thaniyama karanna wela',
    'udaw karanne na', 'udaw karanne naha', 'udavu karanne na', 'udavu karanne naha', 'wada walata udaw karanne na',
    'wada walata udavu karanne na', 'udaw karanna kauruth na', 'udavu karanna kauruth na', 'kavuruth mage wada walata udavu karanne na',
    'kavuruth udaw karanne na', 'kauruth udaw karanne na', 'kavuruth mage wada', 'wada walata udavu', 'wada walata udaw'
  ],
  sleep_problems: [
    'sleep', 'insomnia', 'awake all night', 'sleep deprived', 'cant sleep', 'no sleep',
    'cannot sleep', 'difficulty sleeping', 'trouble sleeping', 'poor sleep', 'lack of sleep',
    'sleep deprivation', 'sleepless night', 'sleepless nights', 'not getting enough sleep',
    'baby keeps waking me up', 'tired because i cant sleep', 'sleep problems',
    'mother sleep problems', 'mothers sleep problems', 'maternal sleep problems',
    'mom sleep problems', 'mother cant sleep', 'mother cannot sleep',
    'tired mother', 'exhausted mother', 'maternal sleep', 'mothers sleep',
    'mata raata nid naha', 'mata rata nid naha', 'raata nid naha', 'rata nid naha',
    'nid naha', 'nid na', 'nida naha', 'ninda naha', 'raata ninda naha', 'raata nid', 'rata nid',
    // Sinhala Unicode — sleep-specific phrases (including sleep deprivation)
    'නින්ද', 'නින්ද මදි', 'නින්ද නොමැති', 'නිදි නෑ', 'නිදාගන්නේ නැහැ', 'නිදාගන්නෙ නෑ',
    'නින්දක් නෑ', 'නින්ද යන්නෙ නෑ', 'නින්ද යන්නේ නැහැ', 'නින්දක් නැහැ',
    'රාත්‍රියට නිදි නෑ', 'රාත්රියට නිදි නෑ',
    'රෑට නින්ද නැහැ', 'රෑට නිදා ගන්න බෑ', 'රෑට හරියට නින්දක් නැහැ',
    'නින්ද අඩුයි', 'නින්දේ ප්රශ්නයක් තියෙනවා', 'නිදාගන්න බැහැ',
    'බබා නිසා මට නින්ද නැහැ', 'බබා රෑට නැගිටින නිසා', 'හරියට නින්දක් නැහැ',
    'නිදිමතයි', 'හොඳට නිදාගන්න බැහැ', 'නින්ද නොලැබෙනවා', 'නින්ද ලැබෙන්නේ නෑ',
    'මට නිදා නෑමට මහන්සියි', 'මට නින්ද නොයෑම', 'මවගේ නින්ද නොයාම',
    'අම්මාට නින්ද නැහැ', 'අම්මාට නින්ද නොයෑම', 'අම්මාට නිදිමත දැනීම',
    'අම්මාගේ නින්ද', 'අම්මාට නින්ද ප්රශ්න',
    'නිදි නැති රාත්රිය', 'නිදි නැති රාත්රී',
    // Singlish
    'ninda', 'nida ganne naha', 'nida na', 'ninda yanne naha', 'nida ganna baha', 'nidaganna baha',
    'mata ninda yanne naha', 'mata ninda yanney naha', 'mata hariyata nindak naha',
    'raatta ninda naha', 'rata ninda naha', 'ninda adui', 'ninda prashnayak thiyenawa',
    'baba nisa mata ninda naha', 'baba rata nagitinawa nisa mata nida ganna baha',
    'mata nidimathai', 'mata hondin nida ganna baha', 'hariyata nindak naha'
  ],
  loss_of_confidence: [
    'confidence', 'self-doubt', 'failure', 'bad mother', 'useless', 'not capable', 'worthless',
    'විශ්වාසයක් නෑ', 'නරක අම්මා කෙනෙක්', 'මට බැහැ', 'අසාර්ථකයි',
    'naraka amma', 'mata baha', 'confidence naha'
  ],
  overwhelmed: [
    'overwhelmed', 'too much', 'drowning', 'breaking down', 'cant cope', 'too hard', 'falling apart',
    'දරාගන්න බැහැ', 'දරාගන්න බෑ', 'ඔළුව රිදෙනවා', 'ඔක්කොම වැඩ',
    'බබාගේ වැඩයි', 'ගෙදර වැඩයි', 'ඔක්කොම මගේ පිටට', 'මගේ පිටට ඇවිත්',
    'වැඩ ගොඩක්', 'ගෙදර වැඩ', 'බබාගේ වැඩ', 'කළමනාකරණය කරගන්න', 'කළමනාකරණය', 'කරන්න වැඩ ගොඩක්', 'හැමදේම කළමනාකරණය',
    'daraganna baha', 'daraganna ba', 'amaruwi', 'godak wada'
  ],
  physical_discomfort: [
    // English
    'pain', 'hurt', 'sore', 'c-section', 'recovery', 'recover', 'stitches', 'body aches', 'discomfort',
    'physical recovery', 'postpartum recovery', 'body recovery', 'recovering after delivery',
    'recovery after birth', 'body pain after delivery', 'postpartum body pain',
    'back pain after delivery', 'abdominal pain after delivery', 'weak after delivery',
    'body feels weak', 'still recovering', 'back pain', 'body pain',
    // Sinhala Unicode
    'කැක්කුමයි', 'රිදෙනවා', 'තුවාලය', 'සිරුරේ කැක්කුම',
    'ඇඟට අමාරුයි', 'ඇඟ දුර්වලයි', 'පිට කොන්ද රිදෙනවා',
    'ශරීරය සුව වෙන්නෙ නැහැ', 'ශරීරය recover වෙන්නේ නැහැ',
    'දරු ප්රසූතියෙන් පස්සේ ඇඟට අමාරුයි', 'දරු ප්රසූතියෙන් පස්සේ වේදනාව',
    'දරු ප්රසූතියෙන් පස්සේ', 'ඇඟ ගොඩක් රිදෙනවා', 'ඇඟ රිදෙනවා',
    'ප්රසූතියෙන් පස්සේ ශරීරය', 'recover වෙන්නේ නැහැ', 'recover වෙන්නෙ නෑ',
    'recover වෙන්න ඕනේ', 'ශාරීරික',
    // Singlish
    'kakkumai', 'ridenawa', 'thuwala', 'kakul ridenawa',
    'delivery eken passe anga amarui', 'delivery eken passe recover wenne naha',
    'mage anga weak', 'body eka recover wenne naha', 'back pain thiyenawa',
    'delivery passe body pain', 'mata recover wenna one', 'anga amarui',
    'anga weak', 'delivery passe', 'passe recover', 'recover wenna'
  ],
  negative_thoughts: [
    'hopeless', 'hate myself', 'dark', 'disappear', 'dark thoughts', 'no point', 'worthless',
    'ජීවිතේ එපා වෙලා', 'මැරෙන්න හිතෙනවා', 'කිසිම තේරුමක් නෑ', 'අඳුරු සිතුවිලි',
    'jeewithe epa wela', 'merenna hithenawa', 'therumak naha'
  ],
  financial_worry: [
    'financial', 'finance', 'money', 'afford', 'bills', 'budget', 'expenses', 'financial stability',
    'financial worry', 'money problems', 'financial stress', 'salli', 'mila mudal', 'wiyadam',
    'සල්ලි', 'මුදල්', "සල්ලි ප්‍රශ්න", "වියදම්"
  ],
  relationship_family_problem: [
    'partner', 'relationship', 'marriage', 'argue', 'arguing', 'fighting', 'fight', 'distant from partner',
    'relationship with my husband', 'argue all the time', 'husband and i are becoming distant', 'problems in our relationship',
    'husband and i are constantly fighting', 'disconnected from my partner', 'conflict with my in-laws', 'family conflict',
    'husband ekka prashna', 'relationship eka hari naha', 'husband ekka nitharama prashna', 'husband ekka randu',
    'husband ekka', 'relationship eka', 'රණ්ඩු', 'ආරවුල්', 'සැමියා එක්ක ප්‍රශ්න', 'පවුලේ අය එක්ක ප්‍රශ්න',
    'සැමියාත් එක්ක', 'සැමියා එක්ක', 'සම්බන්ධය ගොඩක් නරක', 'සම්බන්ධය', 'සැමියාටයි', 'ප්රශ්න ඇති වෙනවා', 'ප්‍රශ්න ඇති වෙනවා',
    'සම්බන්ධතාවය', 'සම්බන්ධතාවය ගොඩක් වෙනස්', 'අපි දෙන්නා අතර'
  ],
  baby_needs: [
    'don\'t understand what my baby needs', 'dont understand what my baby needs', 'cannot understand my baby\'s behavior',
    'don\'t know why my baby is crying', 'dont know why my baby is crying', 'not sure what my baby wants',
    'difficulty understanding my baby\'s signals', 'cannot tell if my baby is hungry or tired',
    'don\'t know when my baby needs', 'dont know when my baby needs', 'confused about what my baby is trying to tell me',
    'struggle to understand my baby\'s different cries', 'cannot figure out what is wrong with my baby',
    'not sure whether my baby is hungry', 'don\'t know if my baby needs a diaper change',
    'cannot understand why my baby is restless', 'trouble knowing when my baby is sleepy',
    'don\'t know what my baby needs', 'struggle to recognize my baby\'s needs',
    'cannot tell what my baby is trying to communicate', 'don\'t know whether my baby is uncomfortable',
    'difficult to understand my baby\'s cues', 'cannot recognize what my baby needs',
    'don\'t know why my baby suddenly starts crying', 'unsure whether my baby is hungry, tired, or uncomfortable',
    'difficulty knowing what my baby needs', 'don\'t understand the different sounds my baby makes',
    'cannot tell what my baby\'s crying means', 'don\'t know when my baby wants attention',
    'confused when my baby changes her behavior', 'don\'t know why my baby is making these sounds',
    'struggle to identify my baby\'s basic needs', 'baby needs', 'understanding my baby',
    // Sinhala Unicode
    'බබාගේ හැසිරීම හඳුනාගන්න බැහැ', 'බබාගේ හැසිරීම හඳුනාගන්න බෑ', 'බබාට මොනවා ඕනෙද කියලා තේරෙන්නේ නැහැ',
    'බබාට මොනවා ඕනෙද කියලා තේරෙන්නේ නෑ', 'බබා අඬන්නේ ඇයි කියලා මට තේරෙන්නේ නැහැ', 'බබා අඬන්නේ ඇයි කියලා මට තේරෙන්නේ නෑ',
    'බබා අඬනකොට එයාට මොනවා ඕනෙද කියලා හිතාගන්න බැහැ', 'බබාගේ විවිධ හැසිරීම් තේරුම් ගන්න මට අමාරුයි',
    'බබා බඩගින්නෙන්ද නිදිමතෙන්ද කියලා මට හඳුනාගන්න බැහැ', 'බබාට කිරි ඕනේ වෙලාව මට තේරෙන්නේ නැහැ',
    'බබා මට කියන්න හදන්නේ මොනවාද කියලා මට තේරෙන්නේ නැහැ', 'බබා අඬන විදිහේ වෙනස්කම් තේරුම් ගන්න මට අමාරුයි',
    'බබා නිතරම අඬන්නේ ඇයි කියලා මට හිතාගන්න බැහැ', 'බබාට මොකක්ද වෙලා තියෙන්නේ කියලා මට තේරෙන්නේ නැහැ',
    'බබාට බඩගිනිද කියලා මට හඳුනාගන්න බැහැ', 'බබාට ඩයපර් මාරු කරන්න ඕනෙද කියලා මට තේරෙන්නේ නැහැ',
    'බබා නොසන්සුන් වෙන්නේ ඇයි කියලා මට තේරෙන්නේ නැහැ', 'බබාට නිදිමතයිද කියලා මට හඳුනාගන්න අමාරුයි',
    'බබා කලබල වෙනකොට එයාට මොනවා ඕනෙද කියලා මට තේරෙන්නේ නැහැ', 'මට බබාගේ අවශ්යතා හඳුනාගන්න අමාරුයි',
    'බබා මට මොනවා කියන්න හදනවාද කියලා තේරෙන්නේ නැහැ', 'බබාට අපහසුතාවයක් තියෙනවාද කියලා මට හිතාගන්න බැහැ',
    'බබාගේ ඉඟි තේරුම් ගන්න මට අමාරුයි', 'බබා අඬනකොට එයාට ඕනේ මොනවාද කියලා හඳුනාගන්න බැහැ',
    'බබා එකපාරටම අඬන්න පටන් ගන්නේ ඇයි කියලා මට තේරෙන්නේ නැහැ', 'බබාට බඩගිනිද නිදිමතද අපහසුතාවයක්ද කියලා මට හඳුනාගන්න බැහැ',
    'වෙලාවෙන් වෙලාවට බබාට මොනවා ඕනෙද කියලා තේරුම් ගන්න අමාරුයි', 'බබා කරන විවිධ ශබ්දවල තේරුම මට තේරෙන්නේ නැහැ',
    'බබා අඬනකොට ඒකෙන් කියන්නේ මොනවාද කියලා මට තේරෙන්නේ නැහැ', 'බබාට අවධානය ඕනේ වෙලාව මට තේරෙන්නේ නැහැ',
    'බබාගේ හැසිරීම වෙනස් වුණාම මට හිතාගන්න බැහැ', 'බබා මේ වගේ ශබ්ද කරන්නේ ඇයි කියලා මට තේරෙන්නේ නැහැ',
    'බබාගේ මූලික අවශ්යතා හඳුනාගන්න මට අමාරුයි',
    // Singlish
    'mata babava nalavaganna therenne na', 'mata babage hasirima handunaganna ba', 'mata babage hasirima handunaganna baha',
    'mata babata monawada one kiyala therenne naha', 'mata babata monawada one kiyala therenne na',
    'baba andanne ai kiyala mata therenne naha', 'baba andanne ai kiyala mata therenne na',
    'baba andanakota eyata monawada one kiyala hithaganna ba', 'babage wenas wenas hasirum therum ganna amarui',
    'baba badaginne da nidimathe da kiyala mata handunaganna ba', 'baba kiri one welawa mata therenne naha',
    'baba mata kiyanna hadanne mokakda kiyala therenne naha', 'baba andana widiye wenas kam therum ganna amarui',
    'baba hamadama andanne ai kiyala mata hithaganna ba', 'babata mokak wela thiyenawada kiyala mata therenne naha',
    'baba badagin da kiyala mata handunaganna ba', 'babata diaper maru karanna one da kiyala mata therenne naha',
    'baba nosansun wenne ai kiyala mata therenne naha', 'baba nidimathe da kiyala mata handunaganna amarui',
    'baba kalabala unama eyata monawada one kiyala mata therenne naha', 'mata babage awashya tha handunaganna amarui',
    'baba mata monawada kiyanna hadanne kiyala therenne naha', 'babata apahasuwak thiyenawada kiyala mata hithaganna ba',
    'babage signs therum ganna mata amarui', 'baba andanakota eyata one mokakda kiyala handunaganna ba',
    'baba eka paratama andanna patan ganne ai kiyala mata therenne naha', 'baba badagin da nidimathe da amaruwak da kiyala handunaganna ba',
    'welawen welawata babata monawada one kiyala therum ganna amarui', 'baba karana wenas wenas sounds wala theruma mata therenne naha',
    'babata attention one welawa mata therenne naha', 'babage behavior eka wenas unama mata hithaganna ba',
    'baba mehema sounds karanne ai kiyala mata therenne naha', 'babage basic needs handunaganna mata amarui'
  ]
};

const EMOTION_KW = {
  happy: [
    'happy', 'joy', 'smile', 'grateful', 'wonderful', 'positive', 'hopeful', 'great', 'good day',
    'සතුටුයි', 'සතුටක්', 'ආසයි', 'සන්තෝෂයි', 'සුන්දරයි',
    'sathutuyi', 'sathuta', 'gasp', 'good day'
  ],
  sad: [
    'sad', 'cry', 'unhappy', 'depressed', 'hopeless', 'hurt', 'empty', 'down', 'devastated',
    'empty feeling', 'no point', 'nothing matters', 'karaganna ba', 'wadak na', 'godak dukai',
    'not emotionally connected', 'close feeling', 'special close feeling',
    'දුකයි', 'කඳුළු', 'අඬනවා', 'කනගාටුයි', 'වේදනාව', 'ගොඩක් දුකයි', 'විශේෂ ලංවීමක්', 'ලංවීමක්',
    'dukai', 'dukayi', 'godak dukai', 'andana', 'kandulu', 'daneo', 'daneno', 'lanweemak'
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
  'kill myself', 'dont want to live', 'want to kill myself', 'dont want to live anymore',
  'මැරෙන්න හිතෙනවා', 'ජීවිතේ එපා වෙලා', 'merenna hithenawa'
];

const MEDIUM_CRISIS_KW = [
  'exhausted', 'overwhelmed', 'lonely', 'isolated', 'scared', 'worried',
  'barely sleep', 'cries every', 'not feeding well', 'fever', 'stress',
  'මහන්සියි', 'බයයි', 'ආතතිය', 'උණ', 'අසනීප'
];

const SUPPORT_MESSAGES = {
  loneliness: ['ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  fatigue: ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌙', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  anxiety: ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ. 🌿'],
  bonding_issues: ['ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  lack_of_support: ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ 🌸'],
  sleep_problems: ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌙', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  loss_of_confidence: ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  overwhelmed: ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  physical_discomfort: ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  negative_thoughts: ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  baby_crying: ['ඔබේ බබාගේ ඇඬීම ස්වාභාවිකය. ඔබ හොඳින් සැලකිලිමත් වෙනවා 💜', 'බබා සමඟ සන්සුන්ව සිටින්න 🌸'],
  baby_needs: ['බබාගේ සංඥා තේරුම් ගැනීමට කාලය දෙන්න 💜', 'ඔබ ඔබේ බබා වෙනුවෙන් ඉගෙන ගනිමින් සිටිනවා 🌸'],
  baby_feeding: ['කිරි දීම කාලය සමඟ පහසු වෙයි 💜', 'ඔබේ මෘදු බව බබාට සහනයකි 🌸'],
  baby_sleep: ['බබාගේ නින්ද රටාව වර්ධනය වෙමින් පවතී 🌙', 'කෙටි විවේක පවා ඔබට උපකාරී වෙයි 💜'],
  baby_health: ['සෞඛ්‍යය කෙරෙහි සැලකිලිමත් වීම අගනේය 💜', 'වෛද්‍ය උපදෙස් ලබා ගැනීම සැමවිටම සුදුසුයි 🌸'],
  caring_for_baby: ['දරුවා රැකබලා ගැනීම උතුම් කාර්යයකි 💜', 'ඔබ අද්භූත මවකි 🌸'],
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
    'needs', 'want', 'wants', 'understand', 'dont know what', 'dont understand', 'behavior', 'hasirima', 'cues', 'signals',
    'therenne naha', 'therenne na', 'therum ganna baha', 'one kiyala', 'mokakda one', 'monawada one',
    'handunaganna ba', 'handunaganna baha', 'hithaganna ba', 'therum ganna amarui', 'handunaganna amarui',
    'තේරෙන්නේ නැහැ', 'තේරෙන්නේ නෑ', 'ඕන කියලා', 'අවශ්යතා', 'තේරුම් ගන්න', 'මොනවා කරන්නද', 'දන්නේ නැහැ', 'දන්නෙ නෑ', 'හඳුනාගන්න බැහැ', 'හඳුනාගන්න බෑ'
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
    'fever', 'sick', 'health', 'unwell', 'doctor', 'hospital', 'pediatrician', 'ලෙඩ', 'උණ', 'අසනීප', 'asanipa', 'una', 'leda'
  ];

  return {
    baby_related: isBabyRelated,
    baby_crying: isBabyRelated && cryingKW.some(k => norm.includes(k)),
    baby_needs: isBabyRelated && needsKW.some(k => norm.includes(k)),
    baby_sleep: isBabyRelated && sleepKW.some(k => norm.includes(k)),
    baby_feeding: isBabyRelated && feedingKW.some(k => norm.includes(k)),
    baby_health: isBabyRelated && healthKW.some(k => k === 'una' ? new RegExp(`\\b${k}\\b`, 'i').test(norm) : norm.includes(k)),
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
  const hasMaternalMatch = sortedReasons[0][1] > 0;
  const motherReason = hasMaternalMatch ? sortedReasons[0][0] : 'fatigue';
  let motherSecondaryReason = sortedReasons[1]?.[1] > 0 ? sortedReasons[1][0] : null;

  const babyIntents = detectBabyIntents(text);

  // Step 3: Determine primary reason priority
  let primaryReason = motherReason;
  let secondaryReason = motherSecondaryReason !== primaryReason ? motherSecondaryReason : null;

  const primaryMaternalReasons = new Set([
    'bonding_issues', 'loneliness', 'negative_thoughts', 'overwhelmed',
    'relationship_family_problem', 'lack_of_support', 'physical_discomfort',
    'fatigue', 'sleep_problems', 'financial_worry', 'loss_of_confidence'
  ]);

  // Only override with baby-specific care topics (crying, health, feeding, sleep, needs) if maternal state isn't an explicit primary concern
  if (babyIntents.baby_related && (!hasMaternalMatch || motherReason === 'fatigue' || (rScores.baby_needs > 0 && rScores.baby_needs >= (rScores[motherReason] || 0)))) {
    const intentsList = [
      { id: 'baby_crying', kws: ['crying', 'cries', 'cry', 'andana', 'andanawa', 'adanawa', 'අඬනවා', 'අඬන', 'ඇඬීම', 'කෑගහනවා'] },
      { id: 'baby_needs', kws: ['needs', 'want', 'wants', 'understand', 'therenne naha', 'therenne na', 'therum ganna baha', 'one kiyala', 'mokakda one', 'monawada one', 'තේරෙන්නේ නැහැ', 'තේරෙන්නේ නෑ', 'ඕන කියලා'] },
      { id: 'baby_sleep', kws: ['sleep', 'sleeping', 'ninda', 'nida ganne', 'නින්ද', 'නිදා', 'නිදාගන්නේ'] },
      { id: 'baby_feeding', kws: ['feeding', 'feed', 'breastfeeding', 'milk', 'kiri', 'කිරි', 'කිරි දෙන්න', 'කිරි බොන්නේ'] },
      { id: 'baby_health', kws: ['fever', 'sick', 'health', 'unwell', 'doctor', 'hospital', 'pediatrician', 'ලෙඩ', 'උණ', 'අසනීප', 'asanipa', 'una', 'leda'] }
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
export const getRecommendations = (analysisResult = {}, preferredActivities = [], preferredGames = [], diaryText = '', completedActivities = []) => {
  const normReason = normalizeReasonKey(analysisResult?.primaryReason || analysisResult?.reason);
  const rawEmotion = analysisResult?.selectedEmoji || analysisResult?.detectedEmotion || analysisResult?.emotion;
  const normEmotion = normalizeEmotionKey(rawEmotion);
  const normRisk = normalizeRiskLevel(analysisResult?.riskLevel);
  const normEmoji = normalizeEmotionKey(analysisResult?.selectedEmoji || normEmotion);

  const rule = getEnhancedRecommendationRule(normEmotion, normReason, normRisk, preferredActivities, preferredGames, '', completedActivities, normEmoji);

  const { category: musicCategory, music: cappedMusic } = getMusicForReason(normReason, normEmotion, normEmoji, normRisk);
  const { category: videoCategory, videos: cappedVideos } = getVideosForReason(normReason, normEmotion, normEmoji, normRisk);
  const messages = SUPPORT_MESSAGES[normReason] || SUPPORT_MESSAGES.overwhelmed;

  const urgencyMessage = normRisk === 'medium'
    ? 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'
    : null;

  const cappedGames = (rule.games || []).slice(0, 4);

  return {
    detectedEmotion: normEmotion,
    selectedEmoji: normEmoji,
    riskLevel: normRisk,
    musicCategory,
    music: cappedMusic,
    videoCategory,
    videos: cappedVideos,
    activities: rule.activities,
    newActivities: rule.newActivities,
    games: cappedGames,
    game: rule.game,
    messages,
    urgencyMessage,
    supportMsg: rule.supportMsg,
    _internal: { primaryReason: normReason },
  };
};

