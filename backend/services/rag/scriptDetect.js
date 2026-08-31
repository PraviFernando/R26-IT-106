// Sinhala script never collides with Latin characters, so even one Sinhala character is an
// unambiguous signal — no threshold/heuristic needed. Same Unicode block textNormalize.js
// already preserves (඀-෿, U+0D80-U+0DFF).
function containsSinhalaScript(text = '') {
  return /[඀-෿]/.test(text);
}

module.exports = { containsSinhalaScript };
