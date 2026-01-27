import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search, HelpCircle, ShoppingBag, Truck, Lock, RefreshCw, Globe, Shield } from 'lucide-react';

const FAQPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openIndex, setOpenIndex] = useState(null);

    const categories = [
        { id: 'all', label: 'All Questions' },
        { id: 'orders', label: 'Orders & Shipping' },
        { id: 'products', label: 'Products & Stock' },
        { id: 'returns', label: 'Returns & Refunds' },
        { id: 'account', label: 'Account & Safety' }
    ];

    const faqs = [
        {
            question: "How long does shipping take?",
            answer: "Standard shipping typically takes 3-5 business days within the UK. International shipping can take 7-14 business days depending on the destination. You can track your order status in real-time from your account dashboard.",
            category: 'orders',
            icon: Truck
        },
        {
            question: "Do you offer international shipping?",
            answer: "Yes, Buy2Brands ships globally! Shipping costs are calculated at checkout based on your location and the weight of your order. We work with premium carriers to ensure your goods arrive safely.",
            category: 'orders',
            icon: Globe
        },
        {
            question: "What is your minimum order quantity (MOQ)?",
            answer: "For most products, we don't have a strict MOQ, allowing you to buy exactly what you need. However, certain wholesale packs offer better pricing when bought in bulk. Check individual product pages for details.",
            category: 'products',
            icon: ShoppingBag
        },
        {
            question: "Are your products authentic?",
            answer: "Absolutely. Buy2Brands guarantees 100% authenticity for all products listed on our platform. We source directly from brands and authorized distributors to ensure quality and trust.",
            category: 'products',
            icon: Shield
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for damaged or incorrect items. If you receive a defective product, please submit a return request via your profile within 48 hours of delivery. General returns for change of mind may be subject to a restocking fee.",
            category: 'returns',
            icon: RefreshCw
        },
        {
            question: "How do I create a return request?",
            answer: "Log in to your account, go to 'My Profile', and navigate to the 'Return Requests' tab. Select the order and item you wish to return, provide a reason, and submit. Our team will review your request within 24 hours.",
            category: 'returns',
            icon: RefreshCw
        },
        {
            question: "Is my payment information secure?",
            answer: "Yes, we use industry-standard encryption and secure payment gateways (Stripe) to process all transactions. We do not store your credit card details on our servers.",
            category: 'account',
            icon: Lock
        },
        {
            question: "How can I contact customer support?",
            answer: "You can reach our support team via the 'Expert Consultation' page for business inquiries, or email us directly at info@buy2brands.com. Our team operates Mon-Sat, 9AM - 6PM GMT.",
            category: 'account',
            icon: HelpCircle
        }
    ];

    // Filter FAQs
    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;

        return matchesSearch && matchesCategory;
    });



    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-uk-navy-500 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-uk-navy-600 via-uk-navy-500 to-uk-red-900 opacity-90" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        How can we help you?
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto relative"
                    >
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-uk-navy-500/30 shadow-lg text-lg"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setOpenIndex(null);
                            }}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${activeCategory === cat.id
                                ? 'bg-uk-red-500 text-white shadow-md transform scale-105'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {filteredFAQs.length > 0 ? (
                        filteredFAQs.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${openIndex === idx ? 'bg-uk-navy-100 text-uk-navy-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <faq.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`font-semibold text-lg ${openIndex === idx ? 'text-uk-navy-700' : 'text-gray-800'}`}>
                                            {faq.question}
                                        </span>
                                    </div>
                                    {openIndex === idx ? (
                                        <Minus className="w-5 h-5 text-uk-red-500 flex-shrink-0" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {openIndex === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="px-6 pb-6 pl-[4.5rem] text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No questions found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* Need more help? */}
                <div className="mt-16 text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
                    <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                    <a
                        href="/expert-consultation"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-uk-navy-600 hover:bg-uk-navy-700"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
