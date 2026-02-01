'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  AlertCircle,
  Pencil
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateSlug, generateUniqueSlug } from '@/lib/slug-helper';

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

interface UMKMData {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  full_description: string;
  phone: string;
  address: string;
  main_image: string;
  images_text: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export default function EditUMPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [umkm, setUmkm] = useState<UMKMData | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageError, setStorageError] = useState<string>('');
  
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
  
  // State untuk gambar
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [selectedMainFile, setSelectedMainFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<{ 
    file?: File; 
    preview: string; 
    id?: number;
    isExisting?: boolean;
  }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [autoSlug, setAutoSlug] = useState('');
  const [manualSlug, setManualSlug] = useState('');

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
  router.push('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  useEffect(() => {
    if (formData.name.trim()) {
      const slug = generateSlug(formData.name);
      setAutoSlug(slug);
      if (!manualSlug && !umkm) {
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  }, [formData.name]);

  const handleSlugChange = (value: string) => {
    const cleanSlug = generateSlug(value);
    setManualSlug(value);
    setFormData(prev => ({ ...prev, slug: cleanSlug }));
  };

  useEffect(() => {
    const testStorageConnection = async () => {
      if (!isLoggedIn) return;
      
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          return;
        }
        
        const umkmBucket = buckets?.find(b => b.name === 'umkm-images');
        
        if (!umkmBucket) {
          setStorageError('Bucket "umkm-images" tidak ditemukan di storage');
          return;
        }
        
        setStorageError('');
        
      } catch (error: any) {
        setStorageError(`Storage test failed: ${error.message}`);
      }
    };
    
    if (isLoggedIn) {
      testStorageConnection();
    }
  }, [isLoggedIn]);

  // Fetch UMKM data berdasarkan slug dari database
  useEffect(() => {
    const fetchUMKMData = async () => {
      if (!slug || !isLoggedIn) return;
      
      setLoading(true);
      setError('');
      
      try {
        
        const { data, error: fetchError } = await supabase
          .from('umkm')
          .select('*')
          .eq('slug', slug)
          .single();

        if (fetchError) {
          throw new Error(`Gagal mengambil data UMKM: ${fetchError.message}`);
        }

        if (!data) {
          throw new Error(`UMKM dengan slug "${slug}" tidak ditemukan`);
        }

        const umkmData = data as UMKMData;
        setUmkm(umkmData);
        
        // Set form data
        setFormData({
          name: umkmData.name,
          slug: umkmData.slug,
          category: umkmData.category,
          description: umkmData.description,
          full_description: umkmData.full_description || '',
          phone: umkmData.phone || '',
          address: umkmData.address || '',
          status: umkmData.status,
        });
        
        // Set main image preview
        if (umkmData.main_image) {
          setMainImagePreview(umkmData.main_image);
        }
        
        // Set additional images
        if (umkmData.images_text) {
          try {
            const parsedImages = JSON.parse(umkmData.images_text);
            if (Array.isArray(parsedImages)) {
              setAdditionalImages(parsedImages.map((url, index) => ({
                preview: url,
                id: index,
                isExisting: true
              })));
            }
          } catch (e) {
          }
        }
        
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data UMKM');
      } finally {
        setLoading(false);
      }
    };

    if (slug && isLoggedIn) {
      fetchUMKMData();
    }
  }, [slug, isLoggedIn]);

  // Handle category change
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

  // Image handling functions
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
    if (mainImagePreview && umkm?.main_image) {
      setImagesToDelete(prev => [...prev, umkm.main_image]);
    }
    setMainImagePreview(null);
    setSelectedMainFile(null);
  };

  const removeAdditionalImage = (index: number) => {
    const image = additionalImages[index];
    if (image.isExisting && image.preview) {
      setImagesToDelete(prev => [...prev, image.preview]);
    }
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  // Function to get public URL
  const getPublicUrl = (filePath: string): string => {
    try {
      const { data } = supabase.storage
        .from('umkm-images')
        .getPublicUrl(filePath);
      return data?.publicUrl || '';
    } catch (error) {
      return '';
    }
  };

  // Upload image to storage
  const uploadImageToStorage = async (file: File, folder: string = ''): Promise<string | null> => {
    try {
      
      // Generate unique filename
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
        return null;
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

  // Upload multiple images
  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const url = await uploadImageToStorage(file, 'additional');
      
      if (url) {
        uploadedUrls.push(url);
      }
      
      // Update progress
      const progress = 30 + Math.floor(((i + 1) / files.length) * 40);
      setUploadProgress(progress);
    }
    
    return uploadedUrls;
  };

  // Delete images from storage
  const deleteImagesFromStorage = async (imageUrls: string[]): Promise<void> => {
    for (const imageUrl of imageUrls) {
      try {
        if (!imageUrl) continue;
        
        // Extract path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        
        // Find 'umkm-images' in path
        const bucketIndex = pathParts.indexOf('umkm-images');
        if (bucketIndex === -1) continue;
        
        // Reconstruct file path
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        
        
        const { error } = await supabase.storage
          .from('umkm-images')
          .remove([filePath]);
        
        if (error) {
        } else {
        }
      } catch (error) {
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !umkm) {
      adminToast.error('Anda harus login terlebih dahulu');
  router.push('/login');
      return;
    }

    // Reset errors
    setError('');
    setSuccess('');

    // Validasi required fields
    if (!formData.name.trim() || !formData.category.trim() || !formData.description.trim()) {
      setError('Nama, kategori, dan deskripsi singkat wajib diisi');
      return;
    }

    // Validasi main image
    if (!mainImagePreview) {
      setError('Gambar utama wajib diisi');
      return;
    }

    setSaving(true);
    setUploadProgress(10);

    try {
      
      let mainImageUrl = mainImagePreview;
      let additionalImageUrls: string[] = [];
      
      // **STEP 1: Delete old images**
      setUploadProgress(15);
      if (imagesToDelete.length > 0) {
        await deleteImagesFromStorage(imagesToDelete);
      }
      
      // **STEP 2: Upload new main image if exists**
      setUploadProgress(20);
      if (selectedMainFile) {
        const uploadedUrl = await uploadImageToStorage(selectedMainFile, 'main');
        
        if (uploadedUrl) {
          mainImageUrl = uploadedUrl;
        } else {
        }
        
      }
      
      setUploadProgress(40);

      // **STEP 3: Upload new additional images**
      const newAdditionalFiles = additionalImages
        .filter(img => img.file && !img.isExisting)
        .map(img => img.file!);
      
      if (newAdditionalFiles.length > 0) {
        const uploadedUrls = await uploadMultipleImages(newAdditionalFiles);
        additionalImageUrls.push(...uploadedUrls);
      }
      
      // **STEP 4: Keep existing additional images**
      const existingImages = additionalImages
        .filter(img => img.isExisting && !imagesToDelete.includes(img.preview))
        .map(img => img.preview);
      
      additionalImageUrls = [...existingImages, ...additionalImageUrls];
      

      setUploadProgress(80);

      // **STEP 5: Generate unique slug if name changed**
      let finalSlug = formData.slug;
      if (formData.name !== umkm.name) {
        finalSlug = await generateUniqueSlug(formData.name, supabase);
      }

      // **STEP 6: Prepare update data**
      const updateData = {
        name: formData.name.trim(),
        slug: finalSlug.trim(),
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
        updated_at: new Date().toISOString()
      };


      setUploadProgress(90);

      // **STEP 7: Update database**
      const { data, error: updateError } = await supabase
        .from('umkm')
        .update(updateData)
        .eq('id', umkm.id)
        .select();

      if (updateError) {
        
        if (updateError.code === '23505') {
          throw new Error('Slug sudah digunakan oleh UMKM lain');
        }
        
        throw new Error(`Database error: ${updateError.message}`);
      }

      setUploadProgress(100);

      // Success message
      setSuccess('✅ UMKM berhasil diperbarui!');
      
      // Reset states
      setImagesToDelete([]);
      setSelectedMainFile(null);
      
      // Redirect jika slug berubah
      if (finalSlug !== umkm.slug) {
        setTimeout(() => {
          router.push(`/admin/umkm/${finalSlug}/edit`);
          router.refresh();
        }, 1500);
      } else {
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }

    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat memperbarui data');
    } finally {
      setSaving(false);
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

  const handleDelete = async () => {
    if (!umkm) return;
    
    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus UMKM "${umkm.name}"?\n\n` +
      'SEMUA GAMBAR AKAN DIHAPUS!\n' +
      'Tindakan ini tidak dapat dibatalkan!'
    );
    
    if (!confirmDelete) return;

    try {
      setSaving(true);
      
      // Hapus semua gambar terkait UMKM
      const allImagesToDelete: string[] = [];
      
      if (umkm.main_image) {
        allImagesToDelete.push(umkm.main_image);
      }
      
      if (umkm.images_text) {
        try {
          const additionalImages = JSON.parse(umkm.images_text);
          if (Array.isArray(additionalImages)) {
            allImagesToDelete.push(...additionalImages);
          }
        } catch (e) {
        }
      }
      
      if (allImagesToDelete.length > 0) {
        await deleteImagesFromStorage(allImagesToDelete);
      }
      
      // Delete dari database
      const { error: deleteError } = await supabase
        .from('umkm')
        .delete()
        .eq('id', umkm.id);

      if (deleteError) {
        throw new Error(`Gagal menghapus UMKM: ${deleteError.message}`);
      }

  adminToast.success('UMKM berhasil dihapus!');
      
      // Redirect ke dashboard
      setTimeout(() => {
        router.push('/admin/dashboard');
        router.refresh();
      }, 1000);

    } catch (err: any) {
      adminToast.error('Gagal menghapus UMKM', err);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2F6B4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data UMKM...</p>
        </div>
      </div>
    );
  }

  if (!authLoading && !isLoggedIn) {
    return null;
  }

  if (error && !umkm) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
              <p className="text-gray-600 mb-4">{error}</p>
            </div>
          </div>
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

  if (!umkm && !loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">UMKM Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">UMKM dengan slug "{slug}" tidak ditemukan.</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2F6B4F]">Edit UMKM</h1>
              <p className="text-[#8B7B6F] mt-2">
                Edit data UMKM "{umkm?.name}"
              </p>
            </div>
            <Button
              onClick={handleDelete}
              disabled={saving}
              variant="destructive"
              className="h-10 px-4"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus UMKM
            </Button>
          </div>
        </div>

        {/* Storage Status */}
        {storageError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">⚠️ Storage Error</h3>
                <p className="text-red-700 text-sm mt-1 whitespace-pre-line">{storageError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {saving && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow border border-[#DFDAD0]">
            <div className="flex justify-between text-sm text-[#5D5D5D] mb-1">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Menyimpan perubahan...
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
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-green-700 text-sm whitespace-pre-line">{success}</p>
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
                disabled={saving}
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
                  disabled={saving}
                  className="border-[#DFDAD0] focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                />
                {autoSlug && manualSlug !== formData.slug && (
                  <p className="text-sm text-gray-500">
                    Auto-generated: <code className="bg-gray-100 px-2 py-1 rounded">{autoSlug}</code>
                    <button
                      type="button"
                      onClick={() => handleSlugChange(autoSlug)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                      disabled={saving}
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
                disabled={saving}
              />
              
              <div 
                onClick={triggerMainImageInput}
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2F6B4F] transition-colors cursor-pointer bg-gray-50 ${
                  saving ? 'cursor-not-allowed opacity-50' : ''
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
                        disabled={saving}
                        className="bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors"
                        title="Hapus gambar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {selectedMainFile?.name || 'Gambar saat ini'}
                      {selectedMainFile && ' (baru)'}
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2 font-medium">
                      Klik untuk mengubah gambar utama
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
                disabled={saving}
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
                      disabled={saving}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {image.isExisting && (
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                        existing
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add more button */}
                <div 
                  onClick={triggerAdditionalImagesInput}
                  className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#2F6B4F] transition-colors cursor-pointer flex flex-col items-center justify-center h-32 ${
                    saving ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <Plus className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Tambah Gambar</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                {additionalImages.length} gambar tambahan
                {additionalImages.some(img => img.file) && ' (ada yang baru)'}
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
                    disabled={saving}
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
                  disabled={saving}
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
                    disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                disabled={saving}
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
                disabled={saving || !formData.name || !formData.category || !formData.description || !mainImagePreview}
                className="flex-1 bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90 h-11 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Pencil className="w-4 h-4" />
                    Perbarui UMKM
                  </span>
                )}
              </Button>
              <Link href="/admin/dashboard" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
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