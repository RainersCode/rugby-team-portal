import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET endpoint for retrieving profile data
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('API: Profile error - No session', sessionError);
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('API: Profile error -', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    // Return with no-cache headers
    return NextResponse.json(
      { 
        profile,
        user: session.user,
        isAdmin: profile?.role === 'admin'
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
    console.error('API: Profile unexpected error -', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

// PUT endpoint for updating profile data
export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('API: Profile update error - No session', sessionError);
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    // Get the updated profile data from request body
    const updates = await request.json();
    
    // Validate the data (add more validation as needed)
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid update data' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    // Only allow certain fields to be updated
    const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'avatar_url', 'bio'];
    const sanitizedUpdates: any = {};
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    });
    
    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(sanitizedUpdates)
      .eq('id', session.user.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('API: Profile update error -', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    // Return the updated profile with no-cache headers
    return NextResponse.json(
      { 
        profile: updatedProfile,
        success: true 
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
    console.error('API: Profile update unexpected error -', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
} 