import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/members/:path*', '/profile/:path*', '/settings/:path*', '/admin/:path*', '/auth/:path*'],
};

export async function middleware(request: NextRequest) {
  console.log('Middleware: Processing route:', request.nextUrl.pathname);
  
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Add caching headers for static assets
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|webp|gif|css|js)$/)) {
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res;
  }

  // Add caching headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res;
  }

  // Refresh session if expired
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Middleware: Session error:', sessionError);
    // Redirect to login if there's a session error on protected routes
    if (['/members', '/profile', '/settings', '/admin'].some(path => request.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    return res;
  }

  // Protected routes that require authentication
  if (['/members', '/profile', '/settings', '/admin'].some(path => request.nextUrl.pathname.startsWith(path))) {
    if (!session) {
      console.log('Middleware: No session for protected route, redirecting to login');
      const redirectUrl = request.nextUrl.pathname;
      const encodedRedirectUrl = encodeURIComponent(redirectUrl);
      return NextResponse.redirect(new URL(`/auth/signin?redirect=${encodedRedirectUrl}`, request.url));
    }

    console.log('Middleware: User authenticated:', session.user.id);

    // Additional check for admin route
    if (request.nextUrl.pathname.startsWith('/admin')) {
      console.log('Middleware: Checking admin status for:', session.user.id);
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Middleware: Error fetching profile:', profileError);
          return NextResponse.redirect(new URL('/', request.url));
        }

        const isAdmin = profile?.role === 'admin';
        console.log('Middleware: Admin status:', isAdmin);

        if (!isAdmin) {
          console.log('Middleware: User is not admin, redirecting home');
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (error) {
        console.error('Middleware: Error checking admin status:', error);
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Redirect signed-in users away from auth pages
  if (session && request.nextUrl.pathname.startsWith('/auth/')) {
    console.log('Middleware: Redirecting authenticated user from auth page');
    return NextResponse.redirect(new URL('/', request.url));
  }

  return res;
} 