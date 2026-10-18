// Unit tests for the exercise module helpers (no database or network needed).
// Run: node --test backend/tests/exercise
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const { parseDurationStr, toMinutes, toLocalDateStr, isValidDateStr, toBool } = require('../../utils/exerciseUtils');
const MLPredictionService = require('../../services/mlPredictionService');
const { buildVideoQueries } = require('../../utils/exerciseVideoQueries');

const FRONT = path.join(__dirname, '..', '..', '..', 'frontend', 'utils');
const loadFrontend = (file) => import(pathToFileURL(path.join(FRONT, file)).href);

test('backend duration helpers', () => {
    assert.equal(parseDurationStr('12:34'), 754);
    assert.equal(parseDurationStr('1:02:03'), 3723);
    assert.equal(parseDurationStr(15), 900);
    assert.equal(parseDurationStr(undefined), 600);
    assert.equal(parseDurationStr('abc'), 600);
    assert.equal(toMinutes('12:34'), 12.6);
    assert.equal(toMinutes(15), 15);
    assert.equal(toMinutes(undefined), undefined);
});

test('backend date and boolean helpers', () => {
    assert.equal(toLocalDateStr(new Date(2026, 0, 5)), '2026-01-05');
    assert.equal(isValidDateStr('2026-10-16'), true);
    assert.equal(isValidDateStr('16/10/2026'), false);
    assert.equal(isValidDateStr(undefined), false);
    assert.equal(toBool('true'), true);
    assert.equal(toBool(true), true);
    assert.equal(toBool('yes'), false);
});

test('ML feature preprocessing matches the training encoding', () => {
    const f = MLPredictionService.preprocessFeatures({
        weeksAfterDelivery: 8, deliveryType: 'c-section', bleedingComplications: true,
        fatigueLevel: 'high', mobilityLevel: 'limited', willingnessToExercise: 'low', epdsRiskLevel: 'high',
    });
    assert.deepEqual(
        [f.weeks_after_delivery, f.delivery_type, f.bleeding, f.fatigue_level, f.mobility_level, f.willingness, f.epds_risk_level],
        [8, 1, 1, 2, 1, 0, 2]
    );
});

test('rule fallback: dangerous conditions always give category 1 / high risk', () => {
    for (const extra of [{ doctorRestrictions: true }, { bleedingComplications: true }, { weeksAfterDelivery: 2 },
        { pelvicPain: true, backPain: true, abdominalPain: true }]) {
        const r = MLPredictionService.fallbackPrediction({ weeksAfterDelivery: 10, fatigueLevel: 'low', mobilityLevel: 'normal', ...extra });
        assert.equal(r.exerciseCategory, 1, JSON.stringify(extra));
        assert.ok(r.riskLevel >= 1);
        assert.equal(r.source, 'rule_fallback');
    }
});

test('rule fallback: high EPDS lowers full functional to strength & core', () => {
    const base = { weeksAfterDelivery: 10, fatigueLevel: 'low', mobilityLevel: 'normal' };
    assert.equal(MLPredictionService.fallbackPrediction({ ...base, epdsRiskLevel: 'low' }).exerciseCategory, 4);
    assert.equal(MLPredictionService.fallbackPrediction({ ...base, epdsRiskLevel: 'high' }).exerciseCategory, 3);
});

test('frontend utils: durations, YouTube ids, matching', async () => {
    const u = await loadFrontend('exerciseUtils.js');
    assert.equal(u.durationToMinutes('12:34'), 12.6);
    assert.equal(u.durationToMinutes(15), 15);
    assert.equal(u.durationToSeconds('10:00'), 600);
    assert.equal(u.formatTime(75), '01:15');
    for (const url of ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3',
        'https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube.com/shorts/dQw4w9WgXcQ']) {
        assert.equal(u.getYoutubeId(url), 'dQw4w9WgXcQ', url);
    }
    assert.equal(u.getYoutubeId('https://example.com/v.mp4'), '');
    assert.equal(u.getYoutubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ', 'a=1'), 'https://www.youtube.com/embed/dQw4w9WgXcQ?a=1');
    assert.equal(u.matchesExercise({ customName: 'A' }, { customName: 'A' }), true);
    assert.equal(u.matchesExercise({}, {}), false, 'missing names must not match everything');
    assert.equal(u.matchesExercise({ exerciseId: 'x', customName: 'A' }, { exerciseId: 'y', customName: 'A' }), false);
});

