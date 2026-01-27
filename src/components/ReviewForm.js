import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';

const ReviewForm = ({ onSubmitReview, isLoggedIn }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLoggedIn) {
            setError('Please login to submit a review');
            return;
        }

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Review must be at least 10 characters');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmitReview({ rating, comment });
            // Reset form on success
            setRating(0);
            setComment('');
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 font-medium">
                    Please login to write a review
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>

            {/* Star Rating */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating *
                </label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="focus:outline-none"
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${star <= (hover || rating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        </motion.button>
                    ))}
                    {rating > 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                            {rating} out of 5 stars
                        </span>
                    )}
                </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Review *
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 resize-none"
                    maxLength={1000}
                />
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                        Minimum 10 characters
                    </span>
                    <span className="text-xs text-gray-500">
                        {comment.length}/1000
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Submit Button */}
            <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </motion.button>
        </form>
    );
};

export default ReviewForm;
