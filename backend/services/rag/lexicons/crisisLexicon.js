// Ported from frontend/services/emotionEngine.js's HIGH_CRISIS_KW (legible/uncorrupted,
// unlike that file's SUPPORT_MESSAGES output strings) and substantially extended with
// canonical self-harm/suicide terminology missing from the original list.
//
// FLAG FOR REVIEW: Sinhala coverage was extended 2026-08-27 (see the block below the postpartum-
// psychosis section) beyond the original 3 emotionEngine.js terms, but this is still a first-pass
// list, NOT clinically/native-speaker reviewed. Only common, unambiguous, multi-word self-harm
// phrasing was added (deliberately avoiding short/generic fragments that could false-positive on
// ordinary complaints). Given the safety stakes, a Sinhala speaker — ideally with a clinical
// background — should still review and extend this file before it's fully relied on.
module.exports = [
  // from emotionEngine.js HIGH_CRISIS_KW
  'hopeless', 'want to die', 'end it all', 'cannot control my emotions', 'cant control my emotions',
  'panic very easily', 'failing as a mother', 'disappear', 'hate myself', 'dark thoughts',
  'මැරෙන්න හිතෙනවා', 'ජීවිතේ එපා වෙලා', 'merenna hithenawa',
  // extended: canonical self-harm/suicide terms
  'suicidal', 'suicide', 'kill myself', 'want to hurt myself', 'hurt myself', 'harm myself',
  'self harm', 'self-harm', "can't go on", 'cant go on', 'cannot go on', 'no reason to live',
  'not worth living', 'better off dead', 'better off without me', 'no point in living',
  'end my life', 'ending my life',
  // postpartum-psychosis-relevant: intrusive thoughts about the baby are a distinct red flag
  'hurt my baby', 'harm my baby', 'thoughts of harming my baby', 'hearing voices',
  // extended Sinhala coverage (2026-08-27) — broader first-pass list, still NOT a substitute
  // for the native-speaker/clinical review flagged above; only adds candidate phrases, which
  // can only reduce false negatives, never make detection worse.
  'මට මැරෙන්න හිතෙනවා', 'මං මැරෙනවා', 'මට මැරෙනවා', 'මරාගන්න හිතෙනවා', 'මාව මරාගන්න හිතෙනවා',
  'ජීවත් වෙන්න හිතෙන්නේ නෑ', 'ජීවත් වෙන්න හිතෙන්නේ නැහැ', 'ජීවත් වෙන්න මනස නෑ',
  'මට ජීවත් වෙන්න බෑ', 'මට තව ඉවසන්න බෑ', 'ආත්ම ඝාතනය', 'ආත්මාහුතිය',
  'මගේ දරුවට හානි කරන්න හිතෙනවා', 'දරුවට හිංසා කරන්න හිතෙනවා', 'මගේ දරුවට රිදෙන්න දෙයක් කරන්න හිතෙනවා',
  'මට කිසිම වටිනාකමක් නෑ', 'මම කිසිම වටිනාකමක් නැති කෙනෙක්', 'මං හිටියත් නැතත් වැඩක් නෑ',
  'මට හඬවල් ඇහෙනවා',
  // common indirect/euphemistic phrasing (caught a real gap: the original stale plan's own
  // test phrase, "I don't want to be here anymore", wasn't matching anything above)
  "don't want to be here anymore", 'dont want to be here anymore', "don't want to be here",
  'dont want to be here', 'wish i wasnt here', "wish i wasn't here", "wish i wasn't born",
  'wish i wasnt born', "can't take it anymore", 'cant take it anymore', "can't do this anymore",
  'cant do this anymore', 'tired of living', 'tired of life', "what's the point", 'whats the point',
  'nothing matters anymore', 'everyone would be better off without me', 'give up on life',
  'want to give up', 'no way out', "life isn't worth it", 'life isnt worth it',
];
