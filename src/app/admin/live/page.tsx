import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminLiveClient from './AdminLiveClient';

export const dynamic = 'force-dynamic';

export default async function AdminLivePage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Check if user is authenticated and is admin
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  // Fetch all live streams
  const { data: streams } = await supabase
    .from('live_streams')
    .select('*')
    .order('stream_date', { ascending: false });

  return (
    <div className="container-width py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Live Stream Management</h1>
      </div>
      <AdminLiveClient initialStreams={streams || []} />
    </div>
  );
} 