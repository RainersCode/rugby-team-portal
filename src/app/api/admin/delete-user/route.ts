import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check if the requester is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: adminCheck } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminCheck || adminCheck.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First check if user exists and is not the last admin
    const { data: userToDelete } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (userToDelete.role === 'admin') {
      // Check if this is the last admin
      const { data: adminCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'admin');

      if (adminCount && adminCount.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        );
      }
    }

    // Delete the user's profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      throw profileError;
    }

    // Then delete from auth.users if we have access
    const { error: authError } = await supabase.rpc('delete_user', { user_id: userId });
    if (authError) {
      console.error('Error deleting from auth.users:', authError);
      // Don't throw here as the profile is already deleted
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
} 
