import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET endpoint for retrieving user settings
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('API: Settings error - No session', sessionError);
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
      console.error('API: Settings error -', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    // Return with no-cache headers
    return NextResponse.json(
      { 
        profile,
        user: session.user
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
    console.error('API: Settings unexpected error -', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

// POST endpoint for updating user settings
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('API: Settings update error - No session', sessionError);
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    // Get the updated settings from request body
    const updates = await request.json();
    
    // Validate the data (add more validation as needed)
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid update data' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    // Process the update - handling both profile and auth updates
    const profileFields = ['first_name', 'last_name', 'phone', 'bio', 'avatar_url', 'preferences'];
    const profileUpdates: Record<string, any> = {};
    
    // Extract profile fields
    profileFields.forEach(field => {
      if (updates[field] !== undefined) {
        profileUpdates[field] = updates[field];
      }
    });
    
    // Update profile if there are profile fields to update
    if (Object.keys(profileUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', session.user.id);
        
      if (updateError) {
        console.error('API: Settings update error -', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }
    
    // Update email if provided
    let emailUpdated = false;
    if (updates.email && updates.email !== session.user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: updates.email
      });
      
      if (emailError) {
        console.error('API: Email update error -', emailError);
        return NextResponse.json(
          { error: 'Failed to update email' },
          { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      
      emailUpdated = true;
    }
    
    // Update password if provided
    let passwordUpdated = false;
    if (updates.password && updates.current_password) {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: updates.current_password
      });
      
      if (signInError) {
        console.error('API: Current password verification failed -', signInError);
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      
      // Then update the password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: updates.password
      });
      
      if (passwordError) {
        console.error('API: Password update error -', passwordError);
        return NextResponse.json(
          { error: 'Failed to update password' },
          { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      
      passwordUpdated = true;
    }
    
    // Get updated profile
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    // Return the updated profile with no-cache headers
    return NextResponse.json(
      { 
        success: true,
        profile: updatedProfile,
        emailUpdated,
        passwordUpdated
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
    console.error('API: Settings update unexpected error -', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
} 