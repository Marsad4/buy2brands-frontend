import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { verifySession } from '../api/stripe.api';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [isVerifying, setIsVerifying] = useState(true);
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                console.error('No session ID found');
                setIsVerifying(false);
                return;
            }

            try {
                console.log('Verifying session:', sessionId);
                const response = await verifySession(sessionId);
                console.log('Verification response:', response);

                if (response && response.order) {
                    setOrder(response.order);
                }
            } catch (error) {
                console.error('Error verifying session:', error);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyPayment();
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {isVerifying ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
                    >
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-uk-navy-500 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Order...</h2>
                        <p className="text-gray-600">Please wait while we confirm your payment</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
                    >
                        {/* Success Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <CheckCircle className="w-16 h-16 text-green-600" />
                        </motion.div>

                        {/* Success Message */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Payment Successful!
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Your order has been confirmed and is being processed.
                        </p>

                        {/* Session Info */}
                        {sessionId && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-8">
                                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                                <p className="text-xs font-mono text-gray-700 break-all">{sessionId}</p>
                            </div>
                        )}

                        {/* What's Next */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                            <div className="flex items-start gap-3 mb-4">
                                <Package className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">What's Next?</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>You'll receive an order confirmation email shortly</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>Track your order status in your account</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>We'll notify you when your order ships</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/profile')}
                                className="px-6 py-3 bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                View My Orders
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
                            >
                                Continue Shopping
                            </motion.button>
                        </div>

                        {/* Thank You Note */}
                        <p className="text-sm text-gray-500 mt-8">
                            Thank you for your business! 🎉
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
