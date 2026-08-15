import api from './api';

const babyActivityService = {
    // Get baby activities with optional filters
    getActivities: async (filters = {}) => {
        const response = await api.get('/baby-activity', { params: filters });
        return response.data;
    },

    // Get a single activity detail by ID
    getActivityById: async (id) => {
        const response = await api.get(`/baby-activity/${id}`);
        return response.data;
    },

    // Admin: Create activity
    createActivity: async (data) => {
        const response = await api.post('/baby-activity', data);
        return response.data;
    },

    // Admin: Update activity
    updateActivity: async (id, data) => {
        const response = await api.put(`/baby-activity/${id}`, data);
        return response.data;
    },

    // Admin: Delete activity
    deleteActivity: async (id) => {
        const response = await api.delete(`/baby-activity/${id}`);
        return response.data;
    }
};

export default babyActivityService;
