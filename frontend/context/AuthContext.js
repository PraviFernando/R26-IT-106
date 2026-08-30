import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, clearAuthToken, setUnauthorizedHandler } from '../services/api';
import { resetToLogin } from '../navigation/navigationRef';

const AuthContext = createContext(null);

// Persisted session lives here. On web this is backed by localStorage, so a
// page reload keeps the user signed in instead of dropping the in-memory token.
const STORAGE_KEY = 'auth_session';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [restoring, setRestoring] = useState(true);

    // Rehydrate a saved session once, on startup.
    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                const saved = raw ? JSON.parse(raw) : null;
                if (saved?.token) {
                    setAuthToken(saved.token);        // sync the axios interceptor
                    setToken(saved.token);
                    setUser(saved.user ?? null);
                }
            } catch (e) {
                console.warn('Failed to restore auth session:', e?.message);
            } finally {
                setRestoring(false);
            }
        })();
    }, []);

    const login = useCallback((userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        setAuthToken(authToken);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: authToken, user: userData }))
            .catch(e => console.warn('Failed to persist auth session:', e?.message));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        clearAuthToken();
        AsyncStorage.removeItem(STORAGE_KEY)
            .catch(e => console.warn('Failed to clear auth session:', e?.message));
    }, []);

    // When axios sees the token rejected mid-session, tear the session down and
    // send the user back to Login.
    useEffect(() => {
        setUnauthorizedHandler(() => {
            logout();
            resetToLogin();
        });
        return () => setUnauthorizedHandler(null);
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, token, restoring, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
