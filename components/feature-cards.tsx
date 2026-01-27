'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Leaf, Zap } from 'lucide-react';

const featureCards = [
  {
    id: 1,
    title: 'Produk Lokal Berkualitas',
    description: 'Koleksi produk terbaik dari UMKM lokal yang sudah terjamin kualitasnya.',
    icon: TrendingUp,
    color: '#2F6B4F',
    bgColor: '#E8F5E9',
  },
  {
    id: 2,
    title: 'Komunitas Pengusaha',
    description: 'Bergabung dengan ribuan pengusaha lokal dan kembangkan bisnis bersama.',
    icon: Users,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    id: 3,
    title: 'Produk Organik',
    description: 'Pilihan produk organik dan ramah lingkungan untuk gaya hidup berkelanjutan.',
    icon: Leaf,
    color: '#84CC16',
    bgColor: '#F2FCE2',
  },
  {
    id: 4,
    title: 'Dukungan Penuh',
    description: 'Dapatkan dukungan lengkap dari tim kami untuk kesuksesan bisnis Anda.',
    icon: Zap,
    color: '#06B6D4',
    bgColor: '#CFFAFE',
  },
];

export function FeatureCards() {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -10,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 150,
        damping: 15,
      },
    },
    hover: {
      rotate: 10,
      scale: 1.1,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {featureCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.id}
            className="rounded-xl p-6 cursor-pointer transition-all"
            style={{ backgroundColor: card.bgColor }}
            variants={cardVariants}
            whileHover="hover"
          >
            <motion.div
              className="mb-4 inline-flex p-3 rounded-lg"
              style={{ backgroundColor: card.color }}
              variants={iconVariants}
              whileHover="hover"
            >
              <IconComponent className="w-6 h-6 text-white" />
            </motion.div>

            <h3 className="text-lg font-semibold mb-2 text-[#5D5D5D]">
              {card.title}
            </h3>
            <p className="text-sm text-[#8B7B6F] leading-relaxed">
              {card.description}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
