// ─────────────────────────────────────────────────────────────────────────────
// Edinburgh Postnatal Depression Scale (EPDS) — 10 items, bilingual (en / si).
//
// Standard EPDS scoring:
//   Q1, Q2, Q4      → option 0..3 top-to-bottom scores 0,1,2,3  (reverse: false)
//   Q3, Q5..Q10     → option 0..3 top-to-bottom scores 3,2,1,0  (reverse: true)
//   Total 0–30.  scoreFor(question, optionIndex) below does the mapping.
//
// Sinhala wording transcribed from the project's source questionnaire
// (Model/evidance/WhatsApp Image 2026-08-23 at 9.28.43 / 9.28.47 / 9.28.54).
// This is a screening tool, not a diagnosis.
// ─────────────────────────────────────────────────────────────────────────────

export const EPDS_QUESTIONS = [
  {
    key: 'q1',
    reverse: false,
    en: {
      stem: 'I have been able to laugh and see the funny side of things',
      options: [
        'As much as I always could',
        'Not quite so much now',
        'Definitely not so much now',
        'Not at all',
      ],
    },
    si: {
      stem: 'මට සිනහවීමට සහ දේවල්වල හොඳ පැත්ත දැකීමට හැකිය.',
      options: [
        'පෙර මෙන්ම හොඳින් හැකිය',
        'පෙරට වඩා ටිකක් අඩුවෙන් හැකිය',
        'පැහැදිලිවම අඩුවෙන් හැකිය',
        'කිසිසේත්ම හැකියාවක් නැත',
      ],
    },
  },
  {
    key: 'q2',
    reverse: false,
    en: {
      stem: 'I have looked forward with enjoyment to things',
      options: [
        'As much as I ever did',
        'Rather less than I used to',
        'Definitely less than I used to',
        'Hardly at all',
      ],
    },
    si: {
      stem: 'ඉදිරියේදී සිදුවන දේවල් ගැන සතුටින් බලාපොරොත්තු වීමට මට හැකිය.',
      options: [
        'පෙර මෙන්ම සතුටින් බලාපොරොත්තු වෙමි',
        'පෙරට වඩා ටිකක් අඩුවෙන් බලාපොරොත්තු වෙමි',
        'පෙරට වඩා සැලකිය යුතු ලෙස අඩුවෙන් බලාපොරොත්තු වෙමි',
        'කිසිසේත්ම බලාපොරොත්තුවක් නැත',
      ],
    },
  },
  {
    key: 'q3',
    reverse: true,
    en: {
      stem: 'I have blamed myself unnecessarily when things went wrong',
      options: [
        'Yes, most of the time',
        'Yes, some of the time',
        'Not very often',
        'No, never',
      ],
    },
    si: {
      stem: 'දේවල් වැරදුණු විට මම අනවශ්‍ය ලෙස මටම දොස් පවරා ගන්නෙමි.',
      options: [
        'ඔව්, බොහෝ විට',
        'ඔව්, සමහර අවස්ථාවලදී',
        'එතරම් නිතර නොවේ',
        'නැහැ, කිසිසේත්ම නැහැ',
      ],
    },
  },
  {
    key: 'q4',
    reverse: false,
    en: {
      stem: 'I have been anxious or worried for no good reason',
      options: [
        'No, not at all',
        'Hardly ever',
        'Yes, sometimes',
        'Yes, very often',
      ],
    },
    si: {
      stem: 'හේතුවක් නොමැතිව මට කනස්සල්ලක් හෝ බියක් දැනුණි.',
      options: [
        'නැහැ, කිසිසේත්ම නැහැ',
        'ඉතා කලාතුරකින්',
        'ඔව්, සමහර අවස්ථාවලදී',
        'ඔව්, ඉතා නිතර',
      ],
    },
  },
  {
    key: 'q5',
    reverse: true,
    en: {
      stem: 'I have felt scared or panicky for no very good reason',
      options: [
        'Yes, quite a lot',
        'Yes, sometimes',
        'No, not much',
        'No, not at all',
      ],
    },
    si: {
      stem: 'හේතුවක් නොමැතිව මට බියක් හෝ කලබලයක් දැනුණි.',
      options: [
        'ඔව්, බොහෝ විට',
        'ඔව්, සමහර අවස්ථාවලදී',
        'නැහැ, එතරම් නිතර නොවේ',
        'නැහැ, කිසිසේත්ම නැහැ',
      ],
    },
  },
  {
    key: 'q6',
    reverse: true,
    en: {
      stem: 'Things have been getting on top of me',
      options: [
        "Yes, most of the time I haven't been able to cope at all",
        "Yes, sometimes I haven't been coping as well as usual",
        'No, most of the time I have coped quite well',
        'No, I have been coping as well as ever',
      ],
    },
    si: {
      stem: 'දේවල් පාලනය කර ගැනීමට මට අපහසු බවක් දැනුණි.',
      options: [
        'ඔව්, බොහෝ විට',
        'ඔව්, සමහර අවස්ථාවලදී',
        'නැහැ, බොහෝ විට මට හොඳින් පාලනය කරගත හැකිය',
        'නැහැ, මට පෙර මෙන්ම හොඳින් පාලනය කරගත හැකිය',
      ],
    },
  },
  {
    key: 'q7',
    reverse: true,
    en: {
      stem: 'I have been so unhappy that I have had difficulty sleeping',
      options: [
        'Yes, most of the time',
        'Yes, sometimes',
        'Not very often',
        'No, not at all',
      ],
    },
    si: {
      stem: 'මම ඉතා අසතුටින් සිටින නිසා නිදා ගැනීමට අපහසු විය.',
      options: [
        'ඔව්, බොහෝ විට',
        'ඔව්, සමහර අවස්ථාවලදී',
        'එතරම් නිතර නොවේ',
        'නැහැ, කිසිසේත්ම නැහැ',
      ],
    },
  },
  {
    key: 'q8',
    reverse: true,
    en: {
      stem: 'I have felt sad or miserable',
      options: [
        'Yes, most of the time',
        'Yes, quite often',
        'Not very often',
        'No, not at all',
      ],
    },
    si: {
      stem: 'මට දුකක් හෝ අසතුටක් දැනුණි.',
      options: [
        'ඔව්, බොහෝ විට',
        'ඔව්, නිතරම වගේ',
        'එතරම් නිතර නොවේ',
        'නැහැ, කිසිසේත්ම නැහැ',
      ],
    },
  },
  {
    key: 'q9',
    reverse: true,
    en: {
      stem: 'I have been so unhappy that I have been crying',
      options: [
        'Yes, most of the time',
        'Yes, quite often',
        'Only occasionally',
        'No, never',
      ],
    },
    si: {
      stem: 'මම ඉතා අසතුටින් සිටින නිසා මට අඬන්න සිතුණි.',
      options: [
        'ඔව්, බොහෝ විට',
        'ඔව්, නිතරම වගේ',
        'කලාතුරකින් පමණි',
        'නැහැ, කිසිසේත්ම නැහැ',
      ],
    },
  },
  {
    key: 'q10',
    reverse: true,
    en: {
      stem: 'The thought of harming myself has occurred to me',
      options: ['Yes, quite often', 'Sometimes', 'Hardly ever', 'Never'],
    },
    si: {
      stem: 'මට මටම හානි කර ගැනීමේ සිතුවිලි ඇති විය.',
      options: [
        'ඔව්, නිතරම වගේ',
        'සමහර අවස්ථාවලදී',
        'ඉතා කලාතුරකින්',
        'කිසිසේත්ම නැහැ',
      ],
    },
  },
];

// Standard EPDS scoring for a chosen option (0..3, top-to-bottom).
export const scoreFor = (question, optionIndex) =>
  question.reverse ? 3 - optionIndex : optionIndex;

// Q10 (self-harm) — index 9. Used to surface the helpline before entering chat.
export const SELF_HARM_QUESTION_INDEX = 9;
