'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/admin/layout/AuthProvider';
import { adminToast } from '@/app/admin/layout/admin-alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  Phone,
  MapPin,
  Loader2,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateSlug, generateUniqueSlug } from '@/lib/slug-helper';

// Kategori yang sudah ditentukan
const CATEGORY_OPTIONS = [
  'Kuliner',
  'Kerajinan', 
  'Jasa',
  'Pertanian',
  'Fashion',
  'Kesehatan',
  'Pendidikan',
  'Teknologi'
];

// Konfigurasi S3
const S3_CONFIG = {
  endpoint: 'https://idunloffuvlackboopge.storage.supabase.co/storage/v1/s3',
  bucket: 'umkm-images' // Sesuaikan dengan nama bucket Anda
};

export default function CreateUMKMPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [selectedMainFile, setSelectedMainFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [autoSlug, setAutoSlug] = useState('');
  const [manualSlug, setManualSlug] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [storageError, setStorageError] = useState<string>('');

  // Protect route
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
  router.push('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    description: '',
    full_description: '',
    phone: '',
    address: '',
    status: 1,
  });

  // Auto-generate slug saat nama berubah
  useEffect(() => {
    if (formData.name.trim()) {
      const slug = generateSlug(formData.name);
      setAutoSlug(slug);
      if (!manualSlug) {
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  }, [formData.name]);

  // Handle manual slug input
  const handleSlugChange = (value: string) => {
    const cleanSlug = generateSlug(value);
    setManualSlug(value);
    setFormData(prev => ({ ...prev, slug: cleanSlug }));
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetImage(file, true);
    }
  };

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      validateAndSetImage(file, false);
    });
  };

  const validateAndSetImage = (file: File, isMain: boolean) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      adminToast.error('Ukuran file terlalu besar', undefined, {
        description: `Ukuran file "${file.name}" maksimal 5MB`,
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      adminToast.error('Format file tidak didukung', undefined, {
        description: `File "${file.name}" bukan gambar (JPEG, PNG, GIF, WebP)`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      
      if (isMain) {
        setSelectedMainFile(file);
        setMainImagePreview(preview);
      } else {
        setAdditionalImages(prev => [...prev, { file, preview }]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeMainImage = () => {
    setMainImagePreview(null);
    setSelectedMainFile(null);
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  // **FIXED: Fungsi untuk mendapatkan public URL yang benar**
  const getPublicUrl = (filePath: string): string => {
    try {
      
      // Menggunakan format URL S3 yang benar
      const { data } = supabase.storage
        .from('umkm-images')
        .getPublicUrl(filePath);
      
      const publicUrl = data?.publicUrl || '';
      
      if (!publicUrl) {
        return '';
      }
      
      return publicUrl;
    } catch (error: any) {
      
      // Fallback: Manual construct URL jika diperlukan
      const fallbackUrl = `${S3_CONFIG.endpoint}/${S3_CONFIG.bucket}/${filePath}`;
      return fallbackUrl;
    }
  };

  // **FIXED: Upload menggunakan API Supabase Storage dengan error handling yang lebih baik**
  const uploadImageToStorage = async (file: File, folder: string = ''): Promise<string | null> => {
    try {

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomStr}.${fileExt}`;
      
      // Build file path
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      
      // Upload menggunakan Supabase Storage SDK
      const { data, error } = await supabase.storage
        .from('umkm-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        
        if (error.message.includes('not found') || error.message.includes('bucket')) {
          
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some(b => b.name === 'umkm-images');
          
          if (!bucketExists) {
            return null;
          }
          
          const { data: retryData, error: retryError } = await supabase.storage
            .from('umkm-images')
            .upload(filePath, file);
            
          if (retryError) {
            return null;
          }
          
        } else {
          return null;
        }
      }

      
      // Get public URL
      const publicUrl = getPublicUrl(filePath);
      
      if (!publicUrl) {
        return null;
      }
      
      return publicUrl;

    } catch (error: any) {
      return null;
    }
  };

  // **ALTERNATIF: Upload menggunakan fetch langsung ke S3 endpoint (jika SDK bermasalah)**
  const uploadToS3Directly = async (file: File, folder: string = ''): Promise<string | null> => {
    try {
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomStr}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      // Upload menggunakan fetch ke S3 endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', filePath);
      
      // Dapatkan session untuk mendapatkan token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        return null;
      }
      
      const response = await fetch(
        `${S3_CONFIG.endpoint}/object/${S3_CONFIG.bucket}/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: file
        }
      );
      
      if (!response.ok) {
        return null;
      }
      
      
      // Construct public URL
      const publicUrl = `${S3_CONFIG.endpoint}/object/public/${S3_CONFIG.bucket}/${filePath}`;
      return publicUrl;
      
    } catch (error) {
      return null;
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Coba upload dengan metode utama dulu
      let url = await uploadImageToStorage(file, 'additional');
      
      // Jika gagal, coba metode alternatif
      if (!url) {
        url = await uploadToS3Directly(file, 'additional');
      }
      
      if (url) {
        uploadedUrls.push(url);
      }
      
      // Update progress
      const progress = 50 + Math.floor(((i + 1) / files.length) * 40);
      setUploadProgress(progress);
    }
    
    return uploadedUrls;
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowCustomCategory(false);
      setCustomCategory('');
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleCustomCategoryChange = (value: string) => {
    setCustomCategory(value);
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      adminToast.error('Anda harus login terlebih dahulu');
  router.push('/login');
      return;
    }

    // Reset errors
    setErrorMessage('');
    setStorageError('');

    // Validasi required fields
    if (!formData.name.trim() || !formData.category.trim() || !formData.description.trim()) {
      setErrorMessage('Nama, kategori, dan deskripsi singkat wajib diisi');
      return;
    }

    // Validasi slug
    if (!formData.slug.trim()) {
      setErrorMessage('Slug tidak boleh kosong');
      return;
    }

    // Validasi main image (wajib)
    if (!selectedMainFile) {
      setErrorMessage('Gambar utama wajib diisi');
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      
      let mainImageUrl = null;
      let additionalImageUrls: string[] = [];
      
      setUploadProgress(20);
      
      mainImageUrl = await uploadImageToStorage(selectedMainFile, 'main');
      
      if (!mainImageUrl) {
        mainImageUrl = await uploadToS3Directly(selectedMainFile, 'main');
      }
      
      if (!mainImageUrl) {
        mainImageUrl = `https://via.placeholder.com/800x600/2F6B4F/FFFFFF?text=${encodeURIComponent(formData.name)}`;
      }
      
      setUploadProgress(40);

      if (additionalImages.length > 0) {
        const files = additionalImages.map(img => img.file);
        additionalImageUrls = await uploadMultipleImages(files);
      }

      setUploadProgress(85);

      const uniqueSlug = await generateUniqueSlug(formData.name, supabase);

      const umkmData = {
        name: formData.name.trim(),
        slug: uniqueSlug,
        category: formData.category.trim(),
        description: formData.description.trim(),
        full_description: formData.full_description.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        main_image: mainImageUrl,
        images_text: additionalImageUrls.length > 0 
          ? JSON.stringify(additionalImageUrls)
          : null,
        status: formData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };


      setUploadProgress(90);

      // **STEP 5: Insert into database**
      const { data, error } = await supabase
        .from('umkm')
        .insert([umkmData])
        .select();

      if (error) {
        
        // Jika error karena RLS
        if (error.code === '42501') {
          throw new Error(
            '❌ RLS Policy Masih Aktif!\n\n' +
            'SOLUSI:\n' +
            '1. Buka Supabase → SQL Editor\n' +
            '2. Jalankan: ALTER TABLE umkm DISABLE ROW LEVEL SECURITY;\n' +
            '3. Klik RUN\n' +
            '4. Refresh halaman ini'
          );
        }
        
        throw new Error(`Database error: ${error.message}`);
      }

      setUploadProgress(100);

      // Success message
  adminToast.success('UMKM berhasil ditambahkan!');
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        category: '',
        description: '',
        full_description: '',
        phone: '',
        address: '',
        status: 1,
      });
      setMainImagePreview(null);
      setSelectedMainFile(null);
      setAdditionalImages([]);
      setCustomCategory('');
      setShowCustomCategory(false);
      setManualSlug('');
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/admin/dashboard');
        router.refresh();
      }, 2000);

    } catch (error: any) {
      setErrorMessage(error.message);
      
      // Show detailed error
      adminToast.error('Gagal menambahkan UMKM', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const triggerMainImageInput = () => {
    document.getElementById('main-image-input')?.click();
  };

  const triggerAdditionalImagesInput = () => {
    document.getElementById('additional-images-input')?.click();
  };

  // Test storage connection on mount
  useEffect(() => {
    const testStorageConnection = async () => {
      if (!isLoggedIn) return;
      
      try {
        // Test 1: Cek bucket exist menggunakan SDK
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          
          // Coba langsung ke endpoint S3
          const sessionResponse = await supabase.auth.getSession();
          const token = sessionResponse.data.session?.access_token;
          
          if (token) {
            try {
              const s3Response = await fetch(
                `${S3_CONFIG.endpoint}/bucket/${S3_CONFIG.bucket}`,
                {
                  headers: { 'Authorization': `Bearer ${token}` }
                }
              );
              
              if (s3Response.ok) {
              } else {
              }
            } catch (s3Error) {
            }
          }
          
          return;
        }
        
        const umkmBucket = buckets?.find(b => b.name === 'umkm-images');
        
        if (!umkmBucket) {
          setStorageError('Bucket "umkm-images" tidak ditemukan di storage\n' +
                         'Buka Supabase → Storage → Buat bucket baru dengan nama "umkm-images"');
          return;
        }
        
        setStorageError('');
        
      } catch (error: any) {
        setStorageError(`Storage test failed: ${error.message}`);
      }
    };
    
    testStorageConnection();
  }, [isLoggedIn]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F6B4F]" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
  <div className="min-h-screen bg-linear-to-b from-white to-[#F8F5F0] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-[#2F6B4F] hover:text-[#2F6B4F]/80 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#2F6B4F]">Tambah UMKM Baru</h1>
          <p className="text-[#8B7B6F] mt-2">
            Isi data UMKM dengan lengkap untuk ditampilkan di katalog
          </p>
        </div>

        {/* Storage Status */}
        {storageError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">⚠️ Storage Error</h3>
                <p className="text-red-700 text-sm mt-1 whitespace-pre-line">{storageError}</p>
                <div className="mt-3 text-xs text-red-600">
                  <p className="font-semibold">Perbaiki di Supabase Dashboard:</p>
                  <ol className="list-decimal pl-4 mt-1 space-y-1">
                    <li>Buka tab <strong>Storage</strong></li>
                    <li>Klik <strong>"Create a new bucket"</strong></li>
                    <li>Nama bucket: <strong>umkm-images</strong></li>
                    <li>Pastikan <strong>Public bucket</strong> dicentang</li>
                    <li>Klik <strong>"Create bucket"</strong></li>
                    <li>Refresh halaman ini</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {loading && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow border border-[#DFDAD0]">
            <div className="flex justify-between text-sm text-[#5D5D5D] mb-1">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Menyimpan data...
              </span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#2F6B4F] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-red-700 text-sm whitespace-pre-line">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#DFDAD0]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama UMKM */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#5D5D5D] font-medium">
                Nama UMKM *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Contoh: Warung Sate Pak Budi"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="border-[#DFDAD0] focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-[#5D5D5D] font-medium">
                Slug / URL *
                <span className="text-sm text-gray-500 ml-2">(otomatis di-generate)</span>
              </Label>
              <div className="space-y-2">
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="warung-sate-pak-budi"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  disabled={loading}
                  className="border-[#DFDAD0] focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                />
                {autoSlug && manualSlug !== formData.slug && (
                  <p className="text-sm text-gray-500">
                    Auto-generated: <code className="bg-gray-100 px-2 py-1 rounded">{autoSlug}</code>
                    <button
                      type="button"
                      onClick={() => handleSlugChange(autoSlug)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Gunakan ini
                    </button>
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Slug akan digunakan di URL: /umkm/<strong>{formData.slug || 'nama-umkm'}</strong>
                </p>
              </div>
            </div>

            {/* Main Image Upload */}
            <div className="space-y-4">
              <Label className="text-[#5D5D5D] font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Gambar Utama (Thumbnail) *
              </Label>
              
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleMainImageUpload}
                className="hidden"
                id="main-image-input"
                disabled={loading}
              />
              
              <div 
                onClick={triggerMainImageInput}
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2F6B4F] transition-colors cursor-pointer bg-gray-50 ${
                  loading ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {mainImagePreview ? (
                  <div className="relative">
                    <img
                      src={mainImagePreview}
                      alt="Main preview"
                      className="w-full h-48 object-cover rounded-lg mx-auto"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMainImage();
                        }}
                        disabled={loading}
                        className="bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors"
                        title="Hapus gambar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {selectedMainFile?.name}
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2 font-medium">
                      Gambar utama untuk thumbnail
                    </p>
                    <p className="text-sm text-gray-500">
                      Wajib diisi. JPEG, PNG (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Images */}
            <div className="space-y-4">
              <Label className="text-[#5D5D5D] font-medium">
                Gambar Tambahan (Opsional)
              </Label>
              
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAdditionalImagesUpload}
                className="hidden"
                id="additional-images-input"
                multiple
                disabled={loading}
              />
              
              {/* Grid untuk additional images */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {additionalImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Additional ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      disabled={loading}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {/* Add more button */}
                <div 
                  onClick={triggerAdditionalImagesInput}
                  className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#2F6B4F] transition-colors cursor-pointer flex flex-col items-center justify-center h-32 ${
                    loading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <Plus className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Tambah Gambar</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                {additionalImages.length} gambar tambahan dipilih
              </p>
            </div>

            {/* Kategori */}
            <div className="space-y-3">
              <Label className="text-[#5D5D5D] font-medium">
                Kategori *
              </Label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      formData.category === cat && !showCustomCategory
                        ? 'bg-[#2F6B4F] text-white border-[#2F6B4F]'
                        : 'border-[#DFDAD0] text-[#5D5D5D] hover:bg-[#F8F5F0]'
                    }`}
                  >
                    {cat}
                </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => handleCategoryChange('custom')}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    showCustomCategory
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'border-[#DFDAD0] text-[#5D5D5D] hover:bg-[#F8F5F0]'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  Lainnya
                </button>
              </div>
              
              {/* Custom Category Input */}
              {showCustomCategory && (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Tulis kategori lainnya..."
                    value={customCategory}
                    onChange={(e) => handleCustomCategoryChange(e.target.value)}
                    disabled={loading}
                    className="border-[#DFDAD0] focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                  />
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#5D5D5D] font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Nomor Telepon
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="border-[#DFDAD0] focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-[#5D5D5D] font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Alamat
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Jl. Contoh No. 123, Desa Marga Kaya"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                  className="border-[#DFDAD0] focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#5D5D5D] font-medium">
                  Deskripsi Singkat *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Deskripsi singkat yang menarik..."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={200}
                  required
                  disabled={loading}
                  rows={3}
                  className="border-[#DFDAD0] focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                />
                <p className="text-sm text-gray-500">
                  {formData.description.length}/200 karakter
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_description" className="text-[#5D5D5D] font-medium">
                  Deskripsi Lengkap
                </Label>
                <Textarea
                  id="full_description"
                  name="full_description"
                  placeholder="Detail lengkap tentang UMKM..."
                  value={formData.full_description}
                  onChange={handleChange}
                  rows={5}
                  disabled={loading}
                  className="border-[#DFDAD0] focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-[#5D5D5D] font-medium">
                Status
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-[#DFDAD0] rounded-md focus:outline-none focus:border-[#2F6B4F] focus:ring-[#2F6B4F] bg-white text-[#5D5D5D]"
              >
                <option value={1}>✅ Aktif (Tampil di katalog)</option>
                <option value={0}>⏸️ Non-Aktif (Disembunyikan)</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#DFDAD0]">
              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.category || !formData.description || !selectedMainFile}
                className="flex-1 bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90 h-11 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Tambah UMKM
                  </span>
                )}
              </Button>
              <Link href="/admin/dashboard" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="w-full border-[#DFDAD0] text-[#5D5D5D] hover:bg-[#F5F5F5] bg-amber-50 h-11"
                >
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}