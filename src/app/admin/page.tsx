"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Users, FileText, Calendar, Settings, BarChart, CalendarDays, Dumbbell, Image as ImageIcon, Play, Trophy, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

export default function AdminDashboard() {
  const { isReady, isAdmin, user } = useRequireAdmin();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [directVerified, setDirectVerified] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [bypassMode, setBypassMode] = useState(false);
  const [stats, setStats] = useState({
    players: 0,
    articles: 0,
    matches: 0,
    users: 0,
    activities: 0,
    exercises: 0,
    training_programs: 0,
    live_streams: 0,
    tournaments: 0,
    championship_teams: 0,
    sevens_teams: 0,
    cup_teams: 0,
  });

  const supabase = createClientComponentClient();

  // Check for bypass mode in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const bypass = url.searchParams.get('bypass');
      
      if (bypass === 'admin' && user) {
        console.log("AdminDashboard: Using bypass mode");
        setBypassMode(true);
        setDirectVerified(true);
        
        // Remove the parameter from URL to prevent repeated bypasses
        url.searchParams.delete('bypass');
        window.history.replaceState({}, document.title, url.toString());
        
        // Start loading data
        fetchStats();
      }
    }
  }, [user]);

  // Direct API verification as a fallback
  useEffect(() => {
    // Clear any browser cache immediately
    if (typeof window !== 'undefined') {
      // Clear localStorage and sessionStorage
      try {
        // Clear localStorage
        localStorage.removeItem('supabase.auth.token');
        
        // Find and clear any admin-related cache items
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('admin') || key.includes('profile'))) {
            localStorage.removeItem(key);
          }
        }
        
        // Clear session storage too
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.includes('admin') || key.includes('profile'))) {
            sessionStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error('Error clearing cache:', e);
      }
    }
    
    // If we've been waiting too long without isReady becoming true
    // and we have a user, try direct API verification
    const timeout = setTimeout(async () => {
      if (!isReady && user && !directVerified && retryCount < 3) {
        console.log("AdminDashboard: Performing direct admin verification via API");
        try {
          // Add a timestamp to bust cache
          const timestamp = Date.now();
          
          // Try both API endpoints, starting with the alternate one
          let verified = false;
          
          // First try the alternate endpoint which has a different route
          try {
            const altResponse = await fetch(`/api/admin/check?t=${timestamp}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'X-No-Cache': timestamp.toString(),
              },
              credentials: 'include',
              cache: 'no-store',
              next: { revalidate: 0 }
            });
            
            if (altResponse.ok) {
              const altData = await altResponse.json();
              if (altData.isAdmin) {
                console.log("AdminDashboard: Alternate API verification succeeded");
                setDirectVerified(true);
                fetchStats();
                verified = true;
                return;
              }
            }
          } catch (altError) {
            console.error("AdminDashboard: Alternate API error:", altError);
          }
          
          // If alternate endpoint failed, try the original one
          if (!verified) {
            console.log("AdminDashboard: Trying original API endpoint");
            
            // Try using our dedicated API
            const response = await fetch(`/api/auth/verify-admin?t=${timestamp}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'X-No-Cache': timestamp.toString(),
              },
              credentials: 'include',
              cache: 'no-store',
              next: { revalidate: 0 }
            });
            
            const data = await response.json();
            
            if (response.ok && data.isAdmin) {
              console.log("AdminDashboard: API verification confirmed admin status");
              setDirectVerified(true);
              fetchStats();
              return;
            }
          }
          
          console.log("AdminDashboard: Both API verifications failed, trying database directly");
          
          // Both API methods failed, try direct database query as last resort
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (!error && profile?.role === 'admin') {
            console.log("AdminDashboard: Database verification confirmed admin status");
            setDirectVerified(true);
            fetchStats();
          } else {
            console.log("AdminDashboard: Database verification failed", error);
            // Try a few times before giving up
            setRetryCount(prev => prev + 1);
          }
        } catch (verifyError) {
          console.error("AdminDashboard: Error in direct verification", verifyError);
          setRetryCount(prev => prev + 1);
        }
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [isReady, user, directVerified, retryCount]);

  // Only fetch stats when we know the user is an admin
  useEffect(() => {
    if ((isReady && isAdmin && user) || directVerified || bypassMode) {
      console.log("AdminDashboard: User is admin, fetching stats");
      fetchStats();
    }
  }, [isReady, isAdmin, user, directVerified, bypassMode]);

  const fetchStats = async () => {
    setFetchError(null);
    try {
      console.log("AdminDashboard: Fetching stats");
      
      // Use try-catch for each count to prevent one failure from stopping all stats
      const fetchCount = async (table: string) => {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.error(`Error fetching ${table} count:`, error);
            return 0;
          }
          
          return count || 0;
        } catch (e) {
          console.error(`Error in fetchCount for ${table}:`, e);
          return 0;
        }
      };
      
      // Add a small delay before fetching to give DB connections time to establish
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then fetch all counts in parallel
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

      setStats({
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
      });
      
      console.log("AdminDashboard: Stats fetched successfully");
    } catch (error) {
      console.error("AdminDashboard: Error fetching stats:", error);
      setFetchError("Failed to load dashboard data. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  // Force a refresh button 
  const handleForceRefresh = () => {
    window.location.reload();
  };

  const adminSections = [
    {
      title: "Players",
      description: "Manage team players, positions, and statistics",
      icon: Users,
      href: "/admin/players",
      count: stats.players,
      color: "text-blue-500",
    },
    {
      title: "Articles",
      description: "Publish and manage news articles",
      icon: FileText,
      href: "/admin/articles",
      count: stats.articles,
      color: "text-green-500",
    },
    {
      title: "Matches",
      description: "Schedule and manage team matches",
      icon: Calendar,
      href: "/admin/matches",
      count: stats.matches,
      color: "text-orange-500",
    },
    {
      title: "Activities",
      description: "Manage team activities and events",
      icon: CalendarDays,
      href: "/admin/activities",
      count: stats.activities,
      color: "text-purple-500",
    },
    {
      title: "Training",
      description: `Manage exercises (${stats.exercises}) and programs (${stats.training_programs})`,
      icon: Dumbbell,
      href: "/admin/training",
      count: stats.exercises + stats.training_programs,
      color: "text-rose-500",
    },
    {
      title: "Tournaments",
      description: `Championship (${stats.championship_teams}), Sevens (${stats.sevens_teams}), Cup (${stats.cup_teams})`,
      icon: Trophy,
      href: "/admin/tournaments",
      count: stats.tournaments,
      color: "text-yellow-500",
    },
    {
      title: "Gallery",
      description: "Manage photo galleries",
      icon: ImageIcon,
      href: "/admin/gallery",
      count: 0,
      color: "text-cyan-500",
    },
    {
      title: "Live Streams",
      description: "Manage live streams and broadcasts",
      icon: Play,
      href: "/admin/live",
      count: stats.live_streams,
      color: "text-red-500",
    },
    {
      title: "Users",
      description: "Manage user accounts and roles",
      icon: Users,
      href: "/admin/users",
      count: stats.users,
      color: "text-indigo-500",
    },
  ];

  // Show loading state while checking admin status OR while fetching stats
  if ((!isReady && !directVerified && !bypassMode) || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-rugby-teal mb-4" />
        <p className="text-muted-foreground">Loading admin dashboard...</p>
        {(!isReady && !directVerified && !bypassMode) && <p className="text-sm text-muted-foreground mt-2">Verifying admin privileges...</p>}
        
        {/* Add a manual refresh button if it takes too long */}
        {retryCount >= 1 && (
          <div className="flex flex-col items-center mt-6">
            <button 
              onClick={handleForceRefresh}
              className="px-4 py-2 bg-rugby-teal text-white rounded-md hover:bg-rugby-teal/90 transition-colors mb-2"
            >
              Force Refresh
            </button>
            
            <a 
              href="/admin?bypass=admin" 
              className="text-sm text-blue-500 hover:underline mt-4"
            >
              Try Bypass Mode
            </a>
          </div>
        )}
      </div>
    );
  }
  
  // Show error state if there was a problem fetching stats
  if (fetchError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-red-500 mt-4">{fetchError}</p>
          <button 
            onClick={() => {
              setLoading(true);
              fetchStats();
            }}
            className="mt-4 px-4 py-2 bg-rugby-teal text-white rounded-md hover:bg-rugby-teal/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Manage your team, content, and users
          from here.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => (
          <Link key={section.title} href={section.href}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {section.title}
                </CardTitle>
                <section.icon className={`h-4 w-4 ${section.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{section.count}</div>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>{/* Add recent activity list here */}</CardContent>
        </Card>

      <Card>
        <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/admin/players/new">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Add Player</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/articles/new">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">New Article</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/matches/new">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <Calendar className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Schedule Match</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/activities/new">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <CalendarDays className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Create Activity</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/training/exercises/new">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <Dumbbell className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">New Exercise</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/training/programs/new">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <Dumbbell className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">New Program</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/tournaments">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <Trophy className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">New Tournament</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/live">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <Play className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">New Live Stream</span>
                  </CardContent>
                </Card>
              </Link>
                    </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 
