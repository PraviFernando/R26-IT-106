import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight, dependency-free Markdown renderer for the subset the chatbot LLM
// (Ollama / Gemma) actually emits:
//   #..###### headings   **bold** / __bold__   *italic* / _italic_   `code`
//   - / * / • bullet lists   1. / 1) numbered lists   --- *** ___ rules
//   [text](url) links   blank-line-separated paragraphs
//
//   <MarkdownText text={message.content} style={styles.assistantText} />
//
// `style` is the base text style (font size / colour / lineHeight). `mutedStyle`
// is merged on top for the "rejected" bubble state.
// ─────────────────────────────────────────────────────────────────────────────

const INLINE_RE =
  /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/g;

function renderInline(text, baseStyle, keyPrefix) {
  const segments = String(text).split(INLINE_RE);
  return segments.map((seg, i) => {
    if (!seg) return null;
    const key = `${keyPrefix}.${i}`;

    if (
      (seg.startsWith('**') && seg.endsWith('**')) ||
      (seg.startsWith('__') && seg.endsWith('__'))
    ) {
      return (
        <Text key={key} style={[baseStyle, styles.bold]}>
          {seg.slice(2, -2)}
        </Text>
      );
    }
    if (
      (seg.startsWith('*') && seg.endsWith('*')) ||
      (seg.startsWith('_') && seg.endsWith('_'))
    ) {
      return (
        <Text key={key} style={[baseStyle, styles.italic]}>
          {seg.slice(1, -1)}
        </Text>
      );
    }
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <Text key={key} style={[baseStyle, styles.code]}>
          {seg.slice(1, -1)}
        </Text>
      );
    }
    const link = seg.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      return (
        <Text
          key={key}
          style={[baseStyle, styles.link]}
          onPress={() => Linking.openURL(link[2]).catch(() => {})}
        >
          {link[1]}
        </Text>
      );
    }
    return (
      <Text key={key} style={baseStyle}>
        {seg}
      </Text>
    );
  });
}

function parseBlocks(src) {
  const lines = String(src || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let para = [];

  const flush = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ') });
      para = [];
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');

    if (line.trim() === '') {
      flush();
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push({ type: 'h', level: heading[1].length, text: heading[2].trim() });
      continue;
    }
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      flush();
      blocks.push({ type: 'hr' });
      continue;
    }
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      flush();
      blocks.push({ type: 'li', ordered: false, text: bullet[1].replace(/^\s+/, '') });
      continue;
    }
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (numbered) {
      flush();
      blocks.push({
        type: 'li',
        ordered: true,
        marker: numbered[1],
        text: numbered[2].replace(/^\s+/, ''),
      });
      continue;
    }
    para.push(line.trim());
  }
  flush();
  return blocks;
}

export default function MarkdownText({ text, style, mutedStyle }) {
  const base = mutedStyle ? [style, mutedStyle] : style;
  const blocks = parseBlocks(text);

  return (
    <View>
      {blocks.map((blk, i) => {
        const gap = i > 0 ? styles.blockGap : null;

        if (blk.type === 'hr') {
          return <View key={i} style={styles.hr} />;
        }
        if (blk.type === 'h') {
          const hStyle = styles[`h${blk.level}`] || styles.h4;
          return (
            <Text key={i} style={[base, styles.bold, hStyle, gap]}>
              {renderInline(blk.text, [base, styles.bold], `h${i}`)}
            </Text>
          );
        }
        if (blk.type === 'li') {
          return (
            <View key={i} style={[styles.liRow, gap]}>
              <Text style={[base, styles.marker]}>
                {blk.ordered ? `${blk.marker}.` : '•'}
              </Text>
              <Text style={[base, styles.liText]}>
                {renderInline(blk.text, base, `li${i}`)}
              </Text>
            </View>
          );
        }
        return (
          <Text key={i} style={[base, gap]}>
            {renderInline(blk.text, base, `p${i}`)}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  blockGap: { marginTop: 8 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  code: {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(124,58,237,0.10)',
    borderRadius: 4,
  },
  link: { color: '#7C3AED', textDecorationLine: 'underline' },

  h1: { fontSize: 19, lineHeight: 26, marginTop: 12 },
  h2: { fontSize: 17, lineHeight: 24, marginTop: 12 },
  h3: { fontSize: 15, lineHeight: 22, marginTop: 10 },
  h4: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  h5: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  h6: { fontSize: 13, lineHeight: 19, marginTop: 8 },

  hr: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginVertical: 12,
  },

  liRow: { flexDirection: 'row', alignItems: 'flex-start' },
  marker: { width: 20, fontWeight: '700' },
  liText: { flex: 1 },
});
