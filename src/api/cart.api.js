import api from './index';

// Get user's cart
export const getCart = async () => {
    return await api.get('/cart');
};

// Add item to cart
export const addToCart = async (item) => {
    return await api.post('/cart/add', item);
};

// Update cart item quantity
export const updateCartItem = async (cartId, quantity) => {
    return await api.put('/cart/update', { cartId, quantity });
};

// Remove item from cart
export const removeFromCart = async (cartId) => {
    return await api.delete(`/cart/remove/${cartId}`);
};

// Clear cart
export const clearCart = async () => {
    return await api.delete('/cart/clear');
};
