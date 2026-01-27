'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Edit,
  Upload,
  Image as ImageIcon,
  X,
  Save,
  Loader2,
  Trash2,
  Phone,
  MapPin
} from 'lucide-react';

interface UMKMData {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  fullDescription: string;
  phone: string;
  address: string;
  orderUrl?: string;
  image?: string;
  status: 'Aktif' | 'Nonaktif' | 'Pending';
  createdAt: string;
  updatedAt: string;
}

interface EditUMKMDialogProps {
  isOpen: boolean;
  onClose: () => void;
  umkm: UMKMData;
  onSave: (data: any) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function EditUMKMDialog({
  isOpen,
  onClose,
  umkm,
  onSave,
  onDelete
}: EditUMKMDialogProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(umkm.image || null);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: umkm.name,
    category: umkm.category,
    description: umkm.description,
    fullDescription: umkm.fullDescription,
    phone: umkm.phone,
    address: umkm.address,
    orderUrl: umkm.orderUrl || '',
    status: umkm.status as 'Aktif' | 'Nonaktif' | 'Pending',
  });

  // Update form data when umkm changes
  useEffect(() => {
    if (umkm) {
      setFormData({
        name: umkm.name,
        category: umkm.category,
        description: umkm.description,
        fullDescription: umkm.fullDescription,
        phone: umkm.phone,
        address: umkm.address,
        orderUrl: umkm.orderUrl || '',
        status: umkm.status,
      });
      setImagePreview(umkm.image || null);
    }
  }, [umkm]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...formData, image: imagePreview });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus UMKM ini?')) {
      setDeleting(true);
      try {
        await onDelete();
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Edit className="w-6 h-6 text-[#2F6B4F]" />
                        Edit UMKM
                      </h2>
                      <p className="text-gray-600 mt-1">Perbarui informasi UMKM {umkm.name}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-4">
                      <Label className="text-gray-700 font-medium flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Gambar UMKM
                      </Label>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#2F6B4F] transition-colors cursor-pointer bg-gray-50">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setImagePreview(null)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="py-8">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">Upload gambar UMKM</p>
                            <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="mt-4 inline-block cursor-pointer"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            {imagePreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                          </Button>
                        </label>
                      </div>
                    </div>

                    {/* Nama UMKM */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Nama UMKM *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Nama UMKM"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="border-gray-300 focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                      />
                    </div>

                    {/* Grid untuk Kategori dan Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Kategori */}
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-gray-700 font-medium">
                          Kategori *
                        </Label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2F6B4F] focus:ring-[#2F6B4F] bg-white text-gray-700"
                        >
                          <option value="">Pilih Kategori</option>
                          <option value="Kuliner">Kuliner</option>
                          <option value="Kerajinan">Kerajinan</option>
                          <option value="Jasa">Jasa</option>
                          <option value="Pertanian">Pertanian</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-gray-700 font-medium">
                          Status *
                        </Label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2F6B4F] focus:ring-[#2F6B4F] bg-white text-gray-700"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Nonaktif">Nonaktif</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    {/* Nomor Telepon */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Nomor Telepon *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="border-gray-300 focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                      />
                    </div>

                    {/* Alamat */}
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-700 font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Alamat *
                      </Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Alamat lengkap UMKM"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        required
                        className="border-gray-300 focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                      />
                    </div>

                    {/* Deskripsi Singkat */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-700 font-medium">
                        Deskripsi Singkat
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        type="text"
                        placeholder="Deskripsi singkat UMKM"
                        value={formData.description}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                      />
                    </div>

                    {/* Deskripsi Lengkap */}
                    <div className="space-y-2">
                      <Label htmlFor="fullDescription" className="text-gray-700 font-medium">
                        Deskripsi Lengkap *
                      </Label>
                      <Textarea
                        id="fullDescription"
                        name="fullDescription"
                        placeholder="Deskripsi lengkap UMKM..."
                        value={formData.fullDescription}
                        onChange={handleChange}
                        rows={5}
                        required
                        className="border-gray-300 focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                      />
                    </div>

                    {/* URL Pesanan */}
                    <div className="space-y-2">
                      <Label htmlFor="orderUrl" className="text-gray-700 font-medium">
                        URL Pesanan (WhatsApp/Link)
                      </Label>
                      <Input
                        id="orderUrl"
                        name="orderUrl"
                        type="url"
                        placeholder="https://wa.me/628xxx atau link lainnya"
                        value={formData.orderUrl}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-black"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                      <div className="flex-1 flex gap-3">
                        <Button
                          type="button"
                          onClick={handleDeleteClick}
                          variant="destructive"
                          className="bg-red-600 text-white hover:bg-red-700"
                          disabled={deleting}
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Menghapus...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus UMKM
                            </>
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          onClick={onClose}
                          variant="outline"
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Batal
                        </Button>
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Simpan Perubahan
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}