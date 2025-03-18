"use client";

import { useEffect, useState, useRef } from "react";
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
import { toast } from "sonner";

export default function AdminDashboard() {
  const { isReady, isAdmin, user, isLoading } = useRequireAdmin();
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
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

  // Use refs to track component mounting state
  const isMounted = useRef(true);
  const abortController = useRef(new AbortController());
  const supabase = createClientComponentClient();
  const sessionCheckedRef = useRef(false);
  const statsLoadedRef = useRef(false);

  // Track page visibility for better reliability
  useEffect(() => {
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !statsLoadedRef.current && isAdmin) {
        console.log("Page became visible, refreshing stats");
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAdmin]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      abortController.current.abort();
    };
  }, []);

  // Only fetch stats when we know the user is an admin
  useEffect(() => {
    if (isReady && isAdmin && user) {
      console.log("AdminDashboard: User is admin, fetching stats");
      sessionCheckedRef.current = true;
      fetchStats();
    } else if (!isReady && !isLoading && retryCount < 3) {
      // Add a retry mechanism after 2 seconds (shorter time)
      const timer = setTimeout(() => {
        if (isMounted.current) {
          console.log(`AdminDashboard: Not ready yet, retrying (${retryCount + 1}/3)...`);
          setRetryCount(prev => prev + 1);
        }
      }, 2000); // Reduced from 3000 to 2000
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isReady, isAdmin, user, retryCount, isLoading]);

  // Special useEffect for persistence across navigation
  useEffect(() => {
    // Try to restore stats from sessionStorage on initial render
    if (typeof window !== 'undefined' && !statsLoadedRef.current) {
      try {
        const savedStats = sessionStorage.getItem('admin-dashboard-stats');
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats);
          setStats(parsedStats);
          setLoading(false);
          statsLoadedRef.current = true;
          console.log("Restored stats from session storage");
        }
      } catch (e) {
        console.warn('Failed to restore stats from sessionStorage:', e);
      }
    }
  }, []);

  // Add another effect to handle session refresh on Vercel
  useEffect(() => {
    // For Vercel deployment, check if we're in production and refresh auth
    if (typeof window !== 'undefined' && 
        window.location.hostname.includes('vercel.app') && 
        !isReady && retryCount === 0) {
      const refreshAuth = async () => {
        try {
          // Don't run if component is unmounted
          if (!isMounted.current) return;
          
          // Force a session refresh
          const { error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error("Error refreshing session:", error);
            // If refresh failed, try to get a new session
            if (!sessionCheckedRef.current) {
              toast.error("Session expired. Please sign in again.");
              window.location.href = '/auth/signin?redirect=/admin';
            }
            return;
          }
          
          console.log("AdminDashboard: Forced session refresh for Vercel deployment");
        } catch (e) {
          console.error("AdminDashboard: Error refreshing session:", e);
        }
      };
      
      refreshAuth();
    }
  }, [retryCount, isReady, supabase.auth]);

  // Add a function to fix message channel issues with Supabase
  useEffect(() => {
    if (!isReady || !isAdmin) return;

    // Function to ping the server to keep message channels alive
    const keepMessageChannelsAlive = async () => {
      try {
        if (!isMounted.current) return;
        
        // Call a simple endpoint that keeps the message channel open
        await fetch('/api/auth/message-fix', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: abortController.current.signal
        });
      } catch (err) {
        // Ignore aborted requests
        if (err.name === 'AbortError') return;
        console.warn('Error keeping message channels alive:', err);
      }
    };

    // Call once immediately
    keepMessageChannelsAlive();
    
    // Set up interval to call regularly
    const interval = setInterval(keepMessageChannelsAlive, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, [isReady, isAdmin]);

  // Listen for admin navigation events to restore state
  useEffect(() => {
    // Memoized version of fetchStats to avoid dependency issues
    const fetchStatsStable = () => {
      fetchStats();
    };

    // Function to handle returning to admin page
    const handleAdminReturn = (event: Event) => {
      console.log("Detected return to admin page");
      
      // If we have stats in session storage, restore them
      if (typeof window !== 'undefined' && !loading) {
        try {
          const savedStats = sessionStorage.getItem('admin-dashboard-stats');
          if (savedStats) {
            setStats(JSON.parse(savedStats));
            statsLoadedRef.current = true;
            setLoading(false);
            console.log("Restored stats on admin page return");
          } else {
            // If no saved stats but we're admin, fetch them
            if (isAdmin && !statsLoadedRef.current) {
              console.log("No saved stats found, fetching fresh data");
              fetchStatsStable();
            }
          }
        } catch (e) {
          console.warn('Failed to handle admin return:', e);
        }
      }
    };
    
    // Function to handle back button to admin page
    const handleBackButton = () => {
      console.log("Back button used to return to admin");
      
      // Similar to admin return, but ensure we're forcing a refresh
      setTimeout(() => {
        if (isAdmin && !statsLoadedRef.current) {
          console.log("Refreshing stats after back button navigation");
          fetchStatsStable();
        }
      }, 500);
    };
    
    // Add event listeners
    window.addEventListener('adminPageReturn', handleAdminReturn);
    window.addEventListener('adminBackButtonUsed', handleBackButton);
    
    return () => {
      window.removeEventListener('adminPageReturn', handleAdminReturn);
      window.removeEventListener('adminBackButtonUsed', handleBackButton);
    };
  }, [isAdmin, loading]);

  const fetchStats = async () => {
    try {
      if (!isMounted.current) return;
      
      setLoadingError(null);
      console.log("AdminDashboard: Fetching stats");
      
      // Create a new abort controller for this operation
      abortController.current = new AbortController();
      const signal = abortController.current.signal;
      
      // Simplified approach - fetch each table one by one to avoid timeout issues
      let statsData = {
        players: 0,
        articles: 0,
        matches: 0,
        users: 0,
        activities: 0,
        exercises: 0,
        training_programs: 0,
        live_streams: 0,
        championship_teams: 0,
        sevens_teams: 0,
        cup_teams: 0,
      };
      
      // Helper function to safely fetch count
      const fetchSingleCount = async (table: string) => {
        if (!isMounted.current || signal.aborted) return 0;
        
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.error(`Error fetching ${table} count:`, error);
            return 0;
          }
          
          return count || 0;
        } catch (err) {
          console.warn(`Could not fetch count for ${table}:`, err);
          return 0;
        }
      };
      
      // Fetch one by one rather than in parallel to avoid overwhelming connections
      statsData.players = await fetchSingleCount("players");
      if (!isMounted.current) return;
      
      statsData.articles = await fetchSingleCount("articles");
      if (!isMounted.current) return;
      
      statsData.matches = await fetchSingleCount("matches");
      if (!isMounted.current) return;
      
      statsData.users = await fetchSingleCount("profiles");
      if (!isMounted.current) return;
      
      statsData.activities = await fetchSingleCount("activities");
      if (!isMounted.current) return;
      
      // Only continue if we're still mounted
      if (!isMounted.current) return;
      
      // Try to fetch the rest in parallel but don't fail if some fail
      try {
        const [exercises, programs, streams, championship, sevens, cup] = await Promise.allSettled([
          fetchSingleCount("exercises"),
          fetchSingleCount("training_programs"),
          fetchSingleCount("live_streams"),
          fetchSingleCount("championship_teams"),
          fetchSingleCount("sevens_teams"),
          fetchSingleCount("cup_teams")
        ]);
        
        // Only use results that were fulfilled
        statsData.exercises = exercises.status === 'fulfilled' ? exercises.value : 0;
        statsData.training_programs = programs.status === 'fulfilled' ? programs.value : 0;
        statsData.live_streams = streams.status === 'fulfilled' ? streams.value : 0;
        statsData.championship_teams = championship.status === 'fulfilled' ? championship.value : 0;
        statsData.sevens_teams = sevens.status === 'fulfilled' ? sevens.value : 0;
        statsData.cup_teams = cup.status === 'fulfilled' ? cup.value : 0;
      } catch (e) {
        console.warn('Failed to fetch some additional stats:', e);
      }
      
      if (!isMounted.current) return;
      
      // Calculate the tournaments total
      statsData.tournaments = 
        statsData.championship_teams + 
        statsData.sevens_teams + 
        statsData.cup_teams;
      
      // Save to sessionStorage for persistence across navigation
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('admin-dashboard-stats', JSON.stringify(statsData));
        } catch (e) {
          console.warn('Failed to save stats to sessionStorage:', e);
        }
      }
      
      // Update the state with the new stats
      setStats(statsData);
      statsLoadedRef.current = true;
      
      console.log("AdminDashboard: Stats fetched successfully");
    } catch (error) {
      // Only update state if still mounted
      if (!isMounted.current) return;
      
      console.error("AdminDashboard: Error fetching stats:", error);
      setLoadingError("Failed to load dashboard statistics. Please try refreshing the page.");
      
      // Try to recover by loading from sessionStorage
      try {
        const savedStats = sessionStorage.getItem('admin-dashboard-stats');
        if (savedStats) {
          setStats(JSON.parse(savedStats));
          statsLoadedRef.current = true;
          setLoadingError(null);
        }
      } catch (e) {
        console.warn('Failed to restore stats after error:', e);
      }
    } finally {
      // Only update state if still mounted
      if (!isMounted.current) return;
      
      setLoading(false);
    }
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
  if (!isReady || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-rugby-teal mb-4" />
        <p className="text-muted-foreground mb-2">Loading dashboard{retryCount > 0 ? ` (Attempt ${retryCount}/3)` : ''}...</p>
        {retryCount >= 3 && (
          <div className="text-center mt-4 max-w-md">
            <p className="text-red-500 mb-2">Dashboard is taking longer than expected to load.</p>
            <p className="mb-4">Try accessing the dashboard directly at:</p>
            <a 
              href="/admin" 
              className="px-4 py-2 bg-rugby-teal text-white hover:bg-rugby-teal/90 transition-colors"
              onClick={() => window.location.href = '/admin'}
            >
              Reload Admin Dashboard
            </a>
          </div>
        )}
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{loadingError}</div>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-rugby-teal text-white hover:bg-rugby-teal/90 transition-colors"
        >
          Retry
        </button>
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
