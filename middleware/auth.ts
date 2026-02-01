// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Cek token/cookie autentikasi
  const token = request.cookies.get('auth-token')?.value;
  
  // List route publik yang bisa diakses tanpa login
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/about',
    '/contact'
  ];
  
  // Cek jika pathname diawali dengan /dashboard
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  // Cek jika pathname adalah route publik
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Logika autentikasi:
  // 1. Jika TIDAK ada token DAN BUKAN route publik -> redirect ke login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // 2. Jika ADA token DAN mengakses login/register -> redirect ke dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // 3. Jika ADA token DAN mengakses root (/) -> redirect ke dashboard
  if (token && pathname === '/') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // 4. Jika ADA token DAN mengakses dashboard route yang tidak ada -> redirect ke dashboard utama
  if (token && isDashboardRoute && !isValidDashboardRoute(pathname)) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return NextResponse.next();
}

// Helper function untuk validasi route dashboard yang valid
function isValidDashboardRoute(pathname: string): boolean {
  // Daftar route dashboard yang valid (sesuaikan dengan struktur app/dashboard)
  const validDashboardRoutes = [
    '/dashboard/analytics',
    '/dashboard/profile',
    '/dashboard/settings',
    '/dashboard/users',
    '/dashboard/reports',
    '/dashboard/api/'
  ];
  
  return validDashboardRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

// Konfigurasi matcher untuk semua route kecuali static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ (API routes)
     * 2. /_next/ (Next.js internals)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};