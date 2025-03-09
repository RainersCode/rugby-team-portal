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

    // Check if user is authenticated and is admin using the more secure getUser method with timeout
    let user;
    try {
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth getUser timeout')), 5000)
      );
      
      const { data } = await Promise.race([
        userPromise,
        timeoutPromise as Promise<never>
      ]) as { data: { user: any } };
      
      user = data.user;
      
      if (!user) {
        console.log('AdminActivitiesPage: No user found, redirecting to signin');
        redirect('/auth/signin');
      }
    } catch (error) {
      console.error('AdminActivitiesPage: Error getting user:', error);
      redirect('/auth/signin');
    }

    // Check if user is admin with timeout
    let isAdmin = false;
    try {
      const profilePromise = supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const { data: profile } = await Promise.race([
        profilePromise,
        timeoutPromise as Promise<never>
      ]) as { data: { role: string } };

      isAdmin = profile?.role === 'admin';
      
      if (!isAdmin) {
        console.log('AdminActivitiesPage: User is not admin, redirecting home');
        redirect('/');
      }
    } catch (error) {
      console.error('AdminActivitiesPage: Error checking admin status:', error);
      redirect('/');
    }

    // First fetch all activities with timeout
    let activities;
    try {
      const activitiesPromise = supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Activities fetch timeout')), 5000)
      );
      
      const { data, error } = await Promise.race([
        activitiesPromise,
        timeoutPromise as Promise<never>
      ]) as { data: any[], error: any };

      if (error) {
        console.error('AdminActivitiesPage: Error fetching activities:', error);
        return <div className="p-8 text-center">Error loading activities. Please try again later.</div>;
      }
      
      activities = data;
    } catch (error) {
      console.error('AdminActivitiesPage: Error fetching activities:', error);
      return <div className="p-8 text-center">Error loading activities. Please try again later.</div>;
    }

    // Then fetch participant details for each activity with limited concurrency
    const activitiesWithDetails = [];
    
    // Process in batches of 3 to avoid overwhelming the database
    for (let i = 0; i < activities.length; i += 3) {
      const batch = activities.slice(i, i + 3);
      const batchResults = await Promise.all(
        batch.map(async (activity) => {
          try {
            // Get participants with their profile data
            const { data: participants } = await supabase
              .from('activity_participants')
              .select('user_id')
              .eq('activity_id', activity.id);

            let participantDetails = [];
            
            if (participants && participants.length > 0) {
              // Only fetch profiles if there are participants
              const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', participants.map(p => p.user_id));

              participantDetails = participants.map(participant => {
                const profile = profiles?.find(p => p.id === participant.user_id);
                return {
                  id: participant.user_id,
                  email: user.email,
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
          } catch (error) {
            console.error(`Error processing activity ${activity.id}:`, error);
            // Return activity with minimal data rather than failing
            return {
              ...activity,
              participants: [{ count: 0 }],
              participant_details: []
            };
          }
        })
      );
      
      activitiesWithDetails.push(...batchResults);
    }

    return <AdminActivitiesClient activities={activitiesWithDetails} />;
  } catch (error) {
    console.error('Error in AdminActivitiesPage:', error);
    return <div className="p-8 text-center">An error occurred. Please try again later.</div>;
  }
} 