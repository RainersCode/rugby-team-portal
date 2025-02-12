import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/members/:path*', '/profile/:path*', '/settings/:path*', '/admin/:path*', '/auth/:path*'],
};

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Add caching headers for static assets
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|webp|gif|css|js)$/)) {
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Add caching headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes that require authentication
  if (['/members', '/profile', '/settings', '/admin'].some(path => request.nextUrl.pathname.startsWith(path))) {
    if (!session) {
      const redirectUrl = request.nextUrl.pathname;
      const encodedRedirectUrl = encodeURIComponent(redirectUrl);
      return NextResponse.redirect(new URL(`/auth/signin?redirect=${encodedRedirectUrl}`, request.url));
    }

    // Additional check for admin route
    if (request.nextUrl.pathname.startsWith('/admin')) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!profile || profile.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Redirect signed-in users away from auth pages
  if (session && request.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return res;
} 