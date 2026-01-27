'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Building2,
  Phone,
  MapPin,
  Calendar,
  Share2,
  CheckCircle,
  Tag,
  Image as ImageIcon,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Interface untuk data UMKM
interface UMKMData {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  full_description: string;
  phone: string;
  address: string;
  main_image?: string;
  images_text?: string[];
  status: number;
  created_at: string;
}

export default function UMKMDetailGuestPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [umkm, setUmkm] = useState<UMKMData | null>(null);
  const [error, setError] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);

  // Fetch UMKM data dari Supabase
  useEffect(() => {
    const fetchUMKMData = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError('');
      
      try {
        const { data, error } = await supabase
          .from('umkm')
          .select('*')
          .eq('slug', slug)
          .eq('status', 1)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            setError('UMKM tidak ditemukan');
          } else {
            setError(`Gagal memuat data UMKM: ${error.message}`);
          }
          setUmkm(null);
        } else if (data) {
          const formattedData: UMKMData = {
            id: data.id,
            slug: data.slug,
            name: data.name,
            category: data.category,
            description: data.description,
            full_description: data.full_description,
            phone: data.phone,
            address: data.address,
            main_image: data.main_image,
            images_text: parseImagesText(data.images_text),
            status: data.status,
            created_at: data.created_at
          };
          setUmkm(formattedData);
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memuat data');
        setUmkm(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUMKMData();
  }, [slug]);

  const parseImagesText = (imagesText: any): string[] => {
    if (!imagesText) return [];
    
    try {
      if (Array.isArray(imagesText)) {
        return imagesText.filter((img: string) => img && typeof img === 'string');
      }
      
      if (typeof imagesText === 'string') {
        const parsed = JSON.parse(imagesText);
        if (Array.isArray(parsed)) {
          return parsed.filter((img: string) => img && typeof img === 'string');
        }
      }
      
      return [];
    } catch {
      return [];
    }
  };

  const handleShare = async () => {
    if (!umkm) return;
    
    const shareData = {
      title: `${umkm.name} - UMKM Desa Marga Kaya`,
      text: umkm.description,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      } catch {
        setError('Gagal membagikan URL');
      }
    }
  };

  const getAllImages = () => {
    if (!umkm) return [];
    
    const images: string[] = [];
    
    if (umkm.main_image && umkm.main_image.trim() !== '') {
      images.push(umkm.main_image);
    }
    
    if (umkm.images_text && umkm.images_text.length > 0) {
      images.push(...umkm.images_text.filter(img => img && img.trim() !== ''));
    }
    
    return images;
  };

  const getActiveImage = () => {
    const images = getAllImages();
    return images.length > 0 ? images[activeImageIndex] : null;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Kuliner':
        return 'bg-amber-50 text-amber-700';
      case 'Kerajinan':
        return 'bg-purple-50 text-purple-700';
      case 'Jasa':
        return 'bg-blue-50 text-blue-700';
      case 'Pertanian':
        return 'bg-green-50 text-green-700';
      case 'Fashion':
        return 'bg-pink-50 text-pink-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatWhatsAppUrl = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return `https://wa.me/${cleaned}?text=Halo%20saya%20tertarik%20dengan%20produk/jasa%20Anda%20di%20UMKM%20Desa%20Marga%20Kaya`;
  };

  const getPublicUrl = (filePath: string): string => {
    if (!filePath) return '';
    
    try {
      if (filePath.startsWith('http')) {
        return filePath;
      }
      
      if (filePath.includes('umkm-images')) {
        const { data } = supabase.storage
          .from('umkm-images')
          .getPublicUrl(filePath);
        return data?.publicUrl || '';
      }
      
      return filePath;
      
    } catch (error) {
      return filePath;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data UMKM...</p>
        </div>
      </div>
    );
  }

  if (error && !umkm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">UMKM Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (!umkm) {
    return null;
  }

  const allImages = getAllImages();
  const activeImage = getActiveImage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getCategoryColor(umkm.category)}`}>
                    <Tag className="w-3.5 h-3.5 mr-1.5" />
                    {umkm.category}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    UMKM Terverifikasi
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {umkm.name}
                </h1>
                
                <p className="text-lg text-gray-600 mb-6">
                  {umkm.description}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Bergabung {formatDate(umkm.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Desa Marga Kaya</span>
                  </div>
                </div>
              </div>
              
              {umkm.phone && (
                <div className="lg:text-right">
                  <a
                    href={formatWhatsAppUrl(umkm.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors shadow-lg shadow-green-700/20"
                  >
                    <Phone className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-sm opacity-90">Hubungi via WhatsApp</div>
                      <div className="font-bold text-lg">{umkm.phone}</div>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Image */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="relative h-64 md:h-96">
                  {activeImage ? (
                    <img 
                      src={getPublicUrl(activeImage)} 
                      alt={`${umkm.name} - Gambar ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-umkm.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center">
                      <ShoppingBag className="w-24 h-24 text-green-300 mb-4" />
                      <p className="text-gray-400 text-lg">{umkm.name}</p>
                    </div>
                  )}
                  
                  {/* Image Navigation */}
                  {allImages.length > 1 && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-between p-4">
                        <button
                          onClick={() => setActiveImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                          className="w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActiveImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                          className="w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5 rotate-180" />
                        </button>
                      </div>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === activeImageIndex 
                                ? 'bg-white w-4' 
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                {allImages.length > 1 && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Galeri Gambar</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {activeImageIndex + 1} / {allImages.length}
                      </span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {allImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === activeImageIndex 
                              ? 'border-green-700 ring-2 ring-green-700/20' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img 
                            src={getPublicUrl(img)} 
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-thumb.jpg';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-700" />
                  Informasi Kontak
                </h2>
                
                <div className="space-y-6">
                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Telepon/WhatsApp</p>
                      <a
                        href={formatWhatsAppUrl(umkm.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-gray-900 hover:text-green-700 transition-colors"
                      >
                        {umkm.phone}
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Alamat</p>
                      <p className="text-gray-900 font-medium leading-relaxed">{umkm.address}</p>
                    </div>
                  </div>
                </div>
                
                {umkm.phone && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <a
                      href={formatWhatsAppUrl(umkm.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-700/20"
                    >
                      <Phone className="w-5 h-5" />
                      Hubungi via WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  Informasi UMKM
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Kategori</span>
                    <span className="font-medium text-gray-900">{umkm.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Status</span>
                    <span className="inline-flex items-center gap-1 font-medium text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Aktif
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Bergabung</span>
                    <span className="font-medium text-gray-900">{formatDate(umkm.created_at)}</span>
                  </div>
                  
                  {allImages.length > 0 && (
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-600">Total Gambar</span>
                      <span className="font-medium text-gray-900">{allImages.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Building2 className="w-6 h-6 text-green-700" />
              Tentang {umkm.name}
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {umkm.full_description || umkm.description}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-green-700 to-emerald-700 rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Tertarik dengan UMKM ini?
            </h3>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              Hubungi langsung pemilik UMKM untuk informasi lebih lanjut tentang produk dan jasa yang ditawarkan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={formatWhatsAppUrl(umkm.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-green-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
              >
                <Phone className="w-5 h-5" />
                Hubungi via WhatsApp
              </a>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                <Home className="w-5 h-5" />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-lg font-bold">UMKM Desa Marga Kaya</p>
              <p className="text-gray-400 text-sm">Membangun ekonomi lokal melalui platform digital</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Beranda
              </Link>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-800">
            © {new Date().getFullYear()} UMKM Desa Marga Kaya. Semua hak dilindungi.
          </div>
        </div>
      </div>
    </div>
  );
}