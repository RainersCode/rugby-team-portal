import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminActivitiesClient from './AdminActivitiesClient';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Direct server component without relying on headers detection
export default async function AdminActivitiesPage() {
  try {
    // Get cookie store for authentication
    const cookieStore = await cookies();
    
    // Create Supabase client for server component
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore,
    });

    // CRITICAL: Fetch the user directly from Supabase to bypass middleware
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('AdminActivitiesPage: Auth error or no user found:', userError);
      redirect('/auth/signin');
    }
    
    console.log('AdminActivitiesPage: User authenticated:', user.id);

    // Direct database query for admin check (with timeout)
    const adminCheckPromise = new Promise(async (resolve, reject) => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('AdminActivitiesPage: Profile fetch error:', profileError);
          reject(profileError);
          return;
        }
        
        const isAdmin = profile?.role === 'admin';
        resolve(isAdmin);
      } catch (error) {
        reject(error);
      }
    });
    
    // Set a timeout for the admin check
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Admin check timeout')), 8000);
    });
    
    try {
      const isAdmin = await Promise.race([adminCheckPromise, timeoutPromise]);
      
      if (!isAdmin) {
        console.log('AdminActivitiesPage: User is not admin:', user.id);
        redirect('/');
      }
      
      console.log('AdminActivitiesPage: Admin status confirmed, loading activities');
    } catch (error) {
      console.error('AdminActivitiesPage: Admin check failed:', error);
      // Return error component instead of redirecting to avoid infinite redirects
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Admin Verification Failed</h2>
          <p className="mb-4">We couldn't verify your admin privileges.</p>
          <p className="mb-6">This could be due to a temporary server issue.</p>
          <div className="space-x-4">
            <a href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded">
              Return Home
            </a>
            <a 
              href="/admin/activities" 
              className="bg-rugby-teal hover:bg-rugby-teal/80 text-white font-semibold py-2 px-4 rounded"
            >
              Try Again
            </a>
          </div>
        </div>
      );
    }
    
    // Fetch activities directly
    try {
      const activities = await fetchActivitiesDirectly(supabase, user.id);
      
      if (!activities || activities.length === 0) {
        return (
          <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Activity Management</h1>
            <p className="mb-4">No activities found. Create a new activity to get started.</p>
            <a 
              href="/admin/activities/new" 
              className="bg-rugby-teal hover:bg-rugby-teal/80 text-white font-semibold py-2 px-4 rounded"
            >
              Create New Activity
            </a>
          </div>
        );
      }
      
      return <AdminActivitiesClient activities={activities} />;
    } catch (error) {
      console.error('AdminActivitiesPage: Activities fetch error:', error);
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Data Loading Error</h2>
          <p className="mb-4">We encountered a problem loading the activities data.</p>
          <a 
            href="/admin/activities" 
            className="bg-rugby-teal hover:bg-rugby-teal/80 text-white font-semibold py-2 px-4 rounded"
          >
            Try Again
          </a>
        </div>
      );
    }
  } catch (error) {
    console.error('AdminActivitiesPage: Unhandled error:', error);
    // Return error component rather than redirecting
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Something Went Wrong</h2>
        <p className="mb-4">We encountered an unexpected error.</p>
        <p className="text-gray-600 mb-6">Technical details have been logged for investigation.</p>
        <div className="space-x-4">
          <a href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded">
            Return Home
          </a>
          <a 
            href="/admin/activities" 
            className="bg-rugby-teal hover:bg-rugby-teal/80 text-white font-semibold py-2 px-4 rounded"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }
}

// Direct server-side activities fetch function
async function fetchActivitiesDirectly(supabase: any, userId: string) {
  // First get all activities with timeout
  const activitiesFetchPromise = new Promise(async (resolve, reject) => {
    try {
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        reject(error);
        return;
      }
      
      resolve(activities || []);
    } catch (error) {
      reject(error);
    }
  });
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Activities fetch timeout')), 10000);
  });
  
  try {
    const activities = await Promise.race([activitiesFetchPromise, timeoutPromise]) as any[];
    
    if (!activities || activities.length === 0) {
      return [];
    }
    
    // Process in small batches to avoid timeouts
    const batchSize = 1; // Process one at a time to be extra safe
    const activitiesWithDetails = [];
    
    for (let i = 0; i < activities.length; i += batchSize) {
      const batch = activities.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (activity) => {
          try {
            // Get participants count directly with a single query
            const { count: participantCount, error: countError } = await supabase
              .from('activity_participants')
              .select('*', { count: 'exact', head: true })
              .eq('activity_id', activity.id);
            
            if (countError) {
              console.error(`Error counting participants for activity ${activity.id}:`, countError);
            }
            
            // Get just the basic participants list
            const { data: participants, error: participantsError } = await supabase
              .from('activity_participants')
              .select('user_id')
              .eq('activity_id', activity.id);
            
            if (participantsError) {
              console.error(`Error fetching participants for activity ${activity.id}:`, participantsError);
            }
            
            // Simplified approach - return basic info since detailed participant info is rarely needed immediately
            return {
              ...activity,
              participants: [{ count: participantCount || 0 }],
              participant_details: participants || [],
              // Add flags for admin UI
              canEdit: true,
              canDelete: true
            };
          } catch (error) {
            console.error(`Error processing activity ${activity.id}:`, error);
            // Return basic activity with minimal data
            return {
              ...activity,
              participants: [{ count: 0 }],
              participant_details: [],
              // Add flags for admin UI
              canEdit: true,
              canDelete: true
            };
          }
        })
      );
      
      activitiesWithDetails.push(...batchResults);
      
      // Add a small delay between batches to prevent overwhelming the connection
      if (i + batchSize < activities.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return activitiesWithDetails;
  } catch (error) {
    console.error('Error in fetchActivitiesDirectly:', error);
    throw error;
  }
} 