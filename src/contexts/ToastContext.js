import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', options = {}) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            message,
            type,
            title: options.title,
            duration: options.duration || 5000,
            autoClose: options.autoClose !== false,
        };

        setToasts((prev) => [...prev, toast]);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Convenience methods
    const success = useCallback((message, options) => {
        return showToast(message, 'success', options);
    }, [showToast]);

    const error = useCallback((message, options) => {
        return showToast(message, 'error', { duration: 6000, ...options });
    }, [showToast]);

    const warning = useCallback((message, options) => {
        return showToast(message, 'warning', options);
    }, [showToast]);

    const info = useCallback((message, options) => {
        return showToast(message, 'info', options);
    }, [showToast]);

    const value = {
        showToast,
        removeToast,
        success,
        error,
        warning,
        info,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <Toast
                                toast={toast}
                                onClose={() => removeToast(toast.id)}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
