// Integration tests for the /exercise API. They use a temporary database
// (exercise_test_<timestamp>) on the MONGODB_URL cluster and delete it afterwards.
// YouTube is disabled so no API quota is used (the static video list is used instead).
// If the ML API (ml_training/predict_api.py) is running, predictions come from the model.
//
// Run: node --test backend/tests/exercise
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

process.env.YOUTUBE_API_KEY = ''; // set before dotenv so it is not overridden
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const EPDSScreening = require('../../models/EPDSScreening');
const exerciseRoutes = require('../../routes/exercise');

const DB_URL = process.env.MONGODB_URL || process.env.MONGO_URI;
const skip = !DB_URL || !process.env.JWT_SECRET ? 'MONGODB_URL and JWT_SECRET are required' : false;

const local = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const baseHealth = {
    date: local(0), weeksAfterDelivery: 10, deliveryType: 'normal', pelvicPain: false, backPain: false,
    abdominalPain: false, bleedingComplications: false, doctorRestrictions: false, fatigueLevel: 'low',
    mobilityLevel: 'normal', muscleWeakness: false, willingnessToExercise: 'high',
};

test('exercise API', { skip, timeout: 180000 }, async (t) => {
    const dbName = `exercise_test_${Date.now()}`;
    await mongoose.connect(DB_URL, { dbName, serverSelectionTimeoutMS: 20000 });
    assert.equal(mongoose.connection.db.databaseName, dbName);

    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/exercise', exerciseRoutes);
    app.use((err, req, res, next) => res.status(500).json({ message: err.message }));
    const server = app.listen(0);
    const base = `http://127.0.0.1:${server.address().port}`;

    const makeUser = () => {
        const id = new mongoose.Types.ObjectId();
        return { id, token: jwt.sign({ id: id.toString(), role: 'patient' }, process.env.JWT_SECRET) };
    };
    const call = async (method, url, body, user) => {
        const res = await fetch(base + url, {
            method,
            headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${user.token}` } : {}) },
            body: body ? JSON.stringify(body) : undefined,
        });
        return { status: res.status, data: await res.json().catch(() => null) };
    };
    const mlUp = await fetch('http://127.0.0.1:5001/health').then(r => r.ok).catch(() => false);

    try {
        const highRisk = makeUser();
        const lowRisk = makeUser();
        await EPDSScreening.create({ userId: highRisk.id, answers: [3, 3, 2, 2, 2, 2, 2, 2, 2, 1], totalScore: 21, riskLevel: 'high', month: 'test' });
        await EPDSScreening.create({ userId: lowRisk.id, answers: Array(10).fill(0), totalScore: 0, riskLevel: 'low', month: 'test' });

        await t.test('requires a login', async () => {
            assert.equal((await call('GET', `/exercise/recommendations/${local(0)}`)).status, 401);
        });

        await t.test('rejects invalid health data', async () => {
            assert.equal((await call('POST', '/exercise/health-data', { ...baseHealth, date: 'yesterday' }, lowRisk)).status, 400);
            assert.equal((await call('POST', '/exercise/health-data', { ...baseHealth, fatigueLevel: 'extreme' }, lowRisk)).status, 400);
            assert.equal((await call('POST', '/exercise/health-data', { ...baseHealth, weeksAfterDelivery: -3 }, lowRisk)).status, 400);
        });

        let lowRec;
        await t.test(`recommendation uses EPDS risk (${mlUp ? 'ML model' : 'rule fallback'})`, async () => {
            const high = await call('POST', '/exercise/health-data', baseHealth, highRisk);
            lowRec = await call('POST', '/exercise/health-data', baseHealth, lowRisk);
            assert.equal(high.status, 200);
            assert.equal(lowRec.status, 200);
            assert.equal(lowRec.data.predictionSource, mlUp ? 'ml_model' : 'rule_fallback');
            assert.ok(high.data.exerciseCategory <= lowRec.data.exerciseCategory, 'high EPDS risk must not get a harder category');
            assert.equal(lowRec.data.recommendedExercises.length > 0, true);
            const get = await call('GET', `/exercise/recommendations/${local(0)}`, null, lowRisk);
            assert.equal(get.data.hasData, true);
            assert.equal(get.data.predictionSource, lowRec.data.predictionSource);
        });

        await t.test('clinical safety rules only lower the level', async () => {
            const u = makeUser();
            let r = await call('POST', '/exercise/health-data', { ...baseHealth, bleedingComplications: true }, u);
            assert.equal(r.data.exerciseCategory, 1);
            assert.equal(r.data.safetyCode, 'bleeding');
            r = await call('POST', '/exercise/health-data', { ...baseHealth, deliveryType: 'c-section', weeksAfterDelivery: 3 }, u);
            assert.ok(r.data.exerciseCategory <= 2);
            r = await call('POST', '/exercise/health-data', { ...baseHealth, pelvicPain: true, backPain: true, abdominalPain: true }, u);
            assert.equal(r.data.exerciseCategory, 1);
            r = await call('POST', '/exercise/health-data', { ...baseHealth, doctorRestrictions: true }, u);
            assert.equal(r.data.safetyStatus, 'blocked');
            assert.equal(r.data.recommendedExercises.length, 0);
            const get = await call('GET', `/exercise/recommendations/${local(0)}`, null, u);
            assert.equal(get.data.recommendations.length, 0, 'blocked users must not get padded videos');
        });

        await t.test('stopwatch record, adherence cap and feedback code', async () => {
            const v = lowRec.data.recommendedExercises[0];
            let r = await call('POST', '/exercise/record', { date: local(0), customActivityName: v.customName, status: 'completed', actualDuration: 6.5, recommendedDuration: 10, pain: 'No', difficulty: 'Easy', feelingAfter: 'Better' }, lowRisk);
            assert.equal(r.status, 200);
            assert.equal(r.data.record.adherenceScore, 65);
            assert.equal(r.data.record.feedbackCode, 'excellent');
            const afterDone = await call('GET', `/exercise/recommendations/${local(0)}`, null, lowRisk);
            const doneCard = afterDone.data.recommendations.find(x => x.customName === v.customName);
            assert.equal(doneCard.completed, true, 'a completed record moves the card to the Completed tab');
            r = await call('POST', '/exercise/record', { date: local(0), customActivityName: 'over', status: 'completed', actualDuration: 30, recommendedDuration: 10, pain: 'Yes' }, lowRisk);
            assert.equal(r.data.record.adherenceScore, 100);
            assert.equal(r.data.record.feedbackCode, 'pain_rest');
            r = await call('POST', '/exercise/record', { date: local(0), customActivityName: 'auto', status: 'completed', durationCompleted: '12:34' }, lowRisk);
            assert.equal(r.status, 200, '"mm:ss" durations must not cause a 500');
            assert.equal(r.data.record.durationCompleted, 12.6);
            r = await call('POST', '/exercise/record', { date: local(0), customActivityName: v.customName, status: 'completed', durationCompleted: 2, adherenceScore: 80 }, lowRisk);
            assert.equal(r.data.record.actualDuration, 6.5, 'a later save keeps the stopwatch time');
            assert.equal((await call('POST', '/exercise/record', { date: local(0), customActivityName: 'x', difficulty: 'Impossible' }, lowRisk)).status, 400);
            assert.equal((await call('POST', '/exercise/record', { date: local(0) }, lowRisk)).status, 400);
        });

        await t.test('movement sessions are private and validated', async () => {
            const sess = { sessionId: `s_${Date.now()}`, exerciseName: 'Cat-Cow', movementScore: 82, repetitions: 7, activeDuration: 95, completed: true, difficulty: 'Moderate', postWorkoutFeeling: 'Better', averageAccuracy: 84 };
            assert.equal((await call('POST', '/exercise/movement-session', sess, lowRisk)).status, 200);
            assert.equal((await call('POST', '/exercise/movement-session', { ...sess, movementScore: 1 }, highRisk)).status, 403);
            assert.equal((await call('POST', '/exercise/movement-session', { ...sess, sessionId: 's2', movementScore: 150 }, lowRisk)).status, 400);
            const list = await call('GET', '/exercise/movement-sessions', null, lowRisk);
            assert.equal(list.data.sessions.length, 1);
            assert.equal(list.data.sessions[0].movementScore, 82);
        });

        await t.test('progress: streak, per-day points, trend code', async () => {
            const r = await call('GET', '/exercise/progress?days=30', null, lowRisk);
            assert.equal(r.status, 200);
            assert.equal(r.data.currentStreak, 1);
            assert.equal(r.data.progressData.length, 1);
            assert.equal(r.data.progressData[0].date, local(0));
            assert.equal(r.data.completedMovementSessionsCount, 1);
            assert.equal(typeof r.data.recoveryTrendCode, 'string');
        });

        await t.test('watch history', async () => {
            const r = await call('POST', '/exercise/watch-history', { videoId: 'dQw4w9WgXcQ', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Test', duration: '12:34', watchPercentage: 85, newSession: true }, lowRisk);
            assert.equal(r.status, 200);
            assert.equal(r.data.entry.duration, 13);
            assert.equal(r.data.entry.completed, true);
            assert.equal((await call('GET', '/exercise/watch-history', null, highRisk)).data.total, 0);
        });
    } finally {
        server.close();
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
    }
});
