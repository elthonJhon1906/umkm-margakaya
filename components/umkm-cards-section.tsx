'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, AlertCircle, Loader2, Calendar, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface UMKMCardProps {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  phone?: string | null;
  address?: string | null;
  main_image: string;
  images_text: string | null;
  status: number;
  created_at: string;
}

interface UmkmImage {
  image_url: string;
}


export function UMKMCardsSection({id}: {id: string}) {
  const [umkms, setUmkms] = useState<UMKMCardProps[]>([]);
  const [umkmImages, setUmkmImages] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUMKM, setSelectedUMKM] = useState<UMKMCardProps | null>(null);
  const [imageSliders, setImageSliders] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchAllUMKMData();
  }, []);

  const fetchAllUMKMData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch UMKM data
      const { data: umkmData, error: umkmError } = await supabase
        .from('umkm')
        .select('id, slug, name, category, description, phone, address, main_image, images_text, status, created_at')
        .eq('status', 1)
        .order('created_at', { ascending: false })
        .limit(8);

      if (umkmError) {
        setError(`Gagal memuat data UMKM: ${umkmError.message}`);
        return;
      }

      if (!umkmData) {
        setUmkms([]);
        return;
      }

      // Process UMKM data
      const processedUmkms = umkmData.map(item => ({
        ...item,
        main_image: item.main_image || ''
      }));

      setUmkms(processedUmkms);
      
      // Process images for each UMKM
      const imagesByUmkm: Record<number, string[]> = {};
      const initialSliders: Record<number, number> = {};

      processedUmkms.forEach(item => {
        const images: string[] = [];
        
        // Add main image first
        if (item.main_image) {
          images.push(item.main_image);
        }
        
        // Parse additional images from images_text
        if (item.images_text) {
          try {
            const parsedImages = JSON.parse(item.images_text);
            if (Array.isArray(parsedImages)) {
              parsedImages.forEach((img: string) => {
                if (img && typeof img === 'string') {
                  images.push(img);
                }
              });
            }
          } catch (e) {
            console.log('Error parsing images_text:', e);
          }
        }
        
        // If no images at all, add placeholder
        if (images.length === 0) {
          images.push(getPlaceholderImage(item.category));
        }
        
        imagesByUmkm[item.id] = images;
        initialSliders[item.id] = 0;
      });

      setUmkmImages(imagesByUmkm);
      setImageSliders(initialSliders);
      
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function untuk mendapatkan public URL dari path storage
  const getPublicUrl = (filePath: string): string => {
    if (!filePath) return '';
    
    try {
      // Jika sudah URL lengkap, return langsung
      if (filePath.startsWith('http')) {
        return filePath;
      }
      
      // Jika path storage, konversi ke public URL
      if (filePath.includes('umkm-images')) {
        const { data } = supabase.storage
          .from('umkm-images')
          .getPublicUrl(filePath);
        return data?.publicUrl || '';
      }
      
      // Default: anggap sudah URL lengkap
      return filePath;
      
    } catch (error) {
      console.error('Error getting public URL:', error);
      return filePath;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'kuliner': '#F59E0B',
      'kerajinan': '#8B5CF6',
      'jasa': '#06B6D4',
      'pertanian': '#84CC16',
      'fashion': '#EC4899',
      'default': '#2F6B4F'
    };
    
    return colors[category?.toLowerCase()] || colors.default;
  };

  const getPlaceholderImage = (category: string) => {
    const placeholderMap: Record<string, string> = {
      'kuliner': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop',
      'kerajinan': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=400&fit=crop',
      'jasa': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&h=400&fit=crop',
      'pertanian': 'https://images.unsplash.com/photo-1488459716781-6a19ea5300e0?w=500&h=400&fit=crop',
      'fashion': 'https://images.unsplash.com/photo-1595777707802-52d19a7aaf3c?w=500&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=400&fit=crop'
    };
    
    return placeholderMap[category?.toLowerCase()] || placeholderMap.default;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const nextImage = (umkmId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageSliders(prev => {
      const current = prev[umkmId] || 0;
      const images = umkmImages[umkmId] || [];
      const next = current + 1 >= images.length ? 0 : current + 1;
      return { ...prev, [umkmId]: next };
    });
  };

  const prevImage = (umkmId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageSliders(prev => {
      const current = prev[umkmId] || 0;
      const images = umkmImages[umkmId] || [];
      const prevIndex = current - 1 < 0 ? images.length - 1 : current - 1;
      return { ...prev, [umkmId]: prevIndex };
    });
  };

  const goToDetailPage = (slug: string) => {
    window.open(`/umkm/${slug}`);
  };

  if (loading) {
    return (
      <div className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Memuat data UMKM...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-500 mb-2">Gagal Memuat Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAllUMKMData}
            className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity bg-green-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (umkms.length === 0) {
    return (
      <div className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Data UMKM</h3>
          <p className="text-gray-500">Data UMKM akan segera ditambahkan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-6 bg-white" id={id}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3 text-green-800">
            UMKM Unggulan Desa Marga Kaya
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Temukan produk dan jasa terbaik dari pengusaha lokal kami
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800">{umkms.length}+</div>
              <div className="text-gray-600 text-sm">UMKM Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800">
                {Array.from(new Set(umkms.map(u => u.category))).length}+
              </div>
              <div className="text-gray-600 text-sm">Kategori</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800">24/7</div>
              <div className="text-gray-600 text-sm">Tersedia Online</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {umkms.map((umkm) => {
            const images = umkmImages[umkm.id] || [];
            const currentImageIndex = imageSliders[umkm.id] || 0;
            const currentImage = images[currentImageIndex];
            
            // Process image URL untuk mendapatkan public URL
            const processedImage = currentImage ? getPublicUrl(currentImage) : '';

            return (
              <div
                key={umkm.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow overflow-hidden border border-gray-200 group"
              >
                <div 
                  className="relative h-48 overflow-hidden bg-gray-200 cursor-pointer"
                  onClick={() => goToDetailPage(umkm.slug)}
                >
                  {processedImage ? (
                    <img
                      src={processedImage}
                      alt={`${umkm.name} - Gambar ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(umkm.category);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div
                    className="absolute top-3 right-3 text-white text-xs px-3 py-1 rounded-full font-medium"
                    style={{ backgroundColor: getCategoryColor(umkm.category) }}
                  >
                    {umkm.category}
                  </div>

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => prevImage(umkm.id, e)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={(e) => nextImage(umkm.id, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex 
                                ? 'bg-white' 
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="p-5">
                  <h3 
                    className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2 h-14 cursor-pointer hover:text-green-700 transition-colors"
                    onClick={() => goToDetailPage(umkm.slug)}
                  >
                    {umkm.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {umkm.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(umkm.created_at)}
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aktif
                    </div>
                  </div>

                  <button
                    onClick={() => goToDetailPage(umkm.slug)}
                    className="w-full px-3 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90 text-sm bg-green-700"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedUMKM && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-green-800">
                  {selectedUMKM.name}
                </h2>
                <button
                  onClick={() => setSelectedUMKM(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {umkmImages[selectedUMKM.id]?.[0] && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={getPublicUrl(umkmImages[selectedUMKM.id][0])}
                      alt={selectedUMKM.name}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(selectedUMKM.category);
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div
                    className="text-white text-sm px-3 py-1 rounded-full font-medium"
                    style={{ backgroundColor: getCategoryColor(selectedUMKM.category) }}
                  >
                    {selectedUMKM.category}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Bergabung: {formatDate(selectedUMKM.created_at)}
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aktif
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 text-green-800">
                    Deskripsi
                  </h3>
                  <p className="text-gray-700">
                    {selectedUMKM.description}
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setSelectedUMKM(null)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Tutup
                  </button>
                  
                  <button
                    onClick={() => goToDetailPage(selectedUMKM.slug)}
                    className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90 text-sm bg-green-700"
                  >
                    Lihat Detail Lengkap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}