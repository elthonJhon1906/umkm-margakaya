'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Globe } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface UMKMDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  umkm: {
    id: number;
    name: string;
    category: string;
    categoryColor: string;
    image: string;
    description: string;
    fullDescription?: string;
    orderUrl?: string;
    images?: string[];
  };
}

export function UMKMDetailModal({ isOpen, onClose, umkm }: UMKMDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = umkm.images && umkm.images.length > 0 ? umkm.images : [umkm.image];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            variants={contentVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="sticky top-0 flex justify-end p-4 bg-white z-10">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-[#5D5D5D]" />
              </button>
            </div>

            {/* Image Carousel */}
            <div className="relative h-80 bg-gray-200 overflow-hidden">
              <motion.div
                className="absolute inset-0"
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={umkm.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-all"
                  >
                    <svg
                      className="w-5 h-5 text-[#5D5D5D]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-all"
                  >
                    <svg
                      className="w-5 h-5 text-[#5D5D5D]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-white w-2 h-2'
                            : 'bg-white/50 w-2 h-2'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Category Badge */}
              <div
                className="absolute top-4 left-4 text-white text-sm px-4 py-2 rounded-full font-medium"
                style={{ backgroundColor: umkm.categoryColor }}
              >
                {umkm.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h1 className="text-3xl font-bold text-[#5D5D5D] mb-4">{umkm.name}</h1>

              {/* Description Section */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#5D5D5D] mb-3">
                  Deskripsi Lengkap
                </h2>
                <p className="text-[#8B7B6F] leading-relaxed">
                  {umkm.fullDescription || umkm.description}
                </p>
              </div>

              {/* Order URL Section */}
              {umkm.orderUrl && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-[#5D5D5D] flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4" />
                    URL Pemesanan / Pembelian
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={umkm.orderUrl}
                      readOnly
                      className="flex-1 px-4 py-3 border-2 border-[#DFDAD0] rounded-lg text-[#5D5D5D] bg-white focus:outline-none focus:border-[#2F6B4F]"
                    />
                    <a
                      href={umkm.orderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-[#2F6B4F] text-white rounded-lg hover:opacity-90 transition-opacity"
                      title="Buka link di tab baru"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => {
                  if (umkm.orderUrl) {
                    window.open(umkm.orderUrl, '_blank');
                  }
                }}
                className="w-full py-3 bg-[#2F6B4F] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Pesan / Beli Sekarang
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
