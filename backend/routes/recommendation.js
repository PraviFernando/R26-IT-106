const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getVideos } = require('../controllers/recommendationController');

// GET /api/recommendations/videos
router.get('/videos', verifyToken, getVideos);

module.exports = router;
