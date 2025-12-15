import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Admin pages - only admins can access
  if (pathname.startsWith('/admin')) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // User-facing pages - admins get redirected to admin dashboard
  const userPages = ['/products', '/cart', '/checkout', '/orders', '/account'];
  if (userPages.some(page => pathname.startsWith(page))) {
    if (token && token.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Home page for admins - redirect to admin dashboard
  if (pathname === '/' && token && token.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/products/:path*', '/cart/:path*', '/checkout/:path*', '/orders/:path*', '/account/:path*', '/'],
};
