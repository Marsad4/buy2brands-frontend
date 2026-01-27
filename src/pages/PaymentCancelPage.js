import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ShoppingCart } from 'lucide-react';

const PaymentCancelPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
                >
                    {/* Cancel Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6"
                    >
                        <XCircle className="w-16 h-16 text-red-600" />
                    </motion.div>

                    {/* Cancel Message */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Payment Cancelled
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Your payment was not completed. Your cart items are still saved.
                    </p>

                    {/* Information Box */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-left">
                        <div className="flex items-start gap-3">
                            <RefreshCw className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">What Happened?</h3>
                                <p className="text-sm text-gray-700 mb-3">
                                    The payment process was cancelled. This could be because:
                                </p>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-600 mt-0.5">•</span>
                                        <span>You clicked the back button on the payment page</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-600 mt-0.5">•</span>
                                        <span>You decided not to complete the purchase</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-600 mt-0.5">•</span>
                                        <span>There was a technical issue</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Reassurance */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
                        <p className="text-sm text-green-800">
                            ✓ Don't worry! Your cart items are still saved and no charges were made.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/cart')}
                            className="px-6 py-3 bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Return to Cart
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
                        >
                            Back to Home
                        </motion.button>
                    </div>

                    {/* Support Link */}
                    <p className="text-sm text-gray-500 mt-8">
                        Need help? <button onClick={() => navigate('/contact')} className="text-uk-navy-500 hover:underline font-semibold">Contact Support</button>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentCancelPage;
