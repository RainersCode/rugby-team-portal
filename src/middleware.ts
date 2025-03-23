import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only intercept routes that need authentication
export const config = {
  matcher: [
    // Protected routes
    '/members/:path*', 
    '/profile/:path*', 
    '/settings/:path*', 
    '/admin/:path*', // Explicitly add admin routes
    // Authentication pages
    '/auth/:path*',
    // Exclude api, and static resources
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request: NextRequest) {
  console.log('Middleware: Processing route:', request.nextUrl.pathname);
  
  // Set up enhanced response with critical headers
  const res = NextResponse.next();
  
  // Critical headers for all responses
  res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  
  // Handle static assets differently
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|webp|gif|css|js|woff|woff2|ttf|svg)$/)) {
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res;
  }
  
  try {
    const supabase = createMiddlewareClient({ req: request, res });
    
    // Special handling for admin dashboard route specifically
    if (request.nextUrl.pathname === '/admin') {
      // We'll be more lenient with the main admin route and let client-side handle verification
      // This helps work around potential database issues
      console.log('Middleware: Admin dashboard route, skipping strict verification');
      
      try {
        // Just check if there's any session
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          console.log('Middleware: No session for admin dashboard, redirecting to login');
          return NextResponse.redirect(new URL('/auth/signin?redirect=/admin', request.url));
        }
        // Let the client-side handle admin verification
        return res;
      } catch (sessionError) {
        console.error('Middleware: Session error for admin dashboard:', sessionError);
        // Still let the request through if there's an error - client will handle it
        return res;
      }
    }
    
    // Regular auth flow for other routes
    
    // Get session with increased timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session fetch timeout')), 10000); // Increase timeout
    });
    
    let session;
    try {
      // Define the session response type
      interface SessionResponse {
        data: {
          session: {
            user: {
              id: string;
              email?: string;
              user_metadata?: {
                [key: string]: any;
              };
            };
          } | null;
        };
      }
      
      const { data } = await Promise.race([
        sessionPromise, 
        timeoutPromise
      ]) as SessionResponse;
      
      session = data.session;
      
      // Check if we're accessing admin routes (except main dashboard)
      if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin') {
        // If no session, redirect to login
        if (!session) {
          console.log('Middleware: No session for admin route, redirecting to login');
          const redirectUrl = request.nextUrl.pathname;
          const encodedRedirectUrl = encodeURIComponent(redirectUrl);
          return NextResponse.redirect(new URL(`/auth/signin?redirect=${encodedRedirectUrl}`, request.url));
        }
        
        // Check admin status by querying database directly
        if (session.user) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            // Only allow if the user is an admin
            if (error || profile?.role !== 'admin') {
              console.log('Middleware: User is not admin, redirecting to home');
              return NextResponse.redirect(new URL('/', request.url));
            }
            
            console.log('Middleware: Admin status verified, proceeding');
          } catch (adminError) {
            console.error('Middleware: Error checking admin status:', adminError);
            // More lenient approach - let client handle verification if there's an error
            return res;
          }
        }
      }
    } catch (error) {
      console.error('Middleware: Session fetch error:', error);
      
      // Special handling for admin dashboard errors
      if (request.nextUrl.pathname === '/admin') {
        console.log('Middleware: Error for admin dashboard, letting client handle');
        return res;
      }
      
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
    
    // Redirect signed-in users away from auth pages
    if (session && request.nextUrl.pathname.startsWith('/auth/')) {
      console.log('Middleware: Redirecting authenticated user from auth page');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return res;
  } catch (error) {
    console.error('Middleware: Unexpected error:', error);
    
    // Special handling for admin dashboard errors
    if (request.nextUrl.pathname === '/admin') {
      console.log('Middleware: Major error for admin dashboard, letting client handle');
      return res;
    }
    
    // For protected routes, redirect to login on error
    if (['/members', '/profile', '/settings', '/admin'].some(path => 
      request.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    // For other routes, allow access
    return res;
  }
} 