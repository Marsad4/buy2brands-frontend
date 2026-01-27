import api from './index';

// Create a new return request
export const createReturnRequest = async (requestData) => {
    return await api.post('/return-requests', requestData);
};

// Get my return requests (User)
export const getMyReturnRequests = async () => {
    return await api.get('/return-requests/my-requests');
};

// Get all return requests (Admin)
export const getAllReturnRequests = async () => {
    return await api.get('/return-requests');
};

// Update return request status (Admin)
export const updateReturnRequestStatus = async (id, statusData) => {
    return await api.put(`/return-requests/${id}`, statusData);
};
