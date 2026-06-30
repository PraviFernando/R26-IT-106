const EPDSScreening = require('../models/EPDSScreening');
const jwt = require('jsonwebtoken');

// ─── Helper: decode JWT from Authorization header ───────────────────────────
const getUserId = (req) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new Error('No token provided');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
};

// ─── Score → Risk Level ──────────────────────────────────────────────────────
// Standard EPDS thresholds:
//   0–8   ➜ Low
//   9–12  ➜ Medium
//   13–30 ➜ High
const getRiskLevel = (score) => {
    if (score >= 13) return 'high';
    if (score >= 9) return 'medium';
    return 'low';
};

// ─── POST /epds/submit ────────────────────────────────────────────────────────
const submitScreening = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { answers, fullName, age, district, village } = req.body;

        if (!Array.isArray(answers) || answers.length !== 10) {
            return res.status(400).json({ message: 'Please provide exactly 10 answers.' });
        }

        const totalScore = answers.reduce((sum, v) => sum + Number(v), 0);
        const riskLevel = getRiskLevel(totalScore);
        const month = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

        // Upsert: replace existing entry for this month if any
        const screening = await EPDSScreening.findOneAndUpdate(
            { userId, month },
            { answers, totalScore, riskLevel, month },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Update user profile with personal details if provided
        if (fullName || age || district || village) {
            const updateFields = {};
            if (fullName) updateFields.fullName = fullName;
            if (age) updateFields.age = age;
            if (district) updateFields.district = district;
            if (village) updateFields.village = village;
            
            await require('../models/User').findByIdAndUpdate(userId, updateFields);
        }

        return res.status(200).json({ screening, message: 'Screening saved successfully.' });
    } catch (err) {
        console.error('submitScreening error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};

// ─── GET /epds/history ────────────────────────────────────────────────────────
const getHistory = async (req, res) => {
    try {
        const userId = getUserId(req);
        const history = await EPDSScreening.find({ userId }).sort({ month: -1 }).limit(12);
        return res.status(200).json(history);
    } catch (err) {
        console.error('getHistory error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};

// ─── GET /epds/current ────────────────────────────────────────────────────────
const getCurrentMonth = async (req, res) => {
    try {
        const userId = getUserId(req);
        const month = new Date().toISOString().slice(0, 7);
        const screening = await EPDSScreening.findOne({ userId, month });
        return res.status(200).json(screening || null);
    } catch (err) {
        console.error('getCurrentMonth error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};

module.exports = { submitScreening, getHistory, getCurrentMonth };
