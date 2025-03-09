import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminActivitiesClient from './AdminActivitiesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminActivitiesPage() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Check if user is authenticated and is admin using the more secure getUser method
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/auth/signin');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      redirect('/');
    }

    // First fetch all activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false });

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return null;
    }

    // Then fetch participant details for each activity
    const activitiesWithDetails = await Promise.all(
      activities.map(async (activity) => {
        // Get participants with their profile data
        const { data: participants } = await supabase
          .from('activity_participants')
          .select('user_id')
          .eq('activity_id', activity.id);

        let participantDetails = [];
        
        if (participants && participants.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', participants.map(p => p.user_id));

          console.log('Profiles found:', profiles);

          participantDetails = participants.map(participant => {
            const profile = profiles?.find(p => p.id === participant.user_id);
            return {
              id: participant.user_id,
              email: user.email, // Use authenticated user email
              full_name: profile ? 
                [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unnamed User'
                : 'Unnamed User'
            };
          });
        }

        return {
          ...activity,
          participants: [{ count: participants?.length || 0 }],
          participant_details: participantDetails
        };
      })
    );

    return <AdminActivitiesClient activities={activitiesWithDetails} />;
  } catch (error) {
    console.error('Error in AdminActivitiesPage:', error);
    return null;
  }
} 