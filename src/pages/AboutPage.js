import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Shield, Award, Globe, Heart } from 'lucide-react';

const AboutPage = () => {
    const stats = [
        { number: '10K+', label: 'Happy Customers' },
        { number: '500+', label: 'Products' },
        { number: '50+', label: 'Countries Served' },
        { number: '24/7', label: 'Support' }
    ];

    const values = [
        {
            icon: Target,
            title: 'Our Mission',
            description: 'To revolutionize the wholesale industry by connecting businesses with premium quality products at unbeatable prices.',
            color: 'blue'
        },
        {
            icon: Shield,
            title: 'Quality Assurance',
            description: 'We maintain rigorous standards to ensure every product in our catalog meets the highest quality benchmarks.',
            color: 'green'
        },
        {
            icon: Heart,
            title: 'Customer First',
            description: 'Your success is our success. We are dedicated to providing exceptional support and business solutions.',
            color: 'red'
        }
    ];

    const team = [
        {
            name: 'Aijaz Ahmed',
            role: 'Founder & CEO',
            image: '/assets/team/ceo.jpg', // Placeholder - in real app would need actual assets or URLs
            // Using a high quality placeholder from unsplash if local asset is missing
            fallbackImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop'
        },
        {
            name: 'Sarah Chen',
            role: 'Head of Operations',
            image: '/assets/team/ops.jpg',
            fallbackImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
        },
        {
            name: 'Michael Ross',
            role: 'Product Director',
            image: '/assets/team/product.jpg',
            fallbackImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-uk-navy-500">
                <div className="absolute inset-0 bg-gradient-to-r from-uk-navy-600 to-uk-navy-500 opacity-90 z-10" />
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop)' }}
                />

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6"
                    >
                        Redefining <span className="text-uk-red-500">Wholesale</span> Excellence
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-gray-300 max-w-2xl mx-auto"
                    >
                        Buy2Brands is your premier partner for high-quality wholesale goods, dropshipping solutions, and business growth strategies.
                    </motion.p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-gray-50 -mt-10 relative z-30 mx-4 md:mx-12 rounded-2xl shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <p className="text-4xl font-bold text-uk-navy-600 mb-2">{stat.number}</p>
                                <p className="text-gray-600 font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Founded with a vision to streamline the global wholesale market, Buy2Brands has grown from a small distribution hub to a worldwide leader in B2B commerce. We recognized the challenges businesses faced in sourcing reliable products and decided to build a solution that prioritizes quality, transparency, and speed.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Today, we serve thousands of retailers, dropshippers, and enterprises, empowering them with the tools and inventory they need to thrive in a competitive market. Our commitment goes beyond just selling products; we build lasting partnerships.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-uk-red-500 rounded-2xl transform rotate-3 opacity-10" />
                            <img
                                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop"
                                alt="Our Office"
                                className="relative rounded-2xl shadow-lg w-full h-[400px] object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                        <p className="text-xl text-gray-600">The principles that drive everything we do</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {values.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-${value.color}-100 flex items-center justify-center mb-6`}>
                                    <value.icon className={`w-7 h-7 text-${value.color}-600`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-uk-navy-600 to-uk-navy-800 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative z-10"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Grow Your Business?</h2>
                            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                                Join thousands of successful businesses who trust Buy2Brands for their wholesale needs.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/products"
                                    className="px-8 py-3 bg-white text-uk-navy-900 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Browse Catalogue
                                </a>
                                <a
                                    href="/expert-consultation"
                                    className="px-8 py-3 bg-uk-red-500 text-white rounded-xl font-bold hover:bg-uk-red-600 transition-colors"
                                >
                                    Talk to an Expert
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
