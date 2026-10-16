const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    submitHealthData,
    getHealthData,
    getRecommendations,
    saveExerciseRecord,
    uploadVideo,
    getProgress,
    seedExercises,
    submitFeedback,
    updateRecommendationProgress,
    saveMovementSession,
    getMovementSessions,
    upsertWatchHistory,
    getWatchHistory,
    deleteWatchHistoryItem,
    clearWatchHistory
} = require('../controllers/exercise');

// All exercise routes require authentication
router.use(verifyToken);

// Health data submission
router.post('/health-data', submitHealthData);
router.get('/health-data/:date', getHealthData);

// Recommendations
router.get('/recommendations/:date', getRecommendations);
router.post('/recommendations/progress', updateRecommendationProgress);

// Exercise records
router.post('/record', saveExerciseRecord);

// Movement sessions
router.post('/movement-session', saveMovementSession);
router.get('/movement-sessions', getMovementSessions);

// Watch history (YouTube-style)
router.post('/watch-history', upsertWatchHistory);
router.get('/watch-history', getWatchHistory);
router.delete('/watch-history/:id', deleteWatchHistoryItem);
router.delete('/watch-history', clearWatchHistory);

// Feedback submissions
router.post('/feedback', submitFeedback);

// Video upload & analysis
router.post('/video/upload', uploadVideo);

// Progress tracking
router.get('/progress', getProgress);

// Seed exercises (admin only or remove in production)
router.post('/seed', verifyRole('admin'), seedExercises);

module.exports = router;