// Matched via exact equality (see greetingDetector.js) against the FULL normalized message,
// not substring `includes()` like crisisLexicon/routineRequestLexicon use — short tokens like
// "hi"/"hey" are substrings of plenty of real words ("high risk pregnancy"), and a substring
// match would also wrongly swallow a real question that happens to start with a greeting
// ("hi, what causes postpartum depression"). Exact match keeps this scoped to messages that
// ARE a greeting, not ones that merely contain one.
module.exports = [
  'hi', 'hii', 'hiya', 'hello', 'helo', 'hey', 'heya', 'yo', 'sup', 'whats up', 'wassup',
  'good morning', 'good afternoon', 'good evening', 'good night', 'morning', 'evening',
  'how are you', 'how r u', 'hru', 'how are you doing',
  'thanks', 'thank you', 'thank u', 'ok thanks', 'okay thanks',
  'bye', 'goodbye', 'good bye', 'see you', 'see ya', 'cya',
  // Sinhala
  'ආයුබෝවන්', 'හලෝ', 'හායි', 'කොහොමද', 'ඔයාට කොහොමද', 'සුබ උදෑසනක්', 'සුබ රාත්‍රියක්',
  'ස්තූතියි', 'බායි',
];
