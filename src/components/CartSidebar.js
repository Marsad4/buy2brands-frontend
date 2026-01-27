import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';

const CartSidebar = ({ isOpen, onClose, cart, onRemoveItem, calculateTotal }) => {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Shopping Cart</h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <p className="text-blue-100">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add some products to get started!</p>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.cartId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{item.productName}</h4>
                            <p className="text-xs text-gray-500 font-medium">{item.brand}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRemoveItem(item.cartId)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {item.isPack ? (
                          <div className="text-sm">
                            <div className="mb-2">
                              <p className="text-gray-700 font-semibold mb-1">
                                {item.packMultiplier}× Pack{item.packMultiplier > 1 ? 's' : ''} ({item.itemCount} items total)
                              </p>
                              {item.variations && (
                                <div className="text-xs text-gray-600 space-y-0.5 ml-2">
                                  {item.variations.map((v, idx) => (
                                    <p key={idx}>• {v.quantity}× Size {v.size} - {v.color}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-lg text-blue-600">
                                  £{item.totalPrice.toFixed(2)}
                                </p>
                                {item.packMultiplier > 1 && (
                                  <p className="text-xs text-gray-500">
                                    £{(item.totalPrice / item.packMultiplier).toFixed(2)} per pack
                                  </p>
                                )}
                              </div>
                              {item.hasDiscount && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                                  {item.discountPercent}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <p className="text-gray-700 mb-1">
                              {item.size} / {item.color} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                            </p>
                            <div>
                              <p className="font-bold text-lg text-gray-900">£{item.totalPrice.toFixed(2)}</p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-500">
                                  £{(item.totalPrice / item.quantity).toFixed(2)} per unit
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t-2 border-gray-200 pt-6 bg-gradient-to-br from-uk-navy-50 to-uk-red-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent">
                        £{calculateTotal().toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onClose();
                          navigate('/checkout');
                        }}
                        className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-4 rounded-xl hover:shadow-xl transition-all duration-200 font-bold text-lg"
                      >
                        Proceed to Checkout
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onClose();
                          navigate('/cart');
                        }}
                        className="w-full bg-white border-2 border-blue-600 text-uk-navy-500 py-3 rounded-xl hover:bg-uk-navy-50 transition-all duration-200 font-semibold"
                      >
                        View Full Cart
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                      >
                        Keep Shopping
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;



