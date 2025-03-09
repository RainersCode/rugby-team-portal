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

  // Only fetch stats when we know the user is an admin
  useEffect(() => {
    if (isReady && isAdmin) {
      console.log("AdminDashboard: User is admin, fetching stats");
      fetchStats();
    }
  }, [isReady, isAdmin]);

  const fetchStats = async () => {
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
    } finally {
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
        <p className="text-muted-foreground">Loading dashboard...</p>
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
