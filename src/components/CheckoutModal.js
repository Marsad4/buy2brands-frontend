import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, cart, calculateTotal, onPlaceOrder }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white p-6 rounded-t-2xl flex-shrink-0">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Checkout</h2>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h3>
                <div className="space-y-3 bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-xl border-2 border-gray-200">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.cartId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{item.productName}</p>
                        <p className="text-gray-600 text-sm">
                          {item.isPack 
                            ? `Pack of ${item.packSize} × ${item.quantity}`
                            : `${item.size} / ${item.color} × ${item.quantity}`
                          }
                        </p>
                      </div>
                      <p className="font-bold text-uk-navy-500 text-lg">${item.totalPrice.toFixed(2)}</p>
                    </motion.div>
                  ))}
                  <div className="border-t-2 border-gray-300 pt-4 flex justify-between items-center">
                    <span className="font-bold text-xl text-gray-900">Total:</span>
                    <span className="font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent text-2xl">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Billing Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Company Name</label>
                      <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Tax ID</label>
                      <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Contact Person</label>
                    <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                    <input type="email" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Phone</label>
                    <input type="tel" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Shipping Address</label>
                    <textarea rows="3" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"></textarea>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-uk-navy-50 hover:border-uk-navy-300 transition-all">
                    <input type="radio" name="payment" defaultChecked className="w-5 h-5 text-blue-600" />
                    <span className="ml-3 font-semibold text-gray-900">Bank Transfer</span>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-uk-navy-50 hover:border-uk-navy-300 transition-all">
                    <input type="radio" name="payment" className="w-5 h-5 text-blue-600" />
                    <span className="ml-3 font-semibold text-gray-900">Purchase Order</span>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-uk-navy-50 hover:border-uk-navy-300 transition-all">
                    <input type="radio" name="payment" className="w-5 h-5 text-blue-600" />
                    <span className="ml-3 font-semibold text-gray-900">Credit Account (Net 30)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 rounded-b-2xl">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPlaceOrder}
              className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-4 rounded-xl hover:shadow-xl transition-all duration-200 font-bold text-lg"
            >
              Place Order - ${calculateTotal().toFixed(2)}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutModal;




