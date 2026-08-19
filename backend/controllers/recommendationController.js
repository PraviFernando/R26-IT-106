const { fetchAndRankVideos } = require('../services/youtubeService');

// In-memory cache object
const cache = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Endpoint controller to fetch, rank, and cache recommended YouTube videos.
 */
const getVideos = async (req, res, next) => {
  try {
    const { reason, emotion, riskLevel, babyIntent } = req.query;
    console.log('[DEBUG getVideos] params received:', { reason, emotion, riskLevel, babyIntent });

    // Build the cache key
    const cacheKey = `${reason || ''}_${emotion || ''}_${riskLevel || ''}_${babyIntent || ''}`;

    // Return cached results if valid
    const cachedItem = cache[cacheKey];
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL)) {
      return res.status(200).json(cachedItem.data);
    }

    // Call service to get ranked videos
    const videos = await fetchAndRankVideos(reason, emotion, riskLevel, babyIntent);

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
