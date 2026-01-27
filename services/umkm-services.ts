// services/umkm-service.ts
import { supabase } from '@/lib/supabase';

// Interface untuk data UMKM
export interface UMKMData {
  id?: number;
  name: string;
  category: string;
  description: string;
  full_description: string;
  phone: string;
  address: string;
  image?: string;
  status: 'Aktif' | 'Nonaktif' | 'Pending';
  created_at?: string;
  updated_at?: string;
}

// Interface untuk filter options
export interface UMKMFilterOptions {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Interface untuk pagination result
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UMKMService {
  /**
   * Mendapatkan semua data UMKM
   */
  static async getAll(): Promise<UMKMData[]> {
    try {
      const { data, error } = await supabase
        .from('umkm')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all UMKM:', error);
      throw new Error('Gagal mengambil data UMKM');
    }
  }

  /**
   * Mendapatkan UMKM berdasarkan ID
   */
  static async getById(id: number): Promise<UMKMData> {
    try {
      const { data, error } = await supabase
        .from('umkm')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error getting UMKM with id ${id}:`, error);
      throw new Error('UMKM tidak ditemukan');
    }
  }

  /**
   * Mencari UMKM berdasarkan nama, deskripsi, atau kategori
   */
  static async search(query: string): Promise<UMKMData[]> {
    try {
      const { data, error } = await supabase
        .from('umkm')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error searching UMKM with query "${query}":`, error);
      throw new Error('Gagal melakukan pencarian');
    }
  }

  /**
   * Mendapatkan UMKM dengan filter
   */
  static async getWithFilters(filters: UMKMFilterOptions): Promise<UMKMData[]> {
    try {
      let query = supabase
        .from('umkm')
        .select('*');

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Execute query
      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting UMKM with filters:', error);
      throw new Error('Gagal mengambil data dengan filter');
    }
  }

