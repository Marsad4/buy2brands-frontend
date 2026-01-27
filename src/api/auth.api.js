import api from './index';

// Signup
export const signup = async (userData) => {
    return await api.post('/auth/signup', userData);
};

// Login
export const login = async (credentials) => {
    return await api.post('/auth/login', credentials);
};

// Logout
export const logout = async () => {
    return await api.post('/auth/logout');
};

// Get current user
export const getMe = async () => {
    return await api.get('/auth/me');
};

// Refresh token
export const refreshToken = async (refreshToken) => {
    return await api.post('/auth/refresh-token', { refreshToken });
};

// Reset password
export const resetPassword = async (email, code, newPassword) => {
    return await api.post('/auth/reset-password', { email, code, newPassword });
};
