const express = require('express');
const router = express.Router();
const { submitScreening, getHistory, getCurrentMonth, getMyHistory, getMyStatus } = require('../controllers/epds');

// POST /epds/submit    — submit the 10-question EPDS form
router.post('/submit', submitScreening);

// GET  /epds/history   — last 12 months of results
router.get('/history', getHistory);

// GET  /epds/current   — this month's result (null if not done yet)
router.get('/current', getCurrentMonth);

// GET  /epds/my-history  — returns { screenings: [...] } for the frontend history panel
router.get('/my-history', getMyHistory);

// GET  /epds/my-status   — returns { hasDoneCurrentCycle, nextAvailableDate, currentScreening }
router.get('/my-status', getMyStatus);

module.exports = router;
