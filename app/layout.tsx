import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/admin/layout/AuthProvider';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'UMKM Desa Marga Kaya',
    template: '%s | UMKM Desa Marga Kaya',
  },
  description: 'Katalog UMKM Desa Marga Kaya.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}