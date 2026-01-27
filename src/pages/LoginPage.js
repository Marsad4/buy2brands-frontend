import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, X, Clock, Check, AlertCircle, RefreshCw } from 'lucide-react';
import * as verificationAPI from '../api/verification.api';
import * as authAPI from '../api/auth.api';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Timer state
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setEmail('');
            setCode('');
            setNewPassword('');
            setConfirmPassword('');
            setError('');
            setSuccess('');
            setCountdown(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await verificationAPI.sendVerificationCode(email);
            setStep(2);
            setCountdown(15 * 60); // 15 minutes
        } catch (err) {
            setError(err.message || 'Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        // Just verify locally that code is 6 digits before moving to next step
        // OR verify with backend if you prefer strictly validating first
        if (code.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Optional: verify code API call here to fail fast
            await verificationAPI.verifyCode(email, code);
            setStep(3);
        } catch (err) {
            setError(err.message || 'Invalid or expired code');
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
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authAPI.resetPassword(email, code, newPassword);
            setSuccess('Password reset successfully! You can now login.');
            setStep(4); // Success step
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative overflow-hidden"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {step === 1 && 'Forgot Password?'}
                        {step === 2 && 'Verify Your Email'}
                        {step === 3 && 'Reset Password'}
                        {step === 4 && 'Success!'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {step === 1 && 'Enter your email to receive a verification code'}
                        {step === 2 && `Enter the code sent to ${email}`}
                        {step === 3 && 'Create a new secure password'}
                        {step === 4 && 'Your password has been updated'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Email */}
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleSendCode}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-uk-navy-500 border-gray-300"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-uk-navy-500 text-white py-2.5 rounded-xl font-semibold hover:bg-uk-navy-600 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Code'}
                            </button>
                        </motion.form>
                    )}

                    {/* Step 2: OTP */}
                    {step === 2 && (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleVerifyCode}
                            className="space-y-4"
                        >
                            <div className="flex justify-center my-4">
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    className="text-center text-3xl font-bold tracking-widest w-48 border-b-2 border-uk-navy-500 py-2 focus:outline-none"
                                    placeholder="000000"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {formatTime(countdown)}
                            </div>

                            {error && <p className="text-sm text-center text-red-600">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading || code.length !== 6}
                                className="w-full bg-uk-navy-500 text-white py-2.5 rounded-xl font-semibold hover:bg-uk-navy-600 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-gray-500 hover:text-gray-700"
                            >
                                Change Email
                            </button>
                        </motion.form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <motion.form
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleResetPassword}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2 border rounded-xl focus:ring-2 focus:ring-uk-navy-500 border-gray-300"
                                        placeholder="Min. 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-uk-navy-500 border-gray-300"
                                        placeholder="Repeat password"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-uk-navy-500 text-white py-2.5 rounded-xl font-semibold hover:bg-uk-navy-600 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </motion.form>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h3>
                            <p className="text-gray-500">Redirecting to login...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

const LoginPage = ({ onLogin, onNavigateToSignup }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onLogin(formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-uk-navy-50 via-uk-red-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">Sign in to your account to continue</p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all ${errors.email ? 'border-red-300' : 'border-gray-200'
                                        }`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all ${errors.password ? 'border-red-300' : 'border-gray-200'
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-uk-navy-500 border-gray-300 rounded focus:ring-uk-navy-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsForgotModalOpen(true)}
                                className="text-sm font-semibold text-uk-navy-500 hover:text-uk-navy-600"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold text-lg flex items-center justify-center gap-2"
                        >
                            Sign In
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-sm text-gray-500">or</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                onClick={onNavigateToSignup}
                                className="font-semibold text-uk-navy-500 hover:text-uk-navy-600"
                            >
                                Sign up for free
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="mt-8 text-center text-sm text-gray-500">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>

                {/* Forgot Password Modal */}
                <ForgotPasswordModal
                    isOpen={isForgotModalOpen}
                    onClose={() => setIsForgotModalOpen(false)}
                />
            </motion.div>
        </div>
    );
};

export default LoginPage;
