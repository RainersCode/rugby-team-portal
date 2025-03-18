import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Initialize Supabase client with cookies
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: 'Session error', message: sessionError.message }, 
        { status: 401 }
      );
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session' }, 
        { status: 401 }
      );
    }
    
    // Verify that the user has admin role
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('User role check error:', userError);
      return NextResponse.json(
        { error: 'Failed to verify user role', message: userError.message }, 
        { status: 500 }
      );
    }
    
    const isAdmin = userData?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'User is not an admin' }, 
        { status: 403 }
      );
    }
    
    // If we reach here, the user is authenticated and has admin role
    return NextResponse.json({ 
      status: 'active',
      user: {
        id: session.user.id,
        email: session.user.email,
        role: userData.role
      },
      sessionExpires: session.expires_at
    });
    
  } catch (error: any) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Session verification failed', message: error.message }, 
      { status: 500 }
    );
  }
}

// Also handle POST to refresh session if needed
export async function POST(request: Request) {
  try {
    // Initialize Supabase client with cookies
    const supabase = createRouteHandlerClient({ cookies });
    
    // Refresh the session
    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('Session refresh error:', refreshError);
      return NextResponse.json(
        { error: 'Session refresh error', message: refreshError.message }, 
        { status: 401 }
      );
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Failed to refresh session' }, 
        { status: 401 }
      );
    }
    
    // Verify that the user has admin role
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('User role check error:', userError);
      return NextResponse.json(
        { error: 'Failed to verify user role', message: userError.message }, 
        { status: 500 }
      );
    }
    
    const isAdmin = userData?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'User is not an admin' }, 
        { status: 403 }
      );
    }
    
    // If we reach here, the user is authenticated and has admin role
    return NextResponse.json({ 
      status: 'refreshed',
      user: {
        id: session.user.id,
        email: session.user.email,
        role: userData.role
      },
      sessionExpires: session.expires_at
    });
    
  } catch (error: any) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Session refresh failed', message: error.message }, 
      { status: 500 }
    );
  }
} 