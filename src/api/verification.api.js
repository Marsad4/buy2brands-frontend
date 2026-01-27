import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Send verification code to email
 */
export const sendVerificationCode = async (email) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/verification/send`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to send verification code' };
    }
};

/**
 * Verify the code
 */
export const verifyCode = async (email, code) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/verification/verify`, { email, code });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to verify code' };
    }
};

/**
 * Resend verification code
 */
export const resendCode = async (email) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/verification/resend`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to resend code' };
    }
};
