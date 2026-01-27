'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Shield,
  Building2,
  Users
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isLoggedIn, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';
  const isAdminRoot = pathname === '/admin';

  // Check authentication
  useEffect(() => {
    if (isLoading) return;

    // Redirect logic simplified
    if (isAdminRoot) {
      router.push(isLoggedIn ? '/admin/dashboard' : '/admin/login');
      return;
    }

    if (!isLoginPage && !isLoggedIn) {
      router.push('/admin/login');
      return;
    }

    if (isLoginPage && isLoggedIn) {
      router.push('/admin/dashboard');
      return;
    }
  }, [isLoggedIn, router, pathname, isLoginPage, isLoading, isAdminRoot]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      color: 'text-[#2F6B4F]',
      bgColor: 'bg-[#2F6B4F]/10'
    },
    {
      title: 'Tambah UMKM',
      href: '/admin/umkm/create',
      icon: <PlusCircle className="w-5 h-5" />,
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/10'
    },
    {
      title: 'Kembali ke Home',
      href: '/',
      icon: <Home className="w-5 h-5" />,
      color: 'text-[#06B6D4]',
      bgColor: 'bg-[#06B6D4]/10'
    }
  ];

  // Handle logout - hapus semua key dari localStorage
  const handleLogout = async () => {
    try {
      // Hapus semua item dari localStorage
      localStorage.clear();
      
      // Panggil fungsi logout dari auth context
      await logout();
      
      // Tidak perlu router.push('/'), cukup clear localStorage
      // Halaman akan tetap di tempat yang sama, tapi state auth sudah ter-reset
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: tetap hapus localStorage meski ada error
      localStorage.clear();
    }
  };

  if (isLoginPage) {
    return <LoginLayout>{children}</LoginLayout>;
  }

  // Show loading while checking auth
  if (isLoading || isAdminRoot || (!isLoggedIn && !isLoginPage)) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        menuItems={menuItems}
        handleLogout={handleLogout}
        pathname={pathname}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <DesktopSidebar
          isOpen={isSidebarOpen}
          menuItems={menuItems}
          handleLogout={handleLogout}
          pathname={pathname}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Main Content */}
        <MainContent isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}>
          {children}
        </MainContent>
      </div>
    </div>
  );
}

// Login Layout Component
function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#F5F5F5] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#2F6B4F]/5 to-[#4CAF50]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-l from-[#2F6B4F]/5 to-[#4CAF50]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-[#F59E0B]/5 to-[#FBBF24]/5 rounded-full blur-3xl"></div>
        
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left side */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-[#2F6B4F] to-[#3A8C66] text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Marga Kaya</h1>
              <p className="text-white/80 text-sm">Administrator System</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="lg:max-w-md"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Kelola UMKM<br />Marga Kaya dengan Mudah
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <p className="text-white/90">Tambah dan kelola data UMKM</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-white/90">Pantau perkembangan usaha</p>
              </div>
            </div>

            <div className="border-t border-white/20 pt-6">
              <p className="text-white/70 text-sm">
                Hanya untuk administrator terautorisasi. Pastikan kredensial Anda aman.
              </p>
            </div>
          </motion.div>

          <div className="hidden lg:block">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Marga Kaya. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="p-8">
              {children}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile footer */}
      <div className="lg:hidden bg-[#2F6B4F] text-white p-4 text-center">
        <p className="text-sm">© {new Date().getFullYear()} Marga Kaya</p>
      </div>
    </div>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-[#F5F5F5]">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#2F6B4F] border-t-transparent rounded-full mx-auto mb-4"
        ></motion.div>
        <motion.p
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
          className="text-[#2F6B4F] font-medium"
        >
          Memverifikasi sesi...
        </motion.p>
      </div>
    </div>
  );
}

// Mobile Header Component
function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between"
    >
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu className="w-6 h-6 text-[#2F6B4F]" />
      </button>
      <h1 className="text-lg font-bold text-[#2F6D4F]">Admin Panel</h1>
      <div className="w-10"></div>
    </motion.div>
  );
}

// Mobile Sidebar Component
function MobileSidebar({
  isOpen,
  onClose,
  menuItems,
  handleLogout,
  pathname
}: {
  isOpen: boolean;
  onClose: () => void;
  menuItems: any[];
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
            transition={{ type: "spring", damping: 25 }}
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

// Desktop Sidebar Component
function DesktopSidebar({
  isOpen,
  menuItems,
  handleLogout,
  pathname,
  onToggle
}: {
  isOpen: boolean;
  menuItems: any[];
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
        width: isOpen ? 280 : 0
      }}
      transition={{ type: "spring", damping: 25 }}
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

// Main Content Component
function MainContent({
  children,
  isSidebarOpen,
  onToggleSidebar
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
        <ChevronRight className={`w-5 h-5 text-[#2F6D4F] transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className="p-4 lg:p-6">
        {children}
      </div>
    </motion.main>
  );
}

// Sidebar Content Component
function SidebarContent({ menuItems, handleLogout, isSidebarOpen, onClose, pathname }: {
  menuItems: any[];
  handleLogout: () => void;
  isSidebarOpen: boolean;
  onClose: () => void;
  pathname: string;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2F6D4F] to-[#4CAF50] flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h2 className="font-bold text-[#2F6D4F] text-lg">Marga Kaya</h2>
              <p className="text-sm text-[#8B7B6F]">Admin Panel</p>
            </div>
          </motion.div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-[#8B7B6F]" />
          </button>
        </div>
      </div>

      {/* Menu Items */}
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
                    isActive
                      ? `${item.bgColor} ${item.color} font-medium`
                      : 'text-[#5D5D5D] hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? item.bgColor : 'bg-gray-100'}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.title}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto w-2 h-2 rounded-full bg-current"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </nav>

      {/* Logout Button */}
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