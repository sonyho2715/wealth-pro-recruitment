import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection and agent subdomain/path routing
 *
 * Handles:
 * 1. Protected route authentication
 * 2. Agent subdomain routing (sony.wealthprohi.com → /[agent])
 * 3. Agent path routing (/sony → /[agent])
 */

// Routes that require authentication
const protectedRoutes = [
  '/agent/dashboard',
];

// System routes that should NOT be treated as agent codes
const systemRoutes = [
  'agent',
  'api',
  'prospect',
  'present',
  'invite',
  'sign',
  'signup',
  'pricing',
  'career',
  'tools',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
];

// Known subdomains that are not agent codes
const systemSubdomains = ['www', 'app', 'api', 'admin'];

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  const sessionCookie = request.cookies.get('wealth_pro_session');
  const hasSession = !!sessionCookie?.value;

  // ============================================
  // SUBDOMAIN ROUTING (sony.wealthprohi.com)
  // ============================================
  const hostParts = hostname.split('.');

  // Check if this is a subdomain (e.g., sony.wealthprohi.com)
  // Exclude www, localhost, and vercel preview URLs
  if (
    hostParts.length >= 3 &&
    !systemSubdomains.includes(hostParts[0]) &&
    !hostname.includes('localhost') &&
    !hostname.includes('vercel.app')
  ) {
    const agentCode = hostParts[0];

    // Rewrite to the agent's balance sheet page
    // sony.wealthprohi.com → /b/sony
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone();
      url.pathname = `/b/${agentCode}`;
      return NextResponse.rewrite(url);
    }

    // sony.wealthprohi.com/results → /b/sony/results
    if (pathname === '/results') {
      const url = request.nextUrl.clone();
      url.pathname = `/b/${agentCode}/results`;
      return NextResponse.rewrite(url);
    }
  }

  // ============================================
  // PATH-BASED ROUTING (/sony → /b/sony)
  // ============================================
  // Check if the first path segment could be an agent code
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length >= 1) {
    const potentialAgentCode = pathSegments[0].toLowerCase();

    // If it's not a system route, treat it as an agent code
    if (!systemRoutes.includes(potentialAgentCode)) {
      const url = request.nextUrl.clone();

      // /sony → /b/sony
      if (pathSegments.length === 1) {
        url.pathname = `/b/${potentialAgentCode}`;
        return NextResponse.rewrite(url);
      }

      // /sony/results → /b/sony/results
      if (pathSegments.length === 2 && pathSegments[1] === 'results') {
        url.pathname = `/b/${potentialAgentCode}/results`;
        return NextResponse.rewrite(url);
      }
    }
  }

  // ============================================
  // PROTECTED ROUTE CHECK
  // ============================================
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/agent/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
