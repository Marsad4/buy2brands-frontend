import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, User, LogOut, UserCircle, ShoppingBag, Shield, Menu, X } from 'lucide-react';

const Header = ({ cart, onCartClick, user, isLoggedIn, onLogout, onSearch, products = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 6) // Limit to 6 results
    : [];

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDesktop = searchRef.current && !searchRef.current.contains(event.target);
      const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(event.target);

      if (isOutsideDesktop && isOutsideMobile) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    onSearch(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const [mobileSearchOverflow, setMobileSearchOverflow] = useState('hidden');

  // Handle mobile search overflow
  useEffect(() => {
    if (showMobileSearch) {
      const timer = setTimeout(() => {
        setMobileSearchOverflow('visible');
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setMobileSearchOverflow('hidden');
    }
  }, [showMobileSearch]);

  const handleProductClick = (product) => {
    // Navigate to product detail page
    const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    navigate(`/product/${product.id || product._id}/${productSlug}`);
    setShowSuggestions(false);
    setShowMobileSearch(false); // Close mobile search on selection
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Header */}
      <div className="bg-gray-100 border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10 text-sm">
            <div className="flex items-center gap-4">
              {/* Hide on mobile, show on md and up */}
              <div className="hidden md:flex items-center gap-4">
                <Link to="/faqs" className="text-gray-600 hover:text-uk-navy-500 transition-colors font-medium">
                  FAQs
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              {/* User Authentication Section - Desktop */}
              {isLoggedIn && user ? (
                <div className="relative z-50">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-uk-navy-500 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium hidden sm:inline">{user.firstName} {user.lastName}</span>
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2"
                      >
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-uk-navy-50 hover:text-uk-navy-500 transition-colors"
                        >
                          <UserCircle className="w-4 h-4" />
                          My Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-uk-navy-50 hover:text-uk-navy-500 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          My Orders
                        </button>

                        {/* Admin Panel Option - Only visible for admin users */}
                        {user?.role === 'admin' && (
                          <>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate('/admin');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-uk-navy-700  hover:bg-uk-navy-50 hover:text-uk-navy-600 transition-colors font-medium"
                            >
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </button>
                          </>
                        )}

                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="px-3 py-1.5 text-gray-700 hover:text-uk-navy-500 font-medium transition-colors"
                  >
                    Login
                  </motion.button>
                  <span className="text-gray-300">|</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/signup')}
                    className="px-3 py-1.5 bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white rounded-lg font-medium hover:shadow-md transition-all text-xs sm:text-sm"
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onCartClick}
                className="relative p-2 text-gray-600 hover:text-uk-navy-500 rounded-lg hover:bg-gray-200 transition-all"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-uk-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  >
                    {cart.length}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Header */}
      <div className="border-b border-gray-200 relative z-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Mobile: Hamburger Menu */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Logo - Centered on mobile, Left on Desktop */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer flex-1 md:flex-none text-center md:text-left"
              onClick={() => navigate('/')}
            >
              <img
                src="/assets/logo-footer.png"
                alt="Excelien Sparks"
                className="h-8 md:h-12 w-auto inline-block md:block"
              />
            </motion.div>

            {/* Mobile: Icons Group (Search, Profile, Cart) */}
            <div className="md:hidden flex items-center gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Search"
              >
                {showMobileSearch ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
              </button>

              {/* Mobile User Profile */}
              {isLoggedIn && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Profile"
                  >
                    <User className="w-6 h-6" />
                  </button>
                  {/* Reuse User Menu Logic for Mobile */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                      >
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-uk-navy-50 hover:text-uk-navy-500 transition-colors"
                        >
                          <UserCircle className="w-4 h-4" />
                          My Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-uk-navy-50 hover:text-uk-navy-500 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          My Orders
                        </button>
                        {user?.role === 'admin' && (
                          <>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate('/admin');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-uk-navy-700  hover:bg-uk-navy-50 hover:text-uk-navy-600 transition-colors font-medium"
                            >
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </button>
                          </>
                        )}
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Login"
                >
                  <User className="w-6 h-6" />
                </button>
              )}

              {/* Mobile Cart */}
              <button
                onClick={onCartClick}
                className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 bg-uk-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-md mx-4" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(searchQuery.trim().length > 0)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uk-navy-500"
                />

                {/* Search Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                    >
                      {filteredProducts.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto">
                          {filteredProducts.map((product) => (
                            <motion.button
                              key={product.id || product._id}
                              whileHover={{ backgroundColor: '#f3f4f6' }}
                              onClick={() => handleProductClick(product)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.brand}</p>
                              </div>
                              <span className="text-sm font-bold text-uk-navy-500">£{product.unitPrice}</span>
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                          <p>No products found</p>
                          <p className="text-xs mt-1">Try searching with different keywords</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar - Expandable */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`md:hidden pb-4 overflow-${mobileSearchOverflow}`}
                ref={mobileSearchRef}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uk-navy-500"
                  />
                  {/* Mobile Search Suggestions */}
                  {showSuggestions && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <motion.button
                          key={product.id || product._id}
                          onClick={() => handleProductClick(product)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Header - Navigation (Desktop Only) */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center items-center h-14">
            <div className="flex items-center gap-16">
              {[
                { id: 'home', label: 'Home', path: '/' },
                { id: 'catalogue', label: 'Catalogue', path: '/products' },
                { id: 'about', label: 'About Us', path: '/about' },
                { id: 'expert-consultation', label: 'Expert Consultation', path: '/expert-consultation' }
              ].map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${isActive
                        ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
              {[
                { id: 'home', label: 'Home', path: '/' },
                { id: 'catalogue', label: 'Catalogue', path: '/products' },
                { id: 'about', label: 'About Us', path: '/about' },
                { id: 'expert-consultation', label: 'Expert Consultation', path: '/expert-consultation' },
                { id: 'faqs', label: 'FAQs', path: '/faqs' }
              ].map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all ${isActive
                      ? 'bg-uk-navy-50 text-uk-navy-600'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header >
  );
};

export default Header;




