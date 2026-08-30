// Authored fresh — no equivalent lexicon existed anywhere in the codebase before this.
// First-pass coverage informed by the actual ingested Knowglagepdf/ corpus's subject
// matter (PPD, EPDS, risk factors, perinatal mental health). Same {phrases, keywords}
// shape as newbornCareLexicon.js so both run through domainGate.js's shared scoring.
// Intentionally tunable — calibrate further once real usage data exists.
module.exports = {
  phrases: [
    'postpartum depression', 'postnatal depression', 'perinatal depression', 'baby blues',
    'postnatal anxiety', 'perinatal anxiety', 'mother mental health', 'feeling overwhelmed',
    "can't bond with my baby", 'cant bond with my baby', 'not feeling like myself',
    'crying spells', 'crying for no reason', 'mood swings after birth', 'epds score',
    'edinburgh postnatal depression scale', 'risk factors for depression',
    'mental health after birth', 'postpartum psychosis', "i'm a bad mother", 'bad mother',
    'මානසික අවපීඩනය', 'ප්‍රසව අවපීඩනය', 'ළමා උපතෙන් පසු අවපීඩනය',
    // extended Sinhala coverage (2026-08-27) — bringing this closer to newbornCareLexicon.js's
    // existing depth, so Sinhala PPD/mental-health questions aren't classified worse than
    // equivalent Sinhala newborn-care questions purely due to lexicon-authoring history.
    'ප්‍රසූතියෙන් පසු අවපීඩනය', 'දරු ප්‍රසූතියෙන් පසු අවපීඩනය', 'ප්‍රසව මානසික සෞඛ්‍යය',
    'මට මගේ දරුවා එක්ක බැඳීමක් නෑ', 'මට මගේ දරුවා එක්ක සම්බන්ධයක් දැනෙන්නේ නෑ',
    'මට මං වගේ හිතෙන්නේ නෑ', 'මට මාව හඳුනගන්න බෑ', 'හේතුවක් නැතුව අඬනවා',
    'ප්‍රසූතියෙන් පසු මනෝභාවයේ වෙනස්කම්', 'මනෝභාවය වෙනස් වෙනවා',
    'මම නරක අම්මා කෙනෙක්', 'නරක අම්මා', 'මට තනිකම දැනෙනවා', 'මට හුදකලාව දැනෙනවා',
    'මට හරිම මහන්සියි', 'මට දරාගන්න බෑ',
  ],
  keywords: [
    'depression', 'depressed', 'anxiety', 'anxious', 'hopeless', 'overwhelmed', 'lonely',
    'isolated', 'exhausted', 'guilty', 'worthless', 'bonding', 'epds', 'postpartum', 'postnatal',
    'perinatal', 'mood', 'psychosis', 'counselling', 'counseling', 'therapy',
    'අවපීඩනය', 'ආතතිය', 'මානසික', 'තනිකම', 'හුදකලා', 'මහන්සි', 'මහන්සියි', 'වරදකාරී',
    'බැඳීම', 'මනෝභාවය', 'උපදේශනය', 'චිකිත්සාව', 'ප්‍රසූතිය',
  ],
};
