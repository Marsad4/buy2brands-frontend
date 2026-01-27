import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash2, Settings } from 'lucide-react';
import * as catalogAPI from '../../api/catalog.api';
import { useToast } from '../../contexts/ToastContext';

const CatalogManagement = () => {
    const toast = useToast();
    const [catalog, setCatalog] = useState({ brands: [], categories: [], subcategories: [], genders: [], sales: [] });
    const [activeTab, setActiveTab] = useState('brands');
    const [formData, setFormData] = useState({ type: '', name: '', parentId: '', discount: 0 });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadCatalog();
    }, []);

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

    const handleCreate = async (e) => {
        e.preventDefault();

        // Map tab names to proper singular types
        const typeMap = {
            'brands': 'brand',
            'categories': 'category',
            'subcategories': 'subcategory',
            'genders': 'gender',
            'sales': 'sale'
        };

        try {
            await catalogAPI.createCatalogItem({ ...formData, type: typeMap[activeTab] });
            setFormData({ type: '', name: '', parentId: '', discount: 0 });
            setShowForm(false);
            loadCatalog();
            toast.success('Item created successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to create item');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this item? It will fail if in use by products.')) {
            try {
                await catalogAPI.deleteCatalogItem(id);
                loadCatalog();
                toast.success('Item deleted successfully!');
            } catch (error) {
                toast.error(error.message || 'Failed to delete');
            }
        }
    };

    const tabs = [
        { id: 'brands', label: 'Brands', icon: Tag },
        { id: 'categories', label: 'Categories', icon: Tag },
        { id: 'subcategories', label: 'Subcategories', icon: Tag },
        { id: 'genders', label: 'Genders', icon: Tag }
    ];

    const [filterParentId, setFilterParentId] = useState('');

    const getItems = () => {
        let items = catalog[activeTab] || [];

        // Filter subcategories by parent if filter selected
        if (activeTab === 'subcategories' && filterParentId) {
            items = items.filter(i => i.parentId === filterParentId);
        }
        return items;
    };

    // Group subcategories by parent for display
    const getGroupedSubcategories = () => {
        const items = getItems();
        if (activeTab !== 'subcategories') return null;

        const grouped = {};
        // Initialize groups for all categories (or filtered one)
        const relevantCategories = filterParentId
            ? catalog.categories.filter(c => c._id === filterParentId)
            : catalog.categories;

        relevantCategories.forEach(cat => {
            grouped[cat._id] = {
                name: cat.name,
                items: items.filter(i => i.parentId === cat._id)
            };
        });

        // Also capture orphans or items whose parent is not loaded/found (though unlikely with integrity checks)
        const orphans = items.filter(i => !catalog.categories.find(c => c._id === i.parentId));
        if (orphans.length > 0) {
            grouped['orphaned'] = { name: 'Uncategorized', items: orphans };
        }

        return grouped;
    };

    return (
        <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-uk-navy-500 to-uk-red-500 bg-clip-text text-transparent mb-6">
                Catalog Management
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => { setActiveTab(tab.id); setFilterParentId(''); }}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {tab.label} ({catalog[tab.id]?.length || 0})
                    </motion.button>
                ))}
            </div>

            {/* Subcategory Filter */}
            {activeTab === 'subcategories' && (
                <div className="mb-6 flex gap-4 items-center">
                    <select
                        value={filterParentId}
                        onChange={(e) => setFilterParentId(e.target.value)}
                        className="px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-uk-navy-500 bg-white"
                    >
                        <option value="">All Parent Categories</option>
                        {catalog.categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Add Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowForm(!showForm)}
                className="mb-4 px-6 py-3 bg-green-600 text-white rounded-xl flex items-center gap-2 font-semibold hover:shadow-lg"
            >
                <Plus className="w-5 h-5" />
                {showForm ? 'Cancel' : `Add ${activeTab.slice(0, -1)}`}
            </motion.button>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                    <div className="grid gap-4">
                        <input
                            type="text"
                            placeholder="Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                        />
                        {activeTab === 'subcategories' && (
                            <select
                                value={formData.parentId}
                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                className="px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-uk-navy-500"
                                required
                            >
                                <option value="">Select Parent Category</option>
                                {catalog.categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        )}
                        <button type="submit" className="px-6 py-3 bg-uk-navy-500 text-white rounded-xl font-semibold hover:shadow-lg">
                            Create
                        </button>
                    </div>
                </form>
            )}

            {/* Items List */}
            <div className="grid gap-6">
                {activeTab === 'subcategories' ? (
                    Object.values(getGroupedSubcategories() || {}).map((group) => (
                        group.items.length > 0 && (
                            <div key={group.name} className="bg-gray-50 p-4 rounded-2xl">
                                <h3 className="font-bold text-lg text-gray-700 mb-3 px-2 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-uk-navy-500" />
                                    {group.name}
                                    <span className="text-sm font-normal text-gray-500">({group.items.length})</span>
                                </h3>
                                <div className="grid gap-3">
                                    {group.items.map((item, index) => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center"
                                        >
                                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))
                ) : (
                    getItems().map((item, index) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="bg-white p-4 rounded-xl shadow-lg flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => handleDelete(item._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    ))
                )}
                {getItems().length === 0 && (
                    <div className="bg-white p-16 rounded-2xl shadow-lg text-center">
                        <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} yet</h3>
                        <p className="text-gray-600">Create your first {activeTab.slice(0, -1)} to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogManagement;
