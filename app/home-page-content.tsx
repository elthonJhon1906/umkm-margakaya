'use client';

import { Navbar } from '../components/navbar';
import { HeroSection } from '../components/hero-section';
import { FeatureCards } from '../components/feature-cards';
import { UMKMCardsSection } from '../components/umkm-cards-section';
import Image from 'next/image';
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
      <div className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-3"
            style={{ color: '#2F6B4F' }}
          >
            Mengapa Memilih Kami?
          </h2>
          <p className="text-center text-[#8B7B6F] mb-8 sm:mb-12 text-sm sm:text-base">
            Dapatkan pengalaman terbaik berbelanja produk lokal
          </p>
          <FeatureCards />
        </div>
      </div>

      {/* UMKM Cards Section dengan Dummy Data */}
      <UMKMCardsSection />

      {/* Footer */}
      <footer className="bg-[#0c4630] text-[#DFDAD0] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
          <div className="text-center">
            <p className="mb-2" style={{ color: '#FFFFFF' }}>
              © 2024 UMKM Desa Marga Kaya
            </p>
            <p className="text-[#B8B3A8] text-sm">
              Mendukung ekonomi lokal melalui platform digital
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-[#DFDAD0]">
            <Image
              src="/logo.png"
              alt="KKN Unila 2026 Periode 1"
              width={40}
              height={40}
            />
            <span className="text-center">KKN Universitas Lampung Tahun 2026 Periode 1</span>
          </div>
        </div>
      </footer>
    </>
  );
}
