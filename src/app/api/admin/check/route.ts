import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// This is an alternate API for checking admin status that can be used 
// if the main verify-admin route has caching issues
export async function GET(request: Request) {
  try {
    const timestamp = Date.now();
    console.log(`AdminCheck API: Starting verification (t=${timestamp})`);
    
    // Get cookies for the Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.log('AdminCheck API: No valid session');
      return NextResponse.json(
        { isAdmin: false, timestamp, error: sessionError?.message || 'No session' },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'X-Timestamp': timestamp.toString()
          }
        }
      );
    }
    
    // Directly query the database for admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('AdminCheck API: Profile query error:', profileError);
      return NextResponse.json(
        { isAdmin: false, timestamp, error: profileError.message },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'X-Timestamp': timestamp.toString()
          }
        }
      );
    }
    
    const isAdmin = profile?.role === 'admin';
    console.log(`AdminCheck API: User ${session.user.id} is admin: ${isAdmin}`);
    
    return NextResponse.json(
      { 
        success: true,
        isAdmin,
        timestamp,
        userId: session.user.id,
        user: {
          email: session.user.email,
          firstName: profile?.first_name,
          lastName: profile?.last_name
        }
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'X-Timestamp': timestamp.toString()
        }
      }
    );
  } catch (error) {
    console.error('AdminCheck API: Unexpected error:', error);
    const timestamp = Date.now();
    return NextResponse.json(
      { isAdmin: false, timestamp, error: 'Server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'X-Timestamp': timestamp.toString()
        }
      }
    );
  }
} 