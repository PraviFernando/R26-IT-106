// Shared helpers for the exercise screens (exercise, movement tracking, progress, watch history).

// YYYY-MM-DD in local time (toISOString would use UTC and shift the day in Sri Lanka)
export const toLocalDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const todayStr = () => toLocalDateStr(new Date());

// "12:34" -> 754, "1:02:03" -> 3723, 15 (minutes) -> 900. Missing/invalid -> 600 (10 minutes).
export const durationToSeconds = (value) => {
    if (value === undefined || value === null || value === '') return 600;
    const str = String(value);
    if (str.includes(':')) {
        const parts = str.split(':').map(n => parseInt(n, 10) || 0);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parseInt(str, 10) * 60 || 600;
};

// 15 -> 15, "12:34" -> 12.6, "1:02:00" -> 62 (minutes). Missing -> 0.
export const durationToMinutes = (value) => {
    if (value === undefined || value === null || value === '') return 0;
    if (typeof value === 'number') return value;
    return Math.round(durationToSeconds(value) / 60 * 10) / 10;
};

// 75 -> "01:15"
export const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// 11-character YouTube id from embed / watch / youtu.be links, or '' when none is found
export const getYoutubeId = (url) => {
    if (!url) return '';
    const match = String(url).match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : '';
};

// Embeddable URL for a YouTube link (extra query params are appended), or the original URL
export const getYoutubeEmbedUrl = (url, params = 'playsinline=1&controls=1&rel=0&modestbranding=1') => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) {
        return params ? `${url}${url.includes('?') ? '&' : '?'}${params}` : url;
    }
    const id = getYoutubeId(url);
    return id ? `https://www.youtube.com/embed/${id}${params ? `?${params}` : ''}` : url;
};

// Whether a recommendation entry is the same exercise as `exercise`
export const matchesExercise = (rec, exercise) => (
    exercise.exerciseId
        ? rec.exerciseId === exercise.exerciseId
        : (!!exercise.customName && rec.customName === exercise.customName) || (!!exercise.videoUrl && rec.videoUrl === exercise.videoUrl)
);
