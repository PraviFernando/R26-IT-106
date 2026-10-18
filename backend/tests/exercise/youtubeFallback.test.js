// YouTube failure handling and the search cache, with a faked YouTube API (no quota used).
// Uses an isolated database (exercise_yt_test_<timestamp>) that is deleted afterwards.
// Run: node --test "backend/tests/exercise/*.test.js"
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

process.env.YOUTUBE_API_KEY = 'fake-key-for-tests';
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });
process.env.YOUTUBE_API_KEY = 'fake-key-for-tests'; // never use the real key in tests

const axios = require('axios');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const YoutubeSearchCache = require('../../models/YoutubeSearchCache');
const exerciseRoutes = require('../../routes/exercise');

const DB_URL = process.env.MONGODB_URL || process.env.MONGO_URI;
const skip = !DB_URL || !process.env.JWT_SECRET ? 'MONGODB_URL and JWT_SECRET are required' : false;

// ---- fake YouTube ----
let scenario = 'ok';
let searchCalls = 0;
const quotaError = () => { const e = new Error('Request failed with status code 429'); e.response = { status: 429 }; throw e; };
const FOCUS_RE = /back pain|pelvic|c-section|diastasis|short 10|relaxing|seated/;
const fakeItems = (n, tag) => Array.from({ length: n }, (_, i) => ({
    id: { videoId: `${tag}${String(i).padStart(2, '0')}abcdefghij`.slice(0, 11) },
    snippet: { title: `${tag} video ${i}`, channelTitle: 'Test channel' },
}));
axios.get = async (url, { params }) => {
    if (url.includes('/search')) {
        searchCalls++;
        const isFocus = FOCUS_RE.test(params.q);
        if (scenario === 'all-429') quotaError();
        if (scenario === 'category-429' && !isFocus) quotaError();
        return { data: { items: fakeItems(isFocus ? 10 : 25, isFocus ? 'F' : 'C') } };
    }
    if (url.includes('/videos')) {
        return { data: { items: params.id.split(',').map(id => ({ id, contentDetails: { duration: 'PT10M' } })) } };
    }
    throw new Error('unexpected url ' + url);
};

const local = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const form = { date: local(), weeksAfterDelivery: 10, deliveryType: 'normal', backPain: true, fatigueLevel: 'low', mobilityLevel: 'normal', willingnessToExercise: 'high' };

test('YouTube failures and search cache', { skip, timeout: 180000 }, async (t) => {
    const dbName = `exercise_yt_test_${Date.now()}`;
    await mongoose.connect(DB_URL, { dbName, serverSelectionTimeoutMS: 20000 });
    assert.equal(mongoose.connection.db.databaseName, dbName);

    const app = express();
    app.use(express.json());
    app.use('/exercise', exerciseRoutes);
    app.use((err, req, res, next) => res.status(500).json({ message: err.message }));
    const server = app.listen(0);
    const base = `http://127.0.0.1:${server.address().port}`;

    const newUser = () => ({ token: jwt.sign({ id: new mongoose.Types.ObjectId().toString(), role: 'patient' }, process.env.JWT_SECRET) });
    const submit = async (user, body = form) => {
        const res = await fetch(base + '/exercise/health-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body: JSON.stringify(body),
        });
        return res.json();
    };
    const unique = (list) => new Set(list.map(v => v.videoUrl)).size === list.length;
    const clearCache = () => YoutubeSearchCache.deleteMany({});

    try {
        await t.test('every search fails (quota): full list from saved videos, no duplicates', async () => {
            await clearCache(); scenario = 'all-429';
            const r = await submit(newUser());
            assert.equal(r.recommendedExercises.length, 10);
            assert.ok(r.recommendedExercises.every(v => v.type === 'youtube_fallback'));
            assert.ok(unique(r.recommendedExercises), 'saved list must not repeat a video');
        });

        await t.test('only the category search fails: focus videos kept and the rest filled from saved videos', async () => {
            await clearCache(); scenario = 'category-429';
            const r = await submit(newUser());
            const list = r.recommendedExercises;
            assert.equal(list.length, 10, 'list must be full, not 3 videos');
            assert.ok(list.some(v => v.type === 'youtube_video' && v.focus === 'back_pain'), 'focus videos kept');
            assert.ok(list.some(v => v.type === 'youtube_fallback'), 'saved videos fill the gap');
            assert.ok(unique(list));
        });

        await t.test('a fresh search is reused: the second form submit makes no YouTube search', async () => {
            await clearCache(); scenario = 'ok'; searchCalls = 0;
            const first = await submit(newUser());
            const callsAfterFirst = searchCalls;
            assert.ok(callsAfterFirst >= 1);
            assert.equal(first.recommendedExercises.length, 10);
            const second = await submit(newUser());
            assert.equal(searchCalls, callsAfterFirst, 'cached searches must not call YouTube again');
            assert.equal(second.recommendedExercises.length, 10);
            assert.ok(second.recommendedExercises.every(v => v.type === 'youtube_video'));
        });

        await t.test('when YouTube fails, an older cached search is used instead of the saved videos', async () => {
            await clearCache(); scenario = 'ok';
            await submit(newUser()); // fills the cache
            const twoDaysAgo = new Date(Date.now() - 48 * 3600 * 1000);
            await YoutubeSearchCache.updateMany({}, { $set: { fetchedAt: twoDaysAgo } }); // stale, but still stored
            scenario = 'all-429'; searchCalls = 0;
            const r = await submit(newUser());
            assert.ok(searchCalls >= 1, 'a stale cache triggers a fresh attempt');
            assert.ok(r.recommendedExercises.every(v => v.type === 'youtube_video'), 'older results beat saved videos');
            assert.equal(r.recommendedExercises.length, 10);
        });

        await t.test('doctor-restricted users still get no videos', async () => {
            await clearCache(); scenario = 'ok';
            const r = await submit(newUser(), { ...form, doctorRestrictions: true });
            assert.equal(r.safetyStatus, 'blocked');
            assert.equal(r.recommendedExercises.length, 0);
        });
    } finally {
        server.close();
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
    }
});
