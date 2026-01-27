import { API_BASE_URL } from './index';

// Get all reviews for a product
export const getProductReviews = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get product reviews error:', error);
        throw error;
    }
};

// Add a new review
export const addReview = async (productId, reviewData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reviewData)
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add review');
            }

            return data;
        } else {
            // If not JSON, it's probably an error page
            const text = await response.text();
            console.error('API returned HTML instead of JSON:', text);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Add review error:', error);
        throw error;
    }
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reviewData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update review');
        }

        return data;
    } catch (error) {
        console.error('Update review error:', error);
        throw error;
    }
};

// Delete a review
export const deleteReview = async (reviewId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete review');
        }

        return data;
    } catch (error) {
        console.error('Delete review error:', error);
        throw error;
    }
};

// Get all reviews by logged-in user
export const getUserReviews = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/reviews/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch user reviews');
        }

        return data;
    } catch (error) {
        console.error('Get user reviews error:', error);
        throw error;
    }
};
