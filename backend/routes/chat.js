const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { sendMessage, getHistory, submitFeedback } = require('../controllers/chat');

router.post('/query', verifyToken, sendMessage);
router.get('/history', verifyToken, getHistory);
router.post('/feedback', verifyToken, submitFeedback);

module.exports = router;
