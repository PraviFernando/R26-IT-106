const mongoose = require('mongoose');

const epdsScreeningSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        answers: {
            type: [Number], // Array of 10 scores (0–3 each)
            required: true,
            validate: {
                validator: (arr) => arr.length === 10 && arr.every((v) => v >= 0 && v <= 3),
                message: 'Answers must contain exactly 10 values, each between 0 and 3.',
            },
        },
        totalScore: {
            type: Number,
            required: true,
            min: 0,
            max: 30,
        },
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high'],
            required: true,
        },
        month: {
            type: String, // 'YYYY-MM'
            required: true,
        },
    },
    { timestamps: true }
);

// One submission per user per month
epdsScreeningSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('EPDSScreening', epdsScreeningSchema);
