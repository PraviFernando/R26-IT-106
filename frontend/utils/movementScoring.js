// Movement scoring used by the camera tracker in MovementTrackingScreen.
//
// The tracker runs inside a WebView/iframe, so the scoring code is kept as a JavaScript
// source string (MOVEMENT_SCORING_JS) that is injected into that page. createMovementScoring()
// evaluates the same source so it can be unit-tested in Node (not used by the app itself).
//
// What is measured (all from the user's own pose, never from a timer):
//  - Range of motion: how much of the exercise's target range the user reaches
//  - Alignment: exercise-specific form checks (knees over ankles, hips level, straight limbs...)
//  - Steadiness: how still the pelvis stays (hip tilt + side-to-side sway), for every exercise
//  - Pace: seconds per rep compared with a slow, controlled tempo (the video's poses can't be measured)

export const MOVEMENT_SCORING_JS = `
var MS_PROFILES = {
    'Modified Squats': { metric: 'knee', rest: 170, target: 105, paceSec: [3, 7] },
    'Glute Bridge': { metric: 'hip', rest: 125, target: 170, paceSec: [3, 7] },
    'Cat-Cow': { metric: 'back', rangeOnly: true, range: 25, paceSec: [4, 9] },
    'Bird Dog': { metric: 'extension', rest: 0, target: 1, paceSec: [3, 8] },
    'Universal': { metric: 'amplitude', rest: 0, target: 0.35, paceSec: [2, 7] }
};

function msClamp(v, lo, hi) {
    if (lo === undefined) lo = 0;
    if (hi === undefined) hi = 100;
    if (!isFinite(v)) return lo;
    return Math.max(lo, Math.min(hi, v));
}

// Angle ABC in degrees (0..180)
function msAngle(a, b, c) {
    var r = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    var d = Math.abs(r * 180 / Math.PI);
    return d > 180 ? 360 - d : d;
}

function msDist(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function msMean(arr) {
    if (!arr.length) return 0;
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
}

function msStd(arr) {
    if (arr.length < 2) return 0;
    var m = msMean(arr), s = 0;
    for (var i = 0; i < arr.length; i++) s += Math.pow(arr[i] - m, 2);
    return Math.sqrt(s / arr.length);
}

// Share (0..100) of the exercise's target range covered by the values seen
function msRomScore(profile, minV, maxV) {
    if (!profile || !isFinite(minV) || !isFinite(maxV)) return 0;
    if (profile.rangeOnly) return msClamp((maxV - minV) / profile.range * 100);
    var need = Math.abs(profile.target - profile.rest);
    var achieved = profile.target < profile.rest ? profile.rest - minV : maxV - profile.rest;
    return msClamp(achieved / need * 100);
}

// 100 inside the controlled-tempo window, falling off when much faster or slower
function msPaceScore(repMs, paceSec) {
    var s = repMs / 1000, lo = paceSec[0], hi = paceSec[1];
    if (!isFinite(s) || s <= 0) return 0;
    if (s >= lo && s <= hi) return 100;
    if (s < lo) return msClamp(100 - (lo - s) / lo * 120);
    return msClamp(100 - (s - hi) / hi * 80);
}

// Steadiness from recent samples of hip tilt and side sway, both divided by torso length.
// A still pelvis gives ~100; visible rocking or tilting brings it down.
function msSteadiness(tilts, sways) {
    if (tilts.length < 5) return null;
    var tiltLevel = msMean(tilts.map(function (t) { return Math.abs(t); }));
    var penalty = msStd(tilts) * 500 + msStd(sways) * 300 + Math.max(0, tiltLevel - 0.04) * 250;
    return Math.round(msClamp(100 - penalty));
}

// Score one form check: 100 when within ok, 0 at or beyond bad, linear between
function msCheck(value, ok, bad) {
    if (!isFinite(value)) return null;
    if (value <= ok) return 100;
    if (value >= bad) return 0;
    return 100 - (value - ok) / (bad - ok) * 100;
}

// Torso angle from vertical in degrees: ~0 standing upright, ~90 lying or on all fours
function msTorsoTilt(lm) {
    var sx = (lm[11].x + lm[12].x) / 2, sy = (lm[11].y + lm[12].y) / 2;
    var hx = (lm[23].x + lm[24].x) / 2, hy = (lm[23].y + lm[24].y) / 2;
    return Math.atan2(Math.abs(sx - hx), Math.abs(sy - hy)) * 180 / Math.PI;
}

// Posture (0..100) on raw MediaPipe landmarks. Two parts:
//  1. Body position for the exercise (upright for squats, lying for bridges, on all fours for
//     Cat-Cow / Bird Dog). If that is wrong, posture stays low whatever else looks fine.
//  2. Exercise-specific form checks with tight tolerances.
function msAlignment(detector, lm, torso) {
    if (!lm || !torso) return null;
    var L = function (i) { return lm[i]; };
    var tilt = msTorsoTilt(lm);
    var hipsLevel = Math.abs(L(23).y - L(24).y) / torso;
    var shouldersLevel = Math.abs(L(11).y - L(12).y) / torso;
    var position = 100;
    var checks = [];

    if (detector === 'Modified Squats') {
        position = msCheck(tilt, 35, 65);                                         // stay fairly upright
        checks.push(msCheck(Math.abs(L(25).x - L(27).x) / torso, 0.10, 0.35));   // left knee over ankle
        checks.push(msCheck(Math.abs(L(26).x - L(28).x) / torso, 0.10, 0.35));   // right knee over ankle
        var feet = Math.abs(L(27).x - L(28).x) / (Math.abs(L(11).x - L(12).x) || 0.0001);
        checks.push(msCheck(Math.abs(feet - 1.1), 0.45, 1.1));                    // feet about shoulder-width
        checks.push(msCheck(hipsLevel, 0.05, 0.2));
    } else if (detector === 'Glute Bridge') {
        position = msCheck(90 - tilt, 30, 60);                                    // lying on the back
        var kneeAngle = Math.min(msAngle(L(23), L(25), L(27)), msAngle(L(24), L(26), L(28)));
        checks.push(msCheck(Math.max(0, Math.abs(kneeAngle - 90) - 25), 0, 35));  // knees bent ~65-115 deg
        var kneeGap = Math.abs(L(25).x - L(26).x), hipGap = Math.abs(L(23).x - L(24).x) || 0.0001;
        checks.push(msCheck(Math.abs(kneeGap / hipGap - 1), 0.4, 1.2));          // knees hip-width
        checks.push(msCheck(hipsLevel, 0.05, 0.2));
    } else if (detector === 'Cat-Cow' || detector === 'Bird Dog') {
        position = msCheck(90 - tilt, 30, 60);                                    // on all fours: torso flat
        // supporting hand below its shoulder and supporting knee below its hip
        var handDrop = Math.max((L(15).y - L(11).y) / torso, (L(16).y - L(12).y) / torso);
        var kneeDrop = Math.max((L(25).y - L(23).y) / torso, (L(26).y - L(24).y) / torso);
        checks.push(msCheck(Math.max(0, 0.6 - handDrop), 0, 0.5));
        checks.push(msCheck(Math.max(0, 0.6 - kneeDrop), 0, 0.5));
        if (detector === 'Cat-Cow') {
            checks.push(msCheck(Math.min(Math.abs(L(15).x - L(11).x), Math.abs(L(16).x - L(12).x)) / torso, 0.2, 0.6)); // hand under shoulder
            checks.push(msCheck(hipsLevel, 0.06, 0.25));
        } else {
            var arm = Math.max(msAngle(L(11), L(13), L(15)), msAngle(L(12), L(14), L(16)));
            var leg = Math.max(msAngle(L(23), L(25), L(27)), msAngle(L(24), L(26), L(28)));
            checks.push(msCheck(180 - arm, 20, 60));                                // reaching arm straight
            checks.push(msCheck(180 - leg, 20, 60));                                // reaching leg straight
            checks.push(msCheck(hipsLevel, 0.05, 0.2));                             // hips stay level
        }
    } else {
        checks.push(msCheck(hipsLevel, 0.05, 0.2));
        checks.push(msCheck(shouldersLevel, 0.05, 0.2));
    }

    var valid = checks.filter(function (c) { return c !== null; });
    // Half the average, half the worst check: one clearly wrong point pulls posture down
    var form = valid.length ? msMean(valid) * 0.5 + Math.min.apply(null, valid) * 0.5 : 100;
    if (position === null) position = 0;
    // Form drives the score; a wrong body position scales it down (position 100 = no change)
    var score = form * position / 100;
    return Math.round(msClamp(score));
}

// Bird Dog reach: 0 (all fours) .. 1 (arm and opposite leg fully reaching), from the larger side
function msBirdDogExtension(lm, torso) {
    var reach = function (wrist, shoulder, ankle, hip) {
        var arm = msClamp(Math.abs(wrist.x - shoulder.x) / torso / 0.9, 0, 1);
        var leg = msClamp(Math.abs(ankle.x - hip.x) / torso / 1.1, 0, 1);
        return (arm + leg) / 2;
    };
    return Math.max(reach(lm[15], lm[11], lm[28], lm[24]), reach(lm[16], lm[12], lm[27], lm[23]));
}

// Exponential smoothing so the numbers on screen don't jump every frame
function msSmooth(prev, next, alpha) {
    if (prev === null || prev === undefined || !isFinite(prev)) return next;
    return prev + (next - prev) * (alpha || 0.25);
}
`;

// Node/test helper: evaluates the same source and returns the functions
export const createMovementScoring = () =>
    // eslint-disable-next-line no-new-func
    new Function(`${MOVEMENT_SCORING_JS}
        return { MS_PROFILES: MS_PROFILES, msClamp: msClamp, msAngle: msAngle, msRomScore: msRomScore,
                 msPaceScore: msPaceScore, msSteadiness: msSteadiness, msCheck: msCheck,
                 msAlignment: msAlignment, msTorsoTilt: msTorsoTilt, msBirdDogExtension: msBirdDogExtension, msSmooth: msSmooth };`)();
