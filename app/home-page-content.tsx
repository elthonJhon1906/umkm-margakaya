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
      <footer className="bg-[#0c4630] text-[#DFDAD0] py-8 px-6">
        <div>
          <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2" style={{ color: '#FFFFF' }}>
            © 2024 UMKM Desa Marga Kaya
          </p>
          <p className="text-[#B8B3A8] text-sm">
            Mendukung ekonomi lokal melalui platform digital
          </p>
        </div>
        <div className='flex items-center gap-2  w-fit rounded-2xl'>
          <Image
          src={'/logo.png'}
          alt='KKN Unila 2026 Periode 1'
          width={40}
          height={40}
          />
          KKN Universitas Lampung Tahun 2026 Periode 1
         </div>
        </div>
      </footer>
    </>
  );
}
