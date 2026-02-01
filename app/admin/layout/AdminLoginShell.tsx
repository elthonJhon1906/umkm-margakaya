import React from 'react';

export default function AdminLoginShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-[#F5F5F5] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-linear-to-r from-[#2F6B4F]/5 to-[#4CAF50]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-linear-to-l from-[#2F6B4F]/5 to-[#4CAF50]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-linear-to-br from-[#F59E0B]/5 to-[#FBBF24]/5 rounded-full blur-3xl" />

        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left side (static) */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between bg-linear-to-br from-[#2F6B4F] to-[#3A8C66] text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Marga Kaya</h1>
              <p className="text-white/80 text-sm">Administrator System</p>
            </div>
          </div>

          <div className="lg:max-w-md">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Kelola UMKM<br />Marga Kaya dengan Mudah
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold">UMKM</span>
                </div>
                <p className="text-white/90">Tambah dan kelola data UMKM</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold">OK</span>
                </div>
                <p className="text-white/90">Pantau perkembangan usaha</p>
              </div>
            </div>

            <div className="border-t border-white/20 pt-6">
              <p className="text-white/70 text-sm">
                Hanya untuk administrator terautorisasi. Pastikan kredensial Anda aman.
              </p>
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="text-white/60 text-sm">© {new Date().getFullYear()} Marga Kaya. All rights reserved.</p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="p-8">{children}</div>
          </div>
        </div>
      </div>

      {/* Mobile footer */}
      <div className="lg:hidden bg-[#2F6B4F] text-white p-4 text-center">
        <p className="text-sm">© {new Date().getFullYear()} Marga Kaya</p>
      </div>
    </div>
  );
}
