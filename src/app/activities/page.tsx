import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ActivitiesClient from './ActivitiesClient';

export const dynamic = 'force-dynamic';

export default async function ActivitiesPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();

  // Get user role if logged in
  let isAdmin = false;
  if (session?.user.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    isAdmin = profile?.role === 'admin';
  }

  // Fetch activities with participant counts and user participation status
  const { data: activities } = await supabase
    .from('activities')
    .select(`
      *,
      participants:activity_participants(count),
      user_participation:activity_participants(user_id)
    `)
    .gte('date', new Date().toISOString()) // Only show upcoming activities
    .order('date', { ascending: true });

  // Fetch upcoming matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or('status.eq.upcoming,status.eq.live')
    .gte('match_date', new Date().toISOString())
    .order('match_date', { ascending: true });

  // Transform the activities data to include user participation status
  const transformedActivities = activities?.map(activity => ({
    ...activity,
    participant_count: activity.participants?.[0]?.count || 0,
    is_participating: activity.user_participation?.some(p => p.user_id === session?.user.id) || false
  })) || [];

  return (
    <ActivitiesClient 
      activities={transformedActivities} 
      matches={matches || []}
      userId={session?.user.id}
      isAdmin={isAdmin}
    />
  );
} 