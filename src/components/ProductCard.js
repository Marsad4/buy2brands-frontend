import React from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onSelect }) => {
  const discountPercent = ((1 - (product.packPrice / (product.packSize * product.unitPrice))) * 100).toFixed(0);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="relative overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Save {discountPercent}%
          </span>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">{product.brand}</p>
        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-uk-navy-500 transition-colors">
          {product.name}
        </h3>

        <div className="bg-gradient-to-br from-uk-navy-50 to-uk-red-50 rounded-xl p-4 mb-4 border border-uk-navy-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Pack of {product.packSize}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-gray-900">£{product.packPrice}</span>
              {product.hasDiscount && (
                <span className="ml-2 text-sm text-gray-400 line-through">
                  £{Math.round(product.packPrice * (1 + product.discountPercent / 100))}
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-600">
              £{(product.packPrice / product.packSize).toFixed(2)}/unit
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Single unit:</span>
          <span className="text-sm font-semibold text-gray-900">£{product.unitPrice}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(product)}
          className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold text-lg"
        >
          View Options
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;




