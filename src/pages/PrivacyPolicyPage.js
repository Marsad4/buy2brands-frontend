import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicyPage = () => {
    const lastUpdated = 'January 26, 2026';

    const sections = [
        {
            icon: Eye,
            title: 'Information We Collect',
            content: [
                'We collect information you provide directly to us, such as when you create an account, update your profile, make a purchase, or communicate with us.',
                'This may include your name, email address, phone number, shipping address, and payment information.',
                'We also automatically collect certain information about your device and how you interact with our website, including IP address, browser type, and pages visited.'
            ]
        },
        {
            icon: Lock,
            title: 'How We Use Your Information',
            content: [
                'To process your orders and payments.',
                'To communicate with you about your account, orders, and our services.',
                'To send you marketing communications (if you have opted in).',
                'To improve our website and customer service.',
                'To detect and prevent fraud and unauthorized access.'
            ]
        },
        {
            icon: Shield,
            title: 'Data Protection',
            content: [
                'We implement appropriate technical and organizational measures to protect your personal data.',
                'We use SSL encryption to protect sensitive information transmitted online.',
                'Access to your personal information is restricted to employees who need it to perform a specific job (e.g., billing or customer service).'
            ]
        },
        {
            icon: FileText,
            title: 'Your Rights',
            content: [
                'You have the right to access, correct, or delete your personal information.',
                'You can update your account information at any time by logging into your account.',
                'You may opt-out of receiving marketing emails from us by following the unsubscribe instructions in those emails.'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <section className="bg-uk-navy-500 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-uk-navy-600 to-uk-navy-500 opacity-90 z-10" />
                <div
                    className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
                />

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        Privacy Policy
                    </motion.h1>
                    <div className="w-24 h-1 bg-uk-red-500 mx-auto mb-6 rounded-full" />
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-gray-200"
                    >
                        Your privacy is critically important to us.
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-30">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 md:p-12">
                    <div className="text-sm text-gray-500 mb-8 text-center uppercase tracking-wide">
                        Last Updated: {lastUpdated}
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-600">
                        <p className="lead text-lg mb-10 text-center">
                            At Buy2Brands, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by us and how we use it.
                        </p>

                        <div className="grid gap-12">
                            {sections.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="border-b border-gray-100 last:border-0 pb-8 last:pb-0"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-uk-red-50 flex items-center justify-center">
                                            <section.icon className="w-5 h-5 text-uk-red-500" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-uk-navy-500 m-0">{section.title}</h2>
                                    </div>
                                    <ul className="space-y-3 list-disc pl-14">
                                        {section.content.map((item, i) => (
                                            <li key={i} className="text-gray-600">{item}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Us</h3>
                            <p className="text-gray-600 mb-4">
                                If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
                            </p>
                            <div className="text-uk-navy-600 font-medium">
                                Email: info@buy2brands.com
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;
