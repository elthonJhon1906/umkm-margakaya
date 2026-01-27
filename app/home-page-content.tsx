'use client';

import { Navbar } from '../components/navbar';
import { HeroSection } from '../components/hero-section';
import { FeatureCards } from '../components/feature-cards';
import { UMKMCardsSection } from '../components/umkm-cards-section';

export function HomePageContent() {
  return (
    <>
      {/* Navigation */}
      <Navbar title="UMKM Desa Marga Kaya" />

      {/* Hero Section */}
      <HeroSection
        title="Katalog UMKM Desa Marga Kaya"
        subtitle="Kuliner, kerajinan, jasa, dan produk lokal unggulan."
        stats={[
          { value: '100+', label: 'UMKM' },
          { value: '6 Kategori', label: 'Beragam Produk' },
        ]}
      />

      {/* Feature Cards Section */}
      <div className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-3" style={{ color: '#2F6B4F' }}>
            Mengapa Memilih Kami?
          </h2>
          <p className="text-center text-[#8B7B6F] mb-12">
            Dapatkan pengalaman terbaik berbelanja produk lokal
          </p>
          <FeatureCards />
        </div>
      </div>

      {/* UMKM Cards Section dengan Dummy Data */}
      <UMKMCardsSection />

      {/* Footer */}
      <footer className="bg-[#3D3D3D] text-[#DFDAD0] py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2" style={{ color: '#DFDAD0' }}>
            © 2024 UMKM Desa Marga Kaya
          </p>
          <p className="text-[#B8B3A8] text-sm">
            Mendukung ekonomi lokal melalui platform digital
          </p>
        </div>
      </footer>
    </>
  );
}
