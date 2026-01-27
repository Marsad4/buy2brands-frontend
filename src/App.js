import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import ProductFormModal from './components/ProductFormModal';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AppRoutes from './Routes';
import { useToast } from './contexts/ToastContext';

// API imports
import * as authAPI from './api/auth.api';
import * as productsAPI from './api/products.api';
import * as cartAPI from './api/cart.api';
import * as ordersAPI from './api/orders.api';
import * as usersAPI from './api/users.api';
import { initializeSocket, disconnectSocket, joinAdminRoom, onOrderStatusUpdate, emitNewOrder, onNewOrder } from './api/socket';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Check if we're on admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);

  // User Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Add auth loading state

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Products State (from backend)
  const [products, setProducts] = useState([]);

  // Orders State
  const [orders, setOrders] = useState([]);

  // Admin Panel State
  const [activeTab, setActiveTab] = useState('products');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Load orders (admin or user)
  const loadOrders = useCallback(async () => {
    try {
      const response = user?.role === 'admin'
        ? await ordersAPI.getAllOrders()
        : await ordersAPI.getUserOrders();

      if (response.success && response.data) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, [user]);

  // Initialize app - check for existing auth token
  useEffect(() => {
    const initializeAuth = async () => {
      setIsAuthLoading(true);
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);

          // Initialize socket connection
          initializeSocket(parsedUser._id || parsedUser.id);

          // Join admin room if user is admin
          if (parsedUser.role === 'admin') {
            joinAdminRoom();
          }

          // Load user's cart from backend
          loadCart();
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      // Set auth loading to false after checking
      setIsAuthLoading(false);
    };

    initializeAuth();

    // Load products on mount
    loadProducts();

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  // Setup real-time order updates
  useEffect(() => {
    if (isLoggedIn && user) {
      // Listen for status updates (User & Admin)
      onOrderStatusUpdate((data) => {
        console.log('Order status updated:', data);
        toast.info(`Order status updated to: ${data.status}`);
        // Refresh orders if on orders page
        if (activeTab === 'orders') {
          loadOrders();
        }
      });

      // Listen for new orders (Admin only)
      if (user.role === 'admin') {
        onNewOrder((data) => {
          console.log('New order received:', data);
          const total = data.order?.totalAmount ? Number(data.order.totalAmount).toFixed(2) : '0.00';
          toast.success(`New order received! Total: £${total}`);
          if (activeTab === 'orders') {
            loadOrders();
          }
        });
      }
    }
  }, [isLoggedIn, user, activeTab, loadOrders, toast]);

  // Load orders when on admin routes
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, user, loadOrders]);

  // Load products from backend
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAllProducts();
      if (response.success && response.data) {
        // Transform backend data to match frontend format
        const transformedProducts = response.data.products.map(product => ({
          ...product,
          id: product._id // Use MongoDB _id as id
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart from backend
  const loadCart = async () => {
    try {
      const response = await cartAPI.getCart();
      if (response.success && response.data) {
        setCart(response.data.cart.items || []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Add to cart - save to backend
  const addToCart = async (item) => {
    try {
      if (isLoggedIn) {
        // Add to backend cart
        const response = await cartAPI.addToCart(item);
        if (response.success) {
          await loadCart(); // Reload cart from backend
          setShowCart(true);
          return;
        }
      }

      // Fallback to local cart if not logged in
      const generateCartId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const buildCartKey = (item) => {
        if (item.isPack) {
          return `pack::${item.productName}::multiplier=${item.packMultiplier}::discount=${!!item.hasDiscount}`;
        }
        return `single::${item.productName}::size=${item.size}::color=${item.color}`;
      };

      const key = buildCartKey(item);
      const incomingQty = Number(item.quantity || 0);
      const incomingTotal = Number(item.totalPrice || 0);

      setCart(prev => {
        const existingIndex = prev.findIndex(i => i.key === key);

        if (existingIndex >= 0) {
          const updated = [...prev];
          const existing = updated[existingIndex];
          const existingQty = Number(existing.quantity || 0);
          const existingTotal = Number(existing.totalPrice || 0);

          updated[existingIndex] = {
            ...existing,
            quantity: existingQty + incomingQty,
            totalPrice: existingTotal + incomingTotal
          };
          return updated;
        } else {
          const newItem = {
            ...item,
            cartId: generateCartId(),
            key,
            quantity: incomingQty,
            totalPrice: incomingTotal
          };
          return [...prev, newItem];
        }
      });

      setShowCart(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      if (isLoggedIn) {
        await cartAPI.removeFromCart(cartId);
        await loadCart();
      } else {
        setCart(cart.filter(item => item.cartId !== cartId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (cartId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        removeFromCart(cartId);
        return;
      }

      if (isLoggedIn) {
        await cartAPI.updateCartItem(cartId, newQuantity);
        await loadCart();
      } else {
        setCart(cart.map(item => {
          if (item.cartId === cartId) {
            const unitPrice = item.totalPrice / item.quantity;
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: unitPrice * newQuantity
            };
          }
          return item;
        }));
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  };

  // Authentication Handlers
  const handleLogin = async (loginData) => {
    try {
      setLoading(true);
      const response = await authAPI.login(loginData);

      if (response.success && response.data) {
        const { user, token } = response.data;

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update state
        setUser(user);
        setIsLoggedIn(true);

        // Initialize socket
        initializeSocket(user._id || user.id);

        // Join admin room if user is admin
        if (user.role === 'admin') {
          joinAdminRoom();
        }

        // Load user's cart
        await loadCart();

        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (signupData) => {
    try {
      setLoading(true);
      const response = await authAPI.signup(signupData);

      if (response.success && response.data) {
        const { user, token } = response.data;

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update state
        setUser(user);
        setIsLoggedIn(true);

        // Initialize socket
        initializeSocket(user._id || user.id);

        toast.success('Account created successfully!');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoggedIn(false);
      setCart([]);
      disconnectSocket();
      navigate('/');
      toast.success('Logged out successfully');
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      setLoading(true);
      const response = await usersAPI.updateProfile(updatedData);

      if (response.success && response.data) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (passwordData) => {
    try {
      setLoading(true);
      const response = await usersAPI.changePassword(passwordData);

      if (response.success) {
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (formData, existingOrder = null) => {
    setLoading(true);
    try {
      // If order is already created (e.g. via Stripe), just handle success
      if (existingOrder) {
        emitNewOrder(existingOrder);
        setCart([]);
        navigate('/payment-success', { state: { order: existingOrder, success: true } });
        setLoading(false);
        return;
      }

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId || item.id,
          ...item
        })),
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country || 'USA'
        },
        paymentMethod: formData.paymentMethod || 'cod',
        customerNotes: formData.notes
      };

      console.log('📦 Placing order with data:', orderData);
      console.log('💰 Cart total check:', calculateTotal());

      const response = await ordersAPI.createOrder(orderData);

      if (response.success) {
        // Emit socket event for real-time update
        emitNewOrder(response.data.order);

        toast.success('Order placed successfully! You will receive a confirmation email shortly.');
        setCart([]);
        navigate('/');
      }
    } catch (error) {
      console.error('Place order error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsAPI.deleteProduct(productId);
      await loadProducts();
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Failed to delete product');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await ordersAPI.deleteOrder(orderId);
      await loadOrders(); // Reload orders from database
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Delete order error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Update order status error:', error);
      toast.error('Failed to update order status');
    }
  };

  // Main App
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-uk-navy-50/30 to-uk-red-50/20">
      {/* Top Banner - Hide on admin routes */}
      {!isAdminRoute && (
        <div className="bg-uk-navy-500 text-white text-sm py-2 text-center">
          <p>Free shipping over £1,000 for all orders • Discounts valid up to January 1, 2025</p>
        </div>
      )}

      {/* Header - Hide on admin routes */}
      {!isAdminRoute && (
        <Header
          cart={cart}
          onCartClick={() => setShowCart(true)}
          user={user}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onSearch={setSearchQuery}
          products={products}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uk-navy-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading...</p>
          </div>
        </div>
      )}

      {/* Routes */}
      <AppRoutes
        user={user}
        isLoggedIn={isLoggedIn}
        isAuthLoading={isAuthLoading}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        handleLogout={handleLogout}
        handleUpdateProfile={handleUpdateProfile}
        handleChangePassword={handleChangePassword}
        products={products}
        searchQuery={searchQuery}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        updateCartQuantity={updateCartQuantity}
        calculateTotal={calculateTotal}
        handlePlaceOrder={handlePlaceOrder}
        orders={orders}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        deleteProduct={deleteProduct}
        updateOrderStatus={updateOrderStatus}
        deleteOrder={deleteOrder}
        showProductModal={showProductModal}
        setShowProductModal={setShowProductModal}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        loadProducts={loadProducts}
        setProducts={setProducts}
      />

      {/* Cart Sidebar - Hide on admin routes */}
      {!isAdminRoute && (
        <CartSidebar
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          cart={cart}
          onRemoveItem={removeFromCart}
          calculateTotal={calculateTotal}
        />
      )}

      {/* Product Form Modal for Admin */}
      {showProductModal && (
        <ProductFormModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          products={products}
          setProducts={setProducts}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          onSave={loadProducts}
        />
      )}

      {/* Footer - Hide on admin routes */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

// Main App Wrapper with BrowserRouter
const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
