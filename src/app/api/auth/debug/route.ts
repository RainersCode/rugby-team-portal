import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// This route is for debugging auth issues only
// You may want to remove it in production

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get session info
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Get cookies for debug (redact sensitive info)
    const allCookies = cookieStore.getAll();
    const safeCookies = allCookies.map(cookie => ({
      name: cookie.name,
      path: cookie.path,
      // Don't expose actual values, just presence
      hasValue: !!cookie.value,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
    }));
    
    // Get app info
    const appInfo = {
      environment: process.env.NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      requestOrigin: requestUrl.origin,
      requestPathname: requestUrl.pathname,
      userAgent: request.headers.get('user-agent') || 'unknown',
    };
    
    return NextResponse.json(
      {
        authenticated: !!session,
        sessionError: sessionError ? { message: sessionError.message } : null,
        userId: session?.user?.id,
        authInfo: {
          aal: session?.user?.aal,
          amr: session?.user?.amr,
          provider: session?.user?.app_metadata?.provider,
        },
        cookiesInfo: {
          count: safeCookies.length,
          cookies: safeCookies,
        },
        appInfo,
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error: any) {
    console.error('Auth debug error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 