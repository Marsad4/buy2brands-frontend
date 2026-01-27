import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Package } from 'lucide-react';

const ProductDetailCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const [selectedVariants, setSelectedVariants] = useState({});
  const [packMultiplier, setPackMultiplier] = useState(0);
  const [isPackIntact, setIsPackIntact] = useState(true);

  // Check if pack is enabled
  const hasPackConfig = product.packConfig && product.packConfig.enabled && product.packConfig.variations && product.packConfig.variations.length > 0;

  // Initialize variants from pack when pack multiplier changes
  useEffect(() => {
    if (packMultiplier > 0 && hasPackConfig) {
      const packVariants = {};
      product.packConfig.variations.forEach(packVar => {
        const variantKey = `${packVar.size}-${packVar.color}`;
        packVariants[variantKey] = {
          size: packVar.size,
          color: packVar.color,
          quantity: packVar.quantity * packMultiplier,
          originalPackQty: packVar.quantity * packMultiplier
        };
      });
      setSelectedVariants(packVariants);
      setIsPackIntact(true);
    } else if (packMultiplier === 0) {
      setSelectedVariants({});
      setIsPackIntact(true);
    }
  }, [packMultiplier, product, hasPackConfig]);

  // Check if pack is still intact when variants change
  useEffect(() => {
    if (packMultiplier > 0 && hasPackConfig) {
      let intact = true;
      product.packConfig.variations.forEach(packVar => {
        const variantKey = `${packVar.size}-${packVar.color}`;
        const expectedQty = packVar.quantity * packMultiplier;
        const actualQty = selectedVariants[variantKey]?.quantity || 0;
        if (actualQty !== expectedQty) {
          intact = false;
        }
      });
      setIsPackIntact(intact);
    }
  }, [selectedVariants, packMultiplier, product, hasPackConfig]);

  const handleVariantQuantityChange = (variantKey, change) => {
    const variant = product.variants.find(v => `${v.size}-${v.color}` === variantKey);
    if (!variant) return;

    // Check if this variant is part of the pack
    const isVariantInPack = hasPackConfig && packMultiplier > 0 && product.packConfig.variations.some(
      pv => `${pv.size}-${pv.color}` === variantKey
    );

    // If pack is active and this variant is NOT in the pack, disable pack discount but keep variants
    if (packMultiplier > 0 && !isVariantInPack) {
      setIsPackIntact(false);
    }

    const currentQty = selectedVariants[variantKey]?.quantity || 0;
    const newQty = Math.max(0, Math.min(variant.stock, currentQty + change));

    if (newQty === 0) {
      const { [variantKey]: removed, ...rest } = selectedVariants;
      setSelectedVariants(rest);
    } else {
      setSelectedVariants({
        ...selectedVariants,
        [variantKey]: {
          ...variant,
          quantity: newQty,
          originalPackQty: selectedVariants[variantKey]?.originalPackQty || 0
        }
      });
    }
  };

  const calculatePackStats = () => {
    if (!hasPackConfig) return { totalItems: 0, regularPrice: 0, packPrice: 0 };

    const totalItems = product.packConfig.variations.reduce((sum, v) => sum + v.quantity, 0);
    const regularPrice = totalItems * product.unitPrice;
    const discountMultiplier = 1 - (product.packConfig.discountPercent / 100);
    const packPrice = regularPrice * discountMultiplier;

    return { totalItems, regularPrice, packPrice };
  };

  const calculateTotalPrice = () => {
    const variantQuantities = Object.values(selectedVariants);
    if (variantQuantities.length === 0) return 0;

    // If pack is intact and we have pack multiplier, use discounted price
    if (packMultiplier > 0 && isPackIntact && hasPackConfig) {
      const { packPrice } = calculatePackStats();
      return packPrice * packMultiplier;
    }

    // Otherwise use regular pricing
    return variantQuantities.reduce((sum, variant) => {
      return sum + (product.unitPrice * variant.quantity);
    }, 0);
  };

  const handleAddToCart = () => {
    if (packMultiplier > 0 && isPackIntact && hasPackConfig) {
      // Adding as pack with discount
      const { totalItems, packPrice } = calculatePackStats();
      const totalPrice = packPrice * packMultiplier;

      onAddToCart({
        productId: product._id || product.id,
        productName: product.name,
        brand: product.brand,
        isPack: true,
        packMultiplier: packMultiplier,
        hasDiscount: true,
        discountPercent: product.packConfig.discountPercent,
        variations: product.packConfig.variations.map(v => ({
          ...v,
          quantity: v.quantity * packMultiplier
        })),
        quantity: packMultiplier,
        totalPrice: totalPrice,
        itemCount: totalItems * packMultiplier
      });
    } else {
      // Adding individual units
      Object.values(selectedVariants).forEach(variant => {
        if (variant.quantity > 0) {
          const individualTotalPrice = product.unitPrice * variant.quantity;
          onAddToCart({
            productId: product._id || product.id,
            productName: product.name,
            brand: product.brand,
            isPack: false,
            size: variant.size,
            color: variant.color,
            quantity: variant.quantity,
            totalPrice: individualTotalPrice
          });
        }
      });
    }

    // Reset selections
    setSelectedVariants({});
    setPackMultiplier(0);
    setIsPackIntact(true);
  };

  const canAddToCart = packMultiplier > 0 || Object.values(selectedVariants).some(v => v.quantity > 0);
  const packStats = calculatePackStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Column 1: Product Image */}
        <div
          onClick={() => {
            const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            navigate(`/product/${product.id || product._id}/${productSlug}`);
          }}
          className="lg:w-96 flex-shrink-0 bg-gray-50 p-4 flex items-center justify-center cursor-pointer group"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Column 2: Pack & Variants Selection */}
        <div className="lg:w-96 flex-shrink-0 p-4 border-l border-r border-gray-200">
          {/* Pack Selection */}
          {hasPackConfig && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="bg-gradient-to-r from-uk-navy-50 to-uk-red-50 border-2 border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-gray-900">Wholesale Pack</h3>
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      {product.packConfig.discountPercent}% OFF
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPackMultiplier(Math.max(0, packMultiplier - 1))}
                      disabled={packMultiplier === 0}
                      className="p-1 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
                    >
                      <Minus className="w-3 h-3" />
                    </motion.button>
                    <span className="w-8 text-center font-bold text-sm text-gray-900">{packMultiplier}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPackMultiplier(packMultiplier + 1)}
                      className="p-1 rounded-lg bg-white hover:bg-gray-100 transition-colors border border-gray-300"
                    >
                      <Plus className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">£{packStats.packPrice.toFixed(2)}</span>
                      <span className="text-xs text-gray-400 line-through">£{packStats.regularPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-600">{packStats.totalItems} items per pack</p>
                  </div>
                </div>
              </div>

              {packMultiplier > 0 && !isPackIntact && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm mt-2">
                  <p className="text-red-700 font-semibold text-xs">⚠️ Pack discount removed - Regular pricing applies</p>
                </div>
              )}
            </div>
          )}

          {/* Individual Units Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {hasPackConfig ? 'Customize Quantities' : `Individual Units (£${product.unitPrice}/unit)`}
            </label>

            {/* Variants Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Size</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Color</th>
                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700">Stock</th>
                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.variants.map((variant) => {
                    const variantKey = `${variant.size}-${variant.color}`;
                    const selected = selectedVariants[variantKey];
                    const quantity = selected?.quantity || 0;
                    const isAvailable = variant.stock > 0;
                    const isFromPack = packMultiplier > 0 && product.packConfig?.variations?.some(
                      v => v.size === variant.size && v.color === variant.color
                    );

                    // Disable if pack is active AND intact, but this variant is not in pack
                    // Once pack is modified, all variants become available
                    const isDisabled = packMultiplier > 0 && hasPackConfig && isPackIntact && !isFromPack;

                    return (
                      <tr
                        key={variantKey}
                        className={`hover:bg-gray-50 transition-colors ${!isAvailable ? 'opacity-50' : ''
                          } ${isFromPack ? 'bg-blue-50' : ''} ${isDisabled ? 'opacity-40' : ''}`}
                      >
                        <td className="px-2 py-2 font-medium text-gray-900 text-xs">
                          {variant.size}
                          {isDisabled && (
                            <span className="block text-red-500 text-[10px] mt-0.5">Not in pack</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-gray-600 text-xs">
                          {variant.color}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {isAvailable ? (
                            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              {variant.stock}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {isAvailable ? (
                            <div className="flex items-center justify-center gap-1">
                              <motion.button
                                whileHover={{ scale: isDisabled ? 1 : 1.1 }}
                                whileTap={{ scale: isDisabled ? 1 : 0.9 }}
                                onClick={() => handleVariantQuantityChange(variantKey, -1)}
                                disabled={quantity === 0 || isDisabled}
                                className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </motion.button>
                              <span className="w-8 text-center font-semibold text-xs">{quantity}</span>
                              <motion.button
                                whileHover={{ scale: isDisabled ? 1 : 1.1 }}
                                whileTap={{ scale: isDisabled ? 1 : 0.9 }}
                                onClick={() => handleVariantQuantityChange(variantKey, 1)}
                                disabled={quantity >= variant.stock || isDisabled}
                                className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </motion.button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column 3: Product Info */}
        <div className="flex-1 p-4">
          {/* Brand & Name */}
          <p className="text-xs text-gray-500 font-semibold mb-1">{product.brand}</p>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
            {product.name}
          </h3>

          {/* Unit Price */}
          <div className="mb-3">
            <span className="text-sm text-gray-600">Unit Price: </span>
            <span className="text-lg font-bold text-blue-600">£{product.unitPrice}</span>
            <span className="text-xs text-gray-500 ml-1">per item</span>
          </div>

          {/* SKU */}
          <p className="text-xs text-gray-500 mb-4">SKU: {product.sku || `WH-${product.id.toString().padStart(4, '0')}`}</p>

          {/* Total Price Summary */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Order Total</h3>
            {packMultiplier > 0 && isPackIntact ? (
              <div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Pack Discount Applied</span>
                    <span className="ml-auto bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {product.packConfig.discountPercent}% OFF
                    </span>
                  </div>
                  <div className="border-t border-green-200 pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Items:</span>
                      <span className="text-xs font-semibold">{packStats.totalItems * packMultiplier}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        £{calculateTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Total Items:</span>
                  <span className="text-xs font-semibold">{Object.values(selectedVariants).reduce((sum, v) => sum + v.quantity, 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    £{calculateTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">Description</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {product.description || `Premium quality ${product.name.toLowerCase()} from ${product.brand}. Perfect for wholesale orders with bulk pricing available.`}
            </p>
          </div>

          {/* Total Price Summary */}
          {canAddToCart && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
              <div className="space-y-1 text-sm">
                {packMultiplier > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {packMultiplier}× Pack{packMultiplier > 1 ? 's' : ''} ({packStats.totalItems * packMultiplier} items):
                    </span>
                    <span className="font-semibold">£{calculateTotalPrice().toFixed(2)}</span>
                  </div>
                )}
                {!isPackIntact && packMultiplier > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Custom quantities:</span>
                    <span className="font-semibold">£{calculateTotalPrice().toFixed(2)}</span>
                  </div>
                )}
                {packMultiplier === 0 && Object.values(selectedVariants).some(v => v.quantity > 0) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Individual units:</span>
                    <span className="font-semibold">£{calculateTotalPrice().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent text-lg">
                    £{calculateTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="w-full bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-bold text-sm disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetailCard;


