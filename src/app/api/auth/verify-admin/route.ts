import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('API: Verifying admin status');
    
    // Get cookies for the Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // First get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('API: Error getting session:', sessionError);
      return NextResponse.json(
        { error: 'Authentication error', isAdmin: false },
        { status: 401 }
      );
    }
    
    if (!session || !session.user) {
      console.log('API: No authenticated user');
      return NextResponse.json(
        { error: 'Not authenticated', isAdmin: false },
        { status: 401 }
      );
    }
    
    // Get the user's profile to check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('API: Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Profile fetch error', isAdmin: false },
        { status: 500 }
      );
    }
    
    const isAdmin = profile?.role === 'admin';
    console.log(`API: User ${session.user.id} admin status:`, isAdmin);
    
    // Cache control to prevent stale admin status
    return NextResponse.json(
      { isAdmin, userId: session.user.id },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, private, max-age=0',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error) {
    console.error('API: Unexpected error in admin verification:', error);
    return NextResponse.json(
      { error: 'Server error', isAdmin: false },
      { status: 500 }
    );
  }
} 