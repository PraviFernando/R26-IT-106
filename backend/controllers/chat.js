const crypto = require('crypto');
const ChatMessage = require('../models/ChatMessage');
const riskLevelService = require('../services/rag/riskLevelService');
const generationService = require('../services/rag/generationService');
const { containsSinhalaScript } = require('../services/rag/scriptDetect');
const { GENERATION } = require('../config/ragConfig');

// Crisis-triggering messages are never stored verbatim — isCrisis/timestamp/session are
// still fully preserved on both docs for potential future review, just not the raw text.
const CRISIS_CONTENT_PLACEHOLDER = '[message withheld — crisis safety response triggered]';

const SUPPORTED_LANGUAGES = ['en', 'si'];

// POST /chat/query
const sendMessage = async (req, res, next) => {
    try {
        const { message, sessionId: bodySessionId, language: bodyLanguage } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ message: 'message is required' });
        }

        const toggleLanguage = SUPPORTED_LANGUAGES.includes(bodyLanguage) ? bodyLanguage : 'en';
        // Sinhala-script input always wins over the toggle (an unambiguous, deliberate signal
        // the user is writing in Sinhala right now) — but plain English input does NOT downgrade
        // an explicit Sinhala toggle preference, since a Sinhala-preferring user might still type
        // an English term mid-message without wanting the whole reply to flip languages.
        const language = containsSinhalaScript(message) ? 'si' : toggleLanguage;

        const userId = req.user.id;
        const sessionId = bodySessionId || crypto.randomUUID();

        const riskLevel = await riskLevelService.getRiskLevel(userId);

        const recent = await ChatMessage.find({ userId, sessionId })
            .sort({ createdAt: -1 })
            .limit(GENERATION.HISTORY_MAX_TURNS)
            .lean();
        const history = recent.reverse().map((m) => ({ role: m.role, content: m.content }));

        const result = await generationService.generateReply({ query: message, riskLevel, history, language });

        await ChatMessage.create({
            userId,
            sessionId,
            role: 'user',
            content: result.isCrisis ? CRISIS_CONTENT_PLACEHOLDER : message,
            isCrisis: result.isCrisis,
        });
        const assistantDoc = await ChatMessage.create({
            userId,
            sessionId,
            role: 'assistant',
            content: result.answer, // the crisis template itself is never sensitive — stored as-is
            sources: result.sources,
            riskLevelUsed: riskLevel,
            category: result.category,
            guardrailZone: result.guardrailZone,
            isCrisis: result.isCrisis,
        });

        res.status(200).json({
            sessionId,
            messageId: assistantDoc._id,
            reply: result.answer,
            sources: result.sources,
            riskLevelUsed: riskLevel,
            category: result.category,
            guardrailZone: result.guardrailZone,
            isCrisis: result.isCrisis,
            suggestedRoutineItems: result.suggestedRoutineItems,
        });
    } catch (err) {
        next(err);
    }
};

// GET /chat/history?sessionId=...
const getHistory = async (req, res, next) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            return res.status(400).json({ message: 'sessionId is required' });
        }

        const userId = req.user.id;
        const messages = await ChatMessage.find({ userId, sessionId }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        next(err);
    }
};

// POST /chat/feedback
const submitFeedback = async (req, res, next) => {
    try {
        const { messageId, rating } = req.body;

        if (!messageId || !['up', 'down'].includes(rating)) {
            return res.status(400).json({ message: 'messageId and rating ("up" or "down") are required' });
        }

        const userId = req.user.id;
        const chatMessage = await ChatMessage.findOneAndUpdate(
            { _id: messageId, userId, role: 'assistant' },
            { feedback: rating },
            { new: true }
        );

        if (!chatMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Feedback recorded', chatMessage });
    } catch (err) {
        next(err);
    }
};

module.exports = { sendMessage, getHistory, submitFeedback };
