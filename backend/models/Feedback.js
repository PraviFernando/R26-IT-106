const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exerciseCategory: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
