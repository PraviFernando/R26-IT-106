// Flat phrase list (unscored, like crisisLexicon.js) — detects when a message is asking
// for a daily routine/schedule, as opposed to an ordinary informational question. Used to
// gate routine-item suggestions so they only attach when actually relevant, not on every
// successfully-answered reply.
module.exports = [
  'give me a routine',
  'give me a schedule',
  'what should i do today',
  'schedule for today',
  'routine for today',
  'daily routine',
  "today's routine",
  'plan for today',
  'plan my day',
  'help me plan my day',
  'what activities should i do',
  'suggest a routine',
  'suggest some activities',
  'recommend a routine',
  'recommend some activities',
  'build me a routine',
  'create a routine',
];
