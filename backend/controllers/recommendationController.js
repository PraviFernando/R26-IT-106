const EPDSScreening = require('../models/EPDSScreening');
const { fetchAndRankVideos } = require('../services/youtubeService');

// In-memory cache object
const cache = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Endpoint controller to fetch, rank, and cache recommended YouTube videos.
 */
const getVideos = async (req, res, next) => {
  try {
    const { reason, emotion, babyIntent, diaryText } = req.query;

    // Retrieve actual stored EPDS risk level from the database for the user
    let epdsRiskLevel = req.query.riskLevel ? req.query.riskLevel.toLowerCase() : 'low';
    if (req.user && req.user.id) {
      try {
        const latestEpds = await EPDSScreening.findOne({ userId: req.user.id }).sort({ month: -1 });
        if (latestEpds && latestEpds.riskLevel) {
          epdsRiskLevel = latestEpds.riskLevel.toLowerCase();
        }
      } catch (epdsErr) {
        console.warn('[DEBUG getVideos] Could not query EPDS risk level, using default:', epdsErr.message);
      }
    }

    console.log('[DEBUG getVideos] params received & resolved:', { reason, emotion, epdsRiskLevel, babyIntent, diaryText });

    // Build the cache key
    const cacheKey = `${reason || ''}_${emotion || ''}_${epdsRiskLevel || ''}_${babyIntent || ''}_${diaryText || ''}`;

    // Return cached results if valid
    const cachedItem = cache[cacheKey];
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL)) {
      return res.status(200).json(cachedItem.data);
    }

    // Call service to get fresh ranked videos using retrieved EPDS risk level
    const videos = await fetchAndRankVideos(reason, emotion, epdsRiskLevel, babyIntent, diaryText);

    // Save to cache
    cache[cacheKey] = {
      timestamp: Date.now(),
      data: videos
    };

    return res.status(200).json(videos);
  } catch (err) {
    // Log backend error safely
    console.error('Error in recommendationController.getVideos:', err.message);

    // Return 500 error to allow frontend to show empty state/retry option
    return res.status(500).json({ error: 'Failed to fetch recommended videos' });
  }
};

module.exports = {
  getVideos
};
