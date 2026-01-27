import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import ExpertConsultationPage from './pages/ExpertConsultationPage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import AdminPanel from './components/AdminPanel';
import DropshippingPage from './pages/DropshippingPage';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * AppRoutes Component
 * Centralizes all application routing configuration
 */
const AppRoutes = ({
    // User & Auth Props
    user,
    isLoggedIn,
    isAuthLoading,
    handleLogin,
    handleSignup,
    handleLogout,
    handleUpdateProfile,
    handleChangePassword,

    // Product Props
    products,
    searchQuery,

    // Cart Props
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    calculateTotal,

    // Order Props
    handlePlaceOrder,

    // Admin Props
    orders,
    activeTab,
    setActiveTab,
    deleteProduct,
    updateOrderStatus,
    deleteOrder,
    showProductModal,
    setShowProductModal,
    editingProduct,
    setEditingProduct,
    loadProducts,
    setProducts
}) => {
    const navigate = useNavigate();
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faqs" element={<FAQPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-conditions" element={<TermsConditionsPage />} />

            <Route
                path="/products"
                element={
                    <ProductsPage
                        products={products.filter(p =>
                            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.brand.toLowerCase().includes(searchQuery.toLowerCase())
                        )}
                        onAddToCart={addToCart}
                    />
                }
            />

            <Route
                path="/product/:productId/:productName?"
                element={
                    <ProductDetailPage
                        products={products}
                        onAddToCart={addToCart}
                        isLoggedIn={isLoggedIn}
                        user={user}
                    />
                }
            />

            <Route
                path="/login"
                element={
                    isLoggedIn ? (
                        <Navigate to="/" replace />
                    ) : (
                        <LoginPage
                            onLogin={handleLogin}
                            onNavigateToSignup={() => navigate('/signup')}
                        />
                    )
                }
            />

            <Route
                path="/signup"
                element={
                    isLoggedIn ? (
                        <Navigate to="/" replace />
                    ) : (
                        <SignupPage onSignup={handleSignup} />
                    )
                }
            />

            <Route
                path="/expert-consultation"
                element={<ExpertConsultationPage user={user} />}
            />

            <Route
                path="/dropshipping"
                element={<DropshippingPage />}
            />

            {/* Protected Routes - Require Login */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn} user={user} isAuthLoading={isAuthLoading}>
                        <ProfilePage
                            user={user}
                            onUpdateProfile={handleUpdateProfile}
                            onChangePassword={handleChangePassword}
                        />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/cart"
                element={
                    <CartPage
                        cart={cart}
                        onRemoveItem={removeFromCart}
                        onUpdateQuantity={updateCartQuantity}
                        calculateTotal={calculateTotal}
                    />
                }
            />

            <Route
                path="/checkout"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn} user={user} isAuthLoading={isAuthLoading}>
                        <CheckoutPage
                            cart={cart}
                            calculateTotal={calculateTotal}
                            onPlaceOrder={handlePlaceOrder}
                            onBackToCart={() => navigate('/cart')}
                            user={user}
                        />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/payment-success"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn} user={user} isAuthLoading={isAuthLoading}>
                        <PaymentSuccessPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/payment-cancel"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn} user={user} isAuthLoading={isAuthLoading}>
                        <PaymentCancelPage />
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes - Require Admin Role */}
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn} user={user} requireAdmin={true} isAuthLoading={isAuthLoading}>
                        <AdminPanel
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            onBackToStore={() => navigate('/')}
                            products={products}
                            orders={orders}
                            onAddProduct={() => {
                                setEditingProduct(null);
                                setShowProductModal(true);
                            }}
                            onEditProduct={(product) => {
                                setEditingProduct(product);
                                setShowProductModal(true);
                            }}
                            onDeleteProduct={deleteProduct}
                            onUpdateOrderStatus={updateOrderStatus}
                            onDeleteOrder={deleteOrder}
                            showProductModal={showProductModal}
                            setShowProductModal={setShowProductModal}
                            editingProduct={editingProduct}
                            setEditingProduct={setEditingProduct}
                            loadProducts={loadProducts}
                            setProducts={setProducts}
                        />
                    </ProtectedRoute>
                }
            />

            {/* Catch-all route - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