test('frontend messages: translate by code, fall back to English sentence', async () => {
    const m = await loadFrontend('exerciseMessages.js');
    assert.match(m.getTranslatedFeedback('anything', true, 'pain_rest'), /වේදනාව/);
    assert.match(m.getTranslatedFeedback('Excellent progress. You may continue with the current exercise plan.', true), /විශිෂ්ට/);
    assert.equal(m.getTranslatedFeedback('Unknown text', true), 'Unknown text');
    assert.match(m.getTranslatedTrend('', false, 'stable'), /^Stable recovery/);
});

test('rule fallback: every form input can change the category', () => {
    const base = { weeksAfterDelivery: 10, deliveryType: 'normal', fatigueLevel: 'low', mobilityLevel: 'normal', willingnessToExercise: 'high', epdsRiskLevel: 'low' };
    const cat = (extra) => MLPredictionService.fallbackPrediction({ ...base, ...extra }).exerciseCategory;
    assert.equal(cat({}), 4);
    for (const extra of [{ pelvicPain: true }, { backPain: true }, { abdominalPain: true }, { muscleWeakness: true },
        { fatigueLevel: 'medium' }, { mobilityLevel: 'limited' }, { willingnessToExercise: 'low' }, { epdsRiskLevel: 'high' }]) {
        assert.equal(cat(extra), 3, JSON.stringify(extra));
    }
    for (const extra of [{ fatigueLevel: 'high' }, { mobilityLevel: 'very_limited' }, { backPain: true, pelvicPain: true },
        { weeksAfterDelivery: 4 }, { deliveryType: 'c-section', weeksAfterDelivery: 5 }]) {
        assert.equal(cat(extra), 2, JSON.stringify(extra));
    }
    assert.equal(cat({ fatigueLevel: 'medium', mobilityLevel: 'limited', willingnessToExercise: 'low' }), 2, 'mild factors lower at most 2 levels');
    assert.equal(cat({ weeksAfterDelivery: 6 }), 3);
});

test('video searches depend on the form, not only the category', () => {
    const plain = buildVideoQueries(4, { weeksAfterDelivery: 10, deliveryType: 'normal' });
    assert.equal(plain.length, 1, 'no symptoms -> category search only');
    const back = buildVideoQueries(3, { weeksAfterDelivery: 10, backPain: true });
    assert.deepEqual(back.map(q => q.focus), [null, 'back_pain']);
    const many = buildVideoQueries(2, { weeksAfterDelivery: 4, deliveryType: 'c-section', pelvicPain: true, backPain: true, fatigueLevel: 'high' });
    assert.equal(many.length, 3, 'at most 2 focus searches');
    assert.deepEqual(many.map(q => q.focus), [null, 'c_section', 'pelvic_pain']);
    assert.match(buildVideoQueries(1, { pelvicPain: true })[1].q, /breathing/, 'focus searches keep the category intensity');
});

test('menu navigation reuses open screens instead of stacking copies', async () => {
    const nav = await loadFrontend('exerciseNavigation.js');
    const calls = [];
    const navigation = { navigate: (...args) => calls.push(args) };

    nav.goToSection(navigation, 'form');
    nav.goToSection(navigation, 'today');
    nav.goToSection(navigation, 'progress');
    nav.goToSection(navigation, 'history');

    assert.deepEqual(calls.map(c => c[0]), ['Exercise', 'Exercise', 'ExerciseProgress', 'ExerciseProgress']);
    assert.deepEqual(calls.map(c => c[1].section || c[1].tab), ['form', 'today', 'progress', 'history']);
    for (const c of calls) assert.deepEqual(c[2], { pop: true }, 'must go back to the open screen, not push another');
    for (const c of calls) assert.equal(typeof c[1].ts, 'number', 'ts makes the same request work twice in a row');
});

test('menu navigation switches in place when the current screen can do it', async () => {
    const nav = await loadFrontend('exerciseNavigation.js');
    let navigated = 0, local = [];
    const navigation = { navigate: () => { navigated++; } };
    nav.goToSection(navigation, 'form', (key) => { local.push(key); return true; });
    assert.equal(navigated, 0);
    assert.deepEqual(local, ['form']);
    nav.goToSection(navigation, 'progress', () => false);
    assert.equal(navigated, 1, 'falls back to navigating when it cannot switch in place');
});

test('streak wording: 1 day, 2 days, 0 days, Sinhala', async () => {
    const m = await loadFrontend('exerciseMessages.js');
    assert.equal(m.formatDays(0, false), '0 days');
    assert.equal(m.formatDays(1, false), '1 day');
    assert.equal(m.formatDays(2, false), '2 days');
    assert.equal(m.formatDays(1, true), '1 දින');
});
