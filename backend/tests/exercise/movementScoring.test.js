// Tests for the camera movement scoring (frontend/utils/movementScoring.js) with simulated poses.
// Run: node --test "backend/tests/exercise/*.test.js"
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const load = async () => {
    const mod = await import(pathToFileURL(path.join(__dirname, '..', '..', '..', 'frontend', 'utils', 'movementScoring.js')).href);
    return mod.createMovementScoring();
};

// A standing body in MediaPipe image coordinates (0..1); torso length ~0.25
const standingPose = (overrides = {}) => {
    const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
    const set = (i, x, y) => { lm[i] = { x, y, visibility: 1 }; };
    set(11, 0.44, 0.30); set(12, 0.56, 0.30); // shoulders
    set(13, 0.42, 0.42); set(14, 0.58, 0.42); // elbows
    set(15, 0.42, 0.52); set(16, 0.58, 0.52); // wrists
    set(23, 0.46, 0.55); set(24, 0.54, 0.55); // hips
    set(25, 0.46, 0.70); set(26, 0.54, 0.70); // knees
    set(27, 0.46, 0.85); set(28, 0.54, 0.85); // ankles
    for (const [i, x, y] of Object.entries(overrides).map(([k, v]) => [Number(k), v[0], v[1]])) set(i, x, y);
    return lm;
};
const TORSO = 0.25;

test('steadiness: a still pelvis scores high, rocking hips score low', async () => {
    const m = await load();
    const still = m.msSteadiness(Array(60).fill(0.01), Array(60).fill(2.0));
    const jitter = m.msSteadiness(Array.from({ length: 60 }, (_, i) => 0.01 + (i % 2 ? 0.004 : -0.004)), Array.from({ length: 60 }, (_, i) => 2 + (i % 2 ? 0.01 : -0.01)));
    const rocking = m.msSteadiness(Array.from({ length: 60 }, (_, i) => Math.sin(i / 3) * 0.12), Array.from({ length: 60 }, (_, i) => 2 + Math.sin(i / 4) * 0.15));
    assert.ok(still >= 95, `still ${still}`);
    assert.ok(jitter >= 85, `small natural jitter should stay high: ${jitter}`);
    assert.ok(rocking <= 40, `rocking ${rocking}`);
    assert.ok(still > jitter && jitter > rocking);
    assert.equal(m.msSteadiness([0.01, 0.02], [1, 1]), null, 'not enough samples yet');
});

test('steadiness is no longer stuck at 100 for every exercise', async () => {
    const m = await load();
    const tilted = m.msSteadiness(Array(60).fill(0.2), Array(60).fill(2));
    assert.ok(tilted < 70, `constant hip tilt should lower steadiness: ${tilted}`);
});

test('range of motion follows how far the user actually moves', async () => {
    const m = await load();
    const squat = m.MS_PROFILES['Modified Squats'];
    assert.equal(m.msRomScore(squat, 170, 172), 0, 'standing still = no range');
    assert.ok(Math.abs(m.msRomScore(squat, 137, 172) - 50) < 2, 'half-depth squat ~50%');
    assert.equal(m.msRomScore(squat, 100, 172), 100, 'full squat');
    const bridge = m.MS_PROFILES['Glute Bridge'];
    assert.equal(m.msRomScore(bridge, 120, 170), 100);
    assert.ok(m.msRomScore(bridge, 120, 148) < 60);
    const catcow = m.MS_PROFILES['Cat-Cow'];
    assert.equal(m.msRomScore(catcow, 140, 170), 100);
    assert.ok(m.msRomScore(catcow, 150, 158) < 40);
});

test('alignment: knees over ankles vs knees caving in (squat)', async () => {
    const m = await load();
    const good = m.msAlignment('Modified Squats', standingPose(), TORSO);
    const caved = m.msAlignment('Modified Squats', standingPose({ 25: [0.52, 0.70], 26: [0.48, 0.70], 27: [0.40, 0.85], 28: [0.60, 0.85] }), TORSO);
    assert.ok(good >= 95, `good ${good}`);
    assert.ok(caved <= 40, `caved ${caved}`);
});

test('alignment: tilted hips are penalised', async () => {
    const m = await load();
    const level = m.msAlignment('Universal', standingPose(), TORSO);
    const tilted = m.msAlignment('Universal', standingPose({ 23: [0.46, 0.52], 24: [0.54, 0.60] }), TORSO);
    assert.ok(level > tilted, `${level} > ${tilted}`);
});

test('bird dog reach is continuous, not on/off', async () => {
    const m = await load();
    const tucked = m.msBirdDogExtension(standingPose(), TORSO);
    const reaching = m.msBirdDogExtension(standingPose({ 15: [0.20, 0.30], 28: [0.80, 0.55] }), TORSO);
    const half = m.msBirdDogExtension(standingPose({ 15: [0.32, 0.30], 28: [0.68, 0.55] }), TORSO);
    assert.ok(tucked < 0.2, `tucked ${tucked}`);
    assert.ok(reaching > 0.85, `reaching ${reaching}`);
    assert.ok(half > tucked && half < reaching, `half ${half}`);
});

test('pace: slow controlled reps score best', async () => {
    const m = await load();
    const p = [3, 7];
    assert.equal(m.msPaceScore(5000, p), 100);
    assert.ok(m.msPaceScore(1000, p) < 30, 'rushed rep');
    assert.ok(m.msPaceScore(12000, p) < 60, 'very slow rep');
    assert.ok(m.msPaceScore(2500, p) > m.msPaceScore(1500, p));
});

test('smoothing stops the number jumping every frame', async () => {
    const m = await load();
    let v = null;
    for (const x of [80, 20, 80, 20, 80]) v = m.msSmooth(v, x, 0.2);
    assert.ok(v > 50 && v < 80, `smoothed ${v}`);
});

// Side view on hands and knees (torso flat), MediaPipe image coordinates
const allFoursPose = () => {
    const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
    const set = (i, x, y) => { lm[i] = { x, y, visibility: 1 }; };
    set(11, 0.30, 0.45); set(12, 0.32, 0.45); // shoulders
    set(13, 0.30, 0.60); set(14, 0.32, 0.60); // elbows
    set(15, 0.30, 0.75); set(16, 0.32, 0.75); // wrists under shoulders
    set(23, 0.70, 0.45); set(24, 0.72, 0.45); // hips
    set(25, 0.70, 0.75); set(26, 0.72, 0.75); // knees under hips
    set(27, 0.90, 0.75); set(28, 0.92, 0.75); // ankles
    return lm;
};

test('posture: doing Cat-Cow while standing scores low, on all fours scores high', async () => {
    const m = await load();
    const standing = m.msAlignment('Cat-Cow', standingPose(), TORSO);
    const allFours = m.msAlignment('Cat-Cow', allFoursPose(), 0.4);
    assert.ok(standing <= 20, `standing ${standing}`);
    assert.ok(allFours >= 85, `all fours ${allFours}`);
});

test('posture: squatting while bent far forward or lying down scores low', async () => {
    const m = await load();
    const upright = m.msAlignment('Modified Squats', standingPose(), TORSO);
    const lying = m.msAlignment('Modified Squats', allFoursPose(), 0.4);
    assert.ok(upright >= 85, `upright ${upright}`);
    assert.ok(lying <= 20, `lying ${lying}`);
});

test('posture: glute bridge needs to be lying with knees bent', async () => {
    const m = await load();
    assert.ok(m.msAlignment('Glute Bridge', standingPose(), TORSO) <= 20, 'standing is wrong for a bridge');
});
