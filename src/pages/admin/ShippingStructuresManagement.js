import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import * as shippingStructuresAPI from '../../api/shippingStructures.api';
import { useToast } from '../../contexts/ToastContext';

const ShippingStructuresManagement = () => {
    const toast = useToast();
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        rules: [{ minItems: 0, maxItems: null, baseCost: 0, costPerAdditionalItem: 0, isFree: false }],
        isDefault: false,
        isActive: true
    });

    useEffect(() => {
        loadStructures();
    }, []);

    const loadStructures = async () => {
        try {
            setLoading(true);
            const response = await shippingStructuresAPI.getAllShippingStructuresAdmin();
            if (response.success) {
                setStructures(response.data.structures || []);
            }
        } catch (error) {
            console.error('Error loading shipping structures:', error);
            toast.error('Failed to load shipping structures');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRule = () => {
        setFormData({
            ...formData,
            rules: [...formData.rules, { minItems: 0, maxItems: null, baseCost: 0, costPerAdditionalItem: 0, isFree: false }]
        });
    };

    const handleRemoveRule = (index) => {
        if (formData.rules.length > 1) {
            setFormData({
                ...formData,
                rules: formData.rules.filter((_, i) => i !== index)
            });
        } else {
            toast.warning('At least one rule is required');
        }
    };

    const handleRuleChange = (index, field, value) => {
        const updatedRules = [...formData.rules];
        updatedRules[index] = {
            ...updatedRules[index],
            [field]: field === 'maxItems' && value === '' ? null : (field === 'isFree' ? value : Number(value))
        };
        setFormData({ ...formData, rules: updatedRules });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await shippingStructuresAPI.updateShippingStructure(editingId, formData);
                toast.success('Shipping structure updated successfully!');
            } else {
                await shippingStructuresAPI.createShippingStructure(formData);
                toast.success('Shipping structure created successfully!');
            }
            setShowForm(false);
            setEditingId(null);
            resetForm();
            loadStructures();
        } catch (error) {
            toast.error(error.message || 'Failed to save shipping structure');
        }
    };

    const handleEdit = (structure) => {
        setFormData({
            name: structure.name,
            description: structure.description || '',
            rules: structure.rules || [],
            isDefault: structure.isDefault || false,
            isActive: structure.isActive !== undefined ? structure.isActive : true
        });
        setEditingId(structure._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this shipping structure?')) return;

        try {
            await shippingStructuresAPI.deleteShippingStructure(id);
            toast.success('Shipping structure deleted successfully!');
            loadStructures();
        } catch (error) {
            toast.error(error.message || 'Failed to delete shipping structure');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            rules: [{ minItems: 0, maxItems: null, baseCost: 0, costPerAdditionalItem: 0, isFree: false }],
            isDefault: false,
            isActive: true
        });
        setEditingId(null);
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-uk-navy-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading shipping structures...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent mb-2">
                            Shipping Structures Management
                        </h2>
                        <p className="text-gray-600">Configure shipping cost rules based on item quantities</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add Structure
                    </motion.button>
                </div>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowForm(false);
                            resetForm();
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {editingId ? 'Edit Shipping Structure' : 'Create Shipping Structure'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Structure Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500"
                                        rows="3"
                                    />
                                </div>

                                {/* Rules */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Shipping Rules <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddRule}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Rule
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.rules.map((rule, index) => (
                                            <div key={index} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-semibold text-gray-700">Rule {index + 1}</span>
                                                    {formData.rules.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveRule(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                            Min Items <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={rule.minItems}
                                                            onChange={(e) => handleRuleChange(index, 'minItems', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                            min="0"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                            Max Items (leave empty for unlimited)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={rule.maxItems || ''}
                                                            onChange={(e) => handleRuleChange(index, 'maxItems', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                            min={rule.minItems + 1}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                            Base Cost (£) <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={rule.baseCost}
                                                            onChange={(e) => handleRuleChange(index, 'baseCost', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                            min="0"
                                                            step="0.01"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                            Cost Per Additional Item (£)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={rule.costPerAdditionalItem}
                                                            onChange={(e) => handleRuleChange(index, 'costPerAdditionalItem', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>

                                                    <div className="flex items-end">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={rule.isFree}
                                                                onChange={(e) => handleRuleChange(index, 'isFree', e.target.checked)}
                                                                className="w-4 h-4"
                                                            />
                                                            <span className="text-xs font-semibold text-gray-600">Free Shipping</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isDefault}
                                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">Set as Default</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">Active</span>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white rounded-xl hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        {editingId ? 'Update Structure' : 'Create Structure'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Structures List */}
            <div className="space-y-4">
                {structures.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <Truck className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Shipping Structures</h3>
                        <p className="text-gray-600">Create your first shipping structure to get started</p>
                    </div>
                ) : (
                    structures.map((structure) => (
                        <motion.div
                            key={structure._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{structure.name}</h3>
                                        {structure.isDefault && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                Default
                                            </span>
                                        )}
                                        {!structure.isActive && (
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    {structure.description && (
                                        <p className="text-gray-600 text-sm">{structure.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(structure)}
                                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(structure._id)}
                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-700 mb-2">Rules:</h4>
                                {structure.rules.map((rule, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold text-gray-700">
                                                {rule.minItems} - {rule.maxItems === null ? '∞' : rule.maxItems} items:
                                            </span>
                                            {rule.isFree ? (
                                                <span className="text-green-600 font-bold">FREE</span>
                                            ) : (
                                                <span className="text-gray-900">
                                                    £{rule.baseCost.toFixed(2)}
                                                    {rule.costPerAdditionalItem > 0 && ` + £${rule.costPerAdditionalItem.toFixed(2)} per additional item`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default ShippingStructuresManagement;
