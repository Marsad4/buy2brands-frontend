import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle specific error cases
        if (error.response) {
            // Server responded with error
            const { status, data } = error.response;

            if (status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            return Promise.reject(data);
        } else if (error.request) {
            // Request made but no response
            return Promise.reject({
                success: false,
                message: 'No response from server. Please check your connection.'
            });
        } else {
            // Error setting up request
            return Promise.reject({
                success: false,
                message: error.message || 'An error occurred'
            });
        }
    }
);

// Export base URL for fetch-based APIs
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default api;
