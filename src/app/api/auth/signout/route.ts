import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const AUTH_COOKIE_NAMES = [
  'supabase-auth-token',
  'sb-access-token',
  'sb-refresh-token',
  'sb-auth-token',
  '__session',
  'supabase-auth',
];

export async function POST() {
  try {
    console.log('API: Processing signout request');
    
    // Properly await cookies() before using it
    const cookieStore = cookies();
    
    // Create a Supabase client with the awaited cookie store
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Force signout with additional options
    const { error } = await supabase.auth.signOut({ 
      scope: 'global' // Sign out from all devices
    });
    
    if (error) {
      console.error('API: Error during sign out:', error);
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
          'Surrogate-Control': 'no-store',
          'Clear-Site-Data': '"cookies", "storage"'
        }
      }
    );
    
    // Clear all cookies with brute force approach
    const allCookies = cookieStore.getAll();
    console.log('API: Found cookies to clear:', allCookies.length);
    
    // First remove all known auth cookies explicitly
    AUTH_COOKIE_NAMES.forEach(name => {
      response.cookies.delete({
        name,
        path: '/',
      });
      // Also try variations
      response.cookies.delete({
        name: name.toLowerCase(),
        path: '/',
      });
    });
    
    // Then clear all cookies that might be related to auth
    allCookies.forEach(cookie => {
      const name = cookie.name;
      
      // Clear anything that looks authentication related
      if (name.includes('supabase') || 
          name.includes('auth') || 
          name.includes('token') || 
          name.includes('session')) {
        console.log('API: Clearing cookie:', name);
        response.cookies.delete({
          name,
          path: '/',
        });
      }
    });
    
    return response;
  } catch (error) {
    console.error('API: Unexpected error during sign out:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'Clear-Site-Data': '"cookies", "storage"'
        }
      }
    );
  }
} 