import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log('API: Auth refresh - Request received');
    
    const requestUrl = new URL(request.url);
    console.log('API: Auth refresh - Request URL:', requestUrl.toString());
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('API: Auth refresh - Session error:', sessionError);
    }
    
    if (!session) {
      console.error('API: Auth refresh - No session');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { 
          status: 401, 
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          } 
        }
      );
    }
    
    console.log('API: Auth refresh - Session found for user:', session.user.id);
    
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('API: Auth refresh - Profile error:', profileError);
    } else {
      console.log('API: Auth refresh - Profile found with role:', profile?.role);
    }
    
    // Check admin status
    const isAdmin = profile?.role === 'admin';
    console.log('API: Auth refresh - Admin status:', isAdmin);
    
    // Return with no-cache headers
    return NextResponse.json(
      { 
        user: {
          ...session.user,
          profile: profile || null
        },
        session,
        isAdmin
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
  } catch (error) {
    console.error('API: Auth refresh - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500, 
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } 
      }
    );
  }
} 