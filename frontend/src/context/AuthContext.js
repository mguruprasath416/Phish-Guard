import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

// Add request interceptor to attach JWT token to all API calls
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('phishing_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('phishing_user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            localStorage.setItem('phishing_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('phishing_user');
        }
    }, [user]);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem('phishing_token');
                    localStorage.removeItem('phishing_user');
                    setUser(null);
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const clearError = () => setError(null);

    // ── Register ──────────────────────────────────────────────────────────────
    const register = async (name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/auth/register', { name, email, password });
            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message,
                    devToken: response.data.devToken
                };
            }
            throw new Error(response.data.error || 'Registration failed');
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    // ── Verify Email (token from URL) ──────────────────────────────────────────
    const verifyEmailToken = async (token) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/auth/verify-email/${token}`);
            if (response.data.success) {
                return { success: true, message: response.data.message };
            }
            throw new Error(response.data.error || 'Verification failed');
        } catch (err) {
            const errData = err.response?.data;
            const msg = errData?.error || err.message;
            setError(msg);
            return { success: false, error: msg, expired: errData?.expired };
        } finally {
            setLoading(false);
        }
    };

    // ── Resend Verification ────────────────────────────────────────────────────
    const resendVerification = async (email) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/auth/resend-verification', { email });
            return {
                success: true,
                message: response.data.message,
                devToken: response.data.devToken
            };
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    // ── Login ──────────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            if (response.data.success) {
                localStorage.setItem('phishing_token', response.data.token); // Store token
                setUser(response.data.user);
                return { success: true };
            }
            throw new Error(response.data.error || 'Login failed');
        } catch (err) {
            const errData = err.response?.data;
            const msg = errData?.error || err.message;
            setError(msg);
            return {
                success: false,
                error: msg,
                requiresVerification: errData?.requiresVerification,
                email: errData?.email
            };
        } finally {
            setLoading(false);
        }
    };

    // ── Logout ─────────────────────────────────────────────────────────────────
    const logout = async () => {
        try {
            if (user) {
                await axios.post('/api/auth/logout', { email: user.email });
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('phishing_token'); // Remove token
            setUser(null);
        }
    };

    // ── Google Login ───────────────────────────────────────────────────────────
    const googleLogin = async (idToken) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/auth/google', { idToken });
            if (response.data.success) {
                localStorage.setItem('phishing_token', response.data.token);
                setUser(response.data.user);
                return { success: true };
            }
            throw new Error(response.data.error || 'Google Login failed');
        } catch (err) {
            const errData = err.response?.data;
            const msg = errData?.error || err.message;
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user, loading, error, clearError,
            register, verifyEmailToken, resendVerification, login, logout, googleLogin,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
