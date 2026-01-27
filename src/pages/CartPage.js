import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, ArrowLeft, Package, Minus, Plus } from 'lucide-react';
import * as shippingStructuresAPI from '../api/shippingStructures.api';
import * as productsAPI from '../api/products.api';

const CartPage = ({ cart, onRemoveItem, onUpdateQuantity, calculateTotal }) => {
    const navigate = useNavigate();

    // State for shipping
    const [shipping, setShipping] = React.useState(0);
    const [calculatingShipping, setCalculatingShipping] = React.useState(false);

    // Calculate order details
    const subtotal = calculateTotal();
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Load shipping structures and calculate shipping
    React.useEffect(() => {
        const calculateShippingCost = async () => {
            if (!cart || cart.length === 0) {
                setShipping(0);
                return;
            }

            setCalculatingShipping(true);
            try {
                // Load shipping structures
                const structuresResponse = await shippingStructuresAPI.getAllShippingStructures();
                if (structuresResponse.success) {
                    const structures = structuresResponse.data.structures || [];

                    // Find default structure
                    const defaultStructure = structures.find(s => s.isDefault) || structures[0];

                    // Get product details for all cart items
                    const productIds = [...new Set(cart.map(item => item.productId || item.id))];
                    const productsMap = {};

                    for (const productId of productIds) {
                        try {
                            const productResponse = await productsAPI.getProduct(productId);
                            if (productResponse.success) {
                                productsMap[productId] = productResponse.data.product;
                            }
                        } catch (error) {
                            console.error(`Error fetching product ${productId}:`, error);
                        }
                    }

                    // Group cart items by shipping structure
                    const itemsByStructure = {};

                    cart.forEach(item => {
                        const product = productsMap[item.productId || item.id];
                        const structureId = product?.shippingStructure || (defaultStructure?._id);
                        const itemCount = item.isPack ? (item.itemCount || item.quantity) : item.quantity;

                        if (!itemsByStructure[structureId]) {
                            itemsByStructure[structureId] = 0;
                        }
                        itemsByStructure[structureId] += itemCount;
                    });

                    // Calculate shipping for each structure group
                    let totalShipping = 0;

                    for (const [structureId, itemCount] of Object.entries(itemsByStructure)) {
                        const structure = structures.find(s => s._id === structureId) || defaultStructure;
                        if (!structure) continue;

                        // Find applicable rule
                        let applicableRule = null;
                        for (const rule of structure.rules) {
                            if (itemCount >= rule.minItems) {
                                if (rule.maxItems === null || itemCount <= rule.maxItems) {
                                    applicableRule = rule;
                                    break;
                                }
                            }
                        }

                        // If no rule found, use the last rule
                        if (!applicableRule && structure.rules.length > 0) {
                            applicableRule = structure.rules[structure.rules.length - 1];
                        }

                        if (applicableRule) {
                            if (!applicableRule.isFree) {
                                let groupShipping = applicableRule.baseCost;

                                // Add cost for additional items
                                if (applicableRule.costPerAdditionalItem > 0 && itemCount > applicableRule.minItems) {
                                    const additionalItems = itemCount - applicableRule.minItems;
                                    groupShipping += additionalItems * applicableRule.costPerAdditionalItem;
                                }

                                totalShipping += groupShipping;
                            }
                        }
                    }

                    setShipping(totalShipping);
                }
            } catch (error) {
                console.error('Error calculating shipping:', error);
                // Fallback to default calculation
                setShipping(subtotal >= 1000 ? 0 : 50);
            } finally {
                setCalculatingShipping(false);
            }
        };

        calculateShippingCost();
    }, [cart, subtotal]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/products')}
                        className="flex items-center gap-2 text-uk-navy-500 hover:text-uk-navy-600 font-semibold mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Continue Shopping
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-gray-600 mt-2">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
                </div>

                {cart.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-16 text-center"
                    >
                        <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8">Add some products to get started!</p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/products')}
                            className="bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
                        >
                            Browse Products
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item, index) => (
                                <motion.div
                                    key={item.cartId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{item.productName}</h3>
                                            <p className="text-sm text-gray-500">{item.brand}</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => onRemoveItem(item.cartId)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </motion.button>
                                    </div>

                                    {item.isPack ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm flex-wrap">
                                                <Package className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-gray-700">
                                                    {item.packMultiplier}× Wholesale Pack{item.packMultiplier > 1 ? 's' : ''}
                                                </span>
                                                {item.hasDiscount && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                        {item.discountPercent}% OFF
                                                    </span>
                                                )}
                                            </div>

                                            {item.variations && (
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-xs font-semibold text-gray-700 mb-2">Pack Contents:</p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                        {item.variations.map((v, idx) => (
                                                            <div key={idx} className="flex items-center">
                                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                                                {v.quantity}× Size {v.size} - {v.color}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                                        Total: {item.itemCount} items
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-3">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    £{item.totalPrice.toFixed(2)}
                                                </div>
                                                {item.packMultiplier > 1 && (
                                                    <p className="text-sm text-gray-500">
                                                        £{(item.totalPrice / item.packMultiplier).toFixed(2)} per pack
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-700">
                                                Size: <span className="font-semibold">{item.size}</span> |
                                                Color: <span className="font-semibold"> {item.color}</span>
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-600">Quantity:</span>
                                                    <div className="flex items-center gap-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </motion.button>
                                                        <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                                                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                <div className="text-2xl font-bold text-gray-900">
                                                    £{item.totalPrice.toFixed(2)}
                                                </div>
                                            </div>

                                            {item.quantity > 1 && (
                                                <p className="text-sm text-gray-500">
                                                    £{(item.totalPrice / item.quantity).toFixed(2)} per unit
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">£{subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between text-gray-700">
                                        <span>Shipping</span>
                                        <span className="font-semibold">
                                            {calculatingShipping ? (
                                                <span className="text-gray-400 text-sm">Calculating...</span>
                                            ) : shipping === 0 ? (
                                                <span className="text-green-600">FREE</span>
                                            ) : (
                                                <span>£{shipping.toFixed(2)}</span>
                                            )}
                                        </span>
                                    </div>

                                    {subtotal > 0 && subtotal < 1000 && (
                                        <p className="text-xs text-uk-navy-500 bg-uk-navy-50 p-2 rounded">
                                            Add £{(1000 - subtotal).toFixed(2)} more for free shipping!
                                        </p>
                                    )}

                                    <div className="flex justify-between text-gray-700">
                                        <span>Tax (8%)</span>
                                        <span className="font-semibold">£{tax.toFixed(2)}</span>
                                    </div>

                                    <div className="border-t-2 border-gray-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-gray-900">Total</span>
                                            <span className="text-3xl font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent">
                                                £{total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-4 rounded-xl hover:shadow-xl transition-all duration-200 font-bold text-lg mb-3"
                                >
                                    Proceed to Checkout
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/products')}
                                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                                >
                                    Continue Shopping
                                </motion.button>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 text-center">
                                        Secure Checkout • SSL Encrypted
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;


