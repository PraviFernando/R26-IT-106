const { body, param, validationResult } = require('express-validator');

// Reusable validation rules
const diaryValidationRules = [
    param('date')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date must be in YYYY-MM-DD format'),

    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date must be in YYYY-MM-DD format'),

    body('content')
        .optional()
        .isString()
        .isLength({ max: 10000 })
        .withMessage('Content cannot exceed 10,000 characters'),

    body('theme')
        .optional()
        .isIn(['default', 'pastel-pink', 'ocean-blue', 'mint-green', 'warm-sunset'])
        .withMessage('Invalid theme selected'),

    body('mood')
        .optional()
        .isIn(['😊', '😌', '😔', '😪', '😠', '🌈', '🌟', '☁️'])
        .withMessage('Invalid mood'),

    body('sentiment')
        .optional()
        .isIn(['Positive Mind', 'Neutral Mind', 'Negative Mind', 'Skipped'])
        .withMessage('Invalid sentiment'),

    body('media')
        .optional()
        .isArray()
        .withMessage('Media must be an array')
        .custom((media) => {
            if (media.length > 10) throw new Error('Maximum 10 media items allowed');
            return true;
        }),
];

// Check if date is valid (today or past date, not future)
const isTodayValidation = (req, res, next) => {
    const { date } = req.body || req.params;
    if (!date) return next();

    const now = new Date();
    const utcToday = now.toISOString().split('T')[0];
    const localY = now.getFullYear();
    const localM = String(now.getMonth() + 1).padStart(2, '0');
    const localD = String(now.getDate()).padStart(2, '0');
    const localToday = `${localY}-${localM}-${localD}`;

    // If date matches local today or UTC today, allow
    if (date === utcToday || date === localToday) {
        return next();
    }

    // Only reject if the date is strictly in the future relative to both local and UTC
    if (date > localToday && date > utcToday) {
        return res.status(400).json({
            message: 'You cannot create or edit diary entries for future dates'
        });
    }
    next();
};

// Validation Result Handler
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg
        });
    }
    next();
};

module.exports = {
    diaryValidationRules,
    isTodayValidation,
    validate
};