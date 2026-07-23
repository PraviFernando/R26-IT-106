const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { signup, signin, signOut, getUser, updateUser, deleteUser, saveOnboarding, addGrowthRecord } = require('../controllers/user');

// POST /user/signup
router.post('/signup', signup);

// POST /user/signin
router.post('/signin', signin);

// POST /user/signout   (using POST is common with cookies)
router.post('/signout', verifyToken, signOut);

// Profile Management
router.get('/me', verifyToken, getUser);
router.put('/me', verifyToken, updateUser);
router.delete('/me', verifyToken, deleteUser);

// POST /user/onboarding – save all 3 onboarding steps
router.post('/onboarding', verifyToken, saveOnboarding);

// POST /user/growth-record – add follow-up growth measurement
router.post('/growth-record', verifyToken, addGrowthRecord);

module.exports = router;