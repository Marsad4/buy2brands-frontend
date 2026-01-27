import api from './index';

export const getAllShippingStructures = async () => {
    return await api.get('/shipping-structures');
};

export const getAllShippingStructuresAdmin = async () => {
    return await api.get('/shipping-structures/admin/all');
};

export const getShippingStructure = async (id) => {
    return await api.get(`/shipping-structures/${id}`);
};

export const createShippingStructure = async (data) => {
    return await api.post('/shipping-structures', data);
};

export const updateShippingStructure = async (id, data) => {
    return await api.put(`/shipping-structures/${id}`, data);
};

export const deleteShippingStructure = async (id) => {
    return await api.delete(`/shipping-structures/${id}`);
};

export const calculateShippingCost = async (id, itemCount) => {
    return await api.post(`/shipping-structures/${id}/calculate`, { itemCount });
};
