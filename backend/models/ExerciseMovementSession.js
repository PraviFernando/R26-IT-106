const mongoose = require('mongoose');

const exerciseMovementSessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    exerciseId: { type: String },
    exerciseName: { type: String, required: true },
    movementScore: { type: Number, required: true },
    repetitions: { type: Number, required: true },
    activeDuration: { type: Number, required: true }, // in seconds
    pauseCount: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    pain: { type: Boolean, default: false },
    difficulty: { type: String, required: true }, // Easy, Moderate, Hard
    postWorkoutFeeling: { type: String, required: true }, // Better, Same, Tired
    averageAccuracy: { type: Number, default: 0 },
    correctRepetitions: { type: Number, default: 0 },
    incorrectRepetitions: { type: Number, default: 0 },
    averageRangeOfMotion: { type: Number, default: 0 },
    averageJointAccuracy: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ExerciseMovementSession', exerciseMovementSessionSchema);
