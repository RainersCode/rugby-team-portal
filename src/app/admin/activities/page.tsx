import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminActivitiesClient from './AdminActivitiesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminActivitiesPage() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore,
    });

    // Detect if this is a client-side rendered page for troubleshooting
    let isBrowser = false;
    try {
      isBrowser = typeof window !== 'undefined';
    } catch (e) {
      // This will throw in server components, which is expected
    }

    // Initial loading state for better UX
    if (isBrowser) {
      return <div className="p-8 text-center">Loading admin activities...</div>;
    }

    // Chrome-specific optimization: use direct API call for profile
    let isChrome = false;
    let user;
    try {
      // Get user agent from headers
      const headers = new Headers();
      const userAgent = headers.get('user-agent') || '';
      isChrome = userAgent.includes('Chrome');

      if (isChrome) {
        console.log('AdminActivitiesPage: Chrome detected, using optimized auth');
        
        // Try to make direct API call for profile
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/profile`, {
            method: 'GET',
            headers: {
              'Cookie': cookieStore.toString(),
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            user = data.user;
            
            // Early admin check
            if (data.profile?.role !== 'admin') {
              console.log('AdminActivitiesPage: User is not admin via API, redirecting');
              redirect('/');
            }
            
            // If we have user and they're admin, we can skip the standard checks
            if (user) {
              // Skip to activities fetching
              const activities = await fetchActivities(supabase);
              return <AdminActivitiesClient activities={activities} />;
            }
          }
        } catch (error) {
          console.error('AdminActivitiesPage: Chrome API call failed, falling back to standard method', error);
          // Fall through to standard method
        }
      }
    } catch (error) {
      console.error('AdminActivitiesPage: Error detecting Chrome:', error);
      // Fall through to standard method
    }

    // Check if user is authenticated and is admin using the more secure getUser method with timeout
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
      // Return a better error UI instead of redirecting in case it's just a timeout
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p className="mb-4">There was a problem verifying your login. Please try the following:</p>
          <ul className="list-disc ml-8 text-left mb-4">
            <li>Clear your browser cache and cookies</li>
            <li>Try using a private/incognito window</li>
            <li>Try logging in again</li>
          </ul>
          <a href="/auth/signin" className="text-rugby-teal hover:underline">Return to Login</a>
        </div>
      );
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
      // Provide detailed error message for admin verification failures
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Admin Verification Error</h2>
          <p className="mb-4">We couldn't verify your admin privileges. Please try again later.</p>
          <a href="/" className="text-rugby-teal hover:underline">Return to Home</a>
        </div>
      );
    }

    // Fetch activities with less concurrency for Chrome
    const activities = await fetchActivities(supabase, isChrome);
    return <AdminActivitiesClient activities={activities} />;
  } catch (error) {
    console.error('Error in AdminActivitiesPage:', error);
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Something Went Wrong</h2>
        <p className="mb-4">We encountered an error while loading the admin dashboard.</p>
        <a href="/" className="text-rugby-teal hover:underline">Return to Home</a>
      </div>
    );
  }
}

// Helper function to fetch activities with proper batching
async function fetchActivities(supabase: any, isChrome = false) {
  try {
    // First fetch all activities with timeout
    const activitiesPromise = supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false });
      
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Activities fetch timeout')), 8000)
    );
    
    const { data: activities } = await Promise.race([
      activitiesPromise,
      timeoutPromise as Promise<never>
    ]) as { data: any[] };

    if (!activities || activities.length === 0) {
      return [];
    }
    
    // Process in smaller batches for Chrome (2) or larger for other browsers (3)
    const batchSize = isChrome ? 2 : 3;
    const activitiesWithDetails = [];
    
    for (let i = 0; i < activities.length; i += batchSize) {
      const batch = activities.slice(i, i + batchSize);
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
                .in('id', participants.map((p: any) => p.user_id));

              participantDetails = participants.map((participant: any) => {
                const profile = profiles?.find((p: any) => p.id === participant.user_id);
                return {
                  id: participant.user_id,
                  email: profile?.email || 'Unknown Email',
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
    
    return activitiesWithDetails;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
} 