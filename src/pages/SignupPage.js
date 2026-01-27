import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Building, Clock, Check, AlertCircle, RefreshCw } from 'lucide-react';
import * as verificationAPI from '../api/verification.api';
import PhoneInputWithCountry from '../components/PhoneInputWithCountry';

const SignupPage = ({ onSignup, onNavigateToLogin }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Complete Registration
    const [formData, setFormData] = useState({
        email: '',
        verificationCode: '',
        firstName: '',
        lastName: '',
        contactNumber: '',
        companyName: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [canResend, setCanResend] = useState(false);

    // Countdown timer for OTP expiry
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (step === 2) {
            setCanResend(true);
        }
    }, [countdown, step]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Step 1: Send verification code
    const handleSendCode = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            setErrors({ email: 'Email is required' });
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setErrors({ email: 'Email is invalid' });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await verificationAPI.sendVerificationCode(formData.email);
            if (response.success) {
                setStep(2);
                setCountdown(15 * 60); // 15 minutes in seconds
                setCanResend(false);
            }
        } catch (error) {
            setErrors({ email: error.message || 'Failed to send verification code' });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyCode = async (e) => {
        e.preventDefault();

        if (!formData.verificationCode || formData.verificationCode.length !== 6) {
            setErrors({ verificationCode: 'Please enter the 6-digit code' });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await verificationAPI.verifyCode(formData.email, formData.verificationCode);
            if (response.success) {
                setStep(3);
            }
        } catch (error) {
            setErrors({ verificationCode: error.message || 'Invalid or expired code' });
        } finally {
            setLoading(false);
        }
    };

    // Resend verification code
    const handleResendCode = async () => {
        setLoading(true);
        setErrors({});

        try {
            const response = await verificationAPI.resendCode(formData.email);
            if (response.success) {
                setCountdown(15 * 60);
                setCanResend(false);
                setFormData(prev => ({ ...prev, verificationCode: '' }));
            }
        } catch (error) {
            setErrors({ verificationCode: error.message || 'Failed to resend code' });
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Complete registration
    const validateFinalForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.contactNumber || formData.contactNumber.length < 5) newErrors.contactNumber = 'Valid phone number is required';
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }

        return newErrors;
    };

    const handleCompleteSignup = (e) => {
        e.preventDefault();
        const newErrors = validateFinalForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSignup(formData);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-uk-navy-50 via-uk-red-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-600">
                        {step === 1 && "Let's verify your email first"}
                        {step === 2 && "Enter your verification code"}
                        {step === 3 && "Complete your registration"}
                    </p>

                    {/* Progress Indicator */}
                    <div className="flex justify-center gap-2 mt-6">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all ${s <= step ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 w-16' : 'bg-gray-300 w-8'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Email Verification */}
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSendCode}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
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
                                            placeholder="you@company.com"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send Verification Code'}
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </motion.form>
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 2 && (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyCode}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                        <Mail className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <p className="text-gray-600">
                                        We've sent a 6-digit code to<br />
                                        <strong className="text-gray-900">{formData.email}</strong>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                                        Enter Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        name="verificationCode"
                                        value={formData.verificationCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setFormData(prev => ({ ...prev, verificationCode: value }));
                                            if (errors.verificationCode) setErrors({});
                                        }}
                                        className={`w-full text-center text-3xl font-bold tracking-widest py-4 border-2 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all ${errors.verificationCode ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                        placeholder="000000"
                                        maxLength="6"
                                        autoFocus
                                    />
                                    {errors.verificationCode && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center justify-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.verificationCode}
                                        </p>
                                    )}
                                </div>

                                {/* Timer */}
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className={countdown < 60 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                        Code expires in {formatTime(countdown)}
                                    </span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading || formData.verificationCode.length !== 6}
                                    className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                    <Check className="w-5 h-5" />
                                </motion.button>

                                {/* Resend Code */}
                                <div className="text-center">
                                    {canResend ? (
                                        <button
                                            type="button"
                                            onClick={handleResendCode}
                                            disabled={loading}
                                            className="text-sm text-uk-navy-500 hover:text-uk-navy-600 font-semibold flex items-center gap-1 mx-auto"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Resend Code
                                        </button>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Didn't receive code? Resend available after timer expires
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-sm text-gray-600 hover:text-gray-800"
                                >
                                    ← Change email address
                                </button>
                            </motion.form>
                        )}

                        {/* Step 3: Complete Registration */}
                        {step === 3 && (
                            <motion.form
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleCompleteSignup}
                                className="space-y-5"
                            >
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                        <Check className="w-8 h-8 text-green-600" />
                                    </div>
                                    <p className="text-green-600 font-semibold">Email Verified!</p>
                                    <p className="text-sm text-gray-600">Complete your profile to finish</p>
                                </div>

                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all ${errors.firstName ? 'border-red-300' : 'border-gray-200'
                                                    }`}
                                                placeholder="John"
                                            />
                                        </div>
                                        {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all ${errors.lastName ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                                    </div>
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <PhoneInputWithCountry
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        error={errors.contactNumber}
                                        required
                                        label="Phone Number"
                                    />
                                </div>

                                {/* Company Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all ${errors.companyName ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                            placeholder="ABC Wholesale Ltd."
                                        />
                                    </div>
                                    {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>}
                                </div>

                                {/* Password Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Password <span className="text-red-500">*</span>
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
                                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                                                    }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                                    </div>
                                </div>

                                {/* Terms & Conditions */}
                                <div>
                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            name="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-uk-navy-500 border-gray-300 rounded focus:ring-uk-navy-500 mt-1"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">
                                            I agree to the{' '}
                                            <button type="button" className="text-uk-navy-500 hover:text-uk-navy-600 font-semibold">
                                                Terms and Conditions
                                            </button>{' '}
                                            and{' '}
                                            <button type="button" className="text-uk-navy-500 hover:text-uk-navy-600 font-semibold">
                                                Privacy Policy
                                            </button>
                                        </span>
                                    </label>
                                    {errors.agreeToTerms && <p className="mt-1 text-xs text-red-600">{errors.agreeToTerms}</p>}
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold text-lg flex items-center justify-center gap-2 mt-6"
                                >
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Login Link */}
                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-uk-navy-500 hover:text-uk-navy-600"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="mt-8 text-center text-sm text-gray-500">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
            </motion.div>
        </div>
    );
};

export default SignupPage;
