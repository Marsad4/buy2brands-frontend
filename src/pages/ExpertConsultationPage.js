import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, Clock, CheckCircle, User, MessageSquare, Briefcase, AlertCircle, TrendingUp } from 'lucide-react';
import * as consultationAPI from '../api/consultation.api';
import { useToast } from '../contexts/ToastContext';
import PhoneInputWithCountry from '../components/PhoneInputWithCountry';

const ExpertConsultationPage = ({ user }) => {
    const toast = useToast();

    // Helper to get user's name
    const getUserName = (u) => {
        if (!u) return '';
        if (u.name) return u.name;
        if (u.fullName) return u.fullName;
        if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
        if (u.firstName) return u.firstName;
        return '';
    };

    const [formData, setFormData] = useState({
        name: getUserName(user),
        email: user ? user.email : '',
        phone: '',
        company: user ? user.companyName || '' : '',
        message: '',
        consultationType: 'general'
    });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Update form if user logs in/out
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || prev.email,
                name: getUserName(user) || prev.name,
                company: user.companyName || prev.company
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await consultationAPI.submitConsultation(formData);
            if (response.success) {
                setSubmitted(true);
                toast.success('Consultation request submitted successfully!');
                setTimeout(() => {
                    setSubmitted(false);
                    setFormData({
                        name: user ? user.name : '',
                        email: user ? user.email : '',
                        phone: '',
                        company: '',
                        message: '',
                        consultationType: 'general'
                    });
                }, 5000);
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.message || 'Failed to submit request. Please try again.');
            toast.error(err.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError(null);
    };

    const services = [
        {
            icon: Briefcase,
            title: 'Wholesale Strategy',

            description: 'Get expert advice on building and scaling your wholesale business operations.',
            color: 'blue'
        },
        {
            icon: MessageSquare,
            title: 'Product Selection',
            description: 'Learn which products are best suited for your target market and business model.',
            color: 'purple'
        },
        {
            icon: CheckCircle,
            title: 'Order Optimization',
            description: 'Optimize your ordering process, quantities, and inventory management strategies.',
            color: 'green'
        }
    ];



    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl font-bold mb-6">Expert Consultation Services</h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Get personalized guidance from our wholesale experts to grow your business and optimize your operations
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Consultation Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services.map((service, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
                            >
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r from-${service.color}-500 to-${service.color}-600 flex items-center justify-center mb-6`}>
                                    <service.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                                <p className="text-gray-600">{service.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Request a Consultation</h2>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                                    <p className="text-gray-600">Our team will contact you within 24 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uk-navy-500"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                disabled={!!user}
                                                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uk-navy-500 ${user ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''}`}
                                                placeholder="john@example.com"
                                            />

                                        </div>
                                    </div>

                                    <div>
                                        <div className="relative">
                                            <PhoneInputWithCountry
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                label="Phone Number"
                                                placeholder="123 456 7890"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Company Name
                                        </label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uk-navy-500"
                                                placeholder="Your Company"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Consultation Type *
                                        </label>
                                        <select
                                            name="consultationType"
                                            value={formData.consultationType}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uk-navy-500"
                                        >
                                            <option value="general">General Consultation</option>
                                            <option value="wholesale">Wholesale Strategy</option>
                                            <option value="product">Product Selection</option>
                                            <option value="order">Order Optimization</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="4"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uk-navy-500"
                                            placeholder="Tell us about your business and what you'd like to discuss..."
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-4 rounded-xl hover:shadow-xl transition-all font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-5 h-5" />
                                        {isSubmitting ? 'Sending Request...' : 'Submit Request'}
                                    </motion.button>
                                </form>
                            )}
                        </motion.div>

                        {/* Contact Info & Experts */}
                        <div className="space-y-8">
                            {/* Contact Information */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-2xl shadow-lg p-8"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-semibold text-gray-900">+44 7723 108434</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Mail className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-semibold text-gray-900">info@buy2brands.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Business Hours</p>
                                            <p className="font-semibold text-gray-900">Mon-Sat: 9AM - 6PM GMT</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Our Process Section */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl shadow-lg p-8"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Consultation Process</h3>
                                <div className="space-y-6">
                                    {[
                                        {
                                            icon: Send,
                                            title: "1. Submit Request",
                                            desc: "Fill out the form with your business details and requirements.",
                                            color: "blue"
                                        },
                                        {
                                            icon: User,
                                            title: "2. Initial Analysis",
                                            desc: "Our team reviews your current setup and market position.",
                                            color: "purple"
                                        },
                                        {
                                            icon: TrendingUp,
                                            title: "3. Strategic Planning",
                                            desc: "We develop a tailored roadmap for your business growth.",
                                            color: "green"
                                        }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${step.color}-100 flex items-center justify-center mt-1`}>
                                                <step.icon className={`w-5 h-5 text-${step.color}-600`} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{step.title}</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Success Guarantee
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        We are committed to finding the best wholesale solutions for your specific business needs.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ExpertConsultationPage;


