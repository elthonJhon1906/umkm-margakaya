'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth } from '@/app/admin/layout/AuthProvider';
import Image from 'next/image';
interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const { isLoggedIn, logout } = useAuth();

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1 + 0.3,
        duration: 0.5,
      },
    }),
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 bg-white border-b border-gray-200"
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          className="text-xl font-bold flex items-center gap-4"
          style={{ color: '#2F6B4F' }}
          custom={0}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <Image
          src={'/logo.png'}
          width={60}
          height={60}
          alt='KKN Unila 2026'
          />
          <span className='text-3xl'>{title}</span>
        </motion.div>

        <div className="flex items-center gap-8">
          {['Beranda'].map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-sm text-[#5D5D5D] hover:text-[#2F6B4F]"
              custom={index + 1}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              {item}
            </motion.a>
          ))}

          <motion.div
            custom={4}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/admin/dashboard">
                  <Button
                    size="sm"
                    className='bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90'
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={logout}
                  className='border-[#2F6B4F] text-[#2F6B4F] hover:bg-red-50 bg-amber-50'
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  variant="outline"
                  className='bg-white hover:bg-amber-50'
                  style={{
                    color: '#2F6B4F',
                    borderColor: '#2F6B4F',
                  }}
                >
                  Login Admin
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
