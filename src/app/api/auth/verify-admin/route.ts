import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const timestamp = url.searchParams.get('t') || Date.now().toString();
    console.log(`API: Verifying admin status (t=${timestamp})`);
    
    // Get cookies for the Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // First get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('API: Error getting session:', sessionError);
      return NextResponse.json(
        { error: 'Authentication error', isAdmin: false, timestamp },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'X-Timestamp': timestamp
          }
        }
      );
    }
    
    if (!session || !session.user) {
      console.log('API: No authenticated user');
      return NextResponse.json(
        { error: 'Not authenticated', isAdmin: false, timestamp },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'X-Timestamp': timestamp
          }
        }
      );
    }
    
    // Log the user details we found
    console.log(`API: Found user session for ${session.user.email || session.user.id}`);
    
    // Get the user's profile to check admin status - force a direct DB query each time
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('API: Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Profile fetch error', isAdmin: false, timestamp },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'X-Timestamp': timestamp
          }
        }
      );
    }
    
    const isAdmin = profile?.role === 'admin';
    console.log(`API: User ${session.user.id} (${profile?.first_name || 'Unknown'} ${profile?.last_name || 'User'}) admin status:`, isAdmin);
    
    // Cache control to prevent stale admin status
    return NextResponse.json(
      { 
        isAdmin, 
        userId: session.user.id,
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown',
        timestamp
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'X-Timestamp': timestamp
        }
      }
    );
  } catch (error) {
    console.error('API: Unexpected error in admin verification:', error);
    const timestamp = Date.now().toString();
    return NextResponse.json(
      { error: 'Server error', isAdmin: false, timestamp },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'X-Timestamp': timestamp
        }
      }
    );
  }
} 