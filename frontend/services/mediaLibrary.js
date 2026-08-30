// ============================================================
// MEDIA LIBRARY — Complete with 10 tracks + 10 videos per reason
// Keys match exactly what emotionEngine.js expects
// ============================================================
// HOW TO ADD YOUR OWN FILES:
//   1. Put .mp3 files in:  src/assets/music/
//   2. Put .mp4 files in:  src/assets/videos/
//   3. Change: source: null  →  source: require('../assets/music/yourfile.mp3')
//   OR stream: source: { uri: 'https://your-server.com/audio.mp3' }
// ============================================================

export const MUSIC_LIBRARY = {
  // ── LONELINESS ──────────────────────────────────────────
  loneliness: [
    { id: 'lo1', title: 'ඔබ තනිවම නොවෙයි', titleEn: 'You Are Not Alone', duration: '6:20', emoji: '💜', url: 'https://www.youtube.com/results?search_query=you+are+not+alone+relaxing+piano+music', source: null },
    { id: 'lo2', title: 'සන්සුන් පියානෝ සංගීතය', titleEn: 'Calm Piano Music', duration: '8:00', emoji: '🎹', url: 'https://www.youtube.com/results?search_query=calm+piano+music+stress+relief', source: null },
    { id: 'lo3', title: 'සැනසිලිදායක උණුසුම', titleEn: 'Comforting Warmth', duration: '5:45', emoji: '🌸', url: 'https://www.youtube.com/results?search_query=comforting+warmth+soothing+music', source: null },
    { id: 'lo4', title: 'සහෝදරියන්ගේ ගීතය', titleEn: 'Sisterhood Song', duration: '7:10', emoji: '🤗', url: 'https://www.youtube.com/results?search_query=sisterhood+healing+song', source: null },
    { id: 'lo5', title: 'ආලෝකය ළඟයි', titleEn: 'Light is Near', duration: '6:30', emoji: '✨', url: 'https://www.youtube.com/results?search_query=light+is+near+meditation+music', source: null },
    { id: 'lo6', title: 'මෘදු සන්සුන් භාවය', titleEn: 'Soft Serenity', duration: '9:00', emoji: '🌿', url: 'https://www.youtube.com/results?search_query=soft+serenity+relaxing+music', source: null },
    { id: 'lo7', title: 'සුන්දර ජීවිතය', titleEn: 'Beautiful Life', duration: '5:30', emoji: '🌈', url: 'https://www.youtube.com/results?search_query=beautiful+life+soothing+music', source: null },
    { id: 'lo8', title: 'ආදරණීය හදවත', titleEn: 'Dear Heart', duration: '7:00', emoji: '❤️', url: 'https://www.youtube.com/results?search_query=dear+heart+calm+instrumental', source: null },
    { id: 'lo9', title: 'මිහිරි ගෙදර තනුව', titleEn: 'Sweet Home Melody', duration: '6:15', emoji: '🏡', url: 'https://www.youtube.com/results?search_query=sweet+home+melody+relaxing+music', source: null },
    { id: 'lo10', title: 'උදෑසන ආලෝකය', titleEn: 'Morning Light', duration: '5:00', emoji: '☀️', url: 'https://www.youtube.com/results?search_query=morning+light+peaceful+music', source: null },
  ],
  // ── FATIGUE ─────────────────────────────────────────────
  fatigue: [
    { id: 'fa1', title: 'විවේක සංගීතය', titleEn: 'Relaxation Audio', duration: '10:00', emoji: '🛌', url: 'https://www.youtube.com/results?search_query=relaxation+audio+sleep+music', source: null },
    { id: 'fa2', title: 'ස්වභාව ධ්වනි - කුරුල්ලන්', titleEn: 'Nature Sounds - Birds', duration: '15:00', emoji: '🐦', url: 'https://www.youtube.com/results?search_query=nature+sounds+birds+chirping+relaxation', source: null },
    { id: 'fa3', title: 'සාගර රළ', titleEn: 'Ocean Waves', duration: '20:00', emoji: '🌊', url: 'https://www.youtube.com/results?search_query=ocean+waves+relaxing+sleep+sounds', source: null },
    { id: 'fa4', title: 'රාත්‍රී සාමය', titleEn: 'Night Peace', duration: '30:00', emoji: '🌙', url: 'https://www.youtube.com/results?search_query=night+peace+deep+sleep+music', source: null },
    { id: 'fa5', title: 'මෘදු පියානෝ සංගීතය', titleEn: 'Gentle Piano', duration: '8:00', emoji: '🎵', url: 'https://www.youtube.com/results?search_query=gentle+piano+relaxing+music', source: null },
    { id: 'fa6', title: 'සැනසිලිදායක තන්තු සංගීතය', titleEn: 'Soothing Strings', duration: '12:00', emoji: '🎼', url: 'https://www.youtube.com/results?search_query=soothing+strings+instrumental+music', source: null },
    { id: 'fa7', title: 'කොළ මත වැසි හඬ', titleEn: 'Rain on Leaves', duration: '25:00', emoji: '🌧️', url: 'https://www.youtube.com/results?search_query=rain+on+leaves+sleep+sounds', source: null },
    { id: 'fa8', title: 'සුදු ශබ්ද සැනසීම', titleEn: 'White Noise Comfort', duration: '60:00', emoji: '🌫️', url: 'https://www.youtube.com/results?search_query=white+noise+baby+sleep+comfort', source: null },
    { id: 'fa9', title: 'අම්මාගේ විවේක ගීතාවලිය', titleEn: 'Mama Rest Playlist', duration: '20:00', emoji: '💜', url: 'https://www.youtube.com/results?search_query=mama+rest+relaxation+music', source: null },
    { id: 'fa10', title: 'සුවදායී නින්ද රළ', titleEn: 'Healing Sleep Waves', duration: '45:00', emoji: '🌊', url: 'https://www.youtube.com/results?search_query=healing+sleep+waves+delta+sounds', source: null },
  ],
  // ── ANXIETY ─────────────────────────────────────────────
  anxiety: [
    { id: 'an1', title: 'භාවනා සංගීතය', titleEn: 'Meditation Music', duration: '10:00', emoji: '🧘', url: 'https://www.youtube.com/results?search_query=meditation+music+anxiety+relief', source: null },
    { id: 'an2', title: '432Hz සුවදායී සංඛ්‍යාත', titleEn: '432Hz Healing Frequencies', duration: '15:00', emoji: '🔮', url: 'https://www.youtube.com/results?search_query=432hz+healing+frequency+calm', source: null },
    { id: 'an3', title: 'සන්සුන් සාගර රළ', titleEn: 'Ocean Waves Calm', duration: '20:00', emoji: '🌊', url: 'https://www.youtube.com/results?search_query=ocean+waves+calm+anxiety', source: null },
    { id: 'an4', title: 'ටිබෙටන් ගායන භාජන', titleEn: 'Tibetan Singing Bowls', duration: '12:00', emoji: '🎵', url: 'https://www.youtube.com/results?search_query=tibetan+singing+bowls+stress+relief', source: null },
    { id: 'an5', title: 'මෘදු බටනලා ශබ්ද', titleEn: 'Soft Flute Sounds', duration: '8:00', emoji: '🎶', url: 'https://www.youtube.com/results?search_query=soft+flute+calming+music', source: null },
    { id: 'an6', title: 'වනාන්තර හුස්ම', titleEn: 'Forest Breathing', duration: '10:00', emoji: '🌲', url: 'https://www.youtube.com/results?search_query=forest+sounds+breathing+meditation', source: null },
    { id: 'an7', title: 'කාංසාව නිවන ගීතාවලිය', titleEn: 'Anxiety Ease Playlist', duration: '9:00', emoji: '🌬️', url: 'https://www.youtube.com/results?search_query=anxiety+ease+relaxing+music', source: null },
    { id: 'an8', title: 'ඩෙල්ටා රළ සන්සුන්තාව', titleEn: 'Delta Wave Calm', duration: '30:00', emoji: '😴', url: 'https://www.youtube.com/results?search_query=delta+wave+deep+calm+sleep', source: null },
    { id: 'an9', title: 'සාමකාමී තණබිම්', titleEn: 'Peaceful Meadow', duration: '15:00', emoji: '🌾', url: 'https://www.youtube.com/results?search_query=peaceful+meadow+relaxing+nature+music', source: null },
    { id: 'an10', title: 'නිශ්චල ජල භාවනාව', titleEn: 'Still Water Meditation', duration: '18:00', emoji: '🪷', url: 'https://www.youtube.com/results?search_query=still+water+meditation+music', source: null },
  ],
  // ── BONDING ISSUES ──────────────────────────────────────
  bonding_issues: [
    { id: 'bo1', title: 'අම්මා-දරු බැඳීම් ගීත', titleEn: 'Mother-Baby Bonding Songs', duration: '8:00', emoji: '💓', url: 'https://www.youtube.com/results?search_query=mother+baby+bonding+music', source: null },
    { id: 'bo2', title: 'සිංහල නැලවිලි ගීය 1', titleEn: 'Sinhala Lullaby 1', duration: '4:30', emoji: '🌙', url: 'https://www.youtube.com/results?search_query=sinhala+lullaby+nalawili+gee', source: null },
    { id: 'bo3', title: 'සිංහල නැලවිලි ගීය 2', titleEn: 'Sinhala Lullaby 2', duration: '5:10', emoji: '⭐', url: 'https://www.youtube.com/results?search_query=sinhala+baby+lullaby+music', source: null },
    { id: 'bo4', title: 'සන්සුන් සංගීතය', titleEn: 'Calming Instrumental Music', duration: '6:30', emoji: '🧘', url: 'https://www.youtube.com/results?search_query=calming+instrumental+music+mother+baby', source: null },
    { id: 'bo5', title: 'පළමු සිනාව ගීතය', titleEn: 'First Smile Song', duration: '5:00', emoji: '😊', url: 'https://www.youtube.com/results?search_query=first+smile+lullaby+baby+music', source: null },
    { id: 'bo6', title: 'ආදර භාෂා නැලවිලි ගීය', titleEn: 'Love Language Lullaby', duration: '7:20', emoji: '💜', url: 'https://www.youtube.com/results?search_query=love+language+lullaby+music', source: null },
    { id: 'bo7', title: 'ළදරු හදගැස්ම සහභාගීත්වය', titleEn: 'Baby Heartbeat Harmony', duration: '8:00', emoji: '🤱', url: 'https://www.youtube.com/results?search_query=baby+heartbeat+womb+sounds+lullaby', source: null },
    { id: 'bo8', title: 'මුදු මොහොත', titleEn: 'Tender Moments', duration: '6:00', emoji: '🌸', url: 'https://www.youtube.com/results?search_query=tender+moments+lullaby+music', source: null },
    { id: 'bo9', title: 'ඔබේ අත්වල ආරක්ෂාව', titleEn: 'Safe in Your Arms', duration: '8:30', emoji: '🌺', url: 'https://www.youtube.com/results?search_query=safe+in+your+arms+baby+lullaby', source: null },
    { id: 'bo10', title: 'දිනෙන් දින වැඩෙන ආදරය', titleEn: 'Growing Love Day by Day', duration: '5:45', emoji: '🌱', url: 'https://www.youtube.com/results?search_query=growing+love+baby+soothing+music', source: null },
  ],
  // ── LACK OF SUPPORT ─────────────────────────────────────
  lack_of_support: [
    { id: 'ls1', title: 'චිත්තවේගීය සුව සංගීතය', titleEn: 'Emotional Healing Music', duration: '8:00', emoji: '💜', url: 'https://www.youtube.com/results?search_query=emotional+healing+music+postpartum', source: null },
    { id: 'ls2', title: 'අභිප්‍රේරණ ගීත', titleEn: 'Motivational Songs', duration: '5:30', emoji: '💪', url: 'https://www.youtube.com/results?search_query=motivational+uplifting+songs+for+moms', source: null },
    { id: 'ls3', title: 'ඔබ ප්‍රමාණවත්', titleEn: 'You Are Enough', duration: '6:30', emoji: '🌟', url: 'https://www.youtube.com/results?search_query=you+are+enough+affirmation+music', source: null },
    { id: 'ls4', title: 'ධෛර්යවන්ත හදවත් ගීත', titleEn: 'Brave Heart Songs', duration: '7:00', emoji: '❤️', url: 'https://www.youtube.com/results?search_query=brave+heart+uplifting+music', source: null },
    { id: 'ls5', title: 'අභ්‍යන්තර ශක්තිය', titleEn: 'Strength Within', duration: '6:15', emoji: '🦋', url: 'https://www.youtube.com/results?search_query=strength+within+meditation+music', source: null },
    { id: 'ls6', title: 'නැවත නැඟිටීම', titleEn: 'Rise Again', duration: '5:45', emoji: '🌈', url: 'https://www.youtube.com/results?search_query=rise+again+inspiration+music', source: null },
    { id: 'ls7', title: 'බලාපොරොත්තුව සහ සුවය', titleEn: 'Hope and Healing', duration: '9:00', emoji: '🕯️', url: 'https://www.youtube.com/results?search_query=hope+and+healing+music', source: null },
    { id: 'ls8', title: 'උදෑසන සවිබල ගැන්වීම', titleEn: 'Morning Empowerment', duration: '5:45', emoji: '☀️', url: 'https://www.youtube.com/results?search_query=morning+empowerment+music', source: null },
    { id: 'ls9', title: 'සුන්දර රණශූරි', titleEn: 'Beautiful Warrior', duration: '7:20', emoji: '⚔️', url: 'https://www.youtube.com/results?search_query=beautiful+warrior+uplifting+music', source: null },
    { id: 'ls10', title: 'ඔබට මෙය කළ හැකිය', titleEn: 'You Got This', duration: '4:50', emoji: '🎯', url: 'https://www.youtube.com/results?search_query=you+got+this+motherhood+music', source: null },
  ],
  // ── SLEEP PROBLEMS ──────────────────────────────────────
  sleep_problems: [
    { id: 'sl1', title: 'නිදන සංගීතය', titleEn: 'Sleep Music', duration: '6:20', emoji: '🌙', url: 'https://youtu.be/rCSCPujLs14' },
    { id: 'sl2', title: 'වැසි හඬ', titleEn: 'Rain Sounds', duration: '8:00', emoji: '🌧️', url: 'https://youtu.be/GA1D88HF0xE' },
    { id: 'sl3', title: 'රාත්‍රී සාමය', titleEn: 'Night Peace', duration: '5:45', emoji: '⭐', url: 'https://youtu.be/q76bMs-NwRk' },
    { id: 'sl4', title: 'නිදන සුදු හඬ', titleEn: 'White Sound for Sleeping', duration: '6:30', emoji: '🌫️', url: 'https://youtu.be/5dden6Vqj4A' },
    { id: 'sl5', title: 'අම්මාට නැලවිලි ගීය', titleEn: 'Lullaby for Mama', duration: '7:00', emoji: '🌸', url: 'https://youtu.be/4owTdwvbyNA' },
    { id: 'sl6', title: 'රළ හඬ', titleEn: 'Wave Sound', duration: '5:30', emoji: '🌊', url: 'https://youtu.be/KcU6w1Pr5gc' },
    { id: 'sl7', title: 'ගැඹුරු නින්ද ඇතිකරන සංගීතය', titleEn: 'Deep Sleep Music', duration: '40:00', emoji: '😴', url: 'https://youtu.be/rCSCPujLs14' },
    { id: 'sl8', title: 'සවස් සන්සුන් භාවනාව', titleEn: 'Evening Calm Meditation', duration: '25:00', emoji: '🌅', url: 'https://youtu.be/q76bMs-NwRk' },
    { id: 'sl9', title: 'සාගර රළ නින්ද සඳහා', titleEn: 'Ocean Waves for Sleep', duration: '50:00', emoji: '🌊', url: 'https://youtu.be/KcU6w1Pr5gc' },
    { id: 'sl10', title: 'නින්ද සඳහා පියානෝ සංගීතය', titleEn: 'Piano for Sleep', duration: '30:00', emoji: '🎹', url: 'https://youtu.be/4owTdwvbyNA' },
  ],
  // ── LOSS OF CONFIDENCE ──────────────────────────────────
  loss_of_confidence: [
    { id: 'lc1', title: 'අභිප්‍රේරණ ගීත', titleEn: 'Motivational Songs', duration: '5:00', emoji: '🌟', url: 'https://www.youtube.com/results?search_query=motivational+songs+for+mothers', source: null },
    { id: 'lc2', title: 'විශ්වාසය තහවුරු කිරීම්', titleEn: 'Confidence Affirmations', duration: '8:00', emoji: '💪', url: 'https://www.youtube.com/results?search_query=mother+confidence+affirmations', source: null },
    { id: 'lc3', title: 'ඔබ ප්‍රමාණවත්', titleEn: 'You Are Enough', duration: '6:30', emoji: '💜', url: 'https://www.youtube.com/results?search_query=you+are+enough+mothers+meditation', source: null },
    { id: 'lc4', title: 'නැඟිට බබළන්න අම්මා', titleEn: 'Rise and Shine Mama', duration: '5:45', emoji: '☀️', url: 'https://www.youtube.com/results?search_query=rise+and+shine+mama+uplifting+music', source: null },
    { id: 'lc5', title: 'ඔසවා තබන ගීත', titleEn: 'Uplifting Songs', duration: '7:00', emoji: '🦋', url: 'https://www.youtube.com/results?search_query=uplifting+songs+motherhood', source: null },
    { id: 'lc6', title: 'මට මෙය කළ හැකිය', titleEn: 'I Can Do This', duration: '6:15', emoji: '🎯', url: 'https://www.youtube.com/results?search_query=i+can+do+this+motivation+for+moms', source: null },
    { id: 'lc7', title: 'ධෛර්යවන්ත අම්මා ගීත', titleEn: 'Brave Mama Songs', duration: '5:30', emoji: '❤️', url: 'https://www.youtube.com/results?search_query=brave+mama+encouragement+music', source: null },
    { id: 'lc8', title: 'ශක්තිමත් වීම', titleEn: 'Growing Stronger', duration: '6:00', emoji: '🌱', url: 'https://www.youtube.com/results?search_query=growing+stronger+healing+music', source: null },
    { id: 'lc9', title: 'උදෑසන ශක්ති ගීතාවලිය', titleEn: 'Morning Power Playlist', duration: '8:30', emoji: '⚡', url: 'https://www.youtube.com/results?search_query=morning+power+playlist+moms', source: null },
    { id: 'lc10', title: 'සුන්දර රණශූරි', titleEn: 'Beautiful Warrior', duration: '7:20', emoji: '⚔️', url: 'https://www.youtube.com/results?search_query=beautiful+warrior+soothing+music', source: null },
  ],
  // ── OVERWHELMED ─────────────────────────────────────────
  overwhelmed: [
    { id: 'ow1', title: 'ස්වභාව ධ්වනි', titleEn: 'Nature Sounds', duration: '20:00', emoji: '🌾', url: 'https://www.youtube.com/results?search_query=nature+sounds+stress+relief', source: null },
    { id: 'ow2', title: 'සන්සුන් විවේක සංගීතය', titleEn: 'Calm Relaxing Music', duration: '15:00', emoji: '🌊', url: 'https://www.youtube.com/results?search_query=calm+relaxing+music+overwhelmed', source: null },
    { id: 'ow3', title: 'වනාන්තර ශබ්ද', titleEn: 'Forest Sounds', duration: '30:00', emoji: '🌲', url: 'https://www.youtube.com/results?search_query=forest+sounds+relaxation', source: null },
    { id: 'ow4', title: 'සරල බව ගීතාවලිය', titleEn: 'Simplicity Playlist', duration: '12:00', emoji: '✂️', url: 'https://www.youtube.com/results?search_query=peaceful+simplicity+music', source: null },
    { id: 'ow5', title: '432Hz සන්සුන්තාව', titleEn: '432Hz Calm', duration: '10:00', emoji: '🔮', url: 'https://www.youtube.com/results?search_query=432hz+calm+anxiety+stress+relief', source: null },
    { id: 'ow6', title: 'මන්දගාමී පියානෝ සංගීතය', titleEn: 'Slow Piano Music', duration: '8:00', emoji: '🎹', url: 'https://www.youtube.com/results?search_query=slow+piano+music+for+stress', source: null },
    { id: 'ow7', title: 'නිශ්චල ජලය', titleEn: 'Still Water', duration: '18:00', emoji: '🪷', url: 'https://www.youtube.com/results?search_query=still+water+relaxing+ambient+music', source: null },
    { id: 'ow8', title: 'වැසි සහ සුළඟ', titleEn: 'Rain and Wind', duration: '25:00', emoji: '🌧️', url: 'https://www.youtube.com/results?search_query=rain+and+wind+relaxing+sounds', source: null },
    { id: 'ow9', title: 'සිහිකල්පනා මොහොත', titleEn: 'Mindful Moments', duration: '7:45', emoji: '🧘', url: 'https://www.youtube.com/results?search_query=mindful+moments+calming+music', source: null },
    { id: 'ow10', title: 'අලුයම සාගරය', titleEn: 'Ocean at Dawn', duration: '22:00', emoji: '🌅', url: 'https://www.youtube.com/results?search_query=ocean+at+dawn+relaxing+music', source: null },
  ],
  // ── PHYSICAL DISCOMFORT ─────────────────────────────────
  physical_discomfort: [
    { id: 'pd1', title: 'මෘදු සන්සුන් සංගීතය', titleEn: 'Soft Calming Music', duration: '12:00', emoji: '🌿', url: 'https://www.youtube.com/results?search_query=soft+calming+music+pain+relief', source: null },
    { id: 'pd2', title: 'ශරීර සුව කිරීමේ සංඛ්‍යාත', titleEn: 'Body Healing Frequencies', duration: '20:00', emoji: '✨', url: 'https://www.youtube.com/results?search_query=body+healing+frequency+music', source: null },
    { id: 'pd4', title: 'විවේකී පසුබිම් සංගීතය', titleEn: 'Relaxing Background Music', duration: '30:00', emoji: '🎵', url: 'https://www.youtube.com/results?search_query=relaxing+background+music+healing', source: null },
    { id: 'pd5', title: 'සුවය ලැබීමේ ස්වර', titleEn: 'Recovery Tones', duration: '18:00', emoji: '🩺', url: 'https://www.youtube.com/results?search_query=recovery+tones+healing+music', source: null },
    { id: 'pd6', title: 'ශරීරය සනසවන', titleEn: 'Soothing the Body', duration: '11:00', emoji: '🧘', url: 'https://www.youtube.com/results?search_query=soothing+the+body+relaxing+music', source: null },
    { id: 'pd7', title: 'සුව කරන ආලෝක සංගීතය', titleEn: 'Healing Light Music', duration: '14:00', emoji: '☀️', url: 'https://www.youtube.com/results?search_query=healing+light+relaxing+music', source: null },
    { id: 'pd8', title: 'මෘදු සුවය', titleEn: 'Gentle Recovery', duration: '10:00', emoji: '🌸', url: 'https://www.youtube.com/results?search_query=gentle+recovery+calm+music', source: null },
    { id: 'pd9', title: 'අලුත්වැඩියා කර පිපෙන්න', titleEn: 'Mend and Bloom', duration: '13:00', emoji: '🌺', url: 'https://www.youtube.com/results?search_query=mend+and+bloom+peaceful+music', source: null },
    { id: 'pd10', title: 'ඔබේ ශරීරය යථා තත්ත්වයට', titleEn: 'Restore Your Body', duration: '16:00', emoji: '💆', url: 'https://www.youtube.com/results?search_query=restore+your+body+meditation+music', source: null },
  ],
  // ── NEGATIVE THOUGHTS ───────────────────────────────────
  negative_thoughts: [
    { id: 'nt1', title: 'චිත්තවේගීය සුව සංගීතය', titleEn: 'Emotional Healing Music', duration: '8:00', emoji: '💜', url: 'https://www.youtube.com/results?search_query=emotional+healing+music', source: null },
    { id: 'nt2', title: 'අඳුරේ ආලෝකය', titleEn: 'Light in the Dark', duration: '7:00', emoji: '🕯️', url: 'https://www.youtube.com/results?search_query=light+in+the+dark+calm+music', source: null },
    { id: 'nt3', title: 'බලාපොරොත්තුව සහ සුවය', titleEn: 'Hope and Healing', duration: '9:00', emoji: '🌈', url: 'https://www.youtube.com/results?search_query=hope+and+healing+soothing+music', source: null },
    { id: 'nt4', title: 'මෘදු සෙමින් ගීත', titleEn: 'Soft Slow Songs', duration: '10:00', emoji: '🌸', url: 'https://www.youtube.com/results?search_query=soft+slow+relaxing+songs', source: null },
    { id: 'nt5', title: 'උදෑසන බලාපොරොත්තු සංගීතය', titleEn: 'Morning Hope Music', duration: '6:30', emoji: '☀️', url: 'https://www.youtube.com/results?search_query=morning+hope+peaceful+music', source: null },
    { id: 'nt6', title: 'ඔබ වැදගත් ගීත', titleEn: 'You Matter Songs', duration: '7:45', emoji: '💛', url: 'https://www.youtube.com/results?search_query=you+matter+uplifting+songs', source: null },
    { id: 'nt7', title: 'ආලෝකය නැවත පැමිණේ', titleEn: 'The Light Returns', duration: '8:30', emoji: '🌟', url: 'https://www.youtube.com/results?search_query=the+light+returns+calm+music', source: null },
    { id: 'nt8', title: 'මෘදු සැනසිලි සංගීතය', titleEn: 'Gentle Comfort Music', duration: '11:00', emoji: '🌿', url: 'https://www.youtube.com/results?search_query=gentle+comfort+relaxing+music', source: null },
    { id: 'nt9', title: 'සෙමින් නැවත නැඟිටීම', titleEn: 'Rise Again Slowly', duration: '6:00', emoji: '🌱', url: 'https://www.youtube.com/results?search_query=rise+again+slowly+meditation+music', source: null },
    { id: 'nt10', title: 'ධෛර්යවන්ත කුඩා හදවත', titleEn: 'Brave Little Heart', duration: '5:30', emoji: '❤️', url: 'https://www.youtube.com/results?search_query=brave+little+heart+uplifting+music', source: null },
  ],
};

