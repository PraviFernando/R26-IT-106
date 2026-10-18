// DATABASE MODEL - cache of YouTube searches to save the daily API quota (see fetchQueryVideos in
// controllers/exercise.js). This is part of the answer to "what happens when the YouTube key fails".
const mongoose = require('mongoose');

// Cached YouTube search results for the exercise recommendations. A search costs 100 quota units
// (10,000 per day), so results are reused for a day, and an older copy is still used when YouTube
// refuses a request (for example when the daily quota is used up).
const youtubeSearchCacheSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // "<search text>|<max results>"
    query: { type: String },
    maxResults: { type: Number },
    videos: [{
        _id: false,
        videoId: { type: String, required: true },
        title: { type: String },
        channelTitle: { type: String },
        duration: { type: String } // "mm:ss"
    }],
    fetchedAt: { type: Date, default: Date.now }
});

// Entries are removed after 7 days; fresh for CFG.YOUTUBE_CACHE_HOURS, usable as a backup until then
youtubeSearchCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model('YoutubeSearchCache', youtubeSearchCacheSchema);
