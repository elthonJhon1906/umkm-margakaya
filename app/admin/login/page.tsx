'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Lock, Home, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    
    // Validasi input
    if (!username.trim() || !password.trim()) {
      setError('Username dan password harus diisi');
      return;
    }

    const result = await login(username, password);
    
    
    if (result.success) {
      setDebugInfo('✅ Login berhasil, mengarahkan ke dashboard...');
      router.push('/admin/dashboard');
    } else {
      setError(result.error || 'Username atau password salah');
      setPassword('');
      
      // Tampilkan debug info di development
      if (process.env.NODE_ENV === 'development') {
        setDebugInfo(`Debug: ${result.error}`);
      }
    }
  };

  const handleTestConnection = async () => {
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      alert(`Connection test: ${data.connected ? 'SUCCESS' : 'FAILED'}\n${data.message}`);
    } catch (error) {
      alert('Connection test failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 1">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#DFDAD0]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2F6B4F]/10 rounded-full mb-4">
            <User className="w-8 h-8 text-[#2F6B4F]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2F6B4F] mb-2">
            UMKM Desa Marga Kaya
          </h1>
          <p className="text-[#8B7B6F] text-sm">Admin Panel Login</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#5D5D5D] font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-[#DFDAD0] focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-[#5D5D5D] h-11"
              disabled={isLoading}
              required
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#5D5D5D] font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#DFDAD0] focus:border-[#2F6B4F] focus:ring-[#2F6B4F] text-[#5D5D5D] h-11"
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-in fade-in">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                  <p className="text-red-500 text-xs mt-1">
                    Username / Password salah.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/90 font-semibold h-11 text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !username.trim() || !password.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6 pt-6 border-t border-[#DFDAD0]">
          <a
            href="/"
            className="inline-flex items-center text-[#8B7B6F] hover:text-[#2F6B4F] text-sm transition-colors group"
          >
            <Home className="w-4 h-4 mr-2 group-hover:translate-x-[-2px] transition-transform" />
            ← Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}