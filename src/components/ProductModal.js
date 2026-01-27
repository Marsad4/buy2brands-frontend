import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ProductModal = ({ product, onClose, onAddToCart }) => {
  const [mode, setMode] = useState('pack');
  const [packQuantity, setPackQuantity] = useState(1);
  const [packUnits, setPackUnits] = useState(product.packSize);
  const [singleItems, setSingleItems] = useState({});

  // Track if pack configuration is intact
  const isPackIntact = packUnits === product.packSize;

  const handlePackUnitsChange = (value) => {
    const units = parseInt(value) || 0;
    setPackUnits(units);
  };

  const calculatePackPrice = () => {
    const isFullPack = packUnits === product.packSize;
    const pricePerUnit = isFullPack ? product.packPrice / product.packSize : product.unitPrice;
    return pricePerUnit * packUnits * packQuantity;
  };

  const handleSingleQuantityChange = (variantKey, quantity) => {
    setSingleItems({
      ...singleItems,
      [variantKey]: { ...singleItems[variantKey], quantity: parseInt(quantity) || 0 }
    });
  };

  const toggleSingleItem = (variant) => {
    const key = `${variant.size}-${variant.color}`;
    if (singleItems[key]) {
      const { [key]: removed, ...rest } = singleItems;
      setSingleItems(rest);
    } else {
      setSingleItems({
        ...singleItems,
        [key]: { ...variant, quantity: 1 }
      });
    }
  };

  const handleAddPackToCart = () => {
    const isFullPack = packUnits === product.packSize;
    const item = {
      productName: product.name,
      brand: product.brand,
      isPack: true,
      packSize: product.packSize,
      quantity: packQuantity,
      actualUnits: packUnits,
      hasDiscount: isFullPack,
      totalPrice: calculatePackPrice()
    };
    onAddToCart(item);
    onClose();
  };

  const handleAddSingleToCart = () => {
    Object.values(singleItems).forEach(item => {
      if (item.quantity > 0) {
        onAddToCart({
          productName: product.name,
          brand: product.brand,
          isPack: false,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          totalPrice: product.unitPrice * item.quantity
        });
      }
    });
    onClose();
  };

  const groupedVariants = product.variants.reduce((acc, variant) => {
    if (!acc[variant.color]) acc[variant.color] = [];
    acc[variant.color].push(variant);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white p-6 rounded-t-2xl flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-3xl font-bold mb-1">{product.name}</h2>
              <p className="text-blue-100">{product.brand}</p>
            </div>
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('pack')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${mode === 'pack'
                  ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Buy Pack (Wholesale)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('single')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${mode === 'single'
                  ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Buy Individual Units
              </motion.button>
            </div>

            {mode === 'pack' ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-uk-navy-50 to-uk-red-50 rounded-xl p-5 border-2 border-uk-navy-100">
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Pack Pricing</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Full pack of {product.packSize} units: <span className="font-bold text-uk-navy-500 text-lg">£{product.packPrice}</span>
                    {' '}(£{(product.packPrice / product.packSize).toFixed(2)}/unit)
                  </p>
                  <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded-lg mt-2">
                    ⚠️ Changing pack quantity removes discount. Individual units: £{product.unitPrice}/unit
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Units per pack (Default: {product.packSize})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={packUnits}
                    onChange={(e) => handlePackUnitsChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Number of packs
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={packQuantity}
                    onChange={(e) => setPackQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                  />
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border-2 border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700 font-medium">Total Units:</span>
                    <span className="font-bold text-lg">{packUnits * packQuantity}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700 font-medium">Price per Unit:</span>
                    <span className="font-bold text-lg">
                      £{(calculatePackPrice() / (packUnits * packQuantity)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xl border-t-2 border-gray-300 pt-3">
                    <span className="font-bold text-gray-900">Total Price:</span>
                    <span className="font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent text-3xl">
                      £{calculatePackPrice().toFixed(2)}
                    </span>
                  </div>
                  {packUnits !== product.packSize && (
                    <p className="text-red-600 text-sm mt-3 font-medium bg-red-50 p-2 rounded-lg">
                      No discount applied - using regular unit price
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddPackToCart}
                  className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-4 rounded-xl hover:shadow-xl transition-all duration-200 font-bold text-lg"
                >
                  Add to Cart
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-5 border-2 border-gray-200">
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    Select sizes and colors, then choose quantity for each
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    Price: <span className="text-blue-600">£{product.unitPrice}</span>/unit
                  </p>
                </div>

                {Object.entries(groupedVariants).map(([color, variants]) => (
                  <div key={color} className="border-2 border-gray-200 rounded-xl p-5 bg-white">
                    <h4 className="font-bold text-lg mb-4 text-gray-900">{color}</h4>
                    <div className="space-y-3">
                      {variants.map(variant => {
                        const key = `${variant.size}-${variant.color}`;
                        const isSelected = !!singleItems[key];

                        // Check if this variant is in the pack configuration
                        const isInPack = product.packConfig?.variations?.some(
                          pv => pv.size === variant.size && pv.color === variant.color
                        );

                        // Disable if pack has units AND is intact, but this variant is not in pack
                        // Once pack is modified, all variants become available
                        const isDisabled = packUnits > 0 && isPackIntact && !isInPack;

                        return (
                          <motion.div
                            key={key}
                            whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                            className={`flex items-center gap-4 p-3 rounded-lg transition-all ${isSelected ? 'bg-uk-navy-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-transparent'
                              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isDisabled ? 'This variant is not available while pack is selected' : ''}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSingleItem(variant)}
                              disabled={isDisabled}
                              className="w-5 h-5 text-uk-navy-500 rounded focus:ring-2 focus:ring-uk-navy-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <span className="flex-1 font-medium">
                              Size {variant.size}
                              <span className="text-gray-500 text-sm ml-2">
                                ({variant.stock} in stock)
                              </span>
                              {isDisabled && (
                                <span className="text-red-500 text-xs ml-2 block">
                                  Not available in selected pack
                                </span>
                              )}
                            </span>
                            {isSelected && !isDisabled && (
                              <motion.input
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                type="number"
                                min="1"
                                max={variant.stock}
                                value={singleItems[key]?.quantity || 1}
                                onChange={(e) => handleSingleQuantityChange(key, e.target.value)}
                                className="w-24 px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-uk-navy-500 font-semibold"
                              />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border-2 border-gray-200">
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent text-3xl">
                      £{Object.values(singleItems).reduce((sum, item) =>
                        sum + (item.quantity * product.unitPrice), 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddSingleToCart}
                  disabled={Object.keys(singleItems).length === 0}
                  className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-4 rounded-xl hover:shadow-xl transition-all duration-200 font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  Add to Cart
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductModal;




