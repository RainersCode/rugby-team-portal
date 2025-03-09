import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError.message);
      return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
    }

    if (!session) {
      // No session exists, return a 401
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Refresh the session
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
      console.error('Error refreshing session:', refreshError.message);
      return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 });
    }

    // Get user's admin status from profiles table
    let isAdmin = false;
    if (refreshedSession?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', refreshedSession.user.id)
        .single();
        
      if (!profileError && profile) {
        isAdmin = profile.role === 'admin';
      }
    }

    // Return the session data with admin status
    return NextResponse.json({
      session: refreshedSession,
      user: refreshedSession?.user || null,
      isAdmin
    });
  } catch (error) {
    console.error('Unexpected error during refresh:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 