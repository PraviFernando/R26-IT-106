const EPDSScreening = require('../models/EPDSScreening');
const User = require('../models/User');
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
const getRiskLevel = (score) => {
    if (score >= 13) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
};

// ─── 2-Week Cycle Helper ─────────────────────────────────────────────────────
const getCycleStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const half = d.getDate() <= 15 ? 'H1' : 'H2';
    return `${year}-${month}-${half}`;
};

// ─── Get Next Available Date ─────────────────────────────────────────────────
const getNextAvailableDate = () => {
    const d = new Date();
    let nextDate;
    if (d.getDate() <= 15) {
        nextDate = new Date(d.getFullYear(), d.getMonth(), 16);
    } else {
        nextDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
    return nextDate.toISOString().split('T')[0];
};

// ─── POST /epds/submit ────────────────────────────────────────────────────────
const submitScreening = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { answers, fullName, age, district, village } = req.body;

        // ─── Validate required fields ──────────────────────────────────────
        if (!answers || !Array.isArray(answers) || answers.length !== 10) {
            return res.status(400).json({
                message: 'Please provide exactly 10 answers.'
            });
        }

        // ─── Validate personal details ─────────────────────────────────────
        if (!fullName || !fullName.trim()) {
            return res.status(400).json({
                message: 'Full name is required.'
            });
        }

        if (!age) {
            return res.status(400).json({
                message: 'Age is required.'
            });
        }

        const ageNum = Number(age);
        if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
            return res.status(400).json({
                message: 'Please provide a valid age (16-100).'
            });
        }

        if (!district || !district.trim()) {
            return res.status(400).json({
                message: 'District is required.'
            });
        }

        if (!village || !village.trim()) {
            return res.status(400).json({
                message: 'Village is required.'
            });
        }

        // ─── Check if user already submitted in this cycle ────────────────
        const currentCycle = getCycleStr();
        const existingScreening = await EPDSScreening.findOne({
            userId,
            month: currentCycle
        });

        if (existingScreening) {
            const nextAvailableDate = getNextAvailableDate();
            return res.status(400).json({
                message: 'You have already completed the screening for this 2-week period.',
                nextAvailableDate: nextAvailableDate,
                alreadySubmitted: true
            });
        }

        // ─── Calculate total score ──────────────────────────────────────────
        const totalScore = answers.reduce((sum, v) => sum + Number(v), 0);

        // ─── Prepare ML data ───────────────────────────────────────────────
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

        // ─── Run ML prediction ─────────────────────────────────────────────
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
        const month = getCycleStr();

        // ─── Save screening ─────────────────────────────────────────────────
        const screening = await EPDSScreening.findOneAndUpdate(
            { userId, month },
            { $set: { answers, totalScore, riskLevel, month } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // ─── Update user profile ────────────────────────────────────────────
        await User.findByIdAndUpdate(userId, {
            fullName: fullName.trim(),
            age: ageNum,
            district: district.trim(),
            village: village.trim()
        });

        return res.status(200).json({
            screening,
            message: 'Screening saved successfully.'
        });
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
const getMyStatus = async (req, res) => {
    try {
        const userId = getUserId(req);
        const cycle = getCycleStr();
        const screening = await EPDSScreening.findOne({ userId, month: cycle });
        const hasDoneCurrentCycle = !!screening;

        const nextAvailableDate = getNextAvailableDate();

        return res.status(200).json({
            hasDoneCurrentCycle,
            nextAvailableDate: nextAvailableDate,
            currentScreening: screening || null,
        });
    } catch (err) {
        console.error('getMyStatus error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};

module.exports = {
    submitScreening,
    getHistory,
    getCurrentMonth,
    getMyHistory,
    getMyStatus
};