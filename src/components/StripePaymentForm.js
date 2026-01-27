import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { AlertCircle, Loader } from 'lucide-react';

const StripePaymentForm = ({ onSuccess, onError, externalProcessing = false }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Use external processing state if provided (from parent component)
    const isCurrentlyProcessing = externalProcessing || isProcessing;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isCurrentlyProcessing || !stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        try {
            // Confirm payment with Stripe
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/payment-success',
                },
                redirect: 'if_required', // Don't redirect, handle on the same page
            });

            if (error) {
                setErrorMessage(error.message);
                setIsProcessing(false);
                if (onError) onError(error);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('✅ Payment succeeded:', paymentIntent.id);
                // Don't set isProcessing to false here - let parent component handle it
                // This prevents the button from being re-enabled before order is confirmed
                if (onSuccess) onSuccess(paymentIntent);
            } else {
                // Payment not succeeded
                setIsProcessing(false);
                setErrorMessage('Payment was not completed successfully');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setErrorMessage('An unexpected error occurred');
            setIsProcessing(false);
            if (onError) onError(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Element */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>
                <PaymentElement
                    options={{
                        layout: 'tabs',
                        defaultValues: {
                            billingDetails: {
                                name: '',
                                email: ''
                            }
                        }
                    }}
                />
            </div>

            {/* Error Message */}
            {errorMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-red-900">Payment Error</p>
                        <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
                type="submit"
                disabled={!stripe || isCurrentlyProcessing}
                whileHover={{ scale: isCurrentlyProcessing ? 1 : 1.02 }}
                whileTap={{ scale: isCurrentlyProcessing ? 1 : 0.98 }}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${isCurrentlyProcessing || !stripe
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white hover:shadow-xl'
                    }`}
            >
                {isCurrentlyProcessing ? (
                    <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    'Place Order & Pay'
                )}
            </motion.button>

            {/* Security Notice */}
            <p className="text-xs text-gray-500 text-center">
                🔒 Your payment information is secure and encrypted
            </p>
        </form>
    );
};

export default StripePaymentForm;
