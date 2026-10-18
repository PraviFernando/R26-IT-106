import api from './api';

// ALL API CALLS of the exercise part. Each function = one backend URL in backend/routes/exercise.js.
// The login token is added automatically by services/api.js.
const exerciseService = {
    // Submit daily health data
    submitHealthData: async (data) => {
        const response = await api.post('/exercise/health-data', data);
        return response.data;
    },
    
    // Get health data for a specific date
    getHealthData: async (date) => {
        const response = await api.get(`/exercise/health-data/${date}`);
        return response.data;
    },
    
    // Get recommendations for a date
    getRecommendations: async (date) => {
        const response = await api.get(`/exercise/recommendations/${date}`);
        return response.data;
    },
    
    // Save exercise completion record
    saveExerciseRecord: async (data) => {
        const response = await api.post('/exercise/record', data);
        return response.data;
    },
    
    // Upload video for analysis
    uploadVideo: async (data) => {
        const response = await api.post('/exercise/video/upload', data);
        return response.data;
    },
    
    // Get progress over time
    getProgress: async (days = 30) => {
        const response = await api.get(`/exercise/progress?days=${days}`);
        return response.data;
    },
    
    // Update watch progress percentage of recommendation
    updateRecommendationProgress: async (data) => {
        const response = await api.post('/exercise/recommendations/progress', data);
        return response.data;
    },

    // Save movement session
    saveMovementSession: async (data) => {
        const response = await api.post('/exercise/movement-session', data);
        return response.data;
    },

    // Get movement sessions
    getMovementSessions: async () => {
        const response = await api.get('/exercise/movement-sessions');
        return response.data;
    },

    // Add or update a watched video in the user's watch history
    saveWatchHistory: async (data) => {
        const response = await api.post('/exercise/watch-history', data);
        return response.data;
    },

    // Get watch history (newest first, paginated)
    getWatchHistory: async ({ page = 1, limit = 20, search = '' } = {}) => {
        const response = await api.get('/exercise/watch-history', { params: { page, limit, search } });
        return response.data;
    },

    // Remove one video from watch history
    deleteWatchHistoryItem: async (id) => {
        const response = await api.delete(`/exercise/watch-history/${id}`);
        return response.data;
    },

    // Clear the whole watch history
    clearWatchHistory: async () => {
        const response = await api.delete('/exercise/watch-history');
        return response.data;
    }
};

export default exerciseService;