'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/admin/layout/AuthProvider';
import { adminToast } from '@/app/admin/layout/admin-alert';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Share2,
  CheckCircle,
  Tag,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Interface untuk data UMKM sesuai database
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
  status: number; // 1=Aktif, 0=Nonaktif, 2=Pending
  created_at: string;
  updated_at: string;
}

export default function UMKMDetailPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [umkm, setUmkm] = useState<UMKMData | null>(null);
  const [error, setError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Protect route
  useEffect(() => {
    if (!isLoggedIn) {
  router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Fetch UMKM data dari Supabase
  useEffect(() => {
    const fetchUMKMData = async () => {
      if (!slug || !isLoggedIn) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Fetch dari tabel 'umkm'
        const { data, error } = await supabase
          .from('umkm')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (error) {
          
          if (error.code === 'PGRST116') {
            setError('UMKM tidak ditemukan');
          } else {
            setError(`Gagal memuat data UMKM: ${error.message}`);
          }
          
          setUmkm(null);
        } else if (data) {
          // Parse data sesuai struktur database
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
            created_at: data.created_at,
            updated_at: data.updated_at
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
  }, [slug, isLoggedIn]);

  // Helper function untuk parse images_text
  const parseImagesText = (imagesText: any): string[] => {
    if (!imagesText) return [];
    
    try {
      // Jika sudah array, langsung return
      if (Array.isArray(imagesText)) {
        return imagesText.filter(img => img && typeof img === 'string');
      }
      
      // Jika string, coba parse sebagai JSON
      if (typeof imagesText === 'string') {
        const parsed = JSON.parse(imagesText);
        if (Array.isArray(parsed)) {
          return parsed.filter(img => img && typeof img === 'string');
        }
      }
      
      return [];
    } catch {
      // Jika parsing gagal, return array kosong
      return [];
    }
  };

  const handleDelete = async () => {
    if (!umkm) return;
    
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus UMKM "${umkm.name}"?\nTindakan ini tidak dapat dibatalkan.`
    );
    
    if (!confirmDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('umkm')
        .delete()
        .eq('id', umkm.id);
      
      if (error) {
        throw error;
      }
      
      adminToast.success('UMKM berhasil dihapus!');
      router.push('/admin/dashboard');
    } catch (err: any) {
      adminToast.error('Gagal menghapus UMKM', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (!umkm) return;
    
    const shareData = {
      title: umkm.name,
      text: umkm.description,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      navigator.share(shareData).catch(err => {
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        adminToast.success('Link berhasil disalin ke clipboard!');
      })
      .catch(err => {
        adminToast.error('Gagal menyalin link', err);
      });
  };

  // Get all images (main_image + images_text)
  const getAllImages = () => {
    if (!umkm) return [];
    
    const images: string[] = [];
    
    // Tambahkan main_image jika ada
    if (umkm.main_image && umkm.main_image.trim() !== '') {
      images.push(umkm.main_image);
    }
    
    // Tambahkan images_text jika ada
    if (umkm.images_text && umkm.images_text.length > 0) {
      images.push(...umkm.images_text.filter(img => img && img.trim() !== ''));
    }
    
    return images;
  };

  // Get active image
  const getActiveImage = () => {
    const images = getAllImages();
    return images.length > 0 ? images[activeImageIndex] : null;
  };

  // Format status number ke string
  const getStatusText = (status: number): string => {
    switch (status) {
      case 1: return 'Aktif';
      case 0: return 'Nonaktif';
      case 2: return 'Pending';
      default: return 'Tidak Diketahui';
    }
  };

  // Get status color
  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'bg-green-50 text-green-700 border border-green-200';
      case 0: return 'bg-red-50 text-red-700 border border-red-200';
      case 2: return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Kuliner':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Kerajinan':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Jasa':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Pertanian':
        return 'bg-[#2F6B4F]/10 text-[#2F6B4F] border border-[#2F6B4F]/20';
      case 'Fashion':
        return 'bg-pink-50 text-pink-700 border border-pink-200';
      case 'Teknologi':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Format tanggal
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

  // Tampilkan loading state
  if (!isLoggedIn || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2F6B4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data UMKM...</p>
        </div>
      </div>
    );
  }

  // Tampilkan error state
  if (error && !umkm) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.refresh()}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              Coba Lagi
            </Button>
            <Link href="/admin/dashboard">
              <Button className="bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan not found state
  if (!umkm) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">UMKM Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">
            UMKM dengan slug "{slug}" tidak ditemukan dalam database.
          </p>
          <Link href="/admin/dashboard">
            <Button className="bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const allImages = getAllImages();
  const activeImage = getActiveImage();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-[#2F6B4F] hover:text-[#2F6B4F]/80 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Link>
            
            <div className="flex flex-wrap items-center gap-3">
              
              <Link href={`/admin/umkm/edit/${umkm.slug}`}>
                <Button 
                  className="bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit UMKM
                </Button>
              </Link>
              
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                className="bg-red-600 text-white hover:bg-red-700 transition-colors"
                size="sm"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                  {umkm.name}
                </h1>
                <p className="text-gray-600 mb-4">
                  {umkm.description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#2F6B4F]" />
                    <span className="font-medium text-gray-700">UMKM Marga Kaya</span>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getCategoryColor(umkm.category)}`}>
                    <Tag className="w-3.5 h-3.5 mr-1.5" />
                    {umkm.category}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(umkm.status)}`}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    {getStatusText(umkm.status)}
                  </span>
                </div>
              </div>
              
              <div className="lg:text-right">
                <div className="text-sm text-gray-500 mb-1">Terdaftar sejak</div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-[#2F6B4F]" />
                  <span className="font-medium">{formatDate(umkm.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom kiri - Konten utama */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gambar UMKM */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              {activeImage ? (
                <div className="relative h-64 md:h-96">
                  <img 
                    src={activeImage} 
                    alt={`${umkm.name} - Gambar ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Gambar+Tidak+Tersedia';
                    }}
                  />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                      ID: UMKM-{umkm.id.toString().padStart(3, '0')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative h-64 md:h-96 bg-linear-to-br from-[#2F6B4F] to-[#1E4A3A]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Building2 className="w-24 h-24 mb-4 opacity-90" />
                    <p className="text-xl font-semibold">{umkm.name}</p>
                    <p className="text-white/80 mt-2">{umkm.category}</p>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                      ID: UMKM-{umkm.id.toString().padStart(3, '0')}
                    </span>
                  </div>
                </div>
              )}

              {/* Image gallery jika ada lebih dari 1 gambar */}
              {allImages.length > 1 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Galeri Gambar</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {activeImageIndex + 1} / {allImages.length}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === activeImageIndex 
                            ? 'border-[#2F6B4F] ring-2 ring-[#2F6B4F]/20' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Gambar';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Deskripsi Lengkap */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2F6B4F]" />
                Tentang UMKM
              </h2>
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {umkm.full_description || umkm.description}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Kolom kanan - Info kontak dan sidebar */}
          <div className="space-y-8">
            {/* Info Kontak */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Informasi Kontak</h2>
              
              <div className="space-y-6">
                {/* Telepon */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2F6B4F]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#2F6B4F]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Telepon/WhatsApp</p>
                    <a
                      href={`https://wa.me/${umkm.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-800 font-medium hover:text-[#2F6B4F] transition-colors"
                    >
                      {umkm.phone}
                    </a>
                  </div>
                </div>

                {/* Alamat */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2F6B4F]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#2F6B4F]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Alamat</p>
                    <p className="text-gray-800 font-medium">{umkm.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Informasi Tambahan */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Informasi Tambahan</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#2F6B4F]" />
                    <span className="text-gray-600">Status</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(umkm.status)}`}>
                    {getStatusText(umkm.status)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#2F6B4F]" />
                    <span className="text-gray-600">Terakhir Diupdate</span>
                  </div>
                  <span className="font-medium text-gray-800">
                    {formatDate(umkm.updated_at)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#2F6B4F]" />
                    <span className="text-gray-600">Kategori</span>
                  </div>
                  <span className="font-medium text-gray-800">{umkm.category}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#2F6B4F]" />
                    <span className="text-gray-600">ID UMKM</span>
                  </div>
                  <span className="font-medium text-gray-800">UMKM-{umkm.id.toString().padStart(3, '0')}</span>
                </div>

                {umkm.slug && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Slug URL</span>
                    </div>
                    <span className="font-medium text-gray-800 text-sm">{umkm.slug}</span>
                  </div>
                )}
                
                {allImages.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#2F6B4F]" />
                      <span className="text-gray-600">Total Gambar</span>
                    </div>
                    <span className="font-medium text-gray-800">{allImages.length}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}