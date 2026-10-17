import api from './api';

const chatService = {
    sendMessage: async (message, sessionId, language) => {
        const response = await api.post('/chat/query', { message, sessionId, language });
        return response.data;
    },

    getHistory: async (sessionId) => {
        const response = await api.get(`/chat/history?sessionId=${sessionId}`);
        return response.data;
    },

    sendFeedback: async (messageId, rating) => {
        const response = await api.post('/chat/feedback', { messageId, rating });
        return response.data;
    },

    addRoutineItem: async (item) => {
        // Local calendar date (YYYY-MM-DD) — must match how PlanScreen builds "today"
        // (toISOString() would give the UTC date and land on the wrong day for +offset
        // timezones like Asia/Colombo late at night).
        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const response = await api.post('/plan/activity', {
            date,
            ...item,
            completed: false,
            timerSeconds: 0,
            isCustom: false,
            note: '',
        });
        return response.data;
    },

    transcribeAudio: async (audioUri) => {
        const formData = new FormData();
        formData.append('audio', { uri: audioUri, name: 'recording.m4a', type: 'audio/m4a' });
        const response = await api.post('/speech/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

export default chatService;
