import api from './index';

// Get user profile
export const getProfile = async () => {
    return await api.get('/users/profile');
};

// Update user profile
export const updateProfile = async (profileData) => {
    return await api.put('/users/profile', profileData);
};

// Change password
export const changePassword = async (passwordData) => {
    return await api.post('/users/change-password', passwordData);
};

// Get order history
export const getOrderHistory = async () => {
    return await api.get('/users/orders');
};

// Admin: Get all users
export const getAllUsers = async () => {
    return await api.get('/users');
};

// Admin: Create new user
export const createUser = async (userData) => {
    return await api.post('/users', userData);
};

// Admin: Update user role
export const updateUserRole = async (userId, role) => {
    return await api.put(`/users/${userId}/role`, { role });
};

// Admin: Delete user
export const deleteUser = async (userId) => {
    return await api.delete(`/users/${userId}`);
};
