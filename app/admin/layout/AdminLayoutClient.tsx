'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  X,
} from 'lucide-react';

import { useAuth } from '@/app/admin/layout/AuthProvider';
import ToasterProvider from '@/app/admin/layout/ToasterProvider';

type MenuItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { isLoggedIn, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';
  const isAdminRoot = pathname === '/admin';

  useEffect(() => {
    if (isLoading) return;

    if (isAdminRoot) {
      router.push(isLoggedIn ? '/admin/dashboard' : '/login');
      return;
    }

    if (!isLoginPage && !isLoggedIn) {
      router.push('/login');
      return;
    }

    if (isLoginPage && isLoggedIn) {
      router.push('/admin/dashboard');
      return;
    }
  }, [isLoggedIn, router, isLoginPage, isLoading, isAdminRoot]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      color: 'text-[#2F6B4F]',
      bgColor: 'bg-[#2F6B4F]/10',
    },
    {
      title: 'Tambah UMKM',
      href: '/admin/umkm/create',
      icon: <PlusCircle className="w-5 h-5" />,
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/10',
    },
    {
      title: 'Kembali ke Home',
      href: '/',
      icon: <Home className="w-5 h-5" />,
      color: 'text-[#06B6D4]',
      bgColor: 'bg-[#06B6D4]/10',
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      router.push('/');
    }
  };

  // NOTE: Login page shell + auth gating/loading are handled by the Server Layout.
  // This client component is only the interactive admin shell.

  return (
    <ToasterProvider>
      <div className="min-h-screen bg-[#F5F5F5]">
        <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          menuItems={menuItems}
          handleLogout={handleLogout}
          pathname={pathname}
        />

        <div className="flex">
          <DesktopSidebar
            isOpen={isSidebarOpen}
            menuItems={menuItems}
            handleLogout={handleLogout}
            pathname={pathname}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <MainContent
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {children}
          </MainContent>
        </div>
      </div>
    </ToasterProvider>
  );
}

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between"
    >
      <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Menu className="w-6 h-6 text-[#2F6B4F]" />
      </button>
      <h1 className="text-lg font-bold text-[#2F6D4F]">Admin Panel</h1>
      <div className="w-10" />
    </motion.div>
  );
}

function MobileSidebar({
  isOpen,
  onClose,
  menuItems,
  handleLogout,
  pathname,
}: {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  handleLogout: () => void;
  pathname: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 left-0 h-full w-72 bg-white z-50 lg:hidden shadow-xl"
          >
            <SidebarContent
              menuItems={menuItems}
              handleLogout={handleLogout}
              isSidebarOpen={true}
              onClose={onClose}
              pathname={pathname}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DesktopSidebar({
  isOpen,
  menuItems,
  handleLogout,
  pathname,
  onToggle,
}: {
  isOpen: boolean;
  menuItems: MenuItem[];
  handleLogout: () => void;
  pathname: string;
  onToggle: () => void;
}) {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{
        x: isOpen ? 0 : -100,
        opacity: isOpen ? 1 : 0,
        width: isOpen ? 280 : 0,
      }}
      transition={{ type: 'spring', damping: 25 }}
      className="hidden lg:block h-screen sticky top-0 bg-white border-r border-gray-200 overflow-hidden"
    >
      <SidebarContent
        menuItems={menuItems}
        handleLogout={handleLogout}
        isSidebarOpen={isOpen}
        onClose={onToggle}
        pathname={pathname}
      />
    </motion.aside>
  );
}

function MainContent({
  children,
  isSidebarOpen,
  onToggleSidebar,
}: {
  children: React.ReactNode;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex-1"
    >
      <button
        onClick={onToggleSidebar}
        className="hidden lg:block fixed left-4 top-4 z-30 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
      >
        <ChevronRight
          className={`w-5 h-5 text-[#2F6D4F] transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div className="p-4 lg:p-6">{children}</div>
    </motion.main>
  );
}

function SidebarContent({
  menuItems,
  handleLogout,
  onClose,
  pathname,
}: {
  menuItems: MenuItem[];
  handleLogout: () => void;
  isSidebarOpen: boolean;
  onClose: () => void;
  pathname: string;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#2F6D4F] to-[#4CAF50] flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h2 className="font-bold text-[#2F6D4F] text-lg">Marga Kaya</h2>
              <p className="text-sm text-[#8B7B6F]">Admin Panel</p>
            </div>
          </motion.div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
            <X className="w-5 h-5 text-[#8B7B6F]" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <AnimatePresence>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive ? `${item.bgColor} ${item.color} font-medium` : 'text-[#5D5D5D] hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? item.bgColor : 'bg-gray-100'}`}>{item.icon}</div>
                  <span className="font-medium">{item.title}</span>
                  {isActive && (
                    <motion.div layoutId="activeTab" className="ml-auto w-2 h-2 rounded-full bg-current" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </nav>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 border-t border-gray-200"
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors group"
        >
          <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-medium">Keluar</span>
        </button>
      </motion.div>
    </div>
  );
}
