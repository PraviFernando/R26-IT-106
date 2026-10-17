// Ported from frontend/services/babyCareService.js's CATEGORY_RULES (9 of its 10 buckets —
// 'Mother Care' is excluded since it's about maternal physical recovery, not the baby, and
// doesn't belong under the newborn_care domain). Flattened into one {phrases, keywords} set
// since the domain gate only needs a yes/no "is this newborn-care topic" signal, not which
// of the original 9 baby sub-topics matched.
module.exports = {
  phrases: [
    // Baby Feeding
    'baby refuses milk', "won't drink milk", 'wont drink milk', 'breastfeeding problem',
    'cannot latch', 'cant latch', 'feeding difficulty', 'feed my baby', 'breast feeding',
    'formula milk', 'bottle feeding', 'not drinking milk', 'refuses to feed', "won't feed",
    'wont feed', 'drinking milk', "don't drink milk", 'dont drink milk', 'isnt drinking milk',
    "isn't drinking milk", 'how to feed', 'how to feed him',
    'කිරි දෙන්නේ කොහොමද', 'කිරි දෙන්න මම දන්නේ නැහැ', 'කිරි දෙන්නේ කොහොමද කියලා',
    'කිරි බොන්නේ නැහැ', 'කිරි දෙන්න අමාරුයි', 'කිරි දෙන්න බෑ', 'කිරි දෙන්න',
    'kiri bonna naha', 'kiri denna baha', 'kiri bonna ba', 'kiri denna amaruwi', 'kiri denne kohomada',
    // Baby Bathing
    'wash my baby', 'clean my baby', 'first bath', 'newborn bath', "don't know how to bath",
    'dont know how to bath', 'how can i bath', 'how to bath', 'bath my newborn',
    'bath my baby', 'bathing baby', 'sponge bath', 'umbilical cord', 'baby bath',
    'bathe my baby', 'bath my newborn baby', 'bathe my newborn baby', 'wash baby', 'clean baby',
    'නාන්න', 'නාගන්න', 'නාවන්න', 'බබාව නාවන්න', 'nawanna', 'baba nawanna',
    // Baby Diapering
    'dress diaper', 'wear diaper', 'change nappy', 'change diaper', 'changing diaper',
    'put diaper', 'remove diaper', 'put on diaper', 'diaper to my child', 'diaper rash',
    'dirty diaper', 'wet diaper', 'change napkin', 'dress diaper to my child',
    'diaper to my baby', 'wearing a diaper',
    'ඩයපර්', 'ඩයපර් මාරු', 'නැප්කින්', 'diaper maru',
    // Baby Sleeping
    'cry at night', 'cries at night', "won't sleep", 'wont sleep', 'sleep through night',
    "can't sleep", 'cant sleep', 'sleep schedule', 'nap time', 'stay awake',
    'cry every night', 'cries every night', 'not sleep at night', 'is not sleep',
    'රාත්රියේ නිදාගන්නේ නැතුව', 'රාත්‍රියේ නිදාගන්නේ නැතුව', 'නිදාගන්නේ නැතුව',
    'නිදාගන්නේ නැහැ', 'නිදාගන්නෙ නෑ', 'රෑට නිදාගන්නේ නැහැ', 'නින්දක් නෑ',
    'nida ganne naha', 'nida na', 'rata nida ganne naha', 'ninda naha',
    // Baby Crying
    "won't stop crying", 'wont stop crying', 'cries every night', 'cries all time',
    'crying baby', 'stop crying', 'calm crying baby', 'soothe baby', 'cry every night',
    'නැතුව අඬනවා', 'ගොඩක් අඬනවා', 'නිතරම අඬනවා', 'නවත්තන්න බැරි තරම් අඬනවා', 'ඇයි කියලා මට තේරෙන්නේ නැහැ',
    'godak andanawa', 'nitharama andanawa', 'baba godak andanawa', 'adanawa',
    // Baby Health
    'has fever', 'high temperature', 'baby is sick', 'vomiting milk', 'turned yellow',
    'medical help', 'diaper rash', 'has a fever',
    'උණ තියෙනවා', 'අසනීප වෙලා', 'ලෙඩ වෙලා', 'ලෙඩයි',
    'una thiyenawa', 'asanipa wela', 'leda wela', 'leda',
    // Baby Development
    'tummy time', 'weight gain', 'developmental milestones', 'learning to sit',
    'learning to crawl', 'first smile',
    'වර්ධනය', 'බර වැඩිවීම', 'ඉඳගන්න', 'ඇවිදින්න',
    // Vaccination
    'baby vaccine', 'vaccine schedule', 'immunization', 'fever after vaccine',
    'එන්නත්', 'වැක්සින්',
    // Baby Safety
    'baby safe', 'safe sleeping position', 'car seat', 'baby proofing',
    'ආරක්ෂාව', 'පරිස්සම්',
  ],
  keywords: [
    // Baby Feeding
    'feed', 'feeding', 'milk', 'breastfeed', 'breastfeeding', 'formula', 'bottle',
    'hungry', 'latch', 'latching', 'burp', 'burping', 'nursing', 'pump', 'pumping',
    'spit up', 'reflux', 'kiri', 'කිරි', 'කිරිදීම',
    // Baby Bathing
    'bath', 'bathe', 'bathing', 'wash', 'clean', 'soap', 'shampoo', 'water',
    'sponge', 'umbilical', 'නාවන්න', 'නෑම', 'nawanna',
    // Baby Diapering
    'diaper', 'diapers', 'nappy', 'napkin', 'rash', 'poop', 'stool', 'wipes', 'pee',
    'ඩයපර්',
    // Baby Sleeping
    'sleep', 'sleeping', 'night', 'nap', 'napping', 'awake', 'wake', 'restless',
    'bedtime', 'routine', 'insomnia', 'ninda', 'නින්ද', 'නිදා', 'නිදාගන්න', 'නිදාගන්නේ',
    'රාත්රියේ', 'රාත්‍රියේ',
    // Baby Crying
    'cry', 'crying', 'cries', 'fussy', 'fussing', 'colic', 'soothe', 'soothing',
    'screaming', 'unsettled', 'andanawa', 'andana', 'adanawa', 'අඬනවා', 'අඬන', 'ඇඬීම', 'කෑගහනවා',
    // Baby Health
    'fever', 'temperature', 'sick', 'ill', 'cold', 'cough', 'vomit', 'vomiting',
    'diarrhea', 'infection', 'medicine', 'doctor', 'hospital', 'jaundice', 'yellow', 'rash',
    'una', 'උණ', 'අසනීප', 'ලෙඩ', 'asanipa', 'leda',
    // Baby Development
    'growth', 'weight', 'gain', 'milestone', 'milestones', 'crawling', 'crawl',
    'sitting', 'sit', 'walking', 'walk', 'standing', 'talking', 'rolling', 'roll', 'smile',
    // Vaccination
    'vaccine', 'vaccination', 'immunization', 'injection', 'එන්නත', 'එන්නත්',
    // Baby Safety
    'safety', 'safe', 'choking', 'carseat', 'proof', 'ආරක්ෂාව',
  ],
};
