import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Package, Edit2, Trash2, Save, X } from 'lucide-react';
import ReviewForm from '../components/ReviewForm';
import ProductImageGallery from '../components/ProductImageGallery';
import * as reviewsAPI from '../api/reviews.api';
import { useToast } from '../contexts/ToastContext';

const ProductDetailPage = ({ products, onAddToCart, isLoggedIn, user }) => {
    const toast = useToast();
    const { productId } = useParams();
    const navigate = useNavigate();

    // Find product from products array using URL param
    const product = products.find(p => (p.id || p._id) === productId);

    // All hooks must be called before any conditional returns
    const [activeTab, setActiveTab] = useState('description');
    const [selectedVariants, setSelectedVariants] = useState({});
    const [packMultiplier, setPackMultiplier] = useState(0);
    const [isPackIntact, setIsPackIntact] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editFormData, setEditFormData] = useState({ rating: 5, comment: '' });

    // Check if pack is enabled (safe to call before product check)
    const hasPackConfig = product?.packConfig && product.packConfig.enabled && product.packConfig.variations && product.packConfig.variations.length > 0;

    // Initialize variants from pack when pack multiplier changes
    useEffect(() => {
        if (packMultiplier > 0 && hasPackConfig && product) {
            const packVariants = {};
            product.packConfig.variations.forEach(packVar => {
                const variantKey = `${packVar.size}-${packVar.color}`;
                packVariants[variantKey] = {
                    size: packVar.size,
                    color: packVar.color,
                    quantity: packVar.quantity * packMultiplier,
                    originalPackQty: packVar.quantity * packMultiplier
                };
            });
            setSelectedVariants(packVariants);
            setIsPackIntact(true);
        } else if (packMultiplier === 0) {
            setSelectedVariants({});
            setIsPackIntact(true);
        }
    }, [packMultiplier, product, hasPackConfig]);

    // Check if pack is still intact when variants change
    useEffect(() => {
        if (packMultiplier > 0 && hasPackConfig && product) {
            let intact = true;
            product.packConfig.variations.forEach(packVar => {
                const variantKey = `${packVar.size}-${packVar.color}`;
                const expectedQty = packVar.quantity * packMultiplier;
                const actualQty = selectedVariants[variantKey]?.quantity || 0;
                if (actualQty !== expectedQty) {
                    intact = false;
                }
            });
            setIsPackIntact(intact);
        }
    }, [selectedVariants, packMultiplier, product, hasPackConfig]);

    // Load reviews for this product (must be before conditional return)
    const loadReviews = React.useCallback(async () => {
        if (!product || !product._id) return;

        try {
            setLoadingReviews(true);
            const response = await reviewsAPI.getProductReviews(product._id);
            if (response.success) {
                setReviews(response.data.reviews || []);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    }, [product]);

    // Load reviews when product changes
    useEffect(() => {
        if (product) {
            loadReviews();
        }
    }, [product, loadReviews]);

    // Add safety check AFTER all hooks
    if (!product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-8 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
                    <button onClick={() => navigate('/products')} className="mt-4 text-uk-navy-500 hover:underline">Go back to catalogue</button>
                </div>
            </div>
        );
    }

    const handleVariantQuantityChange = (variantKey, change) => {
        // Check if this variant is part of the pack
        const isVariantInPack = hasPackConfig && packMultiplier > 0 && product.packConfig.variations.some(
            pv => `${pv.size}-${pv.color}` === variantKey
        );

        // If pack is active and this variant is NOT in the pack, disable pack discount but keep variants
        if (packMultiplier > 0 && !isVariantInPack) {
            setIsPackIntact(false);
        }

        setSelectedVariants(prev => {
            const currentQty = prev[variantKey]?.quantity || 0;
            const newQty = Math.max(0, currentQty + change);

            if (newQty === 0) {
                const { [variantKey]: removed, ...rest } = prev;
                return rest;
            }

            const variant = product.variants.find(v => `${v.size}-${v.color}` === variantKey);
            return {
                ...prev,
                [variantKey]: {
                    size: variant.size,
                    color: variant.color,
                    quantity: newQty
                }
            };
        });
    };

    const calculateTotal = () => {
        const variantQuantities = Object.values(selectedVariants);

        if (packMultiplier > 0 && isPackIntact && hasPackConfig) {
            const basePackTotal = product.packConfig.variations.reduce((sum, v) => sum + v.quantity, 0);
            const discountedPrice = product.unitPrice * (1 - product.packConfig.discountPercent / 100);
            return discountedPrice * basePackTotal * packMultiplier;
        }

        return variantQuantities.reduce((sum, variant) => {
            return sum + (product.unitPrice * variant.quantity);
        }, 0);
    };

    const calculatePackStats = () => {
        if (!hasPackConfig) return { totalItems: 0, packPrice: 0 };

        const totalItems = product.packConfig.variations.reduce((sum, v) => sum + v.quantity, 0);
        const packPrice = product.unitPrice * totalItems * (1 - product.packConfig.discountPercent / 100);

        return { totalItems, packPrice };
    };

    const handleAddToCart = () => {
        if (packMultiplier > 0 && isPackIntact && hasPackConfig) {
            const { totalItems, packPrice } = calculatePackStats();
            const totalPrice = packPrice * packMultiplier;

            onAddToCart({
                productId: product._id || product.id,
                productName: product.name,
                brand: product.brand,
                isPack: true,
                packMultiplier: packMultiplier,
                hasDiscount: true,
                discountPercent: product.packConfig.discountPercent,
                variations: product.packConfig.variations.map(v => ({
                    ...v,
                    quantity: v.quantity * packMultiplier
                })),
                quantity: packMultiplier,
                totalPrice: totalPrice,
                itemCount: totalItems * packMultiplier
            });
        } else {
            const variantQuantities = Object.values(selectedVariants);
            if (variantQuantities.length === 0) {
                toast.warning('Please select at least one variant');
                return;
            }

            onAddToCart({
                productId: product._id || product.id,
                productName: product.name,
                brand: product.brand,
                isPack: false,
                hasDiscount: false,
                variations: variantQuantities,
                totalPrice: calculateTotal()
            });
        }
    };

    // Handle review submission
    const handleSubmitReview = async (reviewData) => {
        try {
            const response = await reviewsAPI.addReview(product._id, reviewData);
            if (response.success) {
                toast.success('Review submitted successfully!');
                // Reload reviews to show the new one
                await loadReviews();
                // Optionally reload product to get updated rating
            }
        } catch (error) {
            throw error;
        }
    };

    // Handle review update
    const handleUpdateReview = async (reviewId) => {
        try {
            const response = await reviewsAPI.updateReview(reviewId, editFormData);
            if (response.success) {
                toast.success('Review updated successfully!');
                setEditingReviewId(null);
                setEditFormData({ rating: 5, comment: '' });
                await loadReviews();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update review');
        }
    };

    // Handle review delete
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const response = await reviewsAPI.deleteReview(reviewId);
            if (response.success) {
                toast.success('Review deleted successfully!');
                await loadReviews();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete review');
        }
    };

    // Start editing a review
    const handleStartEdit = (review) => {
        setEditingReviewId(review._id);
        setEditFormData({
            rating: review.rating,
            comment: review.comment
        });
    };

    const packStats = calculatePackStats();
    const tabs = [
        { id: 'description', label: 'Description' },
        { id: 'sizeChart', label: 'Size Chart' },
        { id: 'reviews', label: 'Reviews' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/products')}
                    className="flex items-center gap-2 text-gray-700 hover:text-uk-navy-500 mb-6 font-semibold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Catalogue
                </motion.button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
                        {/* Column 1: Product Image */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-2">
                                <ProductImageGallery product={product} />
                            </div>
                        </div>

                        {/* Column 2: Pack & Variants Selection */}
                        <div className="lg:col-span-1 border-l border-r border-gray-200 px-6">
                            {/* Pack Selection */}
                            {hasPackConfig && (
                                <div className="mb-6 bg-gradient-to-r from-uk-navy-50 to-uk-red-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Package className="w-5 h-5 text-blue-600" />
                                        <span className="font-bold text-gray-900">Wholesale Pack</span>
                                        <span className="ml-auto bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                                            {product.packConfig.discountPercent}% OFF
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setPackMultiplier(Math.max(0, packMultiplier - 1))}
                                            disabled={packMultiplier === 0}
                                            className="p-1 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </motion.button>
                                        <span className="w-8 text-center font-bold text-sm text-gray-900">{packMultiplier}</span>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setPackMultiplier(packMultiplier + 1)}
                                            className="p-1 rounded-lg bg-white hover:bg-gray-100 transition-colors border border-gray-300"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </motion.button>
                                        <span className="text-xs text-gray-600 ml-2">packs</span>
                                    </div>

                                    {packMultiplier > 0 && (
                                        <div className="bg-white rounded-lg p-3 text-xs space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Items per pack:</span>
                                                <span className="font-semibold">{packStats.totalItems}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total items:</span>
                                                <span className="font-semibold">{packStats.totalItems * packMultiplier}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Variant Selection */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-900 text-sm">Select Quantities</h3>
                                {product.variants.map((variant) => {
                                    const variantKey = `${variant.size}-${variant.color}`;
                                    const quantity = selectedVariants[variantKey]?.quantity || 0;
                                    const isInPack = packMultiplier > 0 && hasPackConfig && product.packConfig?.variations?.some(
                                        pv => pv.size === variant.size && pv.color === variant.color
                                    );

                                    // Disable if pack is active AND intact, but this variant is not in pack
                                    // Once pack is modified, all variants become available
                                    const isDisabled = packMultiplier > 0 && hasPackConfig && isPackIntact && !isInPack;

                                    return (
                                        <div
                                            key={variantKey}
                                            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${quantity > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                                                } ${isInPack ? 'bg-purple-50 border-purple-300' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-gray-900">Size: {variant.size}</span>
                                                    <span className="w-4 h-4 rounded-full border-2 border-gray-300" style={{ backgroundColor: variant.color.toLowerCase() }}></span>
                                                    <span className="text-sm text-gray-600">{variant.color}</span>
                                                </div>
                                                <span className="text-xs text-gray-500">Stock: {variant.stock}</span>
                                                {isDisabled && (
                                                    <span className="text-red-500 text-xs block mt-1">
                                                        Not available in selected pack
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileHover={{ scale: isDisabled ? 1 : 1.1 }}
                                                    whileTap={{ scale: isDisabled ? 1 : 0.9 }}
                                                    onClick={() => handleVariantQuantityChange(variantKey, -1)}
                                                    disabled={quantity === 0 || isDisabled}
                                                    className="p-1 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </motion.button>
                                                <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                                                <motion.button
                                                    whileHover={{ scale: isDisabled ? 1 : 1.1 }}
                                                    whileTap={{ scale: isDisabled ? 1 : 0.9 }}
                                                    onClick={() => handleVariantQuantityChange(variantKey, 1)}
                                                    disabled={quantity >= variant.stock || isDisabled}
                                                    className="p-1 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {!isPackIntact && packMultiplier > 0 && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-xs text-yellow-800">
                                        ⚠️ Pack modified - discount removed
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Column 3: Price & Add to Cart */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8 space-y-4">
                                {/* Product Title Section */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 font-semibold mb-1">{product.brand}</p>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase">{product.name}</h1>
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-5 h-5 ${i < Math.round(product.averageRating || 0)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600">({product.reviewCount || 0} reviews)</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Summary</h3>

                                    {packMultiplier > 0 && isPackIntact ? (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">Pack Price:</span>
                                                <span className="text-sm font-semibold">£{packStats.packPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">Quantity:</span>
                                                <span className="text-sm font-semibold">{packMultiplier}×</span>
                                            </div>
                                            <div className="border-t border-gray-300 my-3"></div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">Total:</span>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        £{calculateTotal().toFixed(2)}
                                                    </div>
                                                    <p className="text-xs text-gray-600">
                                                        {packStats.totalItems * packMultiplier} items
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900 mb-2">
                                                £{calculateTotal().toFixed(2)}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {Object.values(selectedVariants).reduce((sum, v) => sum + v.quantity, 0)} items selected
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddToCart}
                                    className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-4 rounded-xl hover:shadow-xl transition-all font-bold text-lg flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-2xl shadow-lg mt-8">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-8 py-4 font-semibold transition-all ${activeTab === tab.id
                                        ? 'text-uk-navy-500 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8">
                        {activeTab === 'description' && (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {product.description || `Experience premium quality with our ${product.name}. Crafted with attention to detail and using the finest materials.`}
                                </p>
                                <h4 className="font-bold text-gray-900 mt-6 mb-2">Features:</h4>
                                <ul className="list-disc list-inside text-gray-700 space-y-2">
                                    <li>Premium quality materials</li>
                                    <li>Durable and long-lasting</li>
                                    <li>Available in multiple sizes and colors</li>
                                    <li>Perfect for everyday use</li>
                                </ul>
                            </div>
                        )}

                        {activeTab === 'sizeChart' && (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Size Chart</h3>

                                {product.sizeChart && product.sizeChart.type === 'image' && product.sizeChart.imageUrl ? (
                                    // Image-based size chart
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <img
                                            src={product.sizeChart.imageUrl}
                                            alt="Size Chart"
                                            className="max-w-full h-auto rounded-lg shadow-lg"
                                        />
                                    </div>
                                ) : product.sizeChart && product.sizeChart.columns && product.sizeChart.columns.length > 0 && product.sizeChart.rows && product.sizeChart.rows.length > 0 ? (
                                    // Custom table-based size chart
                                    <div className="overflow-x-auto bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                                        <table className="min-w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-gray-100 to-blue-50">
                                                    {product.sizeChart.columns.map((col, index) => (
                                                        <th key={index} className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-900">
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {product.sizeChart.rows.map((row, rowIndex) => (
                                                    <tr key={rowIndex} className="hover:bg-uk-navy-50/30 transition-colors">
                                                        {product.sizeChart.columns.map((col, colIndex) => (
                                                            <td key={colIndex} className="border border-gray-300 px-4 py-2 text-gray-900">
                                                                {row[col] || '-'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    // Default fallback message
                                    <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                                        <p className="text-gray-500 font-semibold text-lg">No size chart available for this product</p>
                                        <p className="text-gray-400 text-sm mt-2">Please contact support for sizing information</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-5 h-5 ${i < Math.round(product.averageRating || 0)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} ({product.reviewCount || 0} reviews)
                                        </span>
                                    </div>
                                </div>

                                {/* Review Form */}
                                <div className="mb-8">
                                    <ReviewForm
                                        onSubmitReview={handleSubmitReview}
                                        isLoggedIn={isLoggedIn}
                                    />
                                </div>

                                {/* Reviews List */}
                                {loadingReviews ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Loading reviews...</p>
                                    </div>
                                ) : reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {reviews.map((review) => {
                                            const isOwnReview = user && review.user && ((review.user._id || review.user.id) === (user._id || user.id));
                                            const isEditing = editingReviewId === review._id;

                                            return (
                                                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                                                    {isEditing ? (
                                                        // Inline Edit Form
                                                        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                                                            <h4 className="font-semibold text-gray-900 mb-3">Edit Your Review</h4>

                                                            {/* Star Rating Selection */}
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
                                                        // Normal Review Display
                                                        <>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-gray-900">
                                                                        {review.user?.firstName} {review.user?.lastName}
                                                                    </span>
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
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-500">
                                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                    {isOwnReview && (
                                                                        <div className="flex gap-2 ml-4">
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.1 }}
                                                                                whileTap={{ scale: 0.9 }}
                                                                                onClick={() => handleStartEdit(review)}
                                                                                className="p-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                                                                                title="Edit review"
                                                                            >
                                                                                <Edit2 className="w-4 h-4" />
                                                                            </motion.button>
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.1 }}
                                                                                whileTap={{ scale: 0.9 }}
                                                                                onClick={() => handleDeleteReview(review._id)}
                                                                                className="p-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                                                                                title="Delete review"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </motion.button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-700">{review.comment}</p>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">No reviews yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Be the first to review this product!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;


