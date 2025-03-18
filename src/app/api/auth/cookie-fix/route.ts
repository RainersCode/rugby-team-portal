import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Initialize Supabase with server-side route handler
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Attempt to get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // Set proper cache control headers to prevent caching
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Cookie synchronization complete',
        hasSession: !!session,
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        } 
      }
    );
    
    // Set a simple test cookie to ensure cookies are working
    response.cookies.set('vercel-cookie-test', 'true', {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error in cookie-fix route:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to synchronize cookies',
        error: (error as Error).message
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        } 
      }
    );
  }
} 