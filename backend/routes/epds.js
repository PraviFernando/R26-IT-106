const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { submitScreening, getHistory, getCurrentMonth } = require('../controllers/epds');

router.use(verifyToken);

// POST /epds/submit    — submit the 10-question EPDS form
router.post('/submit', submitScreening);

// GET  /epds/history   — last 12 months of results
router.get('/history', getHistory);

// GET  /epds/current   — this month's result (null if not done yet)
router.get('/current', getCurrentMonth);

module.exports = router;