export const VIDEO_LIBRARY = {
  // ── LONELINESS ──────────────────────────────────────────
  loneliness: [
    { id: 'vlo1', title: 'ඔබ කිසිදා තනිවම නැත', titleEn: 'You Are Never Truly Alone', duration: '8 min', emoji: '🌸', url: 'https://www.youtube.com/results?search_query=you+are+never+alone+postpartum+support', source: null },
    { id: 'vlo2', title: 'අම්මාට අභිප්‍රේරණ වීඩියෝ', titleEn: 'Motivational Videos for Mothers', duration: '12 min', emoji: '💪', url: 'https://www.youtube.com/results?search_query=motivational+video+for+new+mothers', source: null },
    { id: 'vlo3', title: 'අම්මාගේ ප්‍රජාව', titleEn: 'Community of Mothers', duration: '6 min', emoji: '💜', url: 'https://www.youtube.com/results?search_query=community+of+mothers+support', source: null },
    { id: 'vlo4', title: 'ඔබ වැනි අම්මලාගේ කතා', titleEn: 'Stories from Mamas Like You', duration: '15 min', emoji: '👩‍👧', url: 'https://www.youtube.com/results?search_query=real+motherhood+stories+postpartum', source: null },
    { id: 'vlo5', title: 'ඔබේ ගම සොයා ගැනීම', titleEn: 'Finding Your Village', duration: '10 min', emoji: '🏡', url: 'https://www.youtube.com/results?search_query=finding+your+village+motherhood', source: null },
    { id: 'vlo6', title: 'සැබෑ අම්මලා අවංකව කතා කරයි', titleEn: 'Real Mamas Talk Honestly', duration: '14 min', emoji: '💬', url: 'https://www.youtube.com/results?search_query=real+moms+talk+postpartum+honestly', source: null },
    { id: 'vlo7', title: 'ඔබට තනිවම කිරීමට අවශ්‍ය නැත', titleEn: 'You Don\'t Have to Do It Alone', duration: '7 min', emoji: '🤝', url: 'https://www.youtube.com/results?search_query=you+dont+have+to+do+motherhood+alone', source: null },
    { id: 'vlo8', title: 'අලුත් අම්මලාට ලිපි', titleEn: 'Letters to New Mamas', duration: '9 min', emoji: '✉️', url: 'https://www.youtube.com/results?search_query=letter+to+new+mom+postpartum', source: null },
    { id: 'vlo9', title: 'ආදරයේ නොපෙනෙන වැඩ', titleEn: 'The Invisible Labour of Love', duration: '11 min', emoji: '💛', url: 'https://www.youtube.com/results?search_query=invisible+labor+of+motherhood', source: null },
    { id: 'vlo10', title: 'ප්‍රසව සහාය කවය', titleEn: 'Postpartum Support Circle', duration: '20 min', emoji: '⭕', url: 'https://www.youtube.com/results?search_query=postpartum+support+group+talk', source: null },
  ],
  // ── FATIGUE ─────────────────────────────────────────────
  fatigue: [
    { id: 'vfa1', title: 'විවේක මගපෙන්වීම් වීඩියෝ', titleEn: 'Rest Guidance Video', duration: '6 min', emoji: '🌙', url: 'https://www.youtube.com/results?search_query=rest+guidance+video+for+new+moms', source: null },
    { id: 'vfa2', title: 'විවේකය පූජනීය වන්නේ ඇයි', titleEn: 'Why Rest Is Sacred', duration: '8 min', emoji: '😴', url: 'https://www.youtube.com/results?search_query=why+rest+is+sacred+postpartum', source: null },
    { id: 'vfa3', title: 'ක්ෂුද්ර විවේක ශිල්පීය ක්‍රම', titleEn: 'Micro-Rest Techniques', duration: '5 min', emoji: '⏱️', url: 'https://www.youtube.com/results?search_query=micro+rest+techniques+for+busy+moms', source: null },
    { id: 'vfa4', title: 'කෙටි නැවත ආරෝපණ දිනචරියාව', titleEn: 'Short Recharge Routine', duration: '4 min', emoji: '⚡', url: 'https://www.youtube.com/results?search_query=quick+recharge+routine+for+moms', source: null },
    { id: 'vfa5', title: 'අලුත් අම්මලාට නිදන උපදෙස්', titleEn: 'Sleep Tips for New Mamas', duration: '10 min', emoji: '🛌', url: 'https://www.youtube.com/results?search_query=sleep+tips+for+new+mothers', source: null },
    { id: 'vfa6', title: 'ශක්ති ප්‍රතිසාධන මගපෙන්වීම', titleEn: 'Energy Recovery Guide', duration: '7 min', emoji: '💚', url: 'https://www.youtube.com/results?search_query=energy+recovery+guide+postpartum', source: null },
    { id: 'vfa7', title: 'අලුත් අම්මලාට පෝෂණය', titleEn: 'Nutrition for New Mamas', duration: '9 min', emoji: '🥗', url: 'https://www.youtube.com/results?search_query=postpartum+nutrition+for+energy', source: null },
    { id: 'vfa8', title: 'ඔබේ ශරීරය පුදුම සහගත දෙයක් කළා', titleEn: 'Your Body Did Something Amazing', duration: '11 min', emoji: '✨', url: 'https://www.youtube.com/results?search_query=your+body+did+something+amazing+postpartum', source: null },
    { id: 'vfa9', title: 'මෘදු ප්‍රතිසාධන චලන', titleEn: 'Gentle Recovery Moves', duration: '12 min', emoji: '🤸', url: 'https://www.youtube.com/results?search_query=gentle+postpartum+recovery+movements', source: null },
    { id: 'vfa10', title: 'සුවය රේඛීය නොවේ', titleEn: 'Healing Is Not Linear', duration: '7 min', emoji: '📈', url: 'https://www.youtube.com/results?search_query=postpartum+healing+is+not+linear', source: null },
  ],
  // ── ANXIETY ─────────────────────────────────────────────
  anxiety: [
    { id: 'van1', title: 'කාංසාව සන්සිඳවන වීඩියෝ', titleEn: 'Anxiety Calming Video', duration: '8 min', emoji: '🌿', url: 'https://www.youtube.com/results?search_query=postpartum+anxiety+calming+video', source: null },
    { id: 'van2', title: 'මග පෙන්වන භාවනා වීඩියෝ', titleEn: 'Guided Meditation Video', duration: '10 min', emoji: '🧘', url: 'https://www.youtube.com/results?search_query=guided+meditation+for+postpartum+anxiety', source: null },
    { id: 'van3', title: 'ඔබේ දුවන සිත සන්සුන් කරන්න', titleEn: 'Calm Your Racing Mind', duration: '9 min', emoji: '🧠', url: 'https://www.youtube.com/results?search_query=calm+your+racing+mind+overthinking', source: null },
    { id: 'van4', title: 'එක හුස්මක්', titleEn: 'One Breath at a Time', duration: '5 min', emoji: '🌬️', url: 'https://www.youtube.com/results?search_query=one+breath+at+a+time+meditation', source: null },
    { id: 'van5', title: 'ප්‍රසව කාංසාව පැහැදිලි කිරීම', titleEn: 'Postpartum Anxiety Explained', duration: '15 min', emoji: '📖', url: 'https://www.youtube.com/results?search_query=postpartum+anxiety+explained+tips', source: null },
    { id: 'van6', title: 'බිම ස්ථාවර කිරීමේ ශිල්පීය ක්‍රම', titleEn: 'Grounding Techniques', duration: '8 min', emoji: '🌱', url: 'https://www.youtube.com/results?search_query=grounding+techniques+for+anxiety', source: null },
    { id: 'van7', title: 'මේ මොහොතේ ආරක්ෂිතයි', titleEn: 'Safe in This Moment', duration: '7 min', emoji: '🛡️', url: 'https://www.youtube.com/results?search_query=you+are+safe+in+this+moment+meditation', source: null },
    { id: 'van8', title: 'ඔබේ සිතුවිලි කරුණු නොවේ', titleEn: 'Your Thoughts Are Not Facts', duration: '9 min', emoji: '💡', url: 'https://www.youtube.com/results?search_query=your+thoughts+are+not+facts+anxiety', source: null },
    { id: 'van9', title: 'බලාපොරොත්තු කතා', titleEn: 'Hopeful Stories', duration: '14 min', emoji: '🌟', url: 'https://www.youtube.com/results?search_query=postpartum+anxiety+recovery+stories', source: null },
    { id: 'van10', title: 'මග පෙන්වන හුස්ම ගැනීමේ උපදෙස්', titleEn: 'Guided Breathing Tutorial', duration: '6 min', emoji: '🌬️', url: 'https://www.youtube.com/results?search_query=guided+breathing+tutorial+calm', source: null },
  ],
  // ── BONDING ISSUES ──────────────────────────────────────
  bonding_issues: [
    { id: 'vbo1', title: 'Attachment and bonding - Your Baby and You', titleEn: 'Attachment and bonding - Your Baby and You', duration: '12 min', emoji: '👶', url: 'https://www.youtube.com/watch?v=kQiT2tO3KeE', source: null },
    { id: 'vbo2', title: 'Mother-Baby Bonding & Emotional Connection Guide', titleEn: 'Mother-Baby Bonding & Emotional Connection Guide', duration: '8 min', emoji: '⏱️', url: 'https://www.youtube.com/watch?v=4VuEIeDrwAM', source: null },
    { id: 'vbo3', title: 'දෙමාපිය චිත්තවේගීය සහාය (Parenting Emotional Support)', titleEn: 'Parenting Emotional Support', duration: '15 min', emoji: '💜', url: 'https://www.youtube.com/watch?v=bnlKVPj4zeQ', source: null },
    { id: 'vbo4', title: 'සමට-සම ප්‍රතිලාභ සහ බැඳීම (Skin-to-Skin Bonding & Support)', titleEn: 'Skin-to-Skin Bonding & Support', duration: '6 min', emoji: '🤱', url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04', source: null },
    { id: 'vbo5', title: 'නව මව්වරුන්ට චිත්තවේගීය සහාය (Emotional Support for New Mothers)', titleEn: 'Emotional Support for New Mothers', duration: '10 min', emoji: '🔬', url: 'https://www.youtube.com/watch?v=AJpErm8H2aU', source: null },
    { id: 'vbo6', title: 'අඬන බබා සමඟ බැඳීම ශක්තිමත් කිරීම (Soothing and Bonding with Baby)', titleEn: 'Soothing and Bonding with Baby', duration: '14 min', emoji: '🌸', url: 'https://www.youtube.com/watch?v=kmbKaSRyZ-c', source: null },
    { id: 'vbo7', title: 'ළදරු ආදරය සහ සන්සුන් කිරීම (Baby Love and Comfort)', titleEn: 'Baby Love and Comfort', duration: '8 min', emoji: '👁️', url: 'https://www.youtube.com/watch?v=n1NGKj2B2eU', source: null },
    { id: 'vbo8', title: 'ළදරු කතා සහ සම්බන්ධතාව (Baby Interaction and Cognitive Bonding)', titleEn: 'Baby Interaction and Cognitive Bonding', duration: '7 min', emoji: '🗣️', url: 'https://www.youtube.com/watch?v=6rx_-__NsjU', source: null },
    { id: 'vbo9', title: 'සෑම පෝෂණයක්ම බැඳීමකි (Breastfeeding & Bonding)', titleEn: 'Breastfeeding & Bonding', duration: '5 min', emoji: '🍼', url: 'https://www.youtube.com/watch?v=qdXehiELnIA', source: null },
    { id: 'vbo10', title: 'දිනෙන් දින වැඩෙන ආදරය (Growing Love and Rest)', titleEn: 'Growing Love and Rest', duration: '11 min', emoji: '🌱', url: 'https://www.youtube.com/watch?v=j2C8MkY7Co8', source: null },
  ],
  // ── LACK OF SUPPORT ─────────────────────────────────────
  lack_of_support: [
    { id: 'vls1', title: 'දිරිගන්වන වීඩියෝ', titleEn: 'Encouragement Videos', duration: '8 min', emoji: '💜', url: 'https://www.youtube.com/results?search_query=encouragement+videos+for+new+mothers', source: null },
    { id: 'vls2', title: 'ඔබ ශක්තිමත් පණිවිඩ', titleEn: 'You Are Strong Messages', duration: '5 min', emoji: '💪', url: 'https://www.youtube.com/results?search_query=you+are+a+strong+mother+video', source: null },
    { id: 'vls3', title: 'අලුත් අම්මාවියේදී සහාය සොයා ගැනීම', titleEn: 'Finding Support as a New Mama', duration: '10 min', emoji: '🏡', url: 'https://www.youtube.com/results?search_query=finding+support+as+a+new+mother', source: null },
    { id: 'vls4', title: 'උපකාර ඉල්ලීම ධෛර්යයකි', titleEn: 'Asking For Help Is Brave', duration: '5 min', emoji: '🦁', url: 'https://www.youtube.com/results?search_query=asking+for+help+as+a+mom', source: null },
    { id: 'vls5', title: 'තනිකම ගැන සැබෑ අම්මලා', titleEn: 'Real Mamas on Loneliness', duration: '12 min', emoji: '💬', url: 'https://www.youtube.com/results?search_query=mothers+talk+about+loneliness', source: null },
    { id: 'vls6', title: 'ඔබට තනිවම සිටීමට අවශ්‍ය නැත', titleEn: 'You Don\'t Have to Alone', duration: '7 min', emoji: '🤝', url: 'https://www.youtube.com/results?search_query=you+are+not+alone+in+motherhood', source: null },
    { id: 'vls7', title: 'ප්‍රසව සහාය කවය', titleEn: 'Postpartum Support Circle', duration: '20 min', emoji: '⭕', url: 'https://www.youtube.com/results?search_query=postpartum+support+circle+video', source: null },
    { id: 'vls8', title: 'අපට සුදුසු ගම', titleEn: 'The Village We Deserve', duration: '9 min', emoji: '🌏', url: 'https://www.youtube.com/results?search_query=motherhood+village+community', source: null },
    { id: 'vls9', title: 'අලුත් අම්මලාට ලිපි', titleEn: 'Letters to New Mamas', duration: '9 min', emoji: '✉️', url: 'https://www.youtube.com/results?search_query=encouragement+letters+for+new+mothers', source: null },
    { id: 'vls10', title: 'ඔබ බොහෝ වැදගත්', titleEn: 'You Matter So Much', duration: '6 min', emoji: '💛', url: 'https://www.youtube.com/results?search_query=you+matter+motherhood+motivation', source: null },
  ],
  // ── SLEEP PROBLEMS ──────────────────────────────────────
  sleep_problems: [
    { id: 'vsl1', title: 'පශ්චාත් ප්‍රසව අවධිය ගැන', titleEn: 'About Postpartum', duration: '10 min', emoji: '🌙', url: 'https://youtu.be/hrozJ-EbdGI' },
    { id: 'vsl2', title: 'අලුත් අම්මාට නිදන උපදෙස්', titleEn: 'Sleeping Tips for New Moms', duration: '9 min', emoji: '😴', url: 'https://youtu.be/92Oc8-lnx4k' },
    { id: 'vsl3', title: 'පශ්චාත් ප්‍රසව අවධිය ගැන 2', titleEn: 'About Postpartum Part 2', duration: '8 min', emoji: '🛌', url: 'https://youtu.be/1n46HPsYsHM' },
    { id: 'vsl4', title: 'සන්සුන් නින්දට පෙර කතා', titleEn: 'Calm Bedtime Stories', duration: '12 min', emoji: '📖', url: 'https://youtu.be/Y2IZNS39kM8' },
    { id: 'vsl5', title: 'නින්ද සඳහා භාවනා මගපෙන්වීම', titleEn: 'Sleep Meditation Guide', duration: '15 min', emoji: '🧘', url: 'https://www.youtube.com/results?search_query=sleep+meditation+guide+for+moms', source: null },
    { id: 'vsl6', title: 'රාත්‍රී ලිහිල් කිරීමේ මගපෙන්වීම', titleEn: 'Night Relaxation Guide', duration: '12 min', emoji: '🌟', url: 'https://www.youtube.com/results?search_query=night+relaxation+guide+sleep', source: null },
    { id: 'vsl7', title: 'නින්ද නොලැබීම සඳහා විසඳුම්', titleEn: 'Sleep Deprivation Solutions', duration: '9 min', emoji: '💡', url: 'https://www.youtube.com/results?search_query=postpartum+sleep+deprivation+solutions', source: null },
    { id: 'vsl8', title: 'නින්දට පෙර ශරීරය ලිහිල් කිරීම', titleEn: 'Body Relaxation Before Sleep', duration: '8 min', emoji: '🧘', url: 'https://www.youtube.com/results?search_query=body+relaxation+before+sleep+video', source: null },
    { id: 'vsl9', title: 'විවේකය තුළින් සුවය', titleEn: 'Healing Through Rest', duration: '7 min', emoji: '💜', url: 'https://www.youtube.com/results?search_query=healing+through+rest+postpartum', source: null },
    { id: 'vsl10', title: 'නින්ද යනු ස්වයං රැකවරණයකි', titleEn: 'Sleep Is Self-Care', duration: '6 min', emoji: '🌸', url: 'https://www.youtube.com/results?search_query=sleep+is+self+care+for+mothers', source: null },
  ],
  // ── LOSS OF CONFIDENCE ──────────────────────────────────
  loss_of_confidence: [
    { id: 'vlc1', title: 'විශ්වාසය ගොඩනැගීමේ වීඩියෝ', titleEn: 'Confidence Building Video', duration: '8 min', emoji: '💪', url: 'https://www.youtube.com/results?search_query=motherhood+confidence+building+video', source: null },
    { id: 'vlc2', title: 'ඔබ සැමවිටම ප්‍රමාණවත්', titleEn: 'You Are Enough Always', duration: '10 min', emoji: '💜', url: 'https://www.youtube.com/results?search_query=you+are+enough+motherhood+talk', source: null },
    { id: 'vlc3', title: 'හොඳ මව්වරු පෙනෙන්නේ කෙසේද', titleEn: 'What Good Mothers Look Like', duration: '9 min', emoji: '🌟', url: 'https://www.youtube.com/results?search_query=what+good+mothers+look+like', source: null },
    { id: 'vlc4', title: 'අසම්පූර්ණ සහ පරිපූර්ණ', titleEn: 'Imperfect and Perfect', duration: '6 min', emoji: '🧩', url: 'https://www.youtube.com/results?search_query=imperfectly+perfect+motherhood', source: null },
    { id: 'vlc5', title: 'ඔබ අසමත් වන්නේ නැත', titleEn: 'You\'re Not Failing', duration: '7 min', emoji: '🛡️', url: 'https://www.youtube.com/results?search_query=you+are+not+failing+as+a+mother', source: null },
    { id: 'vlc6', title: 'කුඩා ජයග්‍රහණ සමරන්න', titleEn: 'Celebrate Small Wins', duration: '5 min', emoji: '🎉', url: 'https://www.youtube.com/results?search_query=celebrate+small+wins+motherhood', source: null },
    { id: 'vlc7', title: 'සැසඳීමේ උගුල', titleEn: 'The Comparison Trap', duration: '11 min', emoji: '🪤', url: 'https://www.youtube.com/results?search_query=stop+comparing+yourself+to+other+moms', source: null },
    { id: 'vlc8', title: 'ඔබ ළදරුවාගේ ප්‍රවීණයා', titleEn: 'You Are the Expert on Baby', duration: '14 min', emoji: '👑', url: 'https://www.youtube.com/results?search_query=you+are+the+expert+on+your+baby', source: null },
    { id: 'vlc9', title: 'විවේක ගැනීමට අවසර', titleEn: 'Permission to Rest', duration: '8 min', emoji: '🛌', url: 'https://www.youtube.com/results?search_query=permission+to+rest+for+mothers', source: null },
    { id: 'vlc10', title: 'ඔබ ගැන විශ්වාස කරන්න අම්මා', titleEn: 'Believe in Yourself Mama', duration: '7 min', emoji: '🌸', url: 'https://www.youtube.com/results?search_query=believe+in+yourself+mama+video', source: null },
  ],
  // ── OVERWHELMED ─────────────────────────────────────────
  overwhelmed: [
    { id: 'vow1', title: 'ආතති සහන වීඩියෝ', titleEn: 'Stress Relief Videos', duration: '8 min', emoji: '🌊', url: 'https://www.youtube.com/results?search_query=stress+relief+videos+for+moms', source: null },
    { id: 'vow2', title: 'සියල්ල ඕනෑවට වඩා වැඩි වූ විට', titleEn: 'When Everything Is Too Much', duration: '12 min', emoji: '💜', url: 'https://www.youtube.com/results?search_query=when+motherhood+is+too+much+overwhelmed', source: null },
    { id: 'vow3', title: 'එක හුස්මක් හරහා', titleEn: 'One Breath at a Time', duration: '5 min', emoji: '🌬️', url: 'https://www.youtube.com/results?search_query=one+breath+at+a+time+stress+relief', source: null },
    { id: 'vow4', title: 'මග පෙන්වන හුස්ම වීඩියෝ', titleEn: 'Guided Breathing Videos', duration: '6 min', emoji: '🧘', url: 'https://www.youtube.com/results?search_query=guided+breathing+exercise+for+overwhelm', source: null },
    { id: 'vow5', title: 'මාතෘත්වය සරල කිරීම', titleEn: 'Simplifying Motherhood', duration: '9 min', emoji: '✂️', url: 'https://www.youtube.com/results?search_query=simplifying+motherhood+routine', source: null },
    { id: 'vow6', title: 'විවේක ගැනීමට අවසර', titleEn: 'Permission to Rest', duration: '8 min', emoji: '🛌', url: 'https://www.youtube.com/results?search_query=permission+to+rest+for+overwhelmed+moms', source: null },
    { id: 'vow7', title: 'අඩුවෙන් කිරීමේ කලාව', titleEn: 'The Art of Doing Less', duration: '7 min', emoji: '🎨', url: 'https://www.youtube.com/results?search_query=the+art+of+doing+less+motherhood', source: null },
    { id: 'vow8', title: 'අම්මා ඔබ ප්‍රමාණවත්', titleEn: 'Mama You Are Enough', duration: '6 min', emoji: '🌸', url: 'https://www.youtube.com/results?search_query=mama+you+are+doing+enough', source: null },
    { id: 'vow9', title: 'කාර්යබහුල අම්මලා සඳහා සිහිකල්පනාව', titleEn: 'Mindfulness for Busy Mamas', duration: '10 min', emoji: '🌿', url: 'https://www.youtube.com/results?search_query=mindfulness+for+busy+mothers', source: null },
    { id: 'vow10', title: 'මෘදුව සීමා නියම කිරීම', titleEn: 'Setting Boundaries Gently', duration: '8 min', emoji: '🛡️', url: 'https://www.youtube.com/results?search_query=setting+boundaries+as+a+mother', source: null },
  ],
  // ── PHYSICAL DISCOMFORT ─────────────────────────────────
  physical_discomfort: [
    { id: 'vpd1', title: 'ආරක්ෂිත ව්‍යායාම වීඩියෝ', titleEn: 'Safe Exercise Video', duration: '12 min', emoji: '🤸', url: 'https://www.youtube.com/results?search_query=safe+postpartum+exercises', source: null },
    { id: 'vpd2', title: 'සැහැල්ලු ව්‍යායාම වීඩියෝ', titleEn: 'Light Exercise Videos', duration: '8 min', emoji: '🌸', url: 'https://www.youtube.com/results?search_query=light+postpartum+workout+routine', source: null },
    { id: 'vpd3', title: 'ශරීර ලිහිල් කිරීමේ මගපෙන්වීම', titleEn: 'Body Relaxation Guidance', duration: '10 min', emoji: '🧘', url: 'https://www.youtube.com/results?search_query=postpartum+body+relaxation+meditation', source: null },
    { id: 'vpd4', title: 'ප්‍රසව ශරීරයට කරුණාවන්ත වන්න', titleEn: 'Postpartum Body Be Kind', duration: '8 min', emoji: '💜', url: 'https://www.youtube.com/results?search_query=being+kind+to+your+postpartum+body', source: null },
    { id: 'vpd5', title: 'සී-අංශයෙන් සුවය ලැබීමේ මගපෙන්වීම', titleEn: 'C-Section Recovery Guide', duration: '15 min', emoji: '🏥', url: 'https://www.youtube.com/results?search_query=c+section+recovery+tips+guide', source: null },
    { id: 'vpd6', title: 'සුවය රේඛීය නොවේ', titleEn: 'Healing Is Not Linear', duration: '7 min', emoji: '📈', url: 'https://www.youtube.com/results?search_query=physical+postpartum+recovery+journey', source: null },
    { id: 'vpd7', title: 'මෘදු ප්‍රසව දිගු කිරීම්', titleEn: 'Gentle Postpartum Stretches', duration: '10 min', emoji: '🌺', url: 'https://www.youtube.com/results?search_query=gentle+postpartum+stretches+for+back+pain', source: null },
    { id: 'vpd8', title: 'ඔබේ ශරීරය පුදුම සහගත දෙයක් කළා', titleEn: 'Your Body Did Something Amazing', duration: '6 min', emoji: '✨', url: 'https://www.youtube.com/results?search_query=appreciation+for+postpartum+body', source: null },
    { id: 'vpd9', title: 'ප්‍රකෘතිය සඳහා පෝෂණය', titleEn: 'Nutrition for Recovery', duration: '9 min', emoji: '🥗', url: 'https://www.youtube.com/results?search_query=postpartum+recovery+foods+nutrition', source: null },
    { id: 'vpd10', title: 'විවේකය දුර්වලකමක් නොවේ', titleEn: 'Rest Is Not Weakness', duration: '5 min', emoji: '🌙', url: 'https://www.youtube.com/results?search_query=physical+rest+postpartum+recovery', source: null },
  ],
  // ── NEGATIVE THOUGHTS ───────────────────────────────────
  negative_thoughts: [
    { id: 'vnt1', title: 'ධනාත්මක සිතුවිලි වීඩියෝ', titleEn: 'Positive Mindset Videos', duration: '8 min', emoji: '🌟', url: 'https://www.youtube.com/results?search_query=positive+mindset+videos+for+mothers', source: null },
    { id: 'vnt2', title: 'චිත්තවේගීය සහාය කතා', titleEn: 'Emotional Support Talks', duration: '12 min', emoji: '💜', url: 'https://www.youtube.com/results?search_query=emotional+support+talks+postpartum', source: null },
    { id: 'vnt3', title: 'අඳුරු සිතුවිලි යන්නේ නැත', titleEn: 'Dark Thoughts Not Broken', duration: '10 min', emoji: '🌑', url: 'https://www.youtube.com/results?search_query=handling+intrusive+thoughts+postpartum', source: null },
    { id: 'vnt4', title: 'ඔබ බොහෝ වැදගත්', titleEn: 'You Matter So Much', duration: '6 min', emoji: '💛', url: 'https://www.youtube.com/results?search_query=you+matter+so+much+motherhood', source: null },
    { id: 'vnt5', title: 'ආලෝකය නැවත පැමිණේ', titleEn: 'The Light Returns', duration: '11 min', emoji: '🕯️', url: 'https://www.youtube.com/results?search_query=recovering+from+postpartum+depression', source: null },
    { id: 'vnt6', title: 'බලාපොරොත්තු කතා', titleEn: 'Hopeful Stories', duration: '14 min', emoji: '🌈', url: 'https://www.youtube.com/results?search_query=hopeful+postpartum+recovery+stories', source: null },
    { id: 'vnt7', title: 'ඔබේ සිතුවිලි කරුණු නොවේ', titleEn: 'Your Thoughts Are Not Facts', duration: '9 min', emoji: '💡', url: 'https://www.youtube.com/results?search_query=your+thoughts+are+not+facts+meditation', source: null },
    { id: 'vnt8', title: 'අඳුරු මොහොත ගෙවී යයි', titleEn: 'Dark Moments Pass', duration: '8 min', emoji: '🌊', url: 'https://www.youtube.com/results?search_query=this+too+shall+pass+motherhood', source: null },
    { id: 'vnt9', title: 'දිවි ගලවා ගත් අය කතා බෙදා ගනිති', titleEn: 'Survivors Share Stories', duration: '15 min', emoji: '🌱', url: 'https://www.youtube.com/results?search_query=postpartum+depression+survivors+share+stories', source: null },
    { id: 'vnt10', title: 'මේ මොහොතේ ආරක්ෂිතයි', titleEn: 'Safe in This Moment', duration: '7 min', emoji: '🛡️', url: 'https://www.youtube.com/results?search_query=you+are+safe+in+this+moment+relaxation', source: null },
  ],
  // ── LOSS OF CONFIDENCE ──────────────────────────────────
  loss_of_confidence: [
    { id: 'vlc1', title: 'විශ්වාසය ගොඩනැගීමේ වීඩියෝ', titleEn: 'Confidence Building Video', duration: '8 min', emoji: '💪', source: null },
    { id: 'vlc2', title: 'ඔබ සැමවිටම ප්‍රමාණවත්', titleEn: 'You Are Enough Always', duration: '10 min', emoji: '💜', source: null },
    { id: 'vlc3', title: 'හොඳ මව්වරු පෙනෙන්නේ කෙසේද', titleEn: 'What Good Mothers Look Like', duration: '9 min', emoji: '🌟', source: null },
    { id: 'vlc4', title: 'අසම්පූර්ණ සහ පරිපූර්ණ', titleEn: 'Imperfect and Perfect', duration: '6 min', emoji: '🧩', source: null },
    { id: 'vlc5', title: 'ඔබ අසමත් වන්නේ නැත', titleEn: 'You\'re Not Failing', duration: '7 min', emoji: '🛡️', source: null },
    { id: 'vlc6', title: 'කුඩා ජයග්‍රහණ සමරන්න', titleEn: 'Celebrate Small Wins', duration: '5 min', emoji: '🎉', source: null },
    { id: 'vlc7', title: 'සැසඳීමේ උගුල', titleEn: 'The Comparison Trap', duration: '11 min', emoji: '🪤', source: null },
    { id: 'vlc8', title: 'ඔබ ළදරුවාගේ ප්‍රවීණයා', titleEn: 'You Are the Expert on Baby', duration: '14 min', emoji: '👑', source: null },
    { id: 'vlc9', title: 'විවේක ගැනීමට අවසර', titleEn: 'Permission to Rest', duration: '8 min', emoji: '🛌', source: null },
    { id: 'vlc10', title: 'ඔබ ගැන විශ්වාස කරන්න අම්මා', titleEn: 'Believe in Yourself Mama', duration: '7 min', emoji: '🌸', source: null },
  ],
  // ── OVERWHELMED ─────────────────────────────────────────
  overwhelmed: [
    { id: 'vow1', title: 'ආතති සහන වීඩියෝ', titleEn: 'Stress Relief Videos', duration: '8 min', emoji: '🌊', source: null },
    { id: 'vow2', title: 'සියල්ල ඕනෑවට වඩා වැඩි වූ විට', titleEn: 'When Everything Is Too Much', duration: '12 min', emoji: '💜', source: null },
    { id: 'vow3', title: 'එක හුස්මක් හරහා', titleEn: 'One Breath at a Time', duration: '5 min', emoji: '🌬️', source: null },
    { id: 'vow4', title: 'මග පෙන්වන හුස්ම වීඩියෝ', titleEn: 'Guided Breathing Videos', duration: '6 min', emoji: '🧘', source: null },
    { id: 'vow5', title: 'මාතෘත්වය සරල කිරීම', titleEn: 'Simplifying Motherhood', duration: '9 min', emoji: '✂️', source: null },
    { id: 'vow6', title: 'විවේක ගැනීමට අවසර', titleEn: 'Permission to Rest', duration: '8 min', emoji: '🛌', source: null },
    { id: 'vow7', title: 'අඩුවෙන් කිරීමේ කලාව', titleEn: 'The Art of Doing Less', duration: '7 min', emoji: '🎨', source: null },
    { id: 'vow8', title: 'අම්මා ඔබ ප්‍රමාණවත්', titleEn: 'Mama You Are Enough', duration: '6 min', emoji: '🌸', source: null },
    { id: 'vow9', title: 'කාර්යබහුල අම්මලා සඳහා සිහිකල්පනාව', titleEn: 'Mindfulness for Busy Mamas', duration: '10 min', emoji: '🌿', source: null },
    { id: 'vow10', title: 'මෘදුව සීමා නියම කිරීම', titleEn: 'Setting Boundaries Gently', duration: '8 min', emoji: '🛡️', source: null },
  ],
  // ── PHYSICAL DISCOMFORT ─────────────────────────────────
  physical_discomfort: [
    { id: 'vpd1', title: 'ආරක්ෂිත ව්‍යායාම වීඩියෝ', titleEn: 'Safe Exercise Video', duration: '12 min', emoji: '🤸', source: null },
    { id: 'vpd2', title: 'සැහැල්ලු ව්‍යායාම වීඩියෝ', titleEn: 'Light Exercise Videos', duration: '8 min', emoji: '🌸', source: null },
    { id: 'vpd3', title: 'ශරීර ලිහිල් කිරීමේ මගපෙන්වීම', titleEn: 'Body Relaxation Guidance', duration: '10 min', emoji: '🧘', source: null },
    { id: 'vpd4', title: 'ප්‍රසව ශරීරයට කරුණාවන්ත වන්න', titleEn: 'Postpartum Body Be Kind', duration: '8 min', emoji: '💜', source: null },
    { id: 'vpd5', title: 'සී-අංශයෙන් සුවය ලැබීමේ මගපෙන්වීම', titleEn: 'C-Section Recovery Guide', duration: '15 min', emoji: '🏥', source: null },
    { id: 'vpd6', title: 'සුවය රේඛීය නොවේ', titleEn: 'Healing Is Not Linear', duration: '7 min', emoji: '📈', source: null },
    { id: 'vpd7', title: 'මෘදු ප්‍රසව දිගු කිරීම්', titleEn: 'Gentle Postpartum Stretches', duration: '10 min', emoji: '🌺', source: null },
    { id: 'vpd8', title: 'ඔබේ ශරීරය පුදුම සහගත දෙයක් කළා', titleEn: 'Your Body Did Something Amazing', duration: '6 min', emoji: '✨', source: null },
    { id: 'vpd9', title: 'ප්‍රකෘතිය සඳහා පෝෂණය', titleEn: 'Nutrition for Recovery', duration: '9 min', emoji: '🥗', source: null },
    { id: 'vpd10', title: 'විවේකය දුර්වලකමක් නොවේ', titleEn: 'Rest Is Not Weakness', duration: '5 min', emoji: '🌙', source: null },
  ],
  // ── NEGATIVE THOUGHTS ───────────────────────────────────
  negative_thoughts: [
    { id: 'vnt1', title: 'ධනාත්මක සිතුවිලි වීඩියෝ', titleEn: 'Positive Mindset Videos', duration: '8 min', emoji: '🌟', source: null },
    { id: 'vnt2', title: 'චිත්තවේගීය සහාය කතා', titleEn: 'Emotional Support Talks', duration: '12 min', emoji: '💜', source: null },
    { id: 'vnt3', title: 'අඳුරු සිතුවිලි යන්නේ නැත', titleEn: 'Dark Thoughts Not Broken', duration: '10 min', emoji: '🌑', source: null },
    { id: 'vnt4', title: 'ඔබ බොහෝ වැදගත්', titleEn: 'You Matter So Much', duration: '6 min', emoji: '💛', source: null },
    { id: 'vnt5', title: 'ආලෝකය නැවත පැමිණේ', titleEn: 'The Light Returns', duration: '11 min', emoji: '🕯️', source: null },
    { id: 'vnt6', title: 'බලාපොරොත්තු කතා', titleEn: 'Hopeful Stories', duration: '14 min', emoji: '🌈', source: null },
    { id: 'vnt7', title: 'ඔබේ සිතුවිලි කරුණු නොවේ', titleEn: 'Your Thoughts Are Not Facts', duration: '9 min', emoji: '💡', source: null },
    { id: 'vnt8', title: 'අඳුරු මොහොත ගෙවී යයි', titleEn: 'Dark Moments Pass', duration: '8 min', emoji: '🌊', source: null },
    { id: 'vnt9', title: 'දිවි ගලවා ගත් අය කතා බෙදා ගනිති', titleEn: 'Survivors Share Stories', duration: '15 min', emoji: '🌱', source: null },
    { id: 'vnt10', title: 'මේ මොහොතේ ආරක්ෂිතයි', titleEn: 'Safe in This Moment', duration: '7 min', emoji: '🛡️', source: null },
  ],
};

// ── BABY INTENT ALIASES FOR MUSIC & VIDEO LIBRARIES ─────────
MUSIC_LIBRARY.baby_crying = MUSIC_LIBRARY.bonding_issues;
MUSIC_LIBRARY.baby_needs = MUSIC_LIBRARY.bonding_issues;
MUSIC_LIBRARY.baby_feeding = MUSIC_LIBRARY.bonding_issues;
MUSIC_LIBRARY.caring_for_baby = MUSIC_LIBRARY.bonding_issues;
MUSIC_LIBRARY.baby_sleep = MUSIC_LIBRARY.bonding_issues;
MUSIC_LIBRARY.mother_sleep = MUSIC_LIBRARY.sleep_problems;
MUSIC_LIBRARY.mother_sleep_problems = MUSIC_LIBRARY.sleep_problems;
MUSIC_LIBRARY.sleep_problems = MUSIC_LIBRARY.sleep_problems;
MUSIC_LIBRARY.sleep = MUSIC_LIBRARY.sleep_problems;
MUSIC_LIBRARY.baby_health = MUSIC_LIBRARY.anxiety;

VIDEO_LIBRARY.baby_crying = VIDEO_LIBRARY.bonding_issues;
VIDEO_LIBRARY.baby_needs = VIDEO_LIBRARY.bonding_issues;
VIDEO_LIBRARY.baby_feeding = VIDEO_LIBRARY.bonding_issues;
VIDEO_LIBRARY.caring_for_baby = VIDEO_LIBRARY.bonding_issues;
VIDEO_LIBRARY.baby_sleep = VIDEO_LIBRARY.sleep_problems;
VIDEO_LIBRARY.mother_sleep = VIDEO_LIBRARY.sleep_problems;
VIDEO_LIBRARY.mother_sleep_problems = VIDEO_LIBRARY.sleep_problems;
VIDEO_LIBRARY.sleep_problem = VIDEO_LIBRARY.sleep_problems;
VIDEO_LIBRARY.sleep = VIDEO_LIBRARY.sleep_problems;
VIDEO_LIBRARY.baby_health = VIDEO_LIBRARY.anxiety;

// ── SUPPORTED MUSIC REASONS & STRICT SELECTION ──────────────────
export const SUPPORTED_MUSIC_REASONS = [
  'loneliness',
  'fatigue',
  'anxiety',
  'bonding_issues',
  'lack_of_support',
  'sleep_problems',
  'loss_of_confidence',
  'overwhelmed',
  'physical_discomfort',
  'negative_thoughts'
];

import { normalizeReasonKey, normalizeEmotionKey, normalizeRiskLevel } from './activitiesLibrary.js';

/**
 * Resolves music from MUSIC_LIBRARY strictly using the detected final reason and selected emoji.
 * Reason determines pool, Risk determines safety, Emoji personalizes ranking.
 */
export const getMusicForReason = (finalReason = '', emotion = '', selectedEmoji = null, riskLevel = 'low') => {
  const normReason = normalizeReasonKey(finalReason);
  let targetCategory = normReason;

  if (targetCategory && !SUPPORTED_MUSIC_REASONS.includes(targetCategory)) {
    if (['mother_sleep', 'mother_sleep_problems', 'sleep'].includes(targetCategory)) {
      targetCategory = 'sleep_problems';
    } else if (['baby_crying', 'baby_needs', 'baby_feeding', 'caring_for_baby', 'baby_sleep'].includes(targetCategory)) {
      targetCategory = 'bonding_issues';
    } else if (['baby_health'].includes(targetCategory)) {
      targetCategory = 'anxiety';
    } else if (['feeling_lonely'].includes(targetCategory)) {
      targetCategory = 'loneliness';
    } else if (['feeling_overwhelmed'].includes(targetCategory)) {
      targetCategory = 'overwhelmed';
    } else if (['physical_recovery'].includes(targetCategory)) {
      targetCategory = 'physical_discomfort';
    } else if (['family_problems', 'relationship_family_problem'].includes(targetCategory)) {
      targetCategory = 'lack_of_support';
    } else if (['financial_worries', 'financial_worry'].includes(targetCategory)) {
      targetCategory = 'overwhelmed';
    }
  }

  const selectedCategory = SUPPORTED_MUSIC_REASONS.includes(targetCategory)
    ? targetCategory
    : 'loneliness';

  const fullLibrary = MUSIC_LIBRARY[selectedCategory] || MUSIC_LIBRARY.loneliness;
  const effectiveEmotion = selectedEmoji || emotion;
  const normEmotion = normalizeEmotionKey(effectiveEmotion);

  const prefixes = ['lo', 'fa', 'an', 'bo', 'ls', 'sl', 'lc', 'ow', 'pd', 'nt'];
  const mapMusicForEmotion = (pattern) => prefixes.flatMap(p => pattern.map(n => `${p}${n}`));

  const emojiMusicMap = {
    crying: mapMusicForEmotion([1, 2, 3, 4]),
    happy: mapMusicForEmotion([5, 6, 7, 8]),
    sleepy: mapMusicForEmotion([9, 10, 1, 2]),
    tired: mapMusicForEmotion([3, 4, 5, 6]),
    calm: mapMusicForEmotion([7, 8, 9, 10]),
    sad: mapMusicForEmotion([1, 3, 5, 7])
  };

  const targetMusicList = emojiMusicMap[normEmotion] || emojiMusicMap.calm;

  const scoredMusic = fullLibrary.map((track, idx) => {
    let emojiScore = 0;
    if (targetMusicList.includes(track.id)) {
      emojiScore += 25;
    }
    return { track, emojiScore, idx };
  });

  scoredMusic.sort((a, b) => (b.emojiScore - a.emojiScore) || (a.idx - b.idx));

  const cappedMusic = scoredMusic.map(sm => sm.track).slice(0, 4);

  // DEVELOPMENT DEBUG LOGGING
  console.log('[MusicRecommendation]');
  console.log(`Diary Reason: ${finalReason}`);
  console.log(`Emotion: ${emotion}`);
  console.log(`Selected Emoji: ${selectedEmoji}`);
  console.log(`Selected Music Category: ${selectedCategory}`);
  console.log(`Selected Music IDs: ${cappedMusic.map(m => m.id).join(', ')}`);

  return {
    category: selectedCategory,
    musicList: fullLibrary,
    music: cappedMusic
  };
};

/**
 * Resolves videos from VIDEO_LIBRARY using reason + riskLevel + selectedEmoji.
 */
export const getVideosForReason = (finalReason = '', emotion = '', selectedEmoji = null, riskLevel = 'low') => {
  const normReason = normalizeReasonKey(finalReason);
  let targetCategory = normReason;

  if (targetCategory && !VIDEO_LIBRARY[targetCategory]) {
    if (['mother_sleep', 'mother_sleep_problems', 'sleep'].includes(targetCategory)) {
      targetCategory = 'sleep_problems';
    } else if (['baby_crying', 'baby_needs', 'baby_feeding', 'caring_for_baby', 'baby_sleep'].includes(targetCategory)) {
      targetCategory = 'bonding_issues';
    } else if (['baby_health'].includes(targetCategory)) {
      targetCategory = 'anxiety';
    } else if (['feeling_lonely'].includes(targetCategory)) {
      targetCategory = 'loneliness';
    } else if (['feeling_overwhelmed'].includes(targetCategory)) {
      targetCategory = 'overwhelmed';
    } else if (['physical_recovery'].includes(targetCategory)) {
      targetCategory = 'physical_discomfort';
    } else if (['family_problems', 'relationship_family_problem'].includes(targetCategory)) {
      targetCategory = 'lack_of_support';
    } else if (['financial_worries', 'financial_worry'].includes(targetCategory)) {
      targetCategory = 'overwhelmed';
    }
  }

  const selectedCategory = VIDEO_LIBRARY[targetCategory] ? targetCategory : 'loneliness';
  const fullVideos = (VIDEO_LIBRARY[selectedCategory] || VIDEO_LIBRARY.loneliness).filter(v => v && v.id && (v.title || v.titleEn));

  const effectiveEmotion = selectedEmoji || emotion;
  const normEmotion = normalizeEmotionKey(effectiveEmotion);
  const normRisk = normalizeRiskLevel(riskLevel);

  const vPrefixes = ['vlo', 'vfa', 'van', 'vbo', 'vls', 'vsl', 'vlc', 'vow', 'vpd', 'vnt'];
  const mapVideoForEmotion = (pattern) => vPrefixes.flatMap(p => pattern.map(n => `${p}${n}`));

  const emojiVideoMap = {
    crying: mapVideoForEmotion([1, 2, 3, 4]),
    happy: mapVideoForEmotion([5, 6, 7, 8]),
    sleepy: mapVideoForEmotion([9, 10, 1, 2]),
    tired: mapVideoForEmotion([3, 4, 5, 6]),
    calm: mapVideoForEmotion([7, 8, 9, 10]),
    sad: mapVideoForEmotion([1, 3, 5, 7])
  };

  const targetIdList = emojiVideoMap[normEmotion] || emojiVideoMap.calm;

  const scoredVideos = fullVideos.map((video, idx) => {
    const vText = ((video.id || '') + ' ' + (video.titleEn || '') + ' ' + (video.title || '') + ' ' + (video.url || '') + ' ' + (video.emoji || '')).toLowerCase();

    let reasonScore = 15;
    let riskScore = 4;
    let emojiScore = 0;

    if (normRisk === 'high') {
      const highRiskKeywords = ['postpartum', 'guided', 'calm', 'support', 'meditation', 'breathing', 'safe', 'grounding', 'healing', 'circle', 'never', 'alone'];
      if (highRiskKeywords.some(k => vText.includes(k))) {
        riskScore = 8;
      }
    } else if (normRisk === 'medium') {
      riskScore = 6;
    }

    if (targetIdList.includes(video.id)) {
      emojiScore += 25;
    }

    const finalScore = reasonScore + riskScore + emojiScore;
    return { video, finalScore, idx };
  });

  scoredVideos.sort((a, b) => (b.finalScore - a.finalScore) || (a.idx - b.idx));

  const cappedVideos = scoredVideos.map(sv => sv.video).slice(0, 4);

  return {
    category: selectedCategory,
    videosList: fullVideos,
    videos: cappedVideos
  };
};