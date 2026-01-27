import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Upload, Table, Image as ImageIcon } from 'lucide-react';
import SizeChartImageUpload from './admin/SizeChartImageUpload';

const SizeChartBuilder = ({ sizeChart, onChange }) => {
    const [chartType, setChartType] = useState(sizeChart?.type || 'table');
    const [columns, setColumns] = useState(sizeChart?.columns || ['Size']);
    const [rows, setRows] = useState(sizeChart?.rows || []);
    const [imageUrl, setImageUrl] = useState(sizeChart?.imageUrl || '');
    const [newColumnName, setNewColumnName] = useState('');

    // Update parent component whenever data changes
    const updateParent = (updates) => {
        onChange({
            type: chartType,
            columns: columns,
            rows: rows,
            imageUrl: imageUrl,
            ...updates
        });
    };

    const handleTypeChange = (type) => {
        setChartType(type);
        updateParent({ type });
    };

    const addColumn = () => {
        if (newColumnName.trim()) {
            const newColumns = [...columns, newColumnName.trim()];
            setColumns(newColumns);
            setNewColumnName('');
            updateParent({ columns: newColumns });
        }
    };

    const removeColumn = (index) => {
        const newColumns = columns.filter((_, i) => i !== index);
        // Also remove data from rows for this column
        const newRows = rows.map(row => {
            const newRow = {};
            newColumns.forEach(col => {
                if (row[columns[index]] && col !== columns[index]) {
                    newRow[col] = row[col];
                } else if (row[col]) {
                    newRow[col] = row[col];
                }
            });
            return newRow;
        });
        setColumns(newColumns);
        setRows(newRows);
        updateParent({ columns: newColumns, rows: newRows });
    };

    const addRow = () => {
        const newRow = {};
        columns.forEach(col => {
            newRow[col] = '';
        });
        const newRows = [...rows, newRow];
        setRows(newRows);
        updateParent({ rows: newRows });
    };

    const removeRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        updateParent({ rows: newRows });
    };

    const updateCell = (rowIndex, columnName, value) => {
        const newRows = [...rows];
        newRows[rowIndex] = {
            ...newRows[rowIndex],
            [columnName]: value
        };
        setRows(newRows);
        updateParent({ rows: newRows });
    };

    const handleImageUrlChange = (data) => {
        // data = { file, url, publicId, isLocal }
        // If it's just a string (legacy behavior), handle it
        if (typeof data === 'string') {
            setImageUrl(data);
            updateParent({ imageUrl: data });
            return;
        }

        setImageUrl(data.url);
        updateParent({
            imageUrl: data.url,
            imagePublicId: data.publicId,
            file: data.file
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Size Chart Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTypeChange('table')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${chartType === 'table'
                            ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Table className="w-5 h-5" />
                        Custom Table
                    </motion.button>
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTypeChange('image')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${chartType === 'image'
                            ? 'bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <ImageIcon className="w-5 h-5" />
                        Upload Image
                    </motion.button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {chartType === 'table' ? (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {/* Column builder */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Define Columns (e.g., Size, Chest, Waist, Length, Color)
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColumn())}
                                    placeholder="Enter column name..."
                                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500"
                                />
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addColumn}
                                    className="px-4 py-2 bg-uk-navy-500 text-white rounded-lg hover:bg-uk-navy-600 font-semibold flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Column
                                </motion.button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {columns.map((col, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200"
                                    >
                                        <span className="font-medium text-gray-900">{col}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeColumn(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Rows table */}
                        {columns.length > 0 && (
                            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-900">Size Chart Data</h4>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={addRow}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold flex items-center gap-2 text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Row
                                    </motion.button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                            <tr>
                                                {columns.map((col, index) => (
                                                    <th key={index} className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                                                        {col}
                                                    </th>
                                                ))}
                                                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {rows.map((row, rowIndex) => (
                                                <tr key={rowIndex} className="hover:bg-gray-50">
                                                    {columns.map((col, colIndex) => (
                                                        <td key={colIndex} className="px-4 py-2">
                                                            <input
                                                                type="text"
                                                                value={row[col] || ''}
                                                                onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                                                                placeholder={col}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-2 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(rowIndex)}
                                                            className="text-red-500 hover:text-red-700 p-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {rows.length === 0 && (
                                    <div className="p-8 text-center text-gray-500">
                                        No rows added yet. Click "Add Row" to start building your size chart.
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="image"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <SizeChartImageUpload
                            imageUrl={imageUrl}
                            imagePublicId={sizeChart?.imagePublicId}
                            onChange={(data) => handleImageUrlChange(data)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SizeChartBuilder;
