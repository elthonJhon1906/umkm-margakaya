import { Suspense } from 'react';

import AdminLayoutClient from './layout/AdminLayoutClient';
import AdminLoadingScreen from './layout/AdminLoadingScreen';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense fallback={<AdminLoadingScreen />}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </Suspense>
  );
}