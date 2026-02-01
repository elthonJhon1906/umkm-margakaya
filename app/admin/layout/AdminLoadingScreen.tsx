import React from 'react';

export default function AdminLoadingScreen({
  label = 'Memverifikasi sesi...',
}: {
  label?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-[#F5F5F5]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#2F6B4F] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[#2F6B4F] font-medium">{label}</p>
      </div>
    </div>
  );
}
