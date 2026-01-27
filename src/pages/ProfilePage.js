import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Building, MapPin, Package, Lock,
    Edit2, Save, X, Mail, Phone, Globe,
    RotateCcw, LogOut, Star, Check, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import * as ordersAPI from '../api/orders.api';
import * as verificationAPI from '../api/verification.api';
import * as authAPI from '../api/auth.api';
import * as returnRequestsAPI from '../api/returnRequests.api';
import { onOrderStatusUpdate } from '../api/socket';
import ReviewsSection from '../components/ReviewsSection';
import { useToast } from '../contexts/ToastContext';

// Orders Section Component
const OrdersSection = ({ user }) => {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [deletingOrderId, setDeletingOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();

        // Listen for real-time updates
        const removeListener = onOrderStatusUpdate && onOrderStatusUpdate((data) => { // Check if onOrderStatusUpdate is valid function just in case
            console.log('Order status updated (Profile):', data);
            toast.info(`Order status updated to: ${data.status}`);
            fetchOrders();
        });

        // Note: The socket.js implementation of onOrderStatusUpdate doesn't return an unsubscribe function
        // but it's good practice. Since we modified socket.js to just call socket.on, 
        // we might want to clean up manually if we could, but socket.js is a singleton wrapper.
        // For now, simple re-fetch is fine.
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getUserOrders();
            if (response.success && response.data) {
                setOrders(response.data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId, orderNumber) => {
        // Confirm cancellation
        const confirmed = window.confirm(
            `Are you sure you want to cancel order ${orderNumber}?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setCancellingOrderId(orderId);
            const response = await ordersAPI.cancelOrder(orderId);

            if (response.success) {
                toast.success(`Order ${orderNumber} has been cancelled successfully! You will receive a confirmation email shortly.`);
                // Refresh orders list
                await fetchOrders();
            } else {
                toast.error(`Failed to cancel order: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error(`Error: ${error.response?.data?.message || error.message || 'Failed to cancel order'}`);
        } finally {
            setCancellingOrderId(null);
        }
    };

    const handleDeleteOrder = async (orderId, orderNumber) => {
        // Confirm deletion
        const confirmed = window.confirm(
            `Are you sure you want to delete order ${orderNumber} from your history?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setDeletingOrderId(orderId);
            const response = await ordersAPI.deleteOrder(orderId);

            if (response.success) {
                toast.success(`Order ${orderNumber} has been deleted successfully!`);
                // Refresh orders list
                await fetchOrders();
            } else {
                toast.error(`Failed to delete order: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error(`Error: ${error.response?.data?.message || error.message || 'Failed to delete order'}`);
        } finally {
            setDeletingOrderId(null);
        }
    };

    // Check if order can be cancelled (only pending or processing)
    const canCancelOrder = (status) => {
        return status === 'pending' || status === 'processing';
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uk-navy-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id || order.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-uk-navy-300 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold text-gray-900">{order.orderId || `Order #${order._id || order.id}`}</p>
                                    <p className="text-sm text-gray-600">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Payment: <span className="capitalize">{order.paymentMethod || 'N/A'}</span>
                                    </p>
                                    {order.stripePaymentIntent && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            ID: <span className="font-mono">{order.stripePaymentIntent}</span>
                                        </p>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-uk-navy-600' :
                                        order.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                                </span>
                            </div>

                            {/* Order Items */}
                            {order.items && order.items.length > 0 && (
                                <div className="border-t border-gray-200 pt-3 mb-3">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Order Items:</p>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start text-sm mb-1">
                                            <div className="flex-1">
                                                <div className="text-gray-700 font-medium">
                                                    {item.productName}
                                                    {item.isPack ? (
                                                        <span className="text-blue-600 ml-1">
                                                            (Pack x{item.packMultiplier}) {item.hasDiscount && item.discountPercent && `(${item.discountPercent}% OFF)`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 ml-1">(x{item.quantity})</span>
                                                    )}
                                                </div>
                                                {/* Show pack breakdown */}
                                                {item.isPack && item.variations && item.variations.length > 0 && (
                                                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-2">
                                                        {item.variations.map((v, i) => (
                                                            <div key={i} className="text-xs text-gray-500 flex justify-between w-48">
                                                                <span>{v.size} / {v.color}</span>
                                                                <span>x{v.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {/* Show simple variant details if not a pack */}
                                                {!item.isPack && (item.size || item.color) && (
                                                    <div className="text-xs text-gray-500 ml-4">
                                                        {item.size && <span>Size: {item.size}</span>}
                                                        {item.size && item.color && <span className="mx-1">|</span>}
                                                        {item.color && <span>Color: {item.color}</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-semibold text-gray-900">£{(item.totalPrice || 0).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <div>
                                    <p className="font-bold text-gray-900">
                                        Total: £{order.totalAmount || order.total || 0}
                                    </p>
                                    {order.shippingAddress && (
                                        <p className="text-xs text-gray-600">
                                            Ship to: {order.shippingAddress.city}, {order.shippingAddress.state}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 items-center">
                                    {/* Cancel Button - Only show for pending/processing orders */}
                                    {canCancelOrder(order.status) && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleCancelOrder(order._id || order.id, order.orderId)}
                                            disabled={cancellingOrderId === (order._id || order.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${cancellingOrderId === (order._id || order.id)
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-red-600 text-white hover:bg-red-700'
                                                }`}
                                        >
                                            <X className="w-4 h-4" />
                                            {cancellingOrderId === (order._id || order.id) ? 'Cancelling...' : 'Cancel Order'}
                                        </motion.button>
                                    )}

                                    {/* Delete Button - Show for all orders */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDeleteOrder(order._id || order.id, order.orderId)}
                                        disabled={deletingOrderId === (order._id || order.id)}
                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-xs transition-colors ${deletingOrderId === (order._id || order.id)
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-700 text-white hover:bg-gray-800'
                                            }`}
                                        title="Delete from history"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        {deletingOrderId === (order._id || order.id) ? 'Deleting...' : 'Delete'}
                                    </motion.button>

                                    {/* Show message for non-cancellable orders */}
                                    {!canCancelOrder(order.status) && order.status !== 'cancelled' && (
                                        <p className="text-xs text-gray-500 italic">
                                            Cannot be cancelled
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No orders yet</p>
                    <p className="text-sm text-gray-500 mt-2">Start shopping to see your orders here</p>
                </div>
            )}
        </div>
    );
};


// Reusing the ForgotPasswordModal from LoginPage but with some adaptations if needed
// For now, we'll implement a dedicated flow within the Security tab
// that mimics the forgot password flow (verify email -> set new password)

const ResetPasswordFlow = ({ user, onResetSuccess, onCancel }) => {
    const [step, setStep] = useState(1); // 1: Info/Send, 2: OTP, 3: New Password
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Import these dynamically or pass as props if not available in scope
    // Assuming verificationAPI and authAPI are imported at top of file

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendCode = async () => {
        setLoading(true);
        setError('');
        try {
            // Using the verification API we created earlier
            // ensure verificationAPI is imported at the top
            await verificationAPI.sendVerificationCode(user.email);
            setStep(2);
            setCountdown(15 * 60);
        } catch (err) {
            setError(err.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (code.length !== 6) return;

        setLoading(true);
        setError('');
        try {
            await verificationAPI.verifyCode(user.email, code);
            setStep(3);
        } catch (err) {
            setError(err.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await authAPI.resetPassword(user.email, code, newPassword);
            setSuccess('Password updated successfully!');
            setTimeout(() => {
                onResetSuccess();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Reset Password via Email</h3>
                    <p className="text-sm text-gray-500">Securely reset your password using email verification.</p>
                </div>
                {step === 1 && (
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {success ? (
                <div className="text-center py-6 text-green-600">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6" />
                    </div>
                    <p className="font-semibold">{success}</p>
                </div>
            ) : (
                <>
                    {step === 1 && (
                        <div>
                            <p className="mb-4 text-sm text-gray-600">
                                We will send a verification code to <strong>{user.email}</strong> to verify your identity.
                            </p>
                            <button
                                onClick={handleSendCode}
                                disabled={loading}
                                className="bg-uk-navy-500 text-white px-6 py-2.5 rounded-xl hover:bg-uk-navy-600 font-semibold disabled:opacity-50 text-sm"
                            >
                                {loading ? 'Sending...' : 'Send Verification Code'}
                            </button>
                            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit Code</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-2 border rounded-xl tracking-widest text-lg font-bold text-center"
                                    placeholder="000000"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Expires in: {formatTime(countdown)}</span>
                                <button type="button" onClick={() => setStep(1)} className="text-uk-navy-500 hover:underline">Resend?</button>
                            </div>
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading || code.length !== 6}
                                    className="flex-1 bg-uk-navy-500 text-white py-2 rounded-xl font-semibold hover:bg-uk-navy-600 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-xl"
                                        placeholder="Min. 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-gray-400"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-xl"
                                    placeholder="Repeat password"
                                />
                            </div>
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-uk-navy-500 text-white py-2 rounded-xl font-semibold hover:bg-uk-navy-600 disabled:opacity-50"
                                >
                                    {loading ? 'Resetting...' : 'Set New Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </div>
    );
};

const ReturnRequestsSection = ({ user }) => {
    const toast = useToast();
    const [activeView, setActiveView] = useState('list'); // 'list' or 'new'
    const [requests, setRequests] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [selectedOrder, setSelectedOrder] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [requestsRes, ordersRes] = await Promise.all([
                returnRequestsAPI.getMyReturnRequests(),
                ordersAPI.getUserOrders()
            ]);

            if (requestsRes.success) setRequests(requestsRes.data || []);
            if (ordersRes.success) setOrders(ordersRes.data.orders || []);
        } catch (error) {
            console.error('Error fetching return requests data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrder || !reason) {
            toast.warning('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const response = await returnRequestsAPI.createReturnRequest({
                orderId: selectedOrder,
                reason,
                message
            });

            if (response.success) {
                toast.success('Return request submitted successfully!');
                setActiveView('list');
                fetchData();
                // Reset form
                setSelectedOrder('');
                setReason('');
                setMessage('');
            } else {
                toast.error(response.message || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Submit return request error:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-uk-navy-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Return Requests</h2>
                {activeView === 'list' && (
                    <button
                        onClick={() => setActiveView('new')}
                        className="bg-uk-navy-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-uk-navy-600 transition-colors"
                    >
                        + New Request
                    </button>
                )}
                {activeView === 'new' && (
                    <button
                        onClick={() => setActiveView('list')}
                        className="text-gray-500 hover:text-gray-700 font-semibold text-sm"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {activeView === 'new' && (
                <div className="bg-white border rounded-xl p-6 max-w-2xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Submit a Return Request</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                            <select
                                value={selectedOrder}
                                onChange={(e) => setSelectedOrder(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-uk-navy-500"
                                required
                            >
                                <option value="">Select an order...</option>
                                {orders.map(order => (
                                    <option key={order._id || order.id} value={order.orderId}>
                                        {order.orderId} - {new Date(order.createdAt).toLocaleDateString()} - £{order.totalAmount}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-uk-navy-500"
                                required
                            >
                                <option value="">Select a reason...</option>
                                <option value="Damaged">Damaged Item</option>
                                <option value="Wrong Item">Wrong Item Received</option>
                                <option value="Size Issue">Size / Fit Issue</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="3"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-uk-navy-500"
                                placeholder="Please provide more details..."
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-uk-navy-500 text-white py-2.5 rounded-lg font-semibold hover:bg-uk-navy-600 disabled:opacity-50 transition-colors"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeView === 'list' && (
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No return requests found</p>
                        </div>
                    ) : (
                        requests.map(request => (
                            <div key={request._id} className="border rounded-xl p-4 hover:border-uk-navy-300 transition-colors bg-white">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-bold text-gray-900">{request.orderId}</div>
                                        <div className="text-sm text-gray-500">Submitted on {new Date(request.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            request.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {request.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="mb-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Reason</span>
                                    <p className="text-sm font-medium text-gray-900">{request.reason}</p>
                                </div>

                                {request.message && (
                                    <div className="mb-3 bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic">
                                        "{request.message}"
                                    </div>
                                )}

                                {request.adminResponse && (
                                    <div className="mt-3 border-t pt-3">
                                        <div className="text-xs font-semibold text-uk-navy-600 mb-1">Admin Response:</div>
                                        <p className="text-sm text-gray-700">{request.adminResponse}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const ProfilePage = ({ user, onUpdateProfile, onChangePassword, onLogout }) => {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(user);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showResetFlow, setShowResetFlow] = useState(false);

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'business', label: 'Business Info', icon: Building },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'orders', label: 'My Orders', icon: Package },
        { id: 'reviews', label: 'My Reviews', icon: Star },
        { id: 'return_requests', label: 'Return Requests', icon: RotateCcw },
        { id: 'security', label: 'Security', icon: Lock }
    ];

    const handleEdit = () => {
        setIsEditing(true);
        setEditedData(user);
    };

    const handleSave = () => {
        onUpdateProfile(editedData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData(user);
    };

    const handleChange = (field, value) => {
        setEditedData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setEditedData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handlePasswordChange = (e) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match!');
            return;
        }
        onChangePassword(passwordData);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-4 sticky top-8">
                            <div className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setIsEditing(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-md'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-semibold">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-md p-8">
                            {/* Personal Information Tab */}
                            {activeTab === 'personal' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                                        {!isEditing ? (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleEdit}
                                                className="flex items-center gap-2 px-4 py-2 bg-uk-navy-500 text-white rounded-lg hover:bg-uk-navy-600"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </motion.button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleSave}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleCancel}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                value={isEditing ? editedData.firstName : user.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                value={isEditing ? editedData.lastName : user.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    disabled
                                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={isEditing ? editedData.contactNumber : user.contactNumber}
                                                    onChange={(e) => handleChange('contactNumber', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="url"
                                                    value={isEditing ? editedData.website : user.website}
                                                    onChange={(e) => handleChange('website', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Business Information Tab */}
                            {activeTab === 'business' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
                                        {!isEditing ? (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleEdit}
                                                className="flex items-center gap-2 px-4 py-2 bg-uk-navy-500 text-white rounded-lg hover:bg-uk-navy-600"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </motion.button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleSave}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleCancel}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                                            <input
                                                type="text"
                                                value={isEditing ? editedData.companyName : user.companyName}
                                                onChange={(e) => handleChange('companyName', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Description</label>
                                            <textarea
                                                value={isEditing ? editedData.businessDescription : user.businessDescription}
                                                onChange={(e) => handleChange('businessDescription', e.target.value)}
                                                disabled={!isEditing}
                                                rows="4"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Business Type</label>
                                                <select
                                                    value={isEditing ? editedData.businessType : user.businessType}
                                                    onChange={(e) => handleChange('businessType', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                >
                                                    <option value="shop">Shop</option>
                                                    <option value="online_shop">Online Shop</option>
                                                    <option value="agent">Agent</option>
                                                    <option value="store_chain">Store Chain</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Stores</label>
                                                <input
                                                    type="number"
                                                    value={isEditing ? editedData.numberOfStores : user.numberOfStores}
                                                    onChange={(e) => handleChange('numberOfStores', parseInt(e.target.value))}
                                                    disabled={!isEditing}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                                                <select
                                                    value={isEditing ? editedData.gender : user.gender}
                                                    onChange={(e) => handleChange('gender', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                >
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="unisex">Unisex</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Categories</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Clothing', 'Shoes', 'Bags', 'Accessories', 'Underwear', 'Others'].map((category) => (
                                                    <label key={category} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={(isEditing ? editedData.categories : user.categories)?.includes(category.toLowerCase())}
                                                            onChange={(e) => {
                                                                const categoryLower = category.toLowerCase();
                                                                const currentCategories = isEditing ? editedData.categories : user.categories;
                                                                const newCategories = e.target.checked
                                                                    ? [...currentCategories, categoryLower]
                                                                    : currentCategories.filter(c => c !== categoryLower);
                                                                handleChange('categories', newCategories);
                                                            }}
                                                            disabled={!isEditing}
                                                            className="w-4 h-4 text-uk-navy-500 border-gray-300 rounded focus:ring-uk-navy-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{category}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Addresses Tab */}
                            {activeTab === 'addresses' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">Address Management</h2>
                                        {!isEditing ? (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleEdit}
                                                className="flex items-center gap-2 px-4 py-2 bg-uk-navy-500 text-white rounded-lg hover:bg-uk-navy-600"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </motion.button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleSave}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleCancel}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-8">
                                        {/* Billing Address */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Billing Address</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                                                    <input
                                                        type="text"
                                                        value={isEditing ? editedData.billingAddress?.street : user.billingAddress?.street}
                                                        onChange={(e) => handleNestedChange('billingAddress', 'street', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                                    <input
                                                        type="text"
                                                        value={isEditing ? editedData.billingAddress?.city : user.billingAddress?.city}
                                                        onChange={(e) => handleNestedChange('billingAddress', 'city', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                                    <input
                                                        type="text"
                                                        value={isEditing ? editedData.billingAddress?.state : user.billingAddress?.state}
                                                        onChange={(e) => handleNestedChange('billingAddress', 'state', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                                                    <input
                                                        type="text"
                                                        value={isEditing ? editedData.billingAddress?.zipCode : user.billingAddress?.zipCode}
                                                        onChange={(e) => handleNestedChange('billingAddress', 'zipCode', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                                    <input
                                                        type="text"
                                                        value={isEditing ? editedData.billingAddress?.country : user.billingAddress?.country}
                                                        onChange={(e) => handleNestedChange('billingAddress', 'country', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dispatching Address */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Dispatching Address</h3>
                                            {isEditing && (
                                                <label className="flex items-center gap-2 mb-4">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                handleChange('dispatchingAddress', editedData.billingAddress);
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-uk-navy-500 border-gray-300 rounded focus:ring-uk-navy-500"
                                                    />
                                                    <span className="text-sm text-gray-700">Same as billing address</span>
                                                </label>
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                                                    <input
                                                        type="text"
                                                        value={isEditing ? editedData.dispatchingAddress?.street : user.dispatchingAddress?.street}
                                                        onChange={(e) => handleNestedChange('dispatchingAddress', 'street', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                                    <input
                                                        type="text"
                                                        value={isEditing ? editedData.dispatchingAddress?.city : user.dispatchingAddress?.city}
                                                        onChange={(e) => handleNestedChange('dispatchingAddress', 'city', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                                    <input
                                                        type="text"
                                                        value={isEditing ? editedData.dispatchingAddress?.state : user.dispatchingAddress?.state}
                                                        onChange={(e) => handleNestedChange('dispatchingAddress', 'state', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                                                    <input
                                                        type="text"
                                                        value={isEditing ? editedData.dispatchingAddress?.zipCode : user.dispatchingAddress?.zipCode}
                                                        onChange={(e) => handleNestedChange('dispatchingAddress', 'zipCode', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                                    <input
                                                        type="text"
                                                        value={isEditing ? editedData.dispatchingAddress?.country : user.dispatchingAddress?.country}
                                                        onChange={(e) => handleNestedChange('dispatchingAddress', 'country', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 disabled:bg-gray-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <OrdersSection user={user} />
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <ReviewsSection />
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>

                                    {/* Change Password */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500"
                                                    required
                                                />
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                className="bg-uk-navy-500 text-white px-6 py-3 rounded-xl hover:bg-uk-navy-600 font-semibold"
                                            >
                                                Change Password
                                            </motion.button>
                                        </form>
                                    </div>

                                    {/* Alternative Reset Method */}
                                    <div className="mb-8 border-t border-gray-100 pt-8">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Forgot your current password?</h3>

                                        {!showResetFlow ? (
                                            <button
                                                onClick={() => setShowResetFlow(true)}
                                                className="text-uk-navy-500 font-semibold hover:text-uk-navy-600 flex items-center gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Reset via Email Verification
                                            </button>
                                        ) : (
                                            <ResetPasswordFlow
                                                user={user}
                                                onResetSuccess={() => setShowResetFlow(false)}
                                                onCancel={() => setShowResetFlow(false)}
                                            />
                                        )}
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t-2 border-gray-200 pt-6">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onLogout}
                                            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 font-semibold"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Logout
                                        </motion.button>
                                    </div>
                                </div>
                            )}

                            {/* Return Requests Tab */}
                            {activeTab === 'return_requests' && (
                                <ReturnRequestsSection user={user} />
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ProfilePage;


