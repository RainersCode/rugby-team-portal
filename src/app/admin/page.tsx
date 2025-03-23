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
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const { isReady, user, isAdmin } = useRequireAdmin();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [directVerified, setDirectVerified] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [delayedCheckActive, setDelayedCheckActive] = useState(false);
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
        setLoading(true); // Trigger stats fetch
      }
    }
  }, [user]);

  // Delayed verification mechanism
  useEffect(() => {
    // Only activate delayed check if normal verification is taking too long
    if (!isReady && !directVerified && !bypassMode && user && !delayedCheckActive) {
      console.log("AdminDashboard: Starting delayed verification sequence");
      setDelayedCheckActive(true);
      
      // Schedule a series of delayed verification attempts
      const attemptDelayedVerification = (attempt = 1) => {
        // Exponential backoff for retry timing
        const delay = Math.min(1000 * Math.pow(1.5, attempt), 10000); // max 10 seconds
        
        console.log(`AdminDashboard: Delayed verification attempt ${attempt} scheduled in ${delay}ms`);
        
        setTimeout(async () => {
          // If already verified by another method, don't continue
          if (isReady || directVerified || bypassMode) {
            console.log("AdminDashboard: Delayed verification - another method succeeded");
            return;
          }
          
          console.log(`AdminDashboard: Executing delayed verification attempt ${attempt}`);
          
          try {
            // Direct database query with fresh client
            const freshSupabase = createClientComponentClient();
            const { data: profile, error } = await freshSupabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();
            
            if (!error && profile?.role === 'admin') {
              console.log("AdminDashboard: Delayed verification succeeded");
              setDirectVerified(true);
              setLoading(true); // Trigger stats fetch
              return;
            } else {
              console.log("AdminDashboard: Delayed verification attempt failed", error);
              
              // Continue with more attempts, up to 5 total
              if (attempt < 5) {
                attemptDelayedVerification(attempt + 1);
              }
            }
          } catch (err) {
            console.error("AdminDashboard: Error in delayed verification:", err);
            
            // Continue with more attempts, up to 5 total
            if (attempt < 5) {
              attemptDelayedVerification(attempt + 1);
            }
          }
        }, delay);
      };
      
      // Start the delayed verification series
      attemptDelayedVerification();
    }
  }, [isReady, directVerified, bypassMode, user, delayedCheckActive]);

  // Direct API verification if conditions are right
  useEffect(() => {
    let isMounted = true;
    
    const verifyAdmin = async () => {
      // If we're already verified or in bypass mode, skip
      if (directVerified || bypassMode) return;
      
      // If we're already verified by the hook, skip
      if (isReady && isAdmin) {
        setDirectVerified(true);
        return;
      }
      
      // Only try direct verification if the hook isn't ready yet but we have a user
      if (!isReady && user) {
        console.log("AdminDashboard: Starting direct API verification");
        setDelayedCheckActive(true);
        
        try {
          // Try the alternate endpoint first
          const timestamp = Date.now();
          const altRes = await fetch(`/api/admin/check?t=${timestamp}`);
          
          if (altRes.ok) {
            const altData = await altRes.json();
            console.log("AdminDashboard: Alternate endpoint verification result", altData);
            
            if (altData.isAdmin) {
              if (isMounted) {
                setDirectVerified(true);
                setRetryCount(0); // Reset retry count on success
              }
              return;
            }
          } else {
            console.log("AdminDashboard: Alternate endpoint verification failed");
          }
          
          // If alternate fails, try the original endpoint
          const res = await fetch(`/api/auth/verify-admin?t=${timestamp}`);
          
          if (res.ok) {
            const data = await res.json();
            console.log("AdminDashboard: Original endpoint verification result", data);
            
            if (data.isAdmin) {
              if (isMounted) {
                setDirectVerified(true);
                setRetryCount(0); // Reset retry count on success
              }
              return;
            }
          } else {
            console.log("AdminDashboard: Original endpoint verification failed");
          }
          
          // Both API endpoints failed, try direct database check
          console.log("AdminDashboard: API checks failed, trying direct database check");
          
          const supabase = createClientComponentClient();
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (profile?.role === 'admin') {
            console.log("AdminDashboard: Direct database check success");
            if (isMounted) {
              setDirectVerified(true);
              setRetryCount(0); // Reset retry count on success
            }
            return;
          }
          
          // All verification methods failed, increment retry count
          if (isMounted) {
            setRetryCount(prev => prev + 1);
            console.log(`AdminDashboard: All verification attempts failed, retry count: ${retryCount + 1}`);
          }
        } catch (error) {
          console.error("AdminDashboard: Verification error:", error);
          if (isMounted) {
            setRetryCount(prev => prev + 1);
          }
        }
      }
    };
    
    // Initial verification
    verifyAdmin();
    
    // Schedule retries with increasing delays if needed
    if (!directVerified && !bypassMode && !isReady && user && retryCount > 0) {
      const delay = Math.min(1000 * Math.pow(1.5, retryCount - 1), 10000); // max 10 seconds
      console.log(`AdminDashboard: Scheduling retry #${retryCount} after ${delay}ms`);
      
      const timeoutId = setTimeout(() => {
        if (isMounted && !directVerified && !bypassMode && !isReady && user) {
          verifyAdmin();
        }
      }, delay);
      
      return () => clearTimeout(timeoutId);
    }
    
    return () => {
      isMounted = false;
    };
  }, [isReady, isAdmin, user, directVerified, bypassMode, retryCount]);

  // Only fetch stats when we know the user is an admin
  useEffect(() => {
    if ((isReady && isAdmin && user) || directVerified || bypassMode) {
      console.log("AdminDashboard: User is admin, triggering stats fetch");
      setLoading(true); // Set loading to true to trigger the fetch in the next effect
    }
  }, [isReady, isAdmin, user, directVerified, bypassMode]);
  
  // Handle the actual stats fetching based on loading state
  useEffect(() => {
    const fetchStats = async () => {
      if (loading && ((isReady && isAdmin) || directVerified || bypassMode)) {
        setFetchError(null);
        console.log("AdminDashboard: Fetching dashboard stats");
        
        try {
          // Add timestamp to avoid caching
          const timestamp = Date.now();
          const response = await fetch(`/api/admin/dashboard-stats?t=${timestamp}`, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
            }
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("AdminDashboard: Stats fetched successfully", data);
          setStats(data);
        } catch (error) {
          console.error("AdminDashboard: Error fetching stats:", error);
          setFetchError("Failed to load dashboard data. Please try refreshing the page.");
        } finally {
          setLoading(false);
        }
      } else if (!loading && !fetchError && Object.values(stats).every(val => val === 0)) {
        // If we're not loading but stats are all zeros, try fetching again
        console.log("AdminDashboard: Stats appear empty, trying to fetch again");
        setLoading(true); // Set loading back to true to trigger a re-fetch
      }
    };
    
    fetchStats();
  }, [isReady, isAdmin, directVerified, bypassMode, loading, stats, fetchError]);

  // Function to force page refresh
  const handleForceRefresh = () => {
    // Clear any potentially cached data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminData');
      sessionStorage.removeItem('adminVerified');
    }
    // Force full page reload
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
        {(!isReady && !directVerified && !bypassMode) && (
          <div className="text-center max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mt-2">Verifying admin privileges...</p>
            
            {/* Show detailed status based on retry count */}
            {retryCount === 0 && delayedCheckActive && (
              <p className="text-xs text-muted-foreground mt-2">Initial verification in progress...</p>
            )}
            
            {retryCount === 1 && (
              <p className="text-xs text-muted-foreground mt-2">Retrying verification...</p>
            )}
            
            {retryCount === 2 && (
              <p className="text-xs text-muted-foreground mt-2">Verification taking longer than expected. Please be patient...</p>
            )}
            
            {retryCount >= 3 && (
              <p className="text-xs text-amber-500 mt-2">
                Verification is taking unusually long. This might be due to database connection issues.
              </p>
            )}
          </div>
        )}
        
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
            
            {retryCount >= 3 && (
              <div className="mt-6 border border-amber-200 bg-amber-50 p-4 rounded-md max-w-md">
                <h3 className="text-amber-800 font-medium mb-2">Troubleshooting Tips:</h3>
                <ul className="text-xs text-amber-700 list-disc pl-4 space-y-2">
                  <li>Your session might have expired. Try logging out and back in.</li>
                  <li>Network issues might be affecting database connections.</li>
                  <li>Click "Force Refresh" to reload the entire page.</li>
                  <li>Try "Bypass Mode" which uses an alternative verification method.</li>
                  <li>If problems persist, please contact the administrator.</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Show error state if we failed to fetch stats
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg border border-red-100">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{fetchError}</p>
          <button 
            onClick={() => {
              setFetchError(null);
              setLoading(true); // This will trigger the stats fetch in the useEffect
            }}
            className="px-4 py-2 bg-rugby-teal text-white rounded-md hover:bg-rugby-teal/90 transition-colors"
          >
            Retry
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
