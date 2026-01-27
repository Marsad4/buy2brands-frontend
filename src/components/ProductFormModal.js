import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import SizeChartBuilder from './SizeChartBuilder';
import ImageUploadManager from './admin/ImageUploadManager';
import SizeChartImageUpload from './admin/SizeChartImageUpload';
import { uploadProductImages, uploadSizeChartImage } from '../api/products.api';
import * as catalogAPI from '../api/catalog.api';
import * as shippingStructuresAPI from '../api/shippingStructures.api';
import { useToast } from '../contexts/ToastContext';

const ProductFormModal = ({ isOpen, onClose, products, setProducts, editingProduct, setEditingProduct }) => {
    const toast = useToast();
  const [formData, setFormData] = useState(editingProduct || {
    name: '',
    brand: '',
    sku: '',
    image: '',
    images: [],
    unitPrice: 0,
    description: '',
    variants: [],
    packConfig: {
      enabled: false,
      discountPercent: 0,
      variations: []
    },
    taxPercentage: 0,
    sizeChart: {
      type: 'table',
      columns: [],
      rows: [],
      imageUrl: '',
      imagePublicId: ''
    }
  });

  const [newVariant, setNewVariant] = useState({ size: '', color: '', stock: 0, sku: '', unitPrice: 0 });
  const [newPackVariant, setNewPackVariant] = useState({ size: '', color: '', quantity: 0 });
  const [catalog, setCatalog] = useState({ brands: [], categories: [], subcategories: [], genders: [], sales: [] });
  const [shippingStructures, setShippingStructures] = useState([]);

  // Load catalog options
  React.useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await catalogAPI.getAllCatalog();
        if (response.success) {
          setCatalog(response.data);
        }
      } catch (error) {
        console.error('Error loading catalog:', error);
      }
    };
    loadCatalog();
  }, []);

  // Load shipping structures
  React.useEffect(() => {
    const loadShippingStructures = async () => {
      try {
        const response = await shippingStructuresAPI.getAllShippingStructures();
        if (response.success) {
          setShippingStructures(response.data.structures || []);
        }
      } catch (error) {
        console.error('Error loading shipping structures:', error);
      }
    };
    loadShippingStructures();
  }, []);

  React.useEffect(() => {
    if (editingProduct) {
      setFormData({
        ...editingProduct,
        images: editingProduct.images || [],
        shippingStructure: editingProduct.shippingStructure?._id || editingProduct.shippingStructure || null
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        sku: '',
        image: '',
        images: [],
        unitPrice: 0,
        description: '',
        variants: [],
        packConfig: {
          enabled: false,
          discountPercent: 0,
          variations: []
        },
        taxPercentage: 0,
        sizeChart: {
          type: 'table',
          columns: [],
          rows: [],
          imageUrl: '',
          imagePublicId: ''
        }
      });
    }
  }, [editingProduct, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Import API functions
      const { createProduct, updateProduct } = require('../api/products.api');

      // Prepare product data
      let productData = { ...formData };

      // Upload product images if there are local files
      const localImages = formData.images.filter(img => img.isLocal && img.file);
      if (localImages.length > 0) {
        const files = localImages.map(img => img.file);
        const uploadResponse = await uploadProductImages(files);

        // Replace local images with uploaded ones
        const uploadedImages = uploadResponse.data.images;
        const existingImages = formData.images.filter(img => !img.isLocal);
        productData.images = [...existingImages, ...uploadedImages];
      } else {
        // Keep existing images
        productData.images = formData.images.filter(img => !img.isLocal);
      }

      // Upload size chart image if it's a local file
      if (formData.sizeChart && formData.sizeChart.type === 'image' && formData.sizeChart.file) {
        const uploadResponse = await uploadSizeChartImage(formData.sizeChart.file);
        productData.sizeChart = {
          ...formData.sizeChart,
          imageUrl: uploadResponse.data.image.url,
          imagePublicId: uploadResponse.data.image.publicId,
          file: undefined // Remove file object
        };
      }

      // Remove file objects from data before sending
      productData.images = productData.images.map(img => ({
        url: img.url,
        publicId: img.publicId,
        order: img.order,
        isFeatured: img.isFeatured
      }));

      // Ensure shippingStructure is sent as ID (not object)
      if (productData.shippingStructure) {
        if (typeof productData.shippingStructure === 'object' && productData.shippingStructure._id) {
          productData.shippingStructure = productData.shippingStructure._id;
        }
      } else {
        productData.shippingStructure = null;
      }

      if (editingProduct) {
        const productId = editingProduct._id || editingProduct.id;
        await updateProduct(productId, productData);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully!');
      }

      // Call onSave callback if provided (to refresh products list)
      if (window.onSave) {
        await window.onSave();
      }

      onClose();
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    }
  };


  const addVariant = () => {
    if (newVariant.size && newVariant.color && newVariant.stock >= 0) {
      // Auto-generate SKU if not provided
      const variantToAdd = {
        ...newVariant,
        sku: newVariant.sku || `${formData.sku || formData.brand?.substring(0, 3).toUpperCase() || 'PRD'}-${newVariant.size}-${newVariant.color}`.replace(/\s+/g, '')
      };
      setFormData({
        ...formData,
        variants: [...formData.variants, variantToAdd]
      });
      setNewVariant({ size: '', color: '', stock: 0, sku: '', unitPrice: 0 });
    }
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const addPackVariation = () => {
    if (newPackVariant.size && newPackVariant.color && newPackVariant.quantity > 0) {
      // Check if this variant exists in product variants
      const variantExists = formData.variants.some(
        v => v.size === newPackVariant.size && v.color === newPackVariant.color
      );
      if (!variantExists) {
        toast.warning('Please add this variant to product variants first!');
        return;
      }

      setFormData({
        ...formData,
        packConfig: {
          ...formData.packConfig,
          variations: [...formData.packConfig.variations, newPackVariant]
        }
      });
      setNewPackVariant({ size: '', color: '', quantity: 0 });
    }
  };

  const removePackVariation = (index) => {
    setFormData({
      ...formData,
      packConfig: {
        ...formData.packConfig,
        variations: formData.packConfig.variations.filter((_, i) => i !== index)
      }
    });
  };

  // Calculate pack statistics
  const calculatePackStats = () => {
    if (!formData.packConfig || !formData.packConfig.variations || !formData.unitPrice) {
      return { totalItems: 0, regularPrice: 0, packPrice: 0, savings: 0 };
    }

    const totalItems = formData.packConfig.variations.reduce((sum, v) => sum + (v.quantity || 0), 0);
    const regularPrice = totalItems * formData.unitPrice;
    const discountMultiplier = 1 - (formData.packConfig.discountPercent || 0) / 100;
    const packPrice = regularPrice * discountMultiplier;
    const savings = regularPrice - packPrice;

    return { totalItems, regularPrice, packPrice, savings };
  };

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
              <h2 className="text-3xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                required
              >
                <option value="">Select Brand</option>
                {catalog.brands.map(brand => (
                  <option key={brand._id} value={brand.name}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                placeholder="e.g., FP-TSH-001"
              />
            </div>

            {/* Product Images Upload */}
            <div className="border-t-2 border-gray-200 pt-4">
              <ImageUploadManager
                images={formData.images}
                onChange={(images) => setFormData({ ...formData, images })}
                maxImages={10}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                placeholder="Product description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Unit Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Tax Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.taxPercentage || 0}
                  onChange={(e) => setFormData({ ...formData, taxPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                  placeholder="e.g., 20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Shipping Structure</label>
              <select
                value={formData.shippingStructure || ''}
                onChange={(e) => setFormData({ ...formData, shippingStructure: e.target.value || null })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
              >
                <option value="">Use Default Shipping Structure</option>
                {shippingStructures.map(structure => (
                  <option key={structure._id} value={structure._id}>
                    {structure.name} {structure.isDefault && '(Default)'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a shipping structure for this product. If not selected, the default structure will be used.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                >
                  <option value="">Select Category</option>
                  {catalog.categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Subcategory</label>
                <select
                  value={formData.subcategory || ''}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                  disabled={!formData.category}
                >
                  <option value="">Select Subcategory</option>
                  {catalog.subcategories
                    .filter(sub => {
                      const parentCat = catalog.categories.find(c => c.name === formData.category);
                      return parentCat && sub.parentId === parentCat._id;
                    })
                    .map(sub => (
                      <option key={sub._id} value={sub.name}>{sub.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Gender</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                >
                  <option value="">Select Gender</option>
                  {catalog.genders.map(gender => (
                    <option key={gender._id} value={gender.name}>{gender.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.onSale || false}
                    onChange={(e) => setFormData({ ...formData, onSale: e.target.checked })}
                    className="w-5 h-5 text-uk-navy-500 border-2 border-gray-200 rounded focus:ring-2 focus:ring-uk-navy-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Product On Sale</span>
                </label>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-4">
              <h3 className="font-bold text-lg mb-3 text-gray-900">Product Variants</h3>

              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-5 gap-2">
                  <input
                    type="text"
                    placeholder="Size"
                    value={newVariant.size}
                    onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                    className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                  />
                  <input
                    type="text"
                    placeholder="Color"
                    value={newVariant.color}
                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                    className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newVariant.stock || ''}
                    onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                    className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Unit Price"
                    value={newVariant.unitPrice || ''}
                    onChange={(e) => setNewVariant({ ...newVariant, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={addVariant}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all"
                  >
                    Add
                  </motion.button>
                </div>
                <input
                  type="text"
                  placeholder="SKU (optional - auto-generated if empty)"
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Size: {variant.size} | Color: {variant.color} | Stock: {variant.stock}
                          {variant.unitPrice > 0 && ` | Price: £${variant.unitPrice}`}
                        </p>
                        {variant.sku && (
                          <p className="text-xs text-gray-500 mt-1">SKU: {variant.sku}</p>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pack Configuration Section */}
            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">Pack Configuration</h3>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.packConfig?.enabled || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      packConfig: {
                        ...formData.packConfig,
                        enabled: e.target.checked
                      }
                    })}
                    className="mr-2 w-5 h-5 text-blue-600"
                  />
                  <span className="text-sm font-semibold text-gray-700">Enable Pack</span>
                </label>
              </div>

              {formData.packConfig?.enabled && (
                <>
                  {/* Discount Percentage */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Discount Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.packConfig.discountPercent || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        packConfig: {
                          ...formData.packConfig,
                          discountPercent: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all"
                      placeholder="e.g., 20"
                    />
                  </div>

                  {/* Add Pack Variation */}
                  <div className="mb-3">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Add Variations to Pack</label>
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Size"
                        value={newPackVariant.size}
                        onChange={(e) => setNewPackVariant({ ...newPackVariant, size: e.target.value })}
                        className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                      />
                      <input
                        type="text"
                        placeholder="Color"
                        value={newPackVariant.color}
                        onChange={(e) => setNewPackVariant({ ...newPackVariant, color: e.target.value })}
                        className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                      />
                      <input
                        type="number"
                        placeholder="Qty in Pack"
                        value={newPackVariant.quantity || ''}
                        onChange={(e) => setNewPackVariant({ ...newPackVariant, quantity: parseInt(e.target.value) || 0 })}
                        className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={addPackVariation}
                        className="bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white rounded-xl hover:shadow-lg font-semibold transition-all"
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>

                  {/* Pack Contents List */}
                  <div className="space-y-2 mb-4">
                    <label className="block text-sm font-semibold text-gray-700">Pack Contents:</label>
                    {formData.packConfig.variations && formData.packConfig.variations.length > 0 ? (
                      formData.packConfig.variations.map((variation, index) => (
                        <div key={index} className="flex justify-between items-center bg-uk-navy-50 p-3 rounded-lg border border-blue-200">
                          <span className="font-medium text-gray-900">
                            {variation.quantity}× Size {variation.size} - {variation.color}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => removePackVariation(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No variations added to pack yet</p>
                    )}
                  </div>

                  {/* Pack Summary */}
                  {formData.packConfig.variations && formData.packConfig.variations.length > 0 && formData.unitPrice > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Pack Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Total Items:</span>
                          <span className="font-semibold">{calculatePackStats().totalItems} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Regular Price:</span>
                          <span className="font-semibold">${calculatePackStats().regularPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Pack Price ({formData.packConfig.discountPercent}% off):</span>
                          <span className="font-semibold text-green-600">${calculatePackStats().packPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-green-300">
                          <span className="font-bold text-gray-900">Savings:</span>
                          <span className="font-bold text-green-600">${calculatePackStats().savings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Size Chart Section */}
            <div className="border-t-2 border-gray-200 pt-4">
              <h3 className="font-bold text-lg mb-3 text-gray-900">Size Chart</h3>
              <SizeChartBuilder
                sizeChart={formData.sizeChart}
                onChange={(sizeChartData) => setFormData({ ...formData, sizeChart: sizeChartData })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white py-3 rounded-xl hover:shadow-lg font-semibold transition-all"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence >
  );
};

export default ProductFormModal;



