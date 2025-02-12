import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated and is an admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's role from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, updated_at')
      .order('updated_at', { ascending: false });

    if (profilesError) {
      throw profilesError;
    }

    // Get user emails from auth.users using service role client
    const { data: authData, error: authError } = await supabase
      .rpc('get_user_emails', {
        user_ids: profiles.map(p => p.id)
      });

    if (authError) {
      throw authError;
    }

    // Create a map of user emails
    const emailMap = new Map(authData.map((u: any) => [u.id, u.email]));

    // Combine the data
    const users = profiles.map(profile => ({
      id: profile.id,
      email: emailMap.get(profile.id) || '',
      role: profile.role || 'user',
      name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || undefined,
      updated_at: profile.updated_at
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in users route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 