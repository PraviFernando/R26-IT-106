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

    // Call service to get fresh ranked videos using retrieved EPDS risk level
    const videos = await fetchAndRankVideos(reason, emotion, epdsRiskLevel, babyIntent, diaryText);

    return res.status(200).json(videos);
  } catch (err) {
    console.error('Error in recommendationController.getVideos:', err.message);
    return res.status(500).json({ error: 'Failed to fetch recommended videos' });
  }
};

module.exports = {
  getVideos
};
