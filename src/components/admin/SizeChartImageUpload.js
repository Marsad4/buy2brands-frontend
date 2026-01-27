import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const SizeChartImageUpload = ({ imageUrl, imagePublicId, onChange }) => {
    const toast = useToast();
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    // Handle file selection
    const handleFileSelect = (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.warning('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.warning('File size must be less than 5MB');
            return;
        }

        setUploading(true);

        // Create preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);

        onChange({
            file,
            url: previewUrl,
            publicId: null,
            isLocal: true
        });

        setUploading(false);
    };

    // Handle file input change
    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    // Handle drag and drop
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    // Delete image
    const handleDelete = () => {
        onChange({
            file: null,
            url: '',
            publicId: null,
            isLocal: false
        });
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
                Size Chart Image
            </label>

            {!imageUrl ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragOver
                            ? 'border-uk-navy-500 bg-uk-navy-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onClick={() => document.getElementById('size-chart-input').click()}
                >
                    <input
                        id="size-chart-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Loader className="w-10 h-10 text-uk-navy-500 animate-spin mb-3" />
                            <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-semibold mb-1">
                                Upload Size Chart Image
                            </p>
                            <p className="text-sm text-gray-500">
                                Drag and drop or click to browse
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                Supports: JPG, PNG, WebP (max 5MB)
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                >
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                        <img
                            src={imageUrl}
                            alt="Size Chart"
                            className="w-full h-auto max-h-96 object-contain bg-gray-50"
                        />

                        {/* Overlay with delete button */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                                title="Delete Image"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Change image button */}
                    <button
                        type="button"
                        onClick={() => document.getElementById('size-chart-input').click()}
                        className="mt-2 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-semibold flex items-center justify-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Change Image
                    </button>

                    <input
                        id="size-chart-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                </motion.div>
            )}
        </div>
    );
};

export default SizeChartImageUpload;
