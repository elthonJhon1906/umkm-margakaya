'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
  stats: Array<{ value: string; label: string }>;
}

const heroImages = [
  '/WhatsApp Image 2026-01-26 at 8.21.38 PM.jpeg',
  '/WhatsApp Image 2026-01-27 at 8.42.38 PM.jpeg',
  '/WhatsApp Image 2026-01-23 at 2.12.38 PM (1).jpeg',
  '/WhatsApp Image 2026-01-23 at 2.12.38 PM (2).jpeg',
  '/WhatsApp Image 2026-01-23 at 2.12.38 PM.jpeg',
];

export function HeroSection({ title, subtitle, stats }: HeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
      },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (index: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5 + index * 0.1,
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    }),
  };

  return (
    <motion.div
      className="relative py-16 sm:py-24 px-4 sm:px-6 text-center overflow-hidden"
      style={{
        minHeight: '600px',
      }}
    >
      {/* Background carousel images */}
      {heroImages.map((image, index) => (
        <motion.div
          key={index}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          style={{
            backgroundImage: `url('${image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      {/* Overlay with color #DFDAD0 and 70% opacity */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#DFDAD0',
          opacity: 0.7,
        }}
      />

      {/* Content */}
      <motion.div
        className="max-w-3xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-3xl sm:text-5xl font-bold text-gray-800 mb-4"
          variants={itemVariants}
        >
          {title}
        </motion.h1>

        <motion.p
          className="text-base sm:text-xl text-gray-700 mb-8"
          variants={itemVariants}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8"
          variants={itemVariants}
        >
          <motion.div variants={buttonVariants} whileHover="hover">
            <Link href="#daftar-umkm">
              <Button
                size="lg"
                style={{ backgroundColor: '#2F6B4F' }}
                className="text-white w-full sm:w-auto"
              >
                Lihat UMKM
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={buttonVariants} whileHover="hover">
            <Link href="/admin/umkm/create">
              <Button
                size="lg"
                variant="outline"
                className="text-[#2F6B4F] border-[#2F6B4F] bg-amber-50 hover:bg-[#DFDAD0]/50 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajukan UMKM
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-gray-800">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={statsVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="text-xl sm:text-2xl font-bold"
                whileHover={{ scale: 1.1 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevious}
        className="hidden sm:block absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-[#DFDAD0]/50 hover:bg-[#DFDAD0]/80 p-2 rounded-full transition-all"
      >
        <ChevronLeft className="w-6 h-6 text-[#2F6B4F]" />
      </button>
      <button
        onClick={goToNext}
        className="hidden sm:block absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-[#DFDAD0]/50 hover:bg-[#DFDAD0]/80 p-2 rounded-full transition-all"
      >
        <ChevronRight className="w-6 h-6 text-[#2F6B4F]" />
      </button>

      {/* Carousel indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className="rounded-full transition-all"
            style={{
              width: index === currentImageIndex ? 30 : 10,
              height: 10,
              backgroundColor: index === currentImageIndex ? '#2F6B4F' : 'rgba(223, 218, 208, 0.7)',
            }}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
