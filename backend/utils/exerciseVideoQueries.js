/**
 * Builds the YouTube searches for a mother's daily recommendation.
 *
 * The category (1-4) sets the intensity. On top of that, up to MAX_FOCUS_QUERIES "focus" searches
 * are added from the health form (C-section, pain areas, low energy, mood), so two mothers in the
 * same category with different symptoms get different videos. Focus searches are worded for the
 * category's intensity, so they never suggest harder exercise than the category allows.
 */

// BASE_QUERY = the search text for each exercise category 1-4.
const BASE_QUERY = {
    1: 'postpartum bedrest breathing exercises',
    2: 'postpartum gentle mobility exercises',
    3: 'postpartum core strength exercises',
    4: 'postpartum functional workout exercises',
};

// Wording per intensity, so a focus search stays inside the category
const LEVEL_WORDS = {
    1: 'breathing exercises in bed',
    2: 'gentle exercises',
    3: 'safe strengthening exercises',
    4: 'full workout',
};

const MAX_FOCUS_QUERIES = 2;

/**
 * @returns {{ q: string, focus: string|null }[]} base search first, then focus searches by priority
 */
// makes the form change the videos. Adds "focus" searches by priority: C-section, pelvic pain, back pain,
// core weakness, low energy, mood, limited mobility. Only the first 2 are used, wording stays inside the category level.
const buildVideoQueries = (category, health) => {
    const level = LEVEL_WORDS[category] || LEVEL_WORDS[2];
    const focus = [];

    if (health.deliveryType === 'c-section' && Number(health.weeksAfterDelivery) < 12) {
        focus.push({ focus: 'c_section', q: `after c-section recovery postpartum ${level}` });
    }
    if (health.pelvicPain) {
        focus.push({ focus: 'pelvic_pain', q: `postpartum pelvic floor ${level}` });
    }
    if (health.backPain) {
        focus.push({ focus: 'back_pain', q: `postpartum back pain relief ${level}` });
    }
    if ((health.abdominalPain || health.muscleWeakness) && category >= 2) {
        focus.push({ focus: 'core_weakness', q: `postpartum diastasis recti ${level}` });
    }
    if (health.fatigueLevel === 'high' || health.fatigueLevel === 'medium' || health.willingnessToExercise === 'low') {
        focus.push({ focus: 'low_energy', q: `short 10 minute postpartum ${level}` });
    }
    if (health.epdsRiskLevel === 'high' || health.detectedMood === 'sad') {
        focus.push({ focus: 'mood', q: category === 1 ? 'postpartum relaxation breathing for stress and low mood' : 'postpartum relaxing yoga for stress and low mood' });
    }
    if (health.mobilityLevel === 'very_limited' || health.mobilityLevel === 'limited') {
        focus.push({ focus: 'limited_mobility', q: `postpartum seated ${level}` });
    }

    return [{ q: BASE_QUERY[category] || BASE_QUERY[2], focus: null }, ...focus.slice(0, MAX_FOCUS_QUERIES)];
};

module.exports = { buildVideoQueries, BASE_QUERY, MAX_FOCUS_QUERIES };
