import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as reviewsAPI from '../api/reviews.api';
import { useToast } from '../contexts/ToastContext';

const ReviewsSection = () => {
    const toast = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editFormData, setEditFormData] = useState({ rating: 5, comment: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewsAPI.getUserReviews();
            if (response.success && response.data) {
                setReviews(response.data.reviews || []);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (review) => {
        setEditingReviewId(review._id);
        setEditFormData({
            rating: review.rating,
            comment: review.comment
        });
    };

    const handleUpdateReview = async (reviewId) => {
        try {
            const response = await reviewsAPI.updateReview(reviewId, editFormData);
            if (response.success) {
                toast.success('Review updated successfully!');
                setEditingReviewId(null);
                setEditFormData({ rating: 5, comment: '' });
                await fetchReviews();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update review');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const response = await reviewsAPI.deleteReview(reviewId);
            if (response.success) {
                toast.success('Review deleted successfully!');
                await fetchReviews();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete review');
        }
    };

    const goToProduct = (productId, productName) => {
        const productSlug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        navigate(`/product/${productId}/${productSlug}`);
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uk-navy-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your reviews...</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Reviews</h2>
            {reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => {
                        const isEditing = editingReviewId === review._id;

                        return (
                            <div key={review._id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-uk-navy-300 transition-colors">
                                {isEditing ? (
                                    // Inline Edit Form
                                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Edit Your Review</h4>

                                        {/* Star Rating */}
                                        <div className="mb-3">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setEditFormData({ ...editFormData, rating: star })}
                                                        className="focus:outline-none"
                                                    >
                                                        <Star
                                                            className={`w-8 h-8 cursor-pointer transition-colors ${star <= editFormData.rating
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300 hover:text-yellow-200'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Comment Input */}
                                        <div className="mb-3">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
                                            <textarea
                                                value={editFormData.comment}
                                                onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                                                rows="4"
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Update your review..."
                                                minLength="10"
                                                maxLength="1000"
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleUpdateReview(review._id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setEditingReviewId(null);
                                                    setEditFormData({ rating: 5, comment: '' });
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </motion.button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        {review.product && (review.product.images?.[0]?.url || review.product.image) && (
                                            <img
                                                src={review.product.images?.[0]?.url || review.product.image}
                                                alt={review.product.name}
                                                className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => goToProduct(review.product._id, review.product.name)}
                                            />
                                        )}

                                        {/* Review Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3
                                                        className="font-bold text-gray-900 cursor-pointer hover:text-uk-navy-600 transition-colors"
                                                        onClick={() => goToProduct(review.product._id, review.product.name)}
                                                    >
                                                        {review.product?.name || 'Product'}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < review.rating
                                                                        ? 'text-yellow-400 fill-yellow-400'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleStartEdit(review)}
                                                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                                                        title="Edit review"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDeleteReview(review._id)}
                                                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                                                        title="Delete review"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 text-sm mt-2">{review.comment}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No reviews yet</p>
                    <p className="text-sm text-gray-500 mt-2">Start reviewing products you've purchased!</p>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;
