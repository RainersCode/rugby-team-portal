import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// This route is for debugging auth issues only
// You may want to remove it in production

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Properly await cookies() before using it
    const cookieStore = cookies();
    
    // Create a Supabase client with the awaited cookie store
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError.message);
      return NextResponse.json({ 
        status: 'error',
        sessionError: sessionError.message,
        cookies: [...cookieStore.getAll()].map(c => ({ name: c.name, value: '***' }))
      });
    }

    if (!session) {
      // No session exists
      return NextResponse.json({ 
        status: 'no-session',
        cookies: [...cookieStore.getAll()].map(c => ({ name: c.name, value: '***' }))
      });
    }

    // Also check user profile if session exists
    let profileData = null;
    let profileError = null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      profileData = data;
      profileError = error;
    } catch (err) {
      profileError = err;
    }

    // Return the debug info
    return NextResponse.json({
      status: 'authenticated',
      session: {
        expires_at: session.expires_at,
        user_id: session.user.id,
        email: session.user.email,
      },
      profile: profileData ? {
        id: profileData.id,
        role: profileData.role,
        // Include other non-sensitive fields
      } : null,
      profileError: profileError ? String(profileError) : null,
      cookies: [...cookieStore.getAll()].map(c => ({ name: c.name, value: '***' }))
    });
  } catch (error) {
    console.error('Unexpected error during debug:', error);
    // Get cookies safely
    const safeStore = cookies();
    return NextResponse.json({ 
      status: 'error',
      error: String(error),
      cookies: [...safeStore.getAll()].map(c => ({ name: c.name, value: '***' }))
    });
  }
} 