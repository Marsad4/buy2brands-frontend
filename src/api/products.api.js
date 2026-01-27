import api from './index';

// Get all products
export const getAllProducts = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/products${queryString ? `?${queryString}` : ''}`);
};

// Get single product
export const getProduct = async (id) => {
    return await api.get(`/products/${id}`);
};

// Search products
export const searchProducts = async (query) => {
    return await api.get(`/products/search?q=${encodeURIComponent(query)}`);
};

// Create product (Admin)
export const createProduct = async (productData) => {
    return await api.post('/products', productData);
};

// Update product (Admin)
export const updateProduct = async (id, productData) => {
    return await api.put(`/products/${id}`, productData);
};

// Delete product (Admin)
export const deleteProduct = async (id) => {
    return await api.delete(`/products/${id}`);
};

// Upload product images (Admin)
export const uploadProductImages = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('images', file);
    });

    return await api.post('/products/upload/images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

// Delete product image (Admin)
export const deleteProductImage = async (publicId) => {
    const encodedPublicId = encodeURIComponent(publicId);
    return await api.delete(`/products/images/${encodedPublicId}`);
};

// Upload size chart image (Admin)
export const uploadSizeChartImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    return await api.post('/products/upload/size-chart', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
