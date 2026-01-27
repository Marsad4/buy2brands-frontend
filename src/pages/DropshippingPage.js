import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Truck, Globe, TrendingUp, Package, ShieldCheck, Zap } from 'lucide-react';

const DropshippingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-uk-navy-900 text-white overflow-hidden py-24 lg:py-32">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-uk-navy-900 to-uk-navy-900/80"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-uk-red-500/20 text-uk-red-300 text-sm font-semibold mb-6 border border-uk-red-500/30">
                            B2B Dropshipping Solutions
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                            Scale Your Business <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Without Inventory</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Access thousands of premium fashion items, ship directly to your customers globally, and focus on what matters most—growing your brand.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/expert-consultation')}
                                className="px-8 py-4 bg-uk-red-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-uk-red-700 transition-all"
                            >
                                Start Dropshipping
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/products')}
                                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
                            >
                                Browse Catalogue
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-uk-navy-900 mb-4">Why Dropship with Us?</h2>
                        <p className="text-xl text-gray-600">The infrastructure you need to succeed</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Package,
                                title: "No Inventory Risk",
                                desc: "Don't tie up capital in stock. We hold the inventory, you make the sales."
                            },
                            {
                                icon: Globe,
                                title: "Global Shipping",
                                desc: "We ship to over 100 countries with reliable tracking and fast delivery times."
                            },
                            {
                                icon: Zap,
                                title: "Fast Fulfillment",
                                desc: "Orders are processed and dispatched within 24 hours of confirmation."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Quality Guarantee",
                                desc: "Every item is inspected before shipping to ensure 100% customer satisfaction."
                            },
                            {
                                icon: TrendingUp,
                                title: "High Margins",
                                desc: "Access wholesale pricing that leaves plenty of room for your profit markup."
                            },
                            {
                                icon: Truck,
                                title: "White Label Options",
                                desc: "Ship with custom branding so your customers only see your business name."
                            }
                        ].map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-100"
                            >
                                <div className="w-14 h-14 bg-uk-navy-100 rounded-xl flex items-center justify-center text-uk-navy-600 mb-6">
                                    <benefit.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-uk-navy-900 mb-3">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-uk-navy-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-uk-red-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-xl text-gray-300">Simple steps to launch your business</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-uk-red-500/0 via-uk-red-500/50 to-uk-red-500/0 transform -translate-y-1/2 z-0"></div>

                        {[
                            { step: "01", title: "Join Program", desc: "Sign up for a dropshipping account." },
                            { step: "02", title: "Choose Products", desc: "Select from our vast catalog." },
                            { step: "03", title: "Sell Online", desc: "List items on your store." },
                            { step: "04", title: "We Ship", desc: "We deliver to your customer." }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative z-10 text-center"
                            >
                                <div className="w-24 h-24 mx-auto bg-uk-navy-800 border-4 border-uk-navy-700 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-6 shadow-xl relative group hover:border-uk-red-500 transition-colors">
                                    {item.step}
                                    <div className="absolute inset-0 bg-uk-red-500 rounded-full opacity-0 group-hover:opacity-10 blur-xl transition-opacity"></div>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-uk-navy-900 mb-6">Ready to Start Your Journey?</h2>
                    <p className="text-xl text-gray-600 mb-10">
                        Join thousands of successful entrepreneurs using our platform.
                    </p>
                    <button
                        onClick={() => navigate('/expert-consultation')}
                        className="px-12 py-5 bg-gradient-to-r from-uk-navy-600 to-uk-navy-800 text-white rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                    >
                        Apply for Dropshipping Account
                    </button>
                </div>
            </section>
        </div>
    );
};

export default DropshippingPage;
