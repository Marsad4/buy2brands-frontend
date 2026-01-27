import api from './index';

// Create order
export const createOrder = async (orderData) => {
    return await api.post('/orders', orderData);
};

// Get user's orders
export const getUserOrders = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/orders${queryString ? `?${queryString}` : ''}`);
};

// Get order by ID
export const getOrderById = async (id) => {
    return await api.get(`/orders/${id}`);
};

// Cancel order
export const cancelOrder = async (id) => {
    return await api.delete(`/orders/${id}/cancel`);
};

// Get all orders (Admin)
export const getAllOrders = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/orders/admin/all${queryString ? `?${queryString}` : ''}`);
};

// Update order status (Admin)
export const updateOrderStatus = async (id, status, note) => {
    return await api.patch(`/orders/${id}/status`, { status, note });
};

// Delete order (Admin or User's own)
export const deleteOrder = async (id) => {
    return await api.delete(`/orders/${id}`);
};
