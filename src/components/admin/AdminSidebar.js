import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, Settings, LogOut, RotateCcw, Truck } from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, onBackToStore }) => {
    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-64 bg-white shadow-2xl border-r border-gray-200"
        >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-uk-navy-500 to-uk-red-500">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                </div>
            </div>

            <nav className="p-4">
                <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${activeTab === 'products'
                        ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                >
                    <Package className="w-5 h-5" />
                    <span className="font-semibold">Products</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${activeTab === 'orders'
                        ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-semibold">Orders</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${activeTab === 'users'
                        ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                >
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">Users</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('catalog')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${activeTab === 'catalog'
                        ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                >
                    <Settings className="w-5 h-5" />
                    <span className="font-semibold">Catalog</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('returns')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${activeTab === 'returns'
                        ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                >
                    <RotateCcw className="w-5 h-5" />
                    <span className="font-semibold">Return Requests</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('shipping')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${activeTab === 'shipping'
                        ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                >
                    <Truck className="w-5 h-5" />
                    <span className="font-semibold">Shipping</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBackToStore}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 mt-8 border border-gray-200 hover:border-gray-300"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-semibold">Back to Store</span>
                </motion.button>
            </nav>
        </motion.div>
    );
};

export default AdminSidebar;
