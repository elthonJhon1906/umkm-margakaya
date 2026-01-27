'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Tambahkan useEffect untuk handle redirect otomatis
  useEffect(() => {
    if (isLoading) return;

    console.log('🔄 Auth redirect check:', { 
      isLoggedIn, 
      pathname,
      isLoading 
    });

    // Jika sudah login dan berada di halaman login, redirect ke dashboard guest
    if (isLoggedIn && pathname === '/admin/login') {
      console.log('✅ Logged in, redirecting to guest dashboard');
      router.push('/dashboard');
      return;
    }

    // Jika belum login dan mencoba mengakses admin (kecuali login), redirect ke login
    if (!isLoggedIn && pathname.startsWith('/admin') && pathname !== '/admin/login') {
      console.log('❌ Not logged in, redirecting to login');
      router.push('/admin/login');
      return;
    }

    // Jika sudah login dan mengakses root admin, redirect ke admin dashboard
    if (isLoggedIn && pathname === '/admin') {
      console.log('📊 Redirecting to admin dashboard');
      router.push('/admin/dashboard');
      return;
    }

    // Jika belum login dan mengakses root admin, redirect ke login
    if (!isLoggedIn && pathname === '/admin') {
      console.log('🔐 Redirecting to login');
      router.push('/admin/login');
      return;
    }

  }, [isLoggedIn, pathname, isLoading, router]);

  const checkAuthStatus = async () => {
    try {
      const savedUser = localStorage.getItem('admin_user');
      
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          const { data: verifiedUser, error } = await supabase
            .from('admin')
            .select('*')
            .eq('id', parsedUser.id)
            .single();
          
          if (!error && verifiedUser) {
            setUser(verifiedUser);
            setIsLoggedIn(true);
            localStorage.setItem('admin_user', JSON.stringify(verifiedUser));
          } else {
            localStorage.removeItem('admin_user');
          }
        } catch (parseError) {
          console.error('Error parsing saved user:', parseError);
          localStorage.removeItem('admin_user');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'Username atau password salah' 
          };
        }
        return { 
          success: false, 
          error: error.message || 'Database error occurred' 
        };
      }

      if (!data) {
        return { 
          success: false, 
          error: 'Username atau password salah' 
        };
      }

      const userData = {
        id: data.id,
        username: data.username,
        created_at: data.created_at
      };
      
      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      
      // Redirect ke dashboard guest setelah login berhasil
      router.push('/dashboard');
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Terjadi kesalahan saat login. Silakan coba lagi.';
      
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = 'Koneksi ke database gagal. Periksa koneksi internet Anda.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server. Silakan coba lagi nanti.';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('👋 Logging out user');
    
    // Clear semua state
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('admin_user');
    
    // Redirect ke dashboard guest setelah logout
    // Tidak menggunakan window.location.href agar tetap SPA
    router.push('/dashboard');
    router.refresh(); // Refresh untuk update layout
    
    console.log('✅ Redirected to /dashboard');
  };

  const value: AuthContextType = {
    isLoggedIn,
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}