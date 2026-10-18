// DATABASE MODEL - the daily health form + the result of the recommendation.
// One document per mother per day (date YYYY-MM-DD). It stores the form answers, the safety result
// (safe / limited / blocked + English and Sinhala messages), where the prediction came from
// (ml_model or rule_fallback) and the list of recommended videos with their watch progress.
const mongoose = require('mongoose');

const postpartumHealthDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    deliveryDate: { type: String }, // YYYY-MM-DD
    
    // Form answers (sent to the ML model after encoding, see services/mlPredictionService.js)
    // Recovery Stage
    weeksAfterDelivery: { type: Number, required: true },
    deliveryType: { type: String, enum: ['normal', 'c-section'], required: true },
    
    // Pain Indicators
    pelvicPain: { type: Boolean, default: false },
    backPain: { type: Boolean, default: false },
    abdominalPain: { type: Boolean, default: false },
    
    // Medical Conditions
    bleedingComplications: { type: Boolean, default: false },
    doctorRestrictions: { type: Boolean, default: false },
    
    // Physical Condition
    fatigueLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    mobilityLevel: { type: String, enum: ['very_limited', 'limited', 'normal'], default: 'normal' },
    muscleWeakness: { type: Boolean, default: false },
    
    // Behavioral Readiness
    willingnessToExercise: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    
    // PPD Risk Level (received from screening module)
    ppdRiskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    
    // Diary Insights (received from diary module)
    mood: { type: String },
    sentiment: { type: String },
    stressKeywords: [{ type: String }],
    
    // Result of the clinical safety rules (controllers/exercise.js, SECTION 3)
    // Safety Evaluation Result
    safetyStatus: { type: String, enum: ['safe', 'limited', 'blocked'], default: 'safe' },
    safetyMessage: { type: String },
    safetyMessageSi: { type: String },
    predictionSource: { type: String }, // ml_model | rule_fallback
    
    // The 10 videos of the day; "focus" says why a video was chosen, completed/watchPercentage track progress
    // Recommendation Result
    recommendedExercises: [{
        exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
        customName: String,
        videoUrl: String,
        channelTitle: String,
        thumbnailUrl: String,
        type: { type: String },
        duration: String,
        category: Number,
        focus: String, // why this video was chosen: c_section | pelvic_pain | back_pain | core_weakness | low_energy | mood | limited_mobility
        completed: { type: Boolean, default: false },
        watchPercentage: { type: Number, default: 0 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('PostpartumHealthData', postpartumHealthDataSchema);