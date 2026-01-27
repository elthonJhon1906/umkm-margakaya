'use client';

import { Navbar } from '@/components/navbar';

export function LayoutWithNavbar({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar title="UMKM Desa Marga Kaya" />
      {children}
    </>
  );
}
