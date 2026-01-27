import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Star, TrendingUp, Package, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0vw", "-200vw"]);

  const collections = [
    {
      id: 1,
      title: "Exclusive Designer Wear",
      subtitle: "Luxury Defined",
      description: "Discover our premium selection of high-end designer clothing.",
      color: "from-uk-navy-900 to-uk-navy-800",
      images: [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop", // Main
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop", // Side 1
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop", // Side 2
      ]
    },
    {
      id: 2,
      title: "Urban Street Style",
      subtitle: "Bold & Contemporary",
      description: "The latest trends in streetwear and sneakers.",
      color: "from-uk-red-900 to-uk-red-800",
      images: [
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=800&fit=crop", // Main
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop", // Side 1
        "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400&h=400&fit=crop", // Side 2
      ]
    },
    {
      id: 3,
      title: "Premium Accessories",
      subtitle: "Wallets, Belts & Socks",
      description: "Complete your look with our curated accessories.",
      color: "from-gray-900 to-uk-navy-900",
      images: [
        "https://plus.unsplash.com/premium_photo-1681589453747-53fd893fa420?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&fit=crop", // Wallet (Main)
        "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=400&fit=crop", // Belt
        "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&h=400&fit=crop", // Socks
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-uk-navy-600 via-uk-navy-500 to-uk-red-500 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold">Premium B2B Wholesale Platform</span>
            </div>
            <h1 className="text-5xl md:text-5xl font-bold mb-6">
              Quality Inventory. Better Brands. Wholesale Prices.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Big Brands, Big Opportunities! Discover exclusive selection of luxury brands, sportswear, and accessories at wholesale prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/products')}
                className="px-8 py-4 bg-white text-uk-navy-500 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                View Products
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/expert-consultation')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                Contact
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-uk-navy-50/30 via-transparent to-uk-red-50/20 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600">Your trusted partner for wholesale fashion excellence</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Secure Orders", desc: "Dedicated sales assistant and customer service", color: "from-uk-navy-500 to-uk-navy-600" },
              { icon: Star, title: "Wide Selection", desc: "High-fashion trends and premium brands", color: "from-uk-red-500 to-uk-red-600" },
              { icon: TrendingUp, title: "Real-time Updates", desc: "Stay updated with latest news and offers", color: "from-uk-navy-500 to-uk-red-500" },
              { icon: Package, title: "Exclusive Stock", desc: "Access to exclusive inventory and stocklots", color: "from-uk-red-500 to-uk-navy-500" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.05 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="group text-center p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-uk-navy-200 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 shadow-lg`}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-uk-navy-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Horizontal Scroll Featured Collections */}
      <motion.section ref={targetRef} className="relative h-[400vh] bg-neutral-900">
        <div className="sticky top-16 md:top-36 h-[calc(100vh-4rem)] md:h-[calc(100vh-9rem)] overflow-hidden">
          <motion.div style={{ x }} className="flex h-full">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className={`flex-shrink-0 w-screen h-full flex items-center justify-center bg-gradient-to-br ${collection.color} text-white relative overflow-hidden`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                <div className="max-w-7xl w-full mx-auto px-6 flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 h-full justify-center">
                  {/* Image Collage - Order First on Mobile */}
                  <div className="relative h-[30vh] lg:h-[60vh] w-full order-first lg:order-last mt-4 lg:mt-0">
                    {/* Main Large Image */}
                    <motion.div
                      className="absolute top-0 right-0 w-4/5 h-4/5 rounded-3xl overflow-hidden shadow-2xl z-10"
                      initial={{ opacity: 0, y: 50, rotate: -2 }}
                      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <img src={collection.images[0]} alt={collection.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    </motion.div>

                    {/* Floating Secondary Image 1 */}
                    <motion.div
                      className="absolute bottom-0 left-0 w-2/5 h-2/5 rounded-2xl overflow-hidden shadow-xl z-20 border-4 border-white/10"
                      initial={{ opacity: 0, x: -30, y: 30 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <img src={collection.images[1]} alt="Detail 1" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    </motion.div>

                    {/* Small Accent Image 2 */}
                    <motion.div
                      className="absolute top-1/2 left-10 w-1/4 h-1/4 rounded-xl overflow-hidden shadow-lg z-30 border-2 border-white/20 hidden md:block"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <img src={collection.images[2]} alt="Detail 2" className="w-full h-full object-cover" />
                    </motion.div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-4 lg:space-y-8 text-left w-full">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <h3 className="text-sm md:text-xl font-light text-white/80 tracking-widest uppercase mb-2 lg:mb-4 pl-1 border-l-4 border-white/30 block">
                        {collection.subtitle}
                      </h3>
                      <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 lg:mb-6 leading-tight">
                        {collection.title}
                      </h2>
                      <p className="text-base md:text-xl text-white/70 max-w-lg leading-relaxed mb-6 lg:mb-8">
                        {collection.description}
                      </p>
                      <button
                        onClick={() => navigate('/products')}
                        className="group inline-flex items-center gap-3 px-6 py-3 lg:px-8 lg:py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white text-white hover:text-uk-navy-900 rounded-full transition-all duration-300"
                      >
                        <span className="font-semibold text-base lg:text-lg">Explore Collection</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="relative py-28 bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-6"
            >
              <span className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                🚀 Start Your Journey Today
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Ready to Boost Your Sales?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of retailers who trust us for their wholesale needs. Get started today and unlock exclusive deals!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/products')}
                className="px-10 py-5 bg-white text-uk-navy-500 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all"
              >
                Browse Products →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/expert-consultation')}
                className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;




