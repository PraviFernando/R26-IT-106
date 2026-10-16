// Translations for messages the exercise backend returns. The backend sends a code
// (feedbackCode, recoveryTrendCode) plus English text; we translate by code so changing the
// English wording on the server does not break the Sinhala version. Older records without a
// code fall back to matching the English sentence.

const FEEDBACK = {
    pain_rest: {
        en: "You felt pain during exercise. Please rest. Tomorrow's exercises will be adjusted to lower intensity.",
        si: 'ව්‍යායාම අතරතුර ඔබට වේදනාවක් දැනුණි. කරුණාකර විවේක ගන්න. හෙට දින ව්‍යායාම අඩු තීව්‍රතාවයකට සකස් කරනු ඇත.',
    },
    fatigue_lower: {
        en: 'You may be experiencing fatigue. Tomorrow’s exercises will be adjusted to lower intensity.',
        si: 'ඔබට තෙහෙට්ටුවක් දැනෙන්නට පුළුවන. හෙට දින ව්‍යායාම අඩු තීව්‍රතාවයකට සකස් කරනු ඇත.',
    },
    stopped_early: {
        en: 'You stopped early. Tomorrow’s exercises will be adjusted to lower intensity.',
        si: 'ඔබ ඉක්මනින් නතර කළා. හෙට දින ව්‍යායාම අඩු තීව්‍රතාවයකට සකස් කරනු ඇත.',
    },
    excellent: {
        en: 'Excellent progress. You may continue with the current exercise plan.',
        si: 'විශිෂ්ට ප්‍රගතියක්. ඔබට වත්මන් ව්‍යායාම සැලැස්ම සමඟ දිගටම කටයුතු කළ හැකිය.',
    },
};

const RECOVERY_TREND = {
    no_data: {
        en: 'No data yet to detect recovery trend. Keep logging daily health inputs.',
        si: 'සුවවීමේ ප්‍රවණතාව හඳුනා ගැනීමට තවමත් දත්ත ප්‍රමාණවත් නැත. දිනපතා සෞඛ්‍ය දත්ත ඇතුළත් කරන්න.',
    },
    fatigue_down_mobility_up: {
        en: 'Fantastic recovery trend detected! Over the past few weeks, your fatigue has decreased and your mobility has improved.',
        si: 'විශිෂ්ට සුවවීමේ ප්‍රවණතාවක් හඳුනාගෙන ඇත! පසුගිය සති කිහිපය තුළ ඔබේ තෙහෙට්ටුව අඩු වී ඇති අතර චලන හැකියාව වර්ධනය වී ඇත.',
    },
    fatigue_down: {
        en: 'Positive trend: Your fatigue level has been decreasing over the last 3 weeks.',
        si: 'යහපත් ප්‍රවණතාවක්: පසුගිය සති 3 තුළ ඔබේ තෙහෙට්ටුව මට්ටම ක්‍රමයෙන් අඩු වෙමින් පවතී.',
    },
    mobility_up: {
        en: 'Positive trend: Your mobility is improving over the last 3 weeks.',
        si: 'යහපත් ප්‍රවණතාවක්: පසුගිය සති 3 තුළ ඔබේ චලන හැකියාව වර්ධනය වෙමින් පවතී.',
    },
    stable: {
        en: 'Stable recovery pattern. Rest and follow recommendations daily.',
        si: 'ස්ථාවර සුවවීමේ රටාවක් පවතී. දිනපතා විවේකය ලබාගෙන උපදෙස් අනුගමනය කරන්න.',
    },
};

const translate = (table, code, text, isSinhala) => {
    const entry = (code && table[code]) || Object.values(table).find(e => text && e.en === String(text).trim());
    if (!entry) return text || '';
    return isSinhala ? entry.si : entry.en;
};

// Why a video was recommended (the backend's "focus" field)
const VIDEO_FOCUS = {
    c_section: { en: 'For C-section recovery', si: 'සිසේරියන් සුවය සඳහා' },
    pelvic_pain: { en: 'For pelvic pain', si: 'ශ්‍රෝණි වේදනාව සඳහා' },
    back_pain: { en: 'For back pain', si: 'පිටුපස වේදනාව සඳහා' },
    core_weakness: { en: 'For core weakness', si: 'උදර මාංශ දුර්වලතාවය සඳහා' },
    low_energy: { en: 'Short, low energy', si: 'කෙටි, අඩු ශක්තිය සඳහා' },
    mood: { en: 'For stress and mood', si: 'ආතතිය සහ මනෝභාවය සඳහා' },
    limited_mobility: { en: 'For limited mobility', si: 'සීමිත චලනය සඳහා' },
};

export const videoFocusLabel = (focus, isSinhala) => (VIDEO_FOCUS[focus] ? (isSinhala ? VIDEO_FOCUS[focus].si : VIDEO_FOCUS[focus].en) : '');

export const feedbackText = (code, isSinhala) => (FEEDBACK[code] ? (isSinhala ? FEEDBACK[code].si : FEEDBACK[code].en) : '');

// (text, isSinhala, code?) — keeps the old call signature working
export const getTranslatedFeedback = (text, isSinhala, code) => translate(FEEDBACK, code, text, isSinhala);

export const getTranslatedTrend = (text, isSinhala, code) => translate(RECOVERY_TREND, code, text, isSinhala);
