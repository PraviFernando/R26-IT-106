/**
 * Exercise module thresholds, all in one place.
 * The reasoning (and the guidelines each value is based on) is documented in
 * docs/exercise-clinical-rules.md — keep the two in sync when changing a value.
 */
module.exports = {
    // --- Clinical safety overrides (applied after the ML prediction) ---
    C_SECTION_RECOVERY_WEEKS: 6,      // C-section: only categories 1-2 before this many weeks
    SEVERE_SYMPTOM_COUNT: 3,          // this many of pelvic/back/abdominal pain + muscle weakness -> category 1
    MODERATE_SYMPTOM_COUNT: 2,        // this many -> category capped at 2

    // --- Daily adaptation ---
    LOW_ADHERENCE_PERCENT: 50,        // last session below this % of the recommended time -> step intensity down

    // --- Personalisation from movement tracking (last 3 completed sessions) ---
    PERSONALISE_SESSION_COUNT: 3,
    HIGH_PERFORMANCE_SCORE: 90,       // all recent sessions >= this score & accuracy, rated Easy -> longer videos
    LOW_PERFORMANCE_SCORE: 70,        // last session below this score or accuracy -> shorter/gentler videos

    // --- Video recommendations ---
    RECOMMENDATION_POOL_SIZE: 10,     // videos stored per day
    MAX_YOUTUBE_RESULTS: 25,          // results requested for the category search
    FOCUS_YOUTUBE_RESULTS: 10,        // results requested per focus search (pain area, C-section, energy, mood)
    FOCUS_VIDEOS_PER_QUERY: 3,        // videos kept from each focus search; the rest come from the category search
    YOUTUBE_CACHE_HOURS: 24,          // reuse a YouTube search for this long (saves API quota)
    MIN_VIDEO_SECONDS: 60,            // shorter videos (YouTube Shorts) are excluded
    DEFAULT_VIDEO_DURATION: '10:00',

    // --- Completion ---
    WATCH_COMPLETE_PERCENT: 80,       // watching this much of a video counts as completing it

    // --- Progress analytics ---
    RECOVERY_TREND_DAYS: 21,
    MIN_HEALTH_RECORDS_FOR_TREND: 3,
    PROGRESS_PAIN_PENALTY: 15,
    PROGRESS_HARD_PENALTY: 10,
    PROGRESS_FEELING_BONUS: 5,
    PROGRESS_MIN_SCORE: 20,
};
