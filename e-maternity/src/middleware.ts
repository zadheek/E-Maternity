// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cache static paths regex for better performance
const STATIC_PATHS = /^\/(_next|api|favicon\.ico|.*\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (STATIC_PATHS.test(pathname)) {
    return NextResponse.next();
  }

  // Protected routes
  const protectedPaths = ['/dashboard', '/mother', '/doctor', '/midwife', '/phi', '/admin'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedRoute) {
    const token = request.cookies.get('next-auth.session-token') || 
                  request.cookies.get('__Secure-next-auth.session-token');
    
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
