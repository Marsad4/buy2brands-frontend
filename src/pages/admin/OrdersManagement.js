import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, Calendar, Package, TrendingUp, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import * as XLSX from 'xlsx';

const OrdersManagement = ({ orders, onUpdateOrderStatus, onDeleteOrder }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

    // Filter orders based on status
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Status filter
            const statusMatch = activeFilter === 'all' || order.status === activeFilter;

            // Search filter
            const searchMatch = !searchQuery ||
                order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.shippingAddress?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.shippingAddress?.email?.toLowerCase().includes(searchQuery.toLowerCase());

            // Date filter
            let dateMatch = true;
            if (dateFilter.start || dateFilter.end) {
                const orderDate = new Date(order.createdAt);
                if (dateFilter.start) {
                    dateMatch = dateMatch && orderDate >= new Date(dateFilter.start);
                }
                if (dateFilter.end) {
                    dateMatch = dateMatch && orderDate <= new Date(dateFilter.end);
                }
            }

            return statusMatch && searchMatch && dateMatch;
        });
    }, [orders, activeFilter, searchQuery, dateFilter]);

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            all: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
        };
    }, [orders]);

    // Status tabs configuration
    const statusTabs = [
        { id: 'all', label: 'All Orders', count: stats.all, icon: Package, color: 'blue' },
        { id: 'pending', label: 'Pending', count: stats.pending, icon: Clock, color: 'yellow' },
        { id: 'processing', label: 'Processing', count: stats.processing, icon: TrendingUp, color: 'blue' },
        { id: 'shipped', label: 'Shipped', count: stats.shipped, icon: Truck, color: 'purple' },
        { id: 'delivered', label: 'Delivered', count: stats.delivered, icon: CheckCircle, color: 'green' },
        { id: 'cancelled', label: 'Cancelled', count: stats.cancelled, icon: XCircle, color: 'red' },
    ];

    // Export to Excel
    const exportToExcel = () => {
        const exportData = [];

        filteredOrders.forEach(order => {
            const orderBaseInfo = {
                'Order ID': order.orderId || order._id,
                'Payment ID': order.stripePaymentIntent || 'N/A',
                'Customer Name': order.shippingAddress?.fullName || 'N/A',
                'Email': order.shippingAddress?.email || 'N/A',
                'Phone': order.shippingAddress?.phone || 'N/A',
                'Status': order.status,
                'Payment Method': order.paymentMethod || 'N/A',
                'Payment Status': order.paymentStatus || 'pending',
                'Order Total': `£${(order.totalAmount || 0).toFixed(2)}`,
                'Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
                'Address': order.shippingAddress ?
                    `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`
                    : 'N/A'
            };

            // If order has items, create a row for each item/variation
            if (order.items && order.items.length > 0) {
                order.items.forEach((item, itemIndex) => {
                    if (item.isPack && item.variations && item.variations.length > 0) {
                        // For pack items, create a row for each variation in the pack
                        item.variations.forEach((variation, varIndex) => {
                            const packMultiplier = item.packMultiplier || 1;
                            const totalQty = variation.quantity * packMultiplier;
                            
                            exportData.push({
                                ...orderBaseInfo,
                                'Item #': itemIndex + 1,
                                'Product Name': item.productName || 'N/A',
                                'Brand': item.brand || 'N/A',
                                'Item Type': 'Pack',
                                'Pack Multiplier': packMultiplier,
                                'Pack Discount': item.hasDiscount && item.discountPercent ? `${item.discountPercent}%` : 'N/A',
                                'Size': variation.size || 'N/A',
                                'Color': variation.color || 'N/A',
                                'Quantity Per Pack': variation.quantity || 0,
                                'Total Quantity': totalQty,
                                'Unit Price': `£${(item.unitPrice || 0).toFixed(2)}`,
                                'Item Total Price': `£${(item.totalPrice || 0).toFixed(2)}`,
                                'Pack Total Items': item.itemCount || totalQty
                            });
                        });
                    } else {
                        // For regular items (non-pack)
                        exportData.push({
                            ...orderBaseInfo,
                            'Item #': itemIndex + 1,
                            'Product Name': item.productName || 'N/A',
                            'Brand': item.brand || 'N/A',
                            'Item Type': 'Single',
                            'Pack Multiplier': 'N/A',
                            'Pack Discount': 'N/A',
                            'Size': item.size || 'N/A',
                            'Color': item.color || 'N/A',
                            'Quantity Per Pack': 'N/A',
                            'Total Quantity': item.quantity || 0,
                            'Unit Price': `£${(item.unitPrice || 0).toFixed(2)}`,
                            'Item Total Price': `£${(item.totalPrice || 0).toFixed(2)}`,
                            'Pack Total Items': 'N/A'
                        });
                    }
                });
            } else {
                // If no items, still add a row with order info
                exportData.push({
                    ...orderBaseInfo,
                    'Item #': 'N/A',
                    'Product Name': 'No items',
                    'Brand': 'N/A',
                    'Item Type': 'N/A',
                    'Pack Multiplier': 'N/A',
                    'Pack Discount': 'N/A',
                    'Size': 'N/A',
                    'Color': 'N/A',
                    'Quantity Per Pack': 'N/A',
                    'Total Quantity': 'N/A',
                    'Unit Price': 'N/A',
                    'Item Total Price': 'N/A',
                    'Pack Total Items': 'N/A'
                });
            }
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        ws['!cols'] = [
            { wch: 15 }, // Order ID
            { wch: 30 }, // Payment ID
            { wch: 20 }, // Customer Name
            { wch: 25 }, // Email
            { wch: 15 }, // Phone
            { wch: 12 }, // Status
            { wch: 15 }, // Payment Method
            { wch: 15 }, // Payment Status
            { wch: 12 }, // Order Total
            { wch: 12 }, // Date
            { wch: 50 }, // Address
            { wch: 8 },  // Item #
            { wch: 30 }, // Product Name
            { wch: 15 }, // Brand
            { wch: 10 }, // Item Type
            { wch: 12 }, // Pack Multiplier
            { wch: 12 }, // Pack Discount
            { wch: 10 }, // Size
            { wch: 15 }, // Color
            { wch: 15 }, // Quantity Per Pack
            { wch: 12 }, // Total Quantity
            { wch: 12 }, // Unit Price
            { wch: 15 }, // Item Total Price
            { wch: 15 }  // Pack Total Items
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Orders');
        const fileName = `orders_${activeFilter}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

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
                            Orders Management
                        </h2>
                        <p className="text-gray-600">Track and manage customer orders efficiently</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                        <Download className="w-5 h-5" />
                        Export to Excel
                    </motion.button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer Name, or Email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="flex gap-2 items-center">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <input
                            type="date"
                            value={dateFilter.start}
                            onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                            type="date"
                            value={dateFilter.end}
                            onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                        />
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {statusTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeFilter === tab.id;

                        // Get proper background color classes
                        let activeClass = '';
                        if (isActive) {
                            switch (tab.color) {
                                case 'yellow':
                                    activeClass = 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg';
                                    break;
                                case 'blue':
                                    activeClass = 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg';
                                    break;
                                case 'purple':
                                    activeClass = 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg';
                                    break;
                                case 'green':
                                    activeClass = 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg';
                                    break;
                                case 'red':
                                    activeClass = 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg';
                                    break;
                                default:
                                    activeClass = 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg';
                            }
                        } else {
                            activeClass = 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200';
                        }

                        return (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveFilter(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeClass}`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                                    {tab.count}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-lg p-16 text-center"
                        >
                            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h3>
                            <p className="text-gray-600">No orders match your current filters</p>
                        </motion.div>
                    ) : (
                        filteredOrders.map((order, index) => (
                            <OrderCard
                                key={order._id || order.id}
                                order={order}
                                index={index}
                                onUpdateStatus={onUpdateOrderStatus}
                                onDelete={onDeleteOrder}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// Order Card Component
const OrderCard = ({ order, index, onUpdateStatus, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'yellow';
            case 'processing': return 'blue';
            case 'shipped': return 'purple';
            case 'delivered': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    const statusColor = getStatusColor(order.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
            {/* Order Header */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50/30">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex flex-col mb-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-gray-900">{order.orderId || order._id}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${statusColor}-100 text-${statusColor}-800`}>
                                    {order.status.toUpperCase()}
                                </span>
                            </div>
                            {order.stripePaymentIntent && (
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                    Payment ID: {order.stripePaymentIntent}
                                </p>
                            )}
                        </div>
                        <p className="text-gray-700 font-semibold">{order.shippingAddress?.fullName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{order.shippingAddress?.email || ''}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'N/A'}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="flex flex-col items-end gap-1 mb-2">
                            {/* Breakdown for admin clarity */}
                            <div className="text-xs text-gray-500">
                                <span>Subtotal: £{(order.subtotal || order.totalAmount - (order.tax || 0) - (order.shippingCost || 0)).toFixed(2)}</span>
                                <span className="mx-1">|</span>
                                <span>Tax: £{(order.tax || 0).toFixed(2)}</span>
                                <span className="mx-1">|</span>
                                <span>Ship: £{(order.shippingCost || 0).toFixed(2)}</span>
                            </div>
                            <p className="text-3xl font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent">
                                £{(order.totalAmount || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${order.paymentStatus === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {order.paymentStatus || 'pending'}
                            </span>
                            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 capitalize">
                                {order.paymentMethod || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expand Button */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-4 text-uk-navy-500 hover:text-uk-navy-600 font-semibold text-sm transition-colors"
                >
                    {expanded ? '▲ Hide Details' : '▼ Show Details'}
                </button>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200"
                    >
                        <div className="p-6 space-y-6">
                            {/* Shipping Address */}
                            {order.shippingAddress && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-uk-navy-500" />
                                        Shipping Address
                                    </h4>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-sm text-gray-700 font-medium">{order.shippingAddress.street}</p>
                                        <p className="text-sm text-gray-700">
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                        </p>
                                        <p className="text-sm text-gray-700">{order.shippingAddress.country}</p>
                                        <p className="text-sm text-gray-600 mt-2">Phone: {order.shippingAddress.phone}</p>
                                    </div>
                                </div>
                            )}

                            {/* Order Items */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-uk-navy-500" />
                                    Order Items ({order.items?.length || 0})
                                </h4>
                                <div className="space-y-3">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{item.productName}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.brand || 'N/A'}
                                                    </p>
                                                    {item.isPack ? (
                                                        <p className="text-sm text-blue-600 font-medium mt-1">
                                                            Pack × {item.packMultiplier} {item.hasDiscount && item.discountPercent && `(${item.discountPercent}% OFF)`}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-lg font-bold text-uk-navy-500">£{item.totalPrice || item.price || 0}</p>
                                            </div>

                                            {/* Pack Details */}
                                            {item.isPack && item.variations && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs font-semibold text-gray-700 mb-2">Pack Contents:</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {item.variations.map((v, vidx) => (
                                                            <p key={vidx} className="text-xs text-gray-600 bg-white rounded px-2 py-1">
                                                                • {v.quantity}× Size {v.size} - {v.color}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <select
                                    value={order.status}
                                    onChange={(e) => onUpdateStatus(order._id || order.id, e.target.value)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 font-medium transition-all bg-white"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this order?')) {
                                            onDelete(order._id || order.id);
                                        }
                                    }}
                                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-colors shadow-md hover:shadow-lg"
                                >
                                    Delete
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default OrdersManagement;
