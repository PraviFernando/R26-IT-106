// Ported from frontend/services/emotionEngine.js's normalizeMultilingualText (duplicated
// there as babyCareService.js's normalizeText) — shared by domainGate.js and crisisDetector.js
// so lexicon matching is consistent across both.
function normalizeText(text = '') {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.toLowerCase().trim();

  // Normalize common Singlish spelling variations to standard forms
  cleaned = cleaned
    .replace(/adanawa/g, 'andanawa')
    .replace(/andanne/g, 'andanawa')
    .replace(/andana/g, 'andanawa')
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
    .replace(/['’]/g, '');

  // Keep alphanumeric, spaces, and Sinhala Unicode range
  cleaned = cleaned.replace(/[^\w\s඀-෿]/g, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
}

module.exports = { normalizeText };
