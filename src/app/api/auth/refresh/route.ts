import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('API: Auth refresh - No session', sessionError);
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
    
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('API: Auth refresh - Profile error', profileError);
    }
    
    // Check admin status
    const isAdmin = profile?.role === 'admin';
    
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
    console.error('API: Auth refresh - Unexpected error', error);
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