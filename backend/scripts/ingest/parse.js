const fs = require('fs');
const { PDFParse } = require('pdf-parse');

// pdf-parse v2's class-based API (not the v1 pdf(buffer) function).
async function parsePdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.pages.map((p) => ({ num: p.num, text: cleanPageText(p.text) }));
  } finally {
    await parser.destroy();
  }
}

function cleanPageText(text) {
  return (text || '')
    .replace(/([a-zA-Z])-\s*\n\s*([a-zA-Z])/g, '$1$2') // de-hyphenate line-wrapped words
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      return t.length > 0 && !/^\d{1,4}$/.test(t); // drop blank lines + bare page-number lines
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { parsePdf, cleanPageText };
