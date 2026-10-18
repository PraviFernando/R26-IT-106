// DATABASE MODEL - one record per exercise per day (stopwatch / video / camera completion).
// Holds status, durations, adherence score (actual time / recommended time x 100), pain, difficulty,
// feeling after, and the feedback message (feedbackCode lets the app translate it to Sinhala).
// Written by saveExerciseRecord in controllers/exercise.js; read by getProgress.
const mongoose = require('mongoose');

const exerciseRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    customActivityName: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'skipped', 'restricted'], default: 'pending' },
    accuracy: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    videoUrl: { type: String },
    durationCompleted: { type: Number }, // minutes completed
    performanceMetrics: {
        postureScore: { type: Number, default: 0 },
        rangeOfMotion: { type: Number, default: 0 },
        stabilityScore: { type: Number, default: 0 }
    },
    userFeedback: { type: String },
    liked: { type: Boolean, default: null },
    actualDuration: { type: Number }, // stopwatch actual duration (minutes)
    recommendedDuration: { type: Number }, // recommended duration (minutes)
    videoDuration: { type: Number }, // total video duration (minutes)
    adherenceScore: { type: Number }, // (actualDuration / recommendedDuration) * 100
    pain: { type: String }, // "Yes" / "No"
    difficulty: { type: String }, // "Easy" / "Moderate" / "Hard"
    feelingAfter: { type: String }, // "Better" / "Same" / "Tired"
    intelligentFeedback: { type: String },
    feedbackCode: { type: String } // pain_rest | fatigue_lower | excellent (translated in the app)
}, { timestamps: true });

module.exports = mongoose.model('ExerciseRecord', exerciseRecordSchema);