  /**
   * Mendapatkan UMKM dengan pagination
   */
  static async getPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: UMKMFilterOptions
  ): Promise<PaginatedResult<UMKMData>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('umkm')
        .select('*', { count: 'exact' });

      // Apply filters if any
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Get paginated data
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data || [],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error getting paginated UMKM:', error);
      throw new Error('Gagal mengambil data dengan pagination');
    }
  }

  /**
   * Membuat UMKM baru
   */
  static async create(umkmData: Omit<UMKMData, 'id'>): Promise<UMKMData> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('umkm')
        .insert([{
          ...umkmData,
          created_at: now,
          updated_at: now,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating UMKM:', error);
      throw new Error('Gagal membuat UMKM baru');
    }
  }

  /**
   * Mengupdate data UMKM
   */
  static async update(id: number, umkmData: Partial<UMKMData>): Promise<UMKMData> {
    try {
      const { data, error } = await supabase
        .from('umkm')
        .update({
          ...umkmData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating UMKM with id ${id}:`, error);
      throw new Error('Gagal mengupdate data UMKM');
    }
  }

  /**
   * Menghapus UMKM
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('umkm')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting UMKM with id ${id}:`, error);
      throw new Error('Gagal menghapus UMKM');
    }
  }

  /**
   * Mengganti status UMKM
   */
  static async updateStatus(id: number, status: UMKMData['status']): Promise<UMKMData> {
    try {
      const { data, error } = await supabase
        .from('umkm')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating status for UMKM ${id}:`, error);
      throw new Error('Gagal mengupdate status UMKM');
    }
  }

  /**
   * Mendapatkan semua kategori UMKM yang unik
   */
  static async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('umkm')
        .select('category')
        .order('category');

      if (error) throw error;

      // Extract unique categories
      const categories = [...new Set(data?.map(item => item.category) || [])];
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Gagal mengambil data kategori');
    }
  }

  /**
   * Mendapatkan statistik UMKM
   */
  static async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byCategory: Record<string, number>;
  }> {
    try {
      // Get all UMKM
      const allUMKM = await this.getAll();

      // Calculate statistics
      const total = allUMKM.length;
      const active = allUMKM.filter(u => u.status === 'Aktif').length;
      const inactive = allUMKM.filter(u => u.status === 'Nonaktif').length;
      const pending = allUMKM.filter(u => u.status === 'Pending').length;

      // Group by category
      const byCategory: Record<string, number> = {};
      allUMKM.forEach(umkm => {
        byCategory[umkm.category] = (byCategory[umkm.category] || 0) + 1;
      });

      return {
        total,
        active,
        inactive,
        pending,
        byCategory,
      };
    } catch (error) {
      console.error('Error getting UMKM statistics:', error);
      throw new Error('Gagal mengambil statistik UMKM');
    }
  }

  /**
   * Upload gambar untuk UMKM
   */
  static async uploadImage(file: File, umkmId: number): Promise<string> {
    try {
      // Validasi file
      if (!file.type.startsWith('image/')) {
        throw new Error('File harus berupa gambar');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Ukuran file maksimal 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${umkmId}-${Date.now()}.${fileExt}`;
      const filePath = `umkm-images/${fileName}`;

      // Upload ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('umkm-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('umkm-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Gagal mengupload gambar');
    }
  }

  /**
   * Hapus gambar dari storage
   */
  static async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (!fileName) {
        throw new Error('URL gambar tidak valid');
      }

      const filePath = `umkm-images/${fileName}`;

      // Delete from storage
      const { error } = await supabase.storage
        .from('umkm-images')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Gagal menghapus gambar');
    }
  }

  /**
   * Generate slug dari nama UMKM
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD') // Normalize untuk menghapus diacritics
      .replace(/[\u0300-\u036f]/g, '') // Hapus diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter khusus
      .replace(/\s+/g, '-') // Ganti spasi dengan dash
      .replace(/-+/g, '-') // Ganti multiple dash dengan single
      .trim();
  }

  /**
   * Validasi data UMKM sebelum create/update
   */
  static validateUMKMData(data: Partial<UMKMData>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.name?.trim()) errors.push('Nama UMKM wajib diisi');
    if (!data.category?.trim()) errors.push('Kategori wajib diisi');
    if (!data.description?.trim()) errors.push('Deskripsi singkat wajib diisi');
    if (!data.full_description?.trim()) errors.push('Deskripsi lengkap wajib diisi');
    if (!data.phone?.trim()) errors.push('Nomor telepon wajib diisi');
    if (!data.address?.trim()) errors.push('Alamat wajib diisi');

    // Phone validation (Indonesian format)
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (data.phone && !phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      errors.push('Format nomor telepon tidak valid');
    }

    // Status validation
    if (data.status && !['Aktif', 'Nonaktif', 'Pending'].includes(data.status)) {
      errors.push('Status harus salah satu dari: Aktif, Nonaktif, Pending');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Helper functions untuk transform data jika diperlukan
export const UMKMHelpers = {
  /**
   * Format data untuk ditampilkan di UI
   */
  formatForDisplay(umkm: UMKMData) {
    return {
      ...umkm,
      displayStatus: umkm.status === 'Aktif' ? '✅ Aktif' : 
                    umkm.status === 'Nonaktif' ? '❌ Nonaktif' : 
                    '⏳ Pending',
      shortDescription: umkm.description.length > 100 
        ? umkm.description.substring(0, 100) + '...' 
        : umkm.description,
      formattedPhone: this.formatPhoneNumber(umkm.phone),
      createdDate: umkm.created_at 
        ? new Date(umkm.created_at).toLocaleDateString('id-ID')
        : '-',
    };
  },

  /**
   * Format nomor telepon Indonesia
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      return cleaned.replace(/(\d{4})(\d{4})(\d{0,4})/, '$1-$2-$3');
    } else if (cleaned.startsWith('62')) {
      const without62 = cleaned.substring(2);
      return `+62 ${without62.substring(0, 4)}-${without62.substring(4, 8)}-${without62.substring(8)}`;
    } else if (cleaned.startsWith('8')) {
      return `0${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
    }
    
    return phone;
  },

  /**
   * Get status color untuk UI
   */
  getStatusColor(status: UMKMData['status']): string {
    switch (status) {
      case 'Aktif': return 'bg-green-100 text-green-800';
      case 'Nonaktif': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Get category color untuk UI
   */
  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Kuliner': 'bg-orange-100 text-orange-800',
      'Kerajinan': 'bg-blue-100 text-blue-800',
      'Jasa': 'bg-purple-100 text-purple-800',
      'Retail': 'bg-teal-100 text-teal-800',
      'Pertanian': 'bg-green-100 text-green-800',
      'Peternakan': 'bg-amber-100 text-amber-800',
      'Fashion': 'bg-pink-100 text-pink-800',
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  },
};

// Export default untuk kemudahan import
export default UMKMService;