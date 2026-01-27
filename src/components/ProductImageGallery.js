import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductImageGallery = ({ product }) => {
    // Normalize images structure
    const getImages = () => {
        if (product.images && product.images.length > 0) {
            // Sort by order
            return [...product.images].sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        return [{ url: product.image, _id: 'main' }];
    };

    const images = getImages();
    // Default to featured image or first image
    const initialImage = images.find(img => img.isFeatured) || images[0];
    const [activeImage, setActiveImage] = useState(initialImage);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
    };

    const handleTouchMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const touch = e.touches[0];
        if (touch) {
            const x = ((touch.clientX - left) / width) * 100;
            const y = ((touch.clientY - top) / height) * 100;
            setMousePos({ x, y });
        }
    };

    const handleTouchStart = (e) => {
        setIsZoomed(true);
        handleTouchMove(e);
    };

    const handleTouchEnd = () => {
        setIsZoomed(false);
    };

    return (
        <div className="flex flex-col-reverse gap-4">
            {/* Thumbnails - Horizontal scroll on mobile, vertical optional if layout changes */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {images.map((img, index) => (
                        <button
                            key={img._id || index}
                            onClick={() => setActiveImage(img)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage.url === img.url
                                ? 'border-uk-navy-500 shadow-md ring-2 ring-uk-navy-500/20'
                                : 'border-gray-200 hover:border-uk-navy-300'
                                }`}
                        >
                            <img
                                src={img.url}
                                alt={`${product.name} view ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Main Image with Zoom */}
            <div
                className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden cursor-crosshair group border border-gray-100 shadow-sm touch-none"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                {/* Normal Image */}
                <img
                    src={activeImage.url}
                    alt={product.name}
                    className={`w-full h-full object-contain transition-opacity duration-200 ${isZoomed ? 'opacity-0' : 'opacity-100'
                        }`}
                />

                {/* Zoomed Image Overlay */}
                {isZoomed && (
                    <div
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{
                            backgroundImage: `url(${activeImage.url})`,
                            backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                            backgroundSize: '250%', // 2.5x Zoom
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                )}

                {/* Mobile Zoom Hint (only visible on touch devices usually, but here shown as overlay hint) */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Hover or Touch to Zoom
                </div>
            </div>
        </div>
    );
};

export default ProductImageGallery;
