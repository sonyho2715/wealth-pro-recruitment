import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection
 * Redirects unauthenticated users to login page for protected routes
 *
 * Note: Full session validation happens in the routes themselves.
 * This middleware provides a first-pass check for the session cookie.
 */

// Routes that require authentication
const protectedRoutes = [
  '/agent/dashboard',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/agent/login',
  '/agent/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('wealth_pro_session');
  const hasSession = !!sessionCookie?.value;

  // Check if accessing protected route without session
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/agent/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes with valid session
  const isAuthRoute = authRoutes.some(route => pathname === route);
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/agent/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected and auth routes
    '/agent/dashboard/:path*',
    '/agent/login',
    '/agent/register',
  ],
};
