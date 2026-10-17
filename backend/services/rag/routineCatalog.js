const { DOMAIN_CATEGORIES } = require('../../config/ragConfig');

// Small curated set, PlanDetail.activities-shaped ({activityId, activityName, timeOfDay,
// icon}), tagged by domain category. timeOfDay is fixed per item (matching each activity's
// natural fit) rather than inferred from when the message was sent.
const CATALOG = {
    [DOMAIN_CATEGORIES.MATERNAL_MENTAL_HEALTH]: [
        { activityId: 'routine_deep_breathing', activityName: 'Deep Breathing Exercise', timeOfDay: 'Morning', icon: '🌬️' },
        { activityId: 'routine_mood_checkin', activityName: 'Mood Check-in', timeOfDay: 'Morning', icon: '📝' },
        { activityId: 'routine_rest_break', activityName: 'Rest Break', timeOfDay: 'Afternoon', icon: '😴' },
        { activityId: 'routine_gentle_walk', activityName: 'Gentle Walk Outside', timeOfDay: 'Afternoon', icon: '🚶‍♀️' },
        { activityId: 'routine_connect_support', activityName: 'Connect with a Support Person', timeOfDay: 'Evening', icon: '💬' },
    ],
    [DOMAIN_CATEGORIES.NEWBORN_CARE]: [
        { activityId: 'routine_feeding_schedule', activityName: 'Feeding Time', timeOfDay: 'Morning', icon: '🍼' },
        { activityId: 'routine_tummy_time', activityName: "Baby's Tummy Time", timeOfDay: 'Midday', icon: '👶' },
        { activityId: 'routine_bath_time', activityName: "Baby's Bath Time", timeOfDay: 'Evening', icon: '🛁' },
        { activityId: 'routine_sleep_routine', activityName: 'Baby Sleep Routine', timeOfDay: 'Night', icon: '🌙' },
    ],
};

function selectRoutineItems(category, limit = 3) {
    const items =
        CATALOG[category] ||
        [
            ...CATALOG[DOMAIN_CATEGORIES.MATERNAL_MENTAL_HEALTH].slice(0, 2),
            ...CATALOG[DOMAIN_CATEGORIES.NEWBORN_CARE].slice(0, 1),
        ];
    return items.slice(0, limit);
}

module.exports = { selectRoutineItems };
