import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Properly await cookies() before using it
    const cookieStore = cookies();
    
    // Create a Supabase client with the awaited cookie store
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Sign out the user
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error during sign out:', error);
      return NextResponse.json(
        { error: error.message },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          }
        }
      );
    }
    
    // Create a response with success message
    const response = NextResponse.json(
      { success: true },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
    
    // Try to clear any auth cookies manually
    cookieStore.getAll().forEach(cookie => {
      if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        response.cookies.delete(cookie.name);
      }
    });
    
    return response;
  } catch (error) {
    console.error('Unexpected error during sign out:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  }
} 