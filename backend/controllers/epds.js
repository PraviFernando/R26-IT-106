const EPDSScreening = require('../models/EPDSScreening');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const path = require('path');

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
//   0–9   ➜ Low
//   10–12 ➜ Medium
//   13–30 ➜ High
const getRiskLevel = (score) => {
    if (score >= 13) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
};

// ─── 2-Week Cycle Helper ─────────────────────────────────────────────────────
// Returns YYYY-MM-H1 for days 1-15, and YYYY-MM-H2 for days 16+
const getCycleStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const half = d.getDate() <= 15 ? 'H1' : 'H2';
    return `${year}-${month}-${half}`;
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

        const mlData = {
            emotional_indicators: Number(answers[0]) + Number(answers[1]) + Number(answers[7]),
            sleep_quality: Number(answers[6]),
            stress_level: Number(answers[2]) + Number(answers[5]),
            activity_level: Number(answers[1]),
            anxiety_level: Number(answers[3]) + Number(answers[4]),
            appetite_changes: 0,
            bonding_with_baby: 0,
            crying_frequency: Number(answers[8]),
            concentration_difficulty: 0,
            epds_total_score: totalScore
        };

        const pythonProcess = spawn('python', [path.join(__dirname, '../ml_model/predict.py')]);

        let pythonOutput = '';
        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
        });

        const mlPromise = new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.error('Python ML script timed out.');
                pythonProcess.kill();
                resolve(getRiskLevel(totalScore));
            }, 3000);

            pythonProcess.on('close', (code) => {
                clearTimeout(timeout);
                if (code !== 0) {
                    console.log(`Python process exited with code ${code}`);
                    return resolve(getRiskLevel(totalScore));
                }
                try {
                    const result = JSON.parse(pythonOutput);
                    if (result.error) {
                        console.error('ML Script Error:', result.error);
                        resolve(getRiskLevel(totalScore));
                    } else {
                        resolve(result.prediction.toLowerCase() === 'moderate' ? 'medium' : result.prediction.toLowerCase());
                    }
                } catch (err) {
                    console.error('Error parsing ML output:', err);
                    resolve(getRiskLevel(totalScore));
                }
            });
            pythonProcess.on('error', (err) => {
                clearTimeout(timeout);
                console.error('Python spawn error:', err);
                resolve(getRiskLevel(totalScore));
            });
        });

        pythonProcess.stdin.write(JSON.stringify(mlData));
        pythonProcess.stdin.end();

        const riskLevel = await mlPromise;
        const month = getCycleStr(); // Using 'month' field to store the 2-week cycle ID

        // Upsert: replace existing entry for this cycle if any
        const screening = await EPDSScreening.findOneAndUpdate(
            { userId, month },
            { $set: { answers, totalScore, riskLevel, month } },
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
        const month = getCycleStr();
        const screening = await EPDSScreening.findOne({ userId, month });
        return res.status(200).json(screening || null);
    } catch (err) {
        console.error('getCurrentMonth error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};

// ─── GET /epds/my-history ────────────────────────────────────────────────────
// Returns { screenings: [...] } — used by the frontend history panel
const getMyHistory = async (req, res) => {
    try {
        const userId = getUserId(req);
        const screenings = await EPDSScreening.find({ userId })
            .sort({ createdAt: -1 })
            .limit(24);
        return res.status(200).json({ screenings });
    } catch (err) {
        console.error('getMyHistory error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};

// ─── GET /epds/my-status ─────────────────────────────────────────────────────
// Returns { hasDoneCurrentCycle, nextAvailableDate, currentScreening }
// nextAvailableDate: ISO date string of when the next cycle starts
const getMyStatus = async (req, res) => {
    try {
        const userId = getUserId(req);
        const cycle = getCycleStr();
        const screening = await EPDSScreening.findOne({ userId, month: cycle });
        const hasDoneCurrentCycle = !!screening;

        // Compute next cycle start date
        const d = new Date();
        let nextDate;
        if (d.getDate() <= 15) {
            // H1 (days 1-15) → next cycle starts on the 16th
            nextDate = new Date(d.getFullYear(), d.getMonth(), 16);
        } else {
            // H2 (days 16-end) → next cycle starts on the 1st of next month
            nextDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        }

        return res.status(200).json({
            hasDoneCurrentCycle,
            nextAvailableDate: nextDate.toISOString().split('T')[0],
            currentScreening: screening || null,
        });
    } catch (err) {
        console.error('getMyStatus error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};

module.exports = { submitScreening, getHistory, getCurrentMonth, getMyHistory, getMyStatus };
