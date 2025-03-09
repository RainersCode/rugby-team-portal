import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/members/:path*', '/profile/:path*', '/settings/:path*', '/admin/:path*', '/auth/:path*', '/api/profile'],
};

export async function middleware(request: NextRequest) {
  console.log('Middleware: Processing route:', request.nextUrl.pathname);
  
  const res = NextResponse.next();
  
  // Identify browser for debugging
  const userAgent = request.headers.get('user-agent') || '';
  const isChrome = userAgent.includes('Chrome');
  const isSafari = userAgent.includes('Safari') && !isChrome; // Chrome also includes Safari in UA
  
  console.log(`Middleware: Browser detected - Chrome: ${isChrome}, Safari: ${isSafari}`);
  
  // Special handling for Chrome profile API
  if (isChrome && request.nextUrl.pathname === '/api/profile') {
    console.log('Middleware: Chrome profile API request, skipping auth check');
    return res;
  }
  
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
    // No caching for API routes
    res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    // Allow API calls to proceed without auth for some endpoints
    if (request.nextUrl.pathname === '/api/profile') {
      return res;
    }
  }

  // Longer timeout for Chrome browsers which may need it
  const sessionTimeout = isChrome ? 8000 : 3000; // Longer timeout for Chrome
  const profileTimeout = isChrome ? 8000 : 3000; // Longer timeout for Chrome

  // Refresh session if expired - with timeout
  try {
    // Add browser compatibility header for Chrome - IMPORTANT for auth state consistency
    if (isChrome) {
      // These headers prevent Chrome from caching authentication state
      res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.headers.set('Pragma', 'no-cache');
      res.headers.set('Expires', '0');
      // Add a strict transport security header
      res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      // Prevent browser from using cached version of authentication state
      res.headers.set('Vary', '*');
    }
    
    const sessionPromise = supabase.auth.getSession();
    
    // Add a timeout to the session fetch to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session fetch timeout')), sessionTimeout);
    });
    
    // Define a proper type for session data
    interface SessionData {
      data: {
        session: {
          user: {
            id: string;
            email?: string;
          };
        } | null;
      };
    }
    
    const { data: { session } } = await Promise.race([
      sessionPromise,
      timeoutPromise as Promise<never>
    ]) as SessionData;
    
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
      
      // For Chrome browsers, we'll be more lenient to avoid timeouts
      if (isChrome) {
        console.log('Middleware: Chrome detected, using optimized admin check');
        try {
          // Use a direct API call for Chrome
          const apiUrl = new URL('/api/profile', request.url);
          const response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
              'Cookie': request.headers.get('cookie') || '',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.profile?.role === 'admin') {
              console.log('Middleware: Admin status confirmed via API');
              return res;
            } else {
              console.log('Middleware: Not admin via API, redirecting');
              return NextResponse.redirect(new URL('/', request.url));
            }
          } else {
            // If API fails, fall back to database check
            console.log('Middleware: API check failed, falling back to DB check');
          }
        } catch (error) {
          console.error('Middleware: Error in Chrome-specific admin check:', error);
          // Fall through to standard check
        }
      }
      
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
        
        interface ProfileData {
          data: {
            role: string;
          };
        }
        
        const { data: profile } = await Promise.race([
          profilePromise, 
          profileTimeoutPromise as Promise<never>
        ]) as ProfileData;

        const isAdmin = profile?.role === 'admin';
        console.log('Middleware: Admin status:', isAdmin);

        if (!isAdmin) {
          console.log('Middleware: User is not admin, redirecting home');
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (error: unknown) {
        console.error('Middleware: Error checking admin status:', error);
        // For admin routes, if we can't determine admin status within timeout,
        // let them proceed and let the page component handle the validation
        if (isChrome || (error instanceof Error && error.message.includes('timeout'))) {
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
  } catch (error: unknown) {
    console.error('Middleware error:', error);
    
    // If there's a timeout on session check for admin routes on Chrome,
    // let the page component handle the validation
    if ((isChrome || (error instanceof Error && error.message.includes('timeout'))) && request.nextUrl.pathname.startsWith('/admin')) {
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