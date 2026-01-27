import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronRight, Search, Tag, Percent } from 'lucide-react';
import ProductDetailCard from '../components/ProductDetailCard';
import * as catalogAPI from '../api/catalog.api';

const ProductsPage = ({ products, onAddToCart }) => {
  const [catalog, setCatalog] = useState({ brands: [], categories: [], subcategories: [], genders: [] });
  const [showFilters, setShowFilters] = useState(false); // Mobile filter toggle

  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    brand: [],
    category: [],
    subcategory: [],
    gender: [],
    onSale: false
  });

  // Load catalog for filters
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await catalogAPI.getAllCatalog();
        if (response.success) {
          setCatalog(response.data);
        }
      } catch (error) {
        console.error('Error loading catalog:', error);
      }
    };
    loadCatalog();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter(product => {
    // Search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Brand
    if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) return false;

    // Category
    if (filters.category.length > 0 && !filters.category.includes(product.category)) return false;

    // Subcategory
    if (filters.subcategory.length > 0 && !filters.subcategory.includes(product.subcategory)) return false;

    // Gender
    if (filters.gender.length > 0 && !filters.gender.includes(product.gender)) return false;

    // On Sale
    if (filters.onSale && !product.onSale) return false;

    return true;
  });

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      const isSelected = current.includes(value);
      return {
        ...prev,
        [type]: isSelected ? current.filter(item => item !== value) : [...current, value]
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: [],
      category: [],
      subcategory: [],
      gender: [],
      onSale: false
    });
  };

  // Helper for filter sections
  const FilterSection = ({ title, expanded = true, children }) => {
    const [isOpen, setIsOpen] = useState(expanded);
    return (
      <div className="border-b border-gray-200 py-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full font-semibold text-gray-900 mb-2"
        >
          {title}
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${showFilters
              ? 'bg-uk-navy-500 text-white shadow-lg'
              : 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white hover:opacity-90 hover:shadow-md'
              }`}
          >
            <Filter className="w-5 h-5 " />
            Filter
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Search Bar - Inline */}
          <div className="relative flex-1 md:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-uk-navy-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Results Count & Active Filters */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-semibold">{filteredProducts.length} Products</span>

          {(filters.brand.length > 0 || filters.category.length > 0 || filters.gender.length > 0 || filters.onSale) && (
            <button
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 font-medium hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                {/* On Sale */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-red-500" />
                    Promotions
                  </h3>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors border border-red-100">
                    <input
                      type="checkbox"
                      checked={filters.onSale}
                      onChange={(e) => setFilters(prev => ({ ...prev, onSale: e.target.checked }))}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="font-semibold text-red-700">On Sale Only</span>
                  </label>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Brands</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {catalog.brands.map(brand => (
                      <label key={brand._id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.brand.includes(brand.name)}
                          onChange={() => toggleFilter('brand', brand.name)}
                          className="w-4 h-4 text-uk-navy-500 border-gray-300 rounded focus:ring-uk-navy-500"
                        />
                        <span className="text-gray-700">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {catalog.categories.map(cat => (
                      <div key={cat._id}>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.category.includes(cat.name)}
                            onChange={() => toggleFilter('category', cat.name)}
                            className="w-4 h-4 text-uk-navy-500 border-gray-300 rounded focus:ring-uk-navy-500"
                          />
                          <span className="font-semibold text-gray-900">{cat.name}</span>
                        </label>
                        {/* Subcategories */}
                        <div className="ml-8 space-y-1 border-l-2 border-gray-100 pl-2 mt-1">
                          {catalog.subcategories
                            .filter(sub => sub.parentId === cat._id)
                            .map(sub => (
                              <label key={sub._id} className="flex items-center gap-2 cursor-pointer hover:text-uk-navy-500">
                                <input
                                  type="checkbox"
                                  checked={filters.subcategory.includes(sub.name)}
                                  onChange={() => toggleFilter('subcategory', sub.name)}
                                  className="w-3 h-3 text-gray-400 border-gray-300 rounded focus:ring-uk-navy-500"
                                />
                                <span className="text-sm text-gray-600">{sub.name}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Gender</h3>
                  <div className="space-y-2">
                    {catalog.genders.map(gender => (
                      <label key={gender._id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.gender.includes(gender.name)}
                          onChange={() => toggleFilter('gender', gender.name)}
                          className="w-4 h-4 text-uk-navy-500 border-gray-300 rounded focus:ring-uk-navy-500"
                        />
                        <span className="text-gray-700">{gender.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product List */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id || product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductDetailCard
                product={product}
                onAddToCart={onAddToCart}
              />
            </motion.div>
          ))}
          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
            >
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductsPage;



