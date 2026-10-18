// DATABASE MODEL - the watch history (like YouTube history).
// One row per user per video; watchPercentage is the highest point reached, completed is true at 80%.
const mongoose = require('mongoose');

const exerciseWatchHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoId: { type: String, required: true }, // YouTube id (or the URL when no id can be parsed)
    videoUrl: { type: String, required: true },
    title: { type: String },
    thumbnailUrl: { type: String },
    channelTitle: { type: String },
    category: { type: String },
    duration: { type: Number }, // recommended duration (minutes)
    watchPercentage: { type: Number, default: 0, min: 0, max: 100 }, // highest percentage reached
    lastPercentage: { type: Number, default: 0, min: 0, max: 100 }, // where the user last stopped
    watchCount: { type: Number, default: 1 },
    completed: { type: Boolean, default: false },
    watchedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// One entry per video per user; re-watching moves it back to the top
exerciseWatchHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true });
exerciseWatchHistorySchema.index({ userId: 1, watchedAt: -1 });

module.exports = mongoose.model('ExerciseWatchHistory', exerciseWatchHistorySchema);
