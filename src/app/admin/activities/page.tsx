import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import client component directly to avoid reference errors in build
import AdminActivitiesClient from './AdminActivitiesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Simple loading component for server
function LoadingFallback() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-6">Loading Admin Dashboard</h2>
      <div className="w-12 h-12 rounded-full border-4 border-rugby-teal border-t-transparent animate-spin mx-auto mb-6"></div>
      <p>Please wait while we load your activities...</p>
    </div>
  );
}

// Simple server-side component for admin activities page
export default async function AdminActivitiesPage() {
  try {
    // Get cookie store for authentication
    const cookieStore = cookies();
    
    // Create Supabase client for server component
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore,
    });

    // Fetch the user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('AdminActivitiesPage: Auth error or no user found');
      return redirect('/auth/signin');
    }
    
    const user = userData.user;
    
    // Get profile data to check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('AdminActivitiesPage: Profile fetch error:', profileError);
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Access Error</h2>
          <p className="mb-4">We couldn't verify your account information.</p>
          <div className="flex justify-center space-x-4">
            <a href="/" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">Return Home</a>
            <a href="/auth/signin" className="px-4 py-2 bg-rugby-teal text-white hover:bg-rugby-teal/80 rounded">Sign In Again</a>
          </div>
        </div>
      );
    }
    
    const isAdmin = profile?.role === 'admin';
    
    if (!isAdmin) {
      return redirect('/');
    }
    
    // Fetch basic activities data
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false });
      
    if (activitiesError) {
      console.error('AdminActivitiesPage: Error fetching activities:', activitiesError);
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Data Loading Error</h2>
          <p className="mb-4">We encountered a problem loading the activities.</p>
          <a href="/admin/activities" className="px-4 py-2 bg-rugby-teal text-white hover:bg-rugby-teal/80 rounded">Try Again</a>
        </div>
      );
    }
    
    // Transform activities data for the client component
    const simpleActivities = activities ? activities.map(activity => ({
      ...activity,
      participants: [{ count: 0 }],
      participant_details: []
    })) : [];
    
    // Return the client component with activities data
    return <AdminActivitiesClient activities={simpleActivities} userId={user.id} />;
  } catch (error) {
    console.error('AdminActivitiesPage: Unhandled error:', error);
    // Return error component
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-3">Something Went Wrong</h2>
        <p className="mb-4">We've encountered an unexpected error.</p>
        <div className="flex justify-center space-x-4">
          <a href="/" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">Return Home</a>
          <a href="/admin/activities" className="px-4 py-2 bg-rugby-teal text-white hover:bg-rugby-teal/80 rounded">Try Again</a>
        </div>
      </div>
    );
  }
} 