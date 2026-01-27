import React, { useState, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Upload, X, Star, Image as ImageIcon, Loader } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const ImageUploadManager = ({ images = [], onChange, maxImages = 10 }) => {
    const toast = useToast();
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    // Handle file selection
    const handleFileSelect = async (files) => {
        const fileArray = Array.from(files);

        if (fileArray.length + images.length > maxImages) {
            toast.warning(`You can only upload up to ${maxImages} images`);
            return;
        }

        setUploading(true);

        try {
            // Create preview URLs for immediate display
            const newImages = fileArray.map((file, index) => ({
                file,
                url: URL.createObjectURL(file),
                order: images.length + index,
                isFeatured: images.length === 0 && index === 0, // First image is featured if no images exist
                isLocal: true // Flag to indicate this is a local file
            }));

            onChange([...images, ...newImages]);
        } catch (error) {
            console.error('Error processing files:', error);
            toast.error('Failed to process files');
        } finally {
            setUploading(false);
        }
    };

    // Handle file input change
    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files);
        }
    };

    // Handle drag and drop
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    // Handle reorder
    const handleReorder = (newOrder) => {
        const reorderedImages = newOrder.map((img, index) => ({
            ...img,
            order: index
        }));
        onChange(reorderedImages);
    };

    // Toggle featured image
    const toggleFeatured = (index) => {
        const updatedImages = images.map((img, i) => ({
            ...img,
            isFeatured: i === index
        }));
        onChange(updatedImages);
    };

    // Delete image
    const deleteImage = (index) => {
        const updatedImages = images.filter((_, i) => i !== index);

        // If we deleted the featured image, make the first image featured
        if (updatedImages.length > 0 && !updatedImages.some(img => img.isFeatured)) {
            updatedImages[0].isFeatured = true;
        }

        onChange(updatedImages);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700">
                    Product Images
                    <span className="text-gray-500 font-normal ml-2">
                        ({images.length}/{maxImages})
                    </span>
                </label>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-uk-navy-500 to-uk-red-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                    disabled={uploading || images.length >= maxImages}
                >
                    <Upload className="w-4 h-4" />
                    Upload Images
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Drop zone */}
            {images.length === 0 && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragOver
                            ? 'border-uk-navy-500 bg-uk-navy-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold mb-2">
                        Drag and drop images here
                    </p>
                    <p className="text-sm text-gray-500">
                        or click the "Upload Images" button above
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Supports: JPG, PNG, WebP, GIF (max 5MB each)
                    </p>
                </div>
            )}

            {/* Image grid with reorder functionality */}
            {images.length > 0 && (
                <Reorder.Group
                    axis="x"
                    values={images}
                    onReorder={handleReorder}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                    <AnimatePresence>
                        {images.map((image, index) => (
                            <Reorder.Item
                                key={image.url || image.publicId || index}
                                value={image}
                                className="relative group cursor-move"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-uk-navy-500 transition-all"
                                >
                                    <img
                                        src={image.url}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {/* Featured toggle */}
                                        <button
                                            type="button"
                                            onClick={() => toggleFeatured(index)}
                                            className={`p-2 rounded-full transition-all ${image.isFeatured
                                                    ? 'bg-yellow-400 text-yellow-900'
                                                    : 'bg-white/80 text-gray-600 hover:bg-yellow-400 hover:text-yellow-900'
                                                }`}
                                            title={image.isFeatured ? 'Featured Image' : 'Set as Featured'}
                                        >
                                            <Star className={`w-5 h-5 ${image.isFeatured ? 'fill-current' : ''}`} />
                                        </button>

                                        {/* Delete button */}
                                        <button
                                            type="button"
                                            onClick={() => deleteImage(index)}
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                                            title="Delete Image"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Order badge */}
                                    <div className="absolute top-2 left-2 bg-uk-navy-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {index + 1}
                                    </div>

                                    {/* Featured badge */}
                                    {image.isFeatured && (
                                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            Featured
                                        </div>
                                    )}

                                    {/* Uploading indicator */}
                                    {uploading && image.isLocal && (
                                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                            <Loader className="w-6 h-6 text-uk-navy-500 animate-spin" />
                                        </div>
                                    )}
                                </motion.div>
                            </Reorder.Item>
                        ))}
                    </AnimatePresence>
                </Reorder.Group>
            )}

            {uploading && (
                <div className="text-center text-sm text-gray-600 flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing images...
                </div>
            )}

            {/* Instructions */}
            {images.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Tips:</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Drag images to reorder them</li>
                        <li>Click the star icon to set a featured image</li>
                        <li>The first image is featured by default</li>
                        <li>Click the X to delete an image</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ImageUploadManager;
