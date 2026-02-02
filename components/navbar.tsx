'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { Button } from './ui/button';
import { useAuth } from '@/app/admin/layout/AuthProvider';

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const { isLoggedIn, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div
          className="text-lg sm:text-xl font-bold truncate"
          style={{ color: '#2F6B4F' }}
        >
          {title}
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#beranda"
            className="text-sm text-[#5D5D5D] hover:text-[#2F6B4F]"
          >
            Beranda
          </a>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard">
                <Button
                  size="sm"
                  className="bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={logout}
                className="border-[#2F6B4F] text-[#2F6B4F] hover:bg-red-50 bg-amber-50"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button
                size="sm"
                variant="outline"
                className="bg-white hover:bg-amber-50"
                style={{ color: '#2F6B4F', borderColor: '#2F6B4F' }}
              >
                Login Admin
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-[#2F6B4F] hover:bg-amber-50"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
            <a
              href="#beranda"
              className="block text-sm font-medium text-[#5D5D5D] hover:text-[#2F6B4F]"
              onClick={close}
            >
              Beranda
            </a>
            <a
              href="#kontak"
              className="block text-sm font-medium text-[#5D5D5D] hover:text-[#2F6B4F]"
              onClick={close}
            >
              Kontak
            </a>

            <div className="pt-2">
              {isLoggedIn ? (
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/admin/dashboard" onClick={close}>
                    <Button className="w-full bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout();
                      close();
                    }}
                    className="w-full border-[#2F6B4F] text-[#2F6B4F] hover:bg-red-50"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={close}>
                  <Button
                    variant="outline"
                    className="w-full bg-white hover:bg-amber-50"
                    style={{ color: '#2F6B4F', borderColor: '#2F6B4F' }}
                  >
                    Login Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
