import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../api/stripe.api';
import StripePaymentForm from '../components/StripePaymentForm';
import { useToast } from '../contexts/ToastContext';
import * as shippingStructuresAPI from '../api/shippingStructures.api';
import * as productsAPI from '../api/products.api';
import * as ordersAPI from '../api/orders.api';
import PhoneInputWithCountry from '../components/PhoneInputWithCountry';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const CheckoutPage = ({ cart, calculateTotal, onPlaceOrder, onBackToCart, user }) => {
    const toast = useToast();
    const [clientSecret, setClientSecret] = useState('');
    // const [paymentIntentId, setPaymentIntentId] = useState('');
    const [isLoadingIntent, setIsLoadingIntent] = useState(false);
    const [formData, setFormData] = useState({
        // Shipping Information
        fullName: '',
        email: user?.email || '', // Auto-populate from logged-in user
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [shipping, setShipping] = useState(0);
    // const [shippingStructures, setShippingStructures] = useState([]);
    // const [defaultShippingStructure, setDefaultShippingStructure] = useState(null);

    const subtotal = calculateTotal();
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // Load shipping structures and calculate shipping
    useEffect(() => {
        const calculateShippingCost = async () => {
            if (!cart || cart.length === 0) {
                setShipping(0);
                return;
            }

            try {
                // Load shipping structures
                const structuresResponse = await shippingStructuresAPI.getAllShippingStructures();
                if (structuresResponse.success) {
                    const structures = structuresResponse.data.structures || [];
                    // setShippingStructures(structures);

                    // Find default structure
                    const defaultStructure = structures.find(s => s.isDefault) || structures[0];
                    // setDefaultShippingStructure(defaultStructure);

                    // Get product details for all cart items
                    const productIds = [...new Set(cart.map(item => item.productId || item.id))];
                    const productsMap = {};

                    for (const productId of productIds) {
                        try {
                            const productResponse = await productsAPI.getProduct(productId);
                            if (productResponse.success) {
                                productsMap[productId] = productResponse.data.product;
                            }
                        } catch (error) {
                            console.error(`Error fetching product ${productId}:`, error);
                        }
                    }

                    // Group cart items by shipping structure
                    const itemsByStructure = {};
                    let totalItemCount = 0;

                    cart.forEach(item => {
                        const product = productsMap[item.productId || item.id];
                        const structureId = product?.shippingStructure || (defaultStructure?._id);
                        const itemCount = item.isPack ? (item.itemCount || item.quantity) : item.quantity;
                        // totalItemCount += itemCount;

                        if (!itemsByStructure[structureId]) {
                            itemsByStructure[structureId] = 0;
                        }
                        itemsByStructure[structureId] += itemCount;
                    });

                    // Calculate shipping for each structure group
                    let totalShipping = 0;

                    for (const [structureId, itemCount] of Object.entries(itemsByStructure)) {
                        const structure = structures.find(s => s._id === structureId) || defaultStructure;
                        if (!structure) continue;

                        // Find applicable rule
                        let applicableRule = null;
                        for (const rule of structure.rules) {
                            if (itemCount >= rule.minItems) {
                                if (rule.maxItems === null || itemCount <= rule.maxItems) {
                                    applicableRule = rule;
                                    break;
                                }
                            }
                        }

                        // If no rule found, use the last rule
                        if (!applicableRule && structure.rules.length > 0) {
                            applicableRule = structure.rules[structure.rules.length - 1];
                        }

                        if (applicableRule) {
                            if (applicableRule.isFree) {
                                // Free shipping for this group
                            } else {
                                let groupShipping = applicableRule.baseCost;

                                // Add cost for additional items
                                if (applicableRule.costPerAdditionalItem > 0 && itemCount > applicableRule.minItems) {
                                    const additionalItems = itemCount - applicableRule.minItems;
                                    groupShipping += additionalItems * applicableRule.costPerAdditionalItem;
                                }

                                totalShipping += groupShipping;
                            }
                        }
                    }

                    setShipping(totalShipping);
                }
            } catch (error) {
                console.error('Error calculating shipping:', error);
                // Fallback to default calculation
                setShipping(subtotal >= 1000 ? 0 : 50);
            }
        };

        calculateShippingCost();
    }, [cart, subtotal]);

    // Create Payment Intent when form is filled
    useEffect(() => {
        const createIntent = async () => {
            if (cart && cart.length > 0 && formData.fullName && formData.email && formData.address && formData.city && formData.zipCode) {
                setIsLoadingIntent(true);
                try {
                    const shippingAddress = {
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zipCode,
                        country: formData.country,
                        // Passing cost details inside the same object if the API library supports spreading, 
                        // BUT createPaymentIntent takes (cart, shippingAddress). 
                        // We need to modify the api call in api/stripe.api.js OR modify how we call it here.
                        // Let's check api/stripe.api.js. It sends `cart` as `items`.
                        // The backend expects { items, shippingAddress, tax, shipping }.
                    };

                    // We need to modify the arguments we pass to createPaymentIntent or modify the API wrapper.
                    // Assuming createPaymentIntent(items, shippingAddress, extras) signature update or passing object.
                    // Let's assume we update the API wrapper to accept an config object or just pass them.
                    // Current signature in CheckoutPage: createPaymentIntent(cart, shippingAddress)
                    // Let's pass them as part of shippingAddress for now IF the API blindly spreads it? 
                    // No, safe bet: update the API wrapper too.
                    const response = await createPaymentIntent(cart, shippingAddress, { tax, shipping });
                    if (response && response.clientSecret) {
                        setClientSecret(response.clientSecret);
                        // setPaymentIntentId(response.paymentIntentId);
                    }
                } catch (error) {
                    console.error('Error creating payment intent:', error);
                } finally {
                    setIsLoadingIntent(false);
                }
            }
        };

        const timeoutId = setTimeout(createIntent, 800);
        return () => clearTimeout(timeoutId);
    }, [cart, formData.fullName, formData.email, formData.address, formData.city, formData.state, formData.zipCode, formData.country, formData.phone, tax, shipping]);

    const handlePaymentSuccess = async (paymentIntent) => {
        // Prevent multiple calls
        if (isProcessing) {
            return;
        }

        try {
            setIsProcessing(true);

            // Confirm payment and create order
            const response = await confirmPayment(paymentIntent.id);

            console.log('Payment confirmation response:', response);

            if (response && response.success) {
                // Check if order exists in response
                if (response.order) {
                    // Keep processing state active until order is fully processed
                    if (onPlaceOrder) {
                        // Pass null for formData, and the order object as second argument
                        await onPlaceOrder(null, response.order);
                    }
                    // Processing state will remain active until component unmounts (navigation)
                } else {
                    // Response says success but no order - check for existing order
                    console.warn('Response success but no order object, checking for existing order...');
                    // Fall through to check for existing order below
                }
            } else {
                // Check if order might have been created anyway (race condition)
                // Try to find the order by payment intent ID
                try {
                    const ordersResponse = await ordersAPI.getUserOrders();
                    if (ordersResponse.success && ordersResponse.data) {
                        const recentOrder = ordersResponse.data.orders?.find(
                            order => order.stripePaymentIntent === paymentIntent.id
                        );
                        if (recentOrder) {
                            // Order exists! Treat as success
                            console.log('Order found after error, treating as success');
                            if (onPlaceOrder) {
                                await onPlaceOrder(null, recentOrder);
                            }
                            return; // Exit early, don't show error
                        }
                    }
                } catch (checkError) {
                    console.error('Error checking for existing order:', checkError);
                }

                setIsProcessing(false);
                toast.error('Payment successful but order creation failed. Please contact support with payment ID: ' + paymentIntent.id);
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            // Check if order might have been created anyway
            try {
                const ordersResponse = await ordersAPI.getUserOrders();
                if (ordersResponse.success && ordersResponse.data) {
                    const recentOrder = ordersResponse.data.orders?.find(
                        order => order.stripePaymentIntent === paymentIntent.id
                    );
                    if (recentOrder) {
                        // Order exists! Treat as success
                        console.log('✅ Order found after error, treating as success');
                        if (onPlaceOrder) {
                            await onPlaceOrder(null, recentOrder);
                        }
                        return; // Exit early, don't show error
                    }
                }
            } catch (checkError) {
                console.error('Error checking for existing order:', checkError);
            }

            // Check if error response actually contains order (sometimes API returns error but order exists)
            if (error.response?.data?.order) {
                console.log('✅ Order found in error response, treating as success');
                if (onPlaceOrder) {
                    await onPlaceOrder(null, error.response.data.order);
                }
                return; // Exit early, don't show error
            }

            setIsProcessing(false);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            toast.error(`Payment successful but order creation failed: ${errorMessage}. Please contact support with payment ID: ${paymentIntent.id}`);
        }
    };

    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     // Form validation only - payment handled by StripePaymentForm
    //     if (!formData.fullName || !formData.email || !formData.phone || !formData.address ||
    //         !formData.city || !formData.state || !formData.zipCode || !formData.country) {
    //         toast.warning('Please fill in all required fields');
    //         return;
    //     }
    // };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-8 relative">
            {/* Full-page preloader overlay when processing payment */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center"
                    >
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-uk-navy-500 border-t-transparent mx-auto mb-6"></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Order</h3>
                        <p className="text-gray-600 mb-4">Please wait while we confirm your payment and create your order...</p>
                        <p className="text-sm text-gray-500">Do not close this window or refresh the page</p>
                    </motion.div>
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <a
                        href="/cart"
                        className="inline-flex items-center gap-2 text-uk-navy-500 hover:text-uk-navy-600 font-semibold mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Cart
                    </a>
                    <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-600 mt-2">Complete your purchase</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Information */}
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                        {user && <span className="text-xs font-normal text-gray-500 ml-2">(From your account)</span>}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={user ? undefined : handleChange}
                                        disabled={!!user}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${user
                                            ? 'bg-gray-100 cursor-not-allowed text-gray-600 border-gray-300'
                                            : 'border-gray-200 focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500'
                                            }`}
                                        required
                                    />
                                    {user && (
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            This email cannot be changed. It's linked to your account.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <PhoneInputWithCountry
                                        name="phone"
                                        label="Phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        ZIP Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Payment Information</h2>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                        <Lock className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Payment with Stripe</h3>
                                        <p className="text-sm text-gray-700 mb-3">
                                            After clicking "Proceed to Payment", you'll be redirected to Stripe's secure checkout page to complete your payment with credit or debit card.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 border border-gray-200">
                                                🔒 SSL Encrypted
                                            </span>
                                            <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 border border-gray-200">
                                                💳 All Cards Accepted
                                            </span>
                                            <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 border border-gray-200">
                                                ✓ PCI Compliant
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            {/* Items */}
                            <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={item.cartId} className="flex justify-between text-sm">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{item.productName}</p>
                                            {item.isPack ? (
                                                <p className="text-xs text-gray-500">
                                                    {item.packMultiplier}× Pack ({item.itemCount} items)
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-500">
                                                    {item.size} / {item.color} × {item.quantity}
                                                </p>
                                            )}
                                        </div>
                                        <span className="font-semibold text-gray-900">£{item.totalPrice.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">£{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping</span>
                                    <span className="font-semibold">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            <span>£{shipping.toFixed(2)}</span>
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between text-gray-700">
                                    <span>Tax (8%)</span>
                                    <span className="font-semibold">£{tax.toFixed(2)}</span>
                                </div>

                                <div className="border-t-2 border-gray-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-900">Total</span>
                                        <span className="text-3xl font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent">
                                            £{total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>


                            {/* Stripe Payment Section */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-bold text-gray-900">Secure Payment</h3>
                                </div>

                                {clientSecret && !isLoadingIntent ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <StripePaymentForm
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                            externalProcessing={isProcessing}
                                        />
                                    </Elements>
                                ) : isLoadingIntent ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-uk-navy-500 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Preparing payment form...</p>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                        <p className="text-sm text-yellow-800">
                                            ℹ️ Please fill in all shipping information to continue with payment.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CheckoutPage;


