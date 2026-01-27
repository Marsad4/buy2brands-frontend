import api from './index';

export const getAllCatalog = async () => {
    return await api.get('/catalog');
};

export const createCatalogItem = async (itemData) => {
    return await api.post('/catalog', itemData);
};

export const updateCatalogItem = async (id, itemData) => {
    return await api.put(`/catalog/${id}`, itemData);
};

export const deleteCatalogItem = async (id) => {
    return await api.delete(`/catalog/${id}`);
};
