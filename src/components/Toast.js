import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast.autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, toast.duration || 5000);

            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'error':
                return <XCircle className="w-6 h-6 text-red-600" />;
            case 'warning':
                return <AlertCircle className="w-6 h-6 text-yellow-600" />;
            case 'info':
            default:
                return <Info className="w-6 h-6 text-blue-600" />;
        }
    };

    const getBgColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getTextColor = () => {
        switch (toast.type) {
            case 'success':
                return 'text-green-900';
            case 'error':
                return 'text-red-900';
            case 'warning':
                return 'text-yellow-900';
            case 'info':
            default:
                return 'text-blue-900';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, x: 300 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 300, transition: { duration: 0.2 } }}
            className={`${getBgColor()} border-2 rounded-xl shadow-lg p-4 min-w-[320px] max-w-md relative`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1">
                    {toast.title && (
                        <h4 className={`font-bold text-sm mb-1 ${getTextColor()}`}>
                            {toast.title}
                        </h4>
                    )}
                    <p className={`text-sm ${getTextColor()} ${toast.title ? 'opacity-90' : ''}`}>
                        {toast.message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

export default Toast;
