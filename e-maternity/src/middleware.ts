// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their allowed roles
const roleBasedRoutes = {
  '/dashboard/mother': ['MOTHER'],
  '/dashboard/doctor': ['DOCTOR'],
  '/dashboard/midwife': ['MIDWIFE'],
  '/dashboard/phi': ['PHI'],
  '/dashboard/admin': ['ADMIN'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify-otp') ||
    pathname.startsWith('/forgot-password') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Check authentication
  const token = request.cookies.get('next-auth.session-token');
  
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
