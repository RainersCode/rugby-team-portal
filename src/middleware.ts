import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only intercept routes that need authentication
export const config = {
  matcher: [
    '/members/:path*', 
    '/profile/:path*', 
    '/settings/:path*', 
    '/admin/:path*', 
    '/auth/:path*',
    // Completely exclude API routes from middleware to prevent Chrome compatibility issues
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request: NextRequest) {
  console.log('Middleware: Processing route:', request.nextUrl.pathname);
  
  // Set up enhanced response with critical headers for all browsers
  const res = NextResponse.next();
  
  // Critical headers for all responses to prevent caching issues
  res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  res.headers.set('Vary', '*');
  
  // Handle static assets differently
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|webp|gif|css|js|woff|woff2|ttf|svg)$/)) {
    // Allow caching for performance
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res;
  }
  
  // Skip auth check for API routes entirely
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('Middleware: API route, bypassing auth check');
    return res;
  }
  
  try {
    const supabase = createMiddlewareClient({ req: request, res });
    
    // Get session with increased timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session fetch timeout')), 8000);
    });
    
    let session;
    try {
      // Define the session response type more specifically
      interface SessionResponse {
        data: {
          session: {
            user: {
              id: string;
              email?: string;
            };
          } | null;
        };
      }
      
      const { data } = await Promise.race([
        sessionPromise, 
        timeoutPromise
      ]) as SessionResponse;
      
      session = data.session;
    } catch (error) {
      console.error('Middleware: Session fetch error:', error);
      // For specific routes, redirect to login
      if (['/members', '/profile', '/settings', '/admin'].some(path => 
        request.nextUrl.pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      // For other routes, allow access
      return res;
    }
    
    // Handle protected routes
    if (['/members', '/profile', '/settings'].some(path => 
      request.nextUrl.pathname.startsWith(path))) {
      if (!session) {
        console.log('Middleware: No session for protected route, redirecting to login');
        const redirectUrl = request.nextUrl.pathname;
        const encodedRedirectUrl = encodeURIComponent(redirectUrl);
        return NextResponse.redirect(new URL(`/auth/signin?redirect=${encodedRedirectUrl}`, request.url));
      }
    }
    
    // Special handling for admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // For admin routes, let the page component handle admin validation
      // This prevents issues with middleware timeouts and Chrome compatibility
      if (!session) {
        console.log('Middleware: No session for admin route, redirecting to login');
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      
      // Let the page handle admin validation
      console.log('Middleware: User authenticated for admin route, letting page handle validation');
      return res;
    }
    
    // Redirect signed-in users away from auth pages
    if (session && request.nextUrl.pathname.startsWith('/auth/')) {
      console.log('Middleware: Redirecting authenticated user from auth page');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return res;
  } catch (error) {
    console.error('Middleware: Unexpected error:', error);
    
    // For protected routes, redirect to login on error
    if (['/members', '/profile', '/settings', '/admin'].some(path => 
      request.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    // For other routes, allow access
    return res;
  }
} 