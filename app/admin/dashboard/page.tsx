'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/admin/layout/AuthProvider';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Edit,
  Trash2,
  Eye,
  Phone,
  MapPin,
  Search,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';

import { adminToast } from '@/app/admin/layout/admin-alert';
import { supabase } from '@/lib/supabase';

// Interface untuk data UMKM
interface UMKMData {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  full_description?: string;
  phone?: string | null;
  address?: string | null;
  image: string | null;
  status: number;
  created_at: string;
  updated_at?: string;
}

// Helper functions
const UMKMHelpers = {
  getStatusColor: (status: number) => {
    switch (status) {
      case 1: return 'bg-green-100 text-green-800';
      case 0: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  getStatusText: (status: number) => {
    return status === 1 ? 'Aktif' : 'Nonaktif';
  },

  getCategoryColor: (category: string) => {
    const colors: Record<string, string> = {
      'kuliner': 'bg-yellow-100 text-yellow-800',
      'kerajinan': 'bg-purple-100 text-purple-800',
      'jasa': 'bg-blue-100 text-blue-800',
      'pertanian': 'bg-green-100 text-green-800',
      'fashion': 'bg-pink-100 text-pink-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category?.toLowerCase()] || colors.default;
  },

  formatDate: (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  formatPhone: (phone: string | null | undefined) => {
    if (!phone) return 'Tidak ada';
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length === 12) {
      return cleanedPhone.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleanedPhone.length === 11) {
      return cleanedPhone.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (cleanedPhone.length === 10) {
      return cleanedPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3');
    }
    return phone;
  },

  truncateText: (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
};

export default function AdminDashboardPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // State untuk data dan UI
  const [umkmList, setUmkmList] = useState<UMKMData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    kuliner: 0,
    kerajinan: 0,
    jasa: 0,
    pertanian: 0,
    fashion: 0,
    lainnya: 0
  });

  // Protect route
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
  router.push('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  // Fetch data saat component mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchUMKMData();
    }
  }, [isLoggedIn]);

  // Fetch semua data UMKM
  const fetchUMKMData = async () => {
    try {
      setLoading(true);
      setError(null);
          
      const { data, error } = await supabase
        .from('umkm')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(`Gagal memuat data: ${error.message}`);
        return;
      }

      
      setUmkmList(data || []);
      
      // Hitung statistik dan kategori
      calculateStatistics(data || []);
      extractCategories(data || []);
      
    } catch (err: any) {
      setError('Terjadi kesalahan saat memuat data UMKM');
    } finally {
      setLoading(false);
    }
  };

  // Extract kategori unik dari data
  const extractCategories = (data: UMKMData[]) => {
    const uniqueCategories = Array.from(new Set(data.map(u => u.category))).filter(Boolean);
    setCategories(['Semua', ...uniqueCategories]);
  };

  // Hitung statistik
  const calculateStatistics = (data: UMKMData[]) => {
    const stats = {
      total: data.length,
      active: data.filter(u => u.status === 1).length,
      inactive: data.filter(u => u.status === 0).length,
      kuliner: data.filter(u => u.category?.toLowerCase() === 'kuliner').length,
      kerajinan: data.filter(u => u.category?.toLowerCase() === 'kerajinan').length,
      jasa: data.filter(u => u.category?.toLowerCase() === 'jasa').length,
      pertanian: data.filter(u => u.category?.toLowerCase() === 'pertanian').length,
      fashion: data.filter(u => u.category?.toLowerCase() === 'fashion').length,
      lainnya: data.filter(u => {
        const cat = u.category?.toLowerCase() || '';
        return !['kuliner', 'kerajinan', 'jasa', 'pertanian', 'fashion'].includes(cat);
      }).length
    };
    
    setStatistics(stats);
  };

  // Filter data berdasarkan search, kategori, dan status
  const getFilteredUMKM = () => {
    let filtered = [...umkmList];

    // Filter berdasarkan search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(umkm =>
        umkm.name.toLowerCase().includes(query) ||
        (umkm.description && umkm.description.toLowerCase().includes(query)) ||
        (umkm.category && umkm.category.toLowerCase().includes(query))
      );
    }

    // Filter berdasarkan kategori
    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(umkm => umkm.category === selectedCategory);
    }

    // Filter berdasarkan status
    if (selectedStatus !== 'Semua') {
      const statusNum = selectedStatus === 'Aktif' ? 1 : 0;
      filtered = filtered.filter(umkm => umkm.status === statusNum);
    }

    return filtered;
  };

  const handleViewDetail = (slug: string) => {
    router.push(`/admin/umkm/${slug}`);
  };

  const handleEdit = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    router.push(`/admin/umkm/edit/${slug}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    
    if (!confirm(`Apakah Anda yakin ingin menghapus UMKM "${name}"?`)) {
      return;
    }

    try {
      const target = e.currentTarget as HTMLButtonElement;
      const originalContent = target.innerHTML;
      target.innerHTML = '<Loader2 className="w-4 h-4 animate-spin" />';
      target.disabled = true;

      
      const { error } = await supabase
        .from('umkm')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      
      // Refresh data
      await fetchUMKMData();
      adminToast.success(`UMKM "${name}" berhasil dihapus!`);
      
    } catch (err: any) {
      adminToast.error('Gagal menghapus UMKM', err);
    }
  };

  // Fungsi untuk mengganti status
  const handleToggleStatus = async (e: React.MouseEvent, id: number, currentStatus: number, name: string) => {
    e.stopPropagation();
    
    const newStatus = currentStatus === 1 ? 0 : 1;
    const newStatusText = newStatus === 1 ? 'Aktif' : 'Nonaktif';
    const action = newStatus === 1 ? 'mengaktifkan' : 'menonaktifkan';
    
    if (!confirm(`Apakah Anda yakin ingin ${action} UMKM "${name}"?`)) {
      return;
    }

    try {
      const target = e.currentTarget as HTMLButtonElement;
      target.disabled = true;

      
      const { error } = await supabase
        .from('umkm')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
      
      // Update local state
      setUmkmList(prev => prev.map(umkm => 
        umkm.id === id ? { ...umkm, status: newStatus } : umkm
      ));
      
      // Recalculate statistics
      calculateStatistics(umkmList.map(umkm => 
        umkm.id === id ? { ...umkm, status: newStatus } : umkm
      ));
      
      adminToast.success(`Status UMKM "${name}" berhasil diubah menjadi ${newStatusText}!`);
      
    } catch (err: any) {
      adminToast.error('Gagal mengubah status UMKM', err);
    } finally {
      const target = e.currentTarget as HTMLButtonElement;
      target.disabled = false;
    }
  };

  // Reset semua filter
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedStatus('Semua');
  };

  if (!isLoggedIn && !authLoading) {
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F6B4F]" />
      </div>
    );
  }

  const filteredUMKM = getFilteredUMKM();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2F6B4F] mb-2">Dashboard Admin UMKM</h1>
        <p className="text-sm sm:text-base text-[#8B7B6F]">Kelola semua UMKM yang terdaftar di Desa Marga Kaya</p>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <Loader2 className="w-12 h-12 text-[#2F6B4F] animate-spin mb-4" />
          <p className="text-gray-600">Memuat data UMKM...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <Button 
            onClick={fetchUMKMData} 
            className="mt-3 bg-red-600 hover:bg-red-700"
            size="sm"
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Action Bar */}
      {!loading && !error && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex-1 w-full">
              <div className="relative max-w-full">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari UMKM berdasarkan nama, deskripsi, atau kategori..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F6B4F] focus:border-transparent text-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#2F6B4F] focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#2F6B4F] focus:border-transparent"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              
              {(searchQuery || selectedCategory !== 'Semua' || selectedStatus !== 'Semua') && (
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="border-[#DFDAD0] text-[#5D5D5D] hover:bg-[#F5F5F5]"
                  size="sm"
                >
                  Reset Filter
                </Button>
              )}
              
              <Link href="/admin/umkm/create">
                <Button className="w-full sm:w-auto bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah UMKM
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-[#8B7B6F] mb-1">Total UMKM</p>
              <p className="text-2xl font-bold text-[#2F6B4F]">{statistics.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-[#8B7B6F] mb-1">Aktif</p>
              <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-[#8B7B6F] mb-1">Nonaktif</p>
              <p className="text-2xl font-bold text-red-600">{statistics.inactive}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-[#8B7B6F] mb-1">Kuliner</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.kuliner}</p>
            </div>
          </motion.div>

          {/* UMKM List - Card View */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {filteredUMKM.length === umkmList.length 
                    ? `Semua UMKM (${umkmList.length})`
                    : `Hasil Filter (${filteredUMKM.length} dari ${umkmList.length})`
                  }
                </h2>
                {(searchQuery || selectedCategory !== 'Semua' || selectedStatus !== 'Semua') && (
                  <p className="text-sm text-gray-600 mt-1">
                    Filter: 
                    {searchQuery && ` Pencarian: "${searchQuery}"`}
                    {selectedCategory !== 'Semua' && ` Kategori: ${selectedCategory}`}
                    {selectedStatus !== 'Semua' && ` Status: ${selectedStatus}`}
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>Klik card untuk melihat detail</span>
              </div>
            </div>
            
            {filteredUMKM.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {umkmList.length === 0 ? 'Belum ada UMKM' : 'Tidak ada hasil'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {umkmList.length === 0 
                    ? 'Mulai dengan menambahkan UMKM pertama Anda'
                    : 'Coba ubah kata kunci pencarian atau filter yang Anda gunakan'
                  }
                </p>
                {umkmList.length === 0 ? (
                  <Link href="/admin/umkm/create">
                    <Button className="bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah UMKM Pertama
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={handleResetFilters}
                    variant="outline"
                    className="border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#2F6B4F]/10"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredUMKM.map((umkm, index) => {
                  const statusText = UMKMHelpers.getStatusText(umkm.status);
                  const statusColor = UMKMHelpers.getStatusColor(umkm.status);
                  const categoryColor = UMKMHelpers.getCategoryColor(umkm.category);
                  const formattedPhone = UMKMHelpers.formatPhone(umkm.phone || null);
                  const createdDate = UMKMHelpers.formatDate(umkm.created_at);
                  const shortDescription = UMKMHelpers.truncateText(umkm.description);
                  
                  return (
                    <motion.div
                      key={umkm.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                      onClick={() => handleViewDetail(umkm.slug)}
                      className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group relative"
                    >
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>

                      {/* Card Header */}
                      <div className="p-5 pt-8">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#2F6B4F] to-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 group-hover:text-[#2F6B4F] transition-colors truncate">
                              {umkm.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                                {umkm.category}
                              </span>
                              <span className="text-xs text-gray-500 truncate">
                                Slug: {umkm.slug}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{shortDescription}</p>
                        
                        {/* Contact Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 shrink-0" />
                            <span className="truncate">{formattedPhone}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{umkm.address || 'Alamat belum diisi'}</span>
                          </div>
                        </div>
                        
                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                          <span>ID: {umkm.id}</span>
                          <span>Dibuat: {createdDate}</span>
                        </div>
                      </div>
                      
                      {/* Card Footer - Actions */}
                      <div 
                        className="border-t border-gray-100 p-4 bg-gray-50 flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => handleToggleStatus(e, umkm.id, umkm.status, umkm.name)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            umkm.status === 1
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={umkm.status === 1 ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {umkm.status === 1 ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleEdit(e, umkm.slug)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors group/btn relative"
                            title="Edit UMKM"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Edit
                            </span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, umkm.id, umkm.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group/btn relative"
                            title="Hapus UMKM"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Hapus
                            </span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}