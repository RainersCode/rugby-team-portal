import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/members/:path*', '/profile/:path*', '/settings/:path*', '/admin/:path*', '/auth/:path*'],
};

export async function middleware(request: NextRequest) {
  console.log('Middleware: Processing route:', request.nextUrl.pathname);
  
  const res = NextResponse.next();
  
  // Identify browser for debugging
  const userAgent = request.headers.get('user-agent') || '';
  const isChrome = userAgent.includes('Chrome');
  const isSafari = userAgent.includes('Safari') && !isChrome; // Chrome also includes Safari in UA
  
  console.log(`Middleware: Browser detected - Chrome: ${isChrome}, Safari: ${isSafari}`);
  
  // Create client with appropriate timeout based on browser
  const supabase = createMiddlewareClient({ 
    req: request, 
    res 
  });

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

  // Longer timeout for Chrome browsers which may need it
  const sessionTimeout = isChrome ? 5000 : 3000;
  const profileTimeout = isChrome ? 5000 : 3000;

  // Refresh session if expired - with timeout
  try {
    // Add browser compatibility header for Chrome
    if (isChrome) {
      res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.headers.set('Pragma', 'no-cache');
      res.headers.set('Expires', '0');
    }
    
    const sessionPromise = supabase.auth.getSession();
    
    // Add a timeout to the session fetch to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session fetch timeout')), sessionTimeout);
    });
    
    const { data: { session } } = await Promise.race([
      sessionPromise,
      timeoutPromise as Promise<never>
    ]) as { data: { session: any } };
    
    // Protected routes that require authentication
    if (['/members', '/profile', '/settings'].some(path => request.nextUrl.pathname.startsWith(path))) {
      if (!session) {
        console.log('Middleware: No session for protected route, redirecting to login');
        const redirectUrl = request.nextUrl.pathname;
        const encodedRedirectUrl = encodeURIComponent(redirectUrl);
        return NextResponse.redirect(new URL(`/auth/signin?redirect=${encodedRedirectUrl}`, request.url));
      }
    }
    
    // Special handling for admin routes - more efficient check
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!session) {
        console.log('Middleware: No session for admin route, redirecting to login');
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      
      console.log('Middleware: Checking admin status for:', session.user.id);
      
      try {
        // Use a more efficient query with a timeout
        const profilePromise = supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        const profileTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile fetch timeout')), profileTimeout);
        });
        
        const { data: profile } = await Promise.race([
          profilePromise, 
          profileTimeoutPromise as Promise<never>
        ]) as { data: { role: string } };

        const isAdmin = profile?.role === 'admin';
        console.log('Middleware: Admin status:', isAdmin);

        if (!isAdmin) {
          console.log('Middleware: User is not admin, redirecting home');
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (error: any) {
        console.error('Middleware: Error checking admin status:', error);
        // For admin routes, if we can't determine admin status within timeout,
        // let them proceed and let the page component handle the validation
        if (isChrome || (error.message && error.message.includes('timeout'))) {
          console.log('Middleware: Admin check timed out, letting page component handle validation');
          return res;
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Redirect signed-in users away from auth pages
    if (session && request.nextUrl.pathname.startsWith('/auth/')) {
      console.log('Middleware: Redirecting authenticated user from auth page');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return res;
  } catch (error: any) {
    console.error('Middleware error:', error);
    
    // If there's a timeout on session check for admin routes on Chrome,
    // let the page component handle the validation
    if ((isChrome || (error.message && error.message.includes('timeout'))) && request.nextUrl.pathname.startsWith('/admin')) {
      console.log('Middleware: Session check timed out for admin route, proceeding to page');
      return res;
    }
    
    // For other protected routes, redirect to login on timeout
    if (['/members', '/profile', '/settings', '/admin'].some(path => 
      request.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    return res;
  }
} 