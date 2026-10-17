import axios from 'axios';
import { Platform } from 'react-native';

const PORT = '8073';

const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        return `http://10.0.2.2:${PORT}`;
    }
    return `http://localhost:${PORT}`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Module-level token store — set this after login
let _authToken = null;
export const setAuthToken = (t) => { _authToken = t; };
export const clearAuthToken = () => { _authToken = null; };

// Called when the backend rejects our token (expired / invalid). AuthContext
// registers a handler here to wipe the persisted session and bounce to Login.
let _onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { _onUnauthorized = fn; };

// Attach token to every request if available
api.interceptors.request.use((config) => {
    if (_authToken) {
        config.headers['Authorization'] = `Bearer ${_authToken}`;
    }
    return config;
});

// A 401 from the auth middleware means our session is dead — drop it.
// (Other 401s, e.g. an incorrect diary password, are left alone.)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const msg = error.response?.data?.message;
        const isSessionError =
            error.response?.status === 401 && typeof msg === 'string' && msg.startsWith('Unauthorized');
        if (isSessionError && _authToken) {
            _authToken = null;
            if (_onUnauthorized) _onUnauthorized();
        }
        return Promise.reject(error);
    }
);

export default api;
