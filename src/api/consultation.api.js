import axios from 'axios';

const API_URL = 'http://localhost:5000/api/consultation';

/**
 * Submit a consultation request
 * @param {Object} data - Form data
 * @returns {Promise<Object>} Response data
 */
export const submitConsultation = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/request`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
