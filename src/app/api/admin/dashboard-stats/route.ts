import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const timestamp = Date.now();
    console.log(`DashboardStats API: Fetching stats (t=${timestamp})`);
    
    // Get cookies for the Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // First get the current session to verify admin
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.error('DashboardStats API: No valid session');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      console.error('DashboardStats API: User is not admin');
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    console.log('DashboardStats API: User is admin, fetching stats');
    
    // Small delay to ensure database connections are established
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Helper function to fetch counts with error handling
    const fetchCount = async (table: string) => {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error(`DashboardStats API: Error fetching ${table} count:`, error);
          return 0;
        }
        
        return count || 0;
      } catch (e) {
        console.error(`DashboardStats API: Error in fetchCount for ${table}:`, e);
        return 0;
      }
    };
    
    // Fetch all counts in parallel
    const [
      playersCount,
      articlesCount,
      matchesCount,
      usersCount,
      activitiesCount,
      exercisesCount,
      trainingProgramsCount,
      liveStreamsCount,
      championshipTeamsCount,
      sevensTeamsCount,
      cupTeamsCount,
    ] = await Promise.all([
      fetchCount("players"),
      fetchCount("articles"),
      fetchCount("matches"),
      fetchCount("profiles"),
      fetchCount("activities"),
      fetchCount("exercises"),
      fetchCount("training_programs"),
      fetchCount("live_streams"),
      fetchCount("championship_teams"),
      fetchCount("sevens_teams"),
      fetchCount("cup_teams"),
    ]);
    
    // Construct and return response
    const stats = {
      players: playersCount,
      articles: articlesCount,
      matches: matchesCount,
      users: usersCount,
      activities: activitiesCount,
      exercises: exercisesCount,
      training_programs: trainingProgramsCount,
      live_streams: liveStreamsCount,
      tournaments: championshipTeamsCount + sevensTeamsCount + cupTeamsCount,
      championship_teams: championshipTeamsCount,
      sevens_teams: sevensTeamsCount,
      cup_teams: cupTeamsCount,
      gallery: 0,
    };
    
    console.log('DashboardStats API: Stats fetched successfully');
    
    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'X-Timestamp': timestamp.toString()
      }
    });
  } catch (error) {
    console.error('DashboardStats API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 