import api from './index';

// Create Payment Intent for embedded payment
export const createPaymentIntent = async (items, shippingAddress, extras = {}) => {
    const response = await api.post('/stripe/create-payment-intent', {
        items,
        shippingAddress,
        ...extras
    });
    return response;
};

// Confirm payment after successful payment
export const confirmPayment = async (paymentIntentId) => {
    const response = await api.post('/stripe/confirm-payment', {
        paymentIntentId
    });
    return response;
};

// OLD METHODS - kept for reference, can be removed later
export const createCheckoutSession = async (items, shippingAddress) => {
    const response = await api.post('/stripe/create-checkout-session', {
        items,
        shippingAddress
    });
    return response;
};

export const verifySession = async (sessionId) => {
    const response = await api.get(`/stripe/verify-session/${sessionId}`);
    return response;
};
