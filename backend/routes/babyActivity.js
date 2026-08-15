const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    getActivities,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity
} = require('../controllers/babyActivity');

// Mother facing routes require general authentication token verification
router.get('/', verifyToken, getActivities);
router.get('/:id', verifyToken, getActivityById);

// Admin content-management endpoints require admin permissions
router.post('/', verifyToken, verifyRole('admin'), createActivity);
router.put('/:id', verifyToken, verifyRole('admin'), updateActivity);
router.delete('/:id', verifyToken, verifyRole('admin'), deleteActivity);

module.exports = router;
