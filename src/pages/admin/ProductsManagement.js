import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Package, Star, TrendingUp, AlertCircle, Search, Filter } from 'lucide-react';

import * as catalogAPI from '../../api/catalog.api';

const ProductsManagement = ({ products, onAddProduct, onEditProduct, onDeleteProduct }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBrand, setFilterBrand] = useState('all');
    const [brands, setBrands] = useState([]);

    // Load brands from catalog
    React.useEffect(() => {
        const loadBrands = async () => {
            try {
                const response = await catalogAPI.getAllCatalog();
                if (response.success) {
                    setBrands(response.data.brands);
                }
            } catch (error) {
                console.error('Error loading brands:', error);
            }
        };
        loadBrands();
    }, []);

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBrand = filterBrand === 'all' || product.brand === filterBrand;
        return matchesSearch && matchesBrand;
    });

    // Calculate stats
    const totalProducts = products.length;
    const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0);

    // Calculate average rating only from rated products
    const ratedProducts = products.filter(p => p.averageRating > 0);
    const avgRating = ratedProducts.length > 0
        ? ratedProducts.reduce((sum, p) => sum + p.averageRating, 0) / ratedProducts.length
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent mb-2">
                            Products Management
                        </h2>
                        <p className="text-gray-600">Manage your entire product catalog with ease</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAddProduct}
                        className="flex items-center gap-2 bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Product
                    </motion.button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Package className="w-8 h-8 opacity-80" />
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-bold mb-1">{totalProducts}</p>
                        <p className="text-blue-100 text-sm">Total Products</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <AlertCircle className="w-8 h-8 opacity-80" />
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-bold mb-1">{totalVariants}</p>
                        <p className="text-purple-100 text-sm">Total Variants</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Star className="w-8 h-8 opacity-80" />
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-bold mb-1">{avgRating.toFixed(1)}</p>
                        <p className="text-yellow-100 text-sm">Average Rating</p>
                    </motion.div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products by name or brand..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filterBrand}
                            onChange={(e) => setFilterBrand(e.target.value)}
                            className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all appearance-none bg-white font-medium"
                        >
                            <option value="all">All Brands</option>
                            {brands.map(brand => (
                                <option key={brand._id} value={brand.name}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 border-b-2 border-gray-200">
                            <tr>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Brand</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Pack Info</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Variants</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {filteredProducts.map((product, index) => {
                                    const packConfig = product.packConfig;
                                    const hasPackConfig = packConfig && packConfig.enabled;

                                    return (
                                        <motion.tr
                                            key={product.id || product._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gradient-to-r hover:from-uk-navy-50/30 hover:to-uk-red-50/30 transition-all duration-200"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-16 h-16 rounded-xl object-cover shadow-lg ring-2 ring-white"
                                                        />
                                                        {product.averageRating >= 4 && (
                                                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1">
                                                                <Star className="w-3 h-3 fill-current" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">ID: {(product.id || product._id)?.toString().slice(-8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                                                    {product.brand}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-lg font-bold text-gray-900">£{product.unitPrice}</p>
                                                <p className="text-xs text-gray-500">per unit</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {hasPackConfig ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="w-4 h-4 text-blue-600" />
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {packConfig.variations?.length || 0} items
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-green-600 font-semibold">
                                                            {packConfig.discountPercent}% OFF
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No pack</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < Math.round(product.averageRating || 0)
                                                                    ? 'text-yellow-400 fill-yellow-400'
                                                                    : 'text-gray-300'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-600">
                                                        ({product.reviewCount || 0})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg text-sm font-bold">
                                                    {product.variants?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => onEditProduct(product)}
                                                        className="p-2 text-uk-navy-500 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                                                        title="Edit Product"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => onDeleteProduct(product.id || product._id)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-16">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-semibold">No products found</p>
                            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-center text-sm text-gray-500">
                Showing {filteredProducts.length} of {totalProducts} products
            </div>
        </motion.div>
    );
};

export default ProductsManagement;
