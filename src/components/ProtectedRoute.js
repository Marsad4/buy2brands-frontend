import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Wrapper component for routes that require authentication or admin access
 */
const ProtectedRoute = ({ children, isLoggedIn, requireAdmin = false, user, isAuthLoading = false }) => {
    // Show loading state while checking authentication
    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uk-navy-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Check if user is logged in
    if (!isLoggedIn || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check if admin access is required
    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // User is authorized, render the children
    return children;
};

export default ProtectedRoute;
