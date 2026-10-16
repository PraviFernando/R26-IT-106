/**
 * Small helpers shared by the exercise controller.
 */

// "12:34" / "1:02:03" / 15 (minutes) -> seconds. Missing or invalid -> 600 (10 minutes).
const parseDurationStr = (dStr) => {
    if (dStr === undefined || dStr === null || dStr === '') return 600;
    const str = String(dStr);
    if (str.includes(':')) {
        const parts = str.split(':').map(n => parseInt(n, 10) || 0);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parseInt(str, 10) * 60 || 600;
};

// Minutes as a number (one decimal) from minutes or "mm:ss"; undefined when no value is given
const toMinutes = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    return Math.round(parseDurationStr(value) / 60 * 10) / 10;
};

// YYYY-MM-DD in the server's local time zone (matches the app's local date; toISOString would use UTC)
const toLocalDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const isValidDateStr = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime());

const toBool = (value) => value === true || value === 'true';

// YouTube returns titles HTML-escaped (e.g. "Strong &amp; Fit"); decode the common entities
const decodeHtml = (text) => String(text || '')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&'); // last, so "&amp;lt;" stays "&lt;"

module.exports = { parseDurationStr, toMinutes, toLocalDateStr, isValidDateStr, toBool, decodeHtml };
