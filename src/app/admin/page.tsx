"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Users, FileText, Calendar, Settings, BarChart, CalendarDays, Dumbbell, Image as ImageIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    players: 0,
    articles: 0,
    matches: 0,
    users: 0,
    activities: 0,
    exercises: 0,
    training_programs: 0,
  });

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAdmin();
    fetchStats();
  }, []);

  const checkAdmin = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/signin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      router.push("/");
    }
  };

  const fetchStats = async () => {
    try {
      const [
        { count: playersCount },
        { count: articlesCount },
        { count: matchesCount },
        { count: usersCount },
        { count: activitiesCount },
        { count: exercisesCount },
        { count: trainingProgramsCount },
      ] = await Promise.all([
        supabase.from("players").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("matches").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("activities").select("*", { count: "exact", head: true }),
        supabase.from("exercises").select("*", { count: "exact", head: true }),
        supabase.from("training_programs").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        players: playersCount || 0,
        articles: articlesCount || 0,
        matches: matchesCount || 0,
        users: usersCount || 0,
        activities: activitiesCount || 0,
        exercises: exercisesCount || 0,
        training_programs: trainingProgramsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
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
      title: "Gallery",
      description: "Manage photo galleries",
      icon: ImageIcon,
      href: "/admin/gallery",
      count: 0,
      color: "text-cyan-500",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                    </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 
