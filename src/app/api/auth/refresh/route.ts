import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('API: Refreshing auth session');
    
    // Properly await cookies() before using it
    const cookieStore = cookies();
    
    // Create a Supabase client with the awaited cookie store
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('API: Session error:', sessionError.message);
      return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
    }

    if (!session) {
      console.log('API: No session found');
      // No session exists, return a 401
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('API: Current session found for user:', session.user.id);

    // Refresh the session
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
      console.error('API: Error refreshing session:', refreshError.message);
      return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 });
    }

    if (!refreshedSession) {
      console.log('API: No refreshed session found');
      return NextResponse.json({ error: 'Failed to refresh session' }, { status: 401 });
    }

    console.log('API: Session refreshed for user:', refreshedSession.user.id);

    // Get user's admin status from profiles table
    let isAdmin = false;
    let profileData = null;
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', refreshedSession.user.id)
        .single();
        
      if (profileError) {
        console.error('API: Error fetching user profile:', profileError);
      } else if (profile) {
        console.log('API: Profile found:', profile.id, 'role:', profile.role);
        isAdmin = profile.role === 'admin';
        profileData = profile;
      } else {
        console.log('API: No profile found for user:', refreshedSession.user.id);
      }
    } catch (error) {
      console.error('API: Error checking admin status:', error);
    }

    // Return the session data with admin status and user profile data
    return NextResponse.json({
      session: refreshedSession,
      user: {
        ...refreshedSession.user,
        profile: profileData
      },
      isAdmin
    });
  } catch (error) {
    console.error('API: Unexpected error during refresh:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 