import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminActivitiesClient from './AdminActivitiesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminActivitiesPage() {
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

  // First, fetch activities with participant counts
  const { data: activities, error } = await supabase
    .from('activities')
    .select(`
      *,
      participants:activity_participants(count)
    `)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching activities:', error);
    return null;
  }

  // Then, for each activity, fetch participant details
  const activitiesWithParticipants = await Promise.all(
    activities?.map(async (activity) => {
      const { data: participants } = await supabase
        .from('activity_participants')
        .select(`
          user_id,
          user:profiles(
            id,
            email,
            full_name
          )
        `)
        .eq('activity_id', activity.id);

      return {
        ...activity,
        participant_count: activity.participants?.[0]?.count || 0,
        participant_details: participants?.map(p => p.user) || []
      };
    }) || []
  );

  return <AdminActivitiesClient activities={activitiesWithParticipants} />;
} 