"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  LayoutDashboard,
  FileText,
  Calendar,
  LogOut,
  Dumbbell,
  Image,
  Play,
  Settings,
  Trophy,
} from "lucide-react";

interface UserNavProps {
  user: User;
  isAdmin?: boolean;
}

export default function UserNav({ user, isAdmin }: UserNavProps) {
  const router = useRouter();
  const [initials, setInitials] = useState("");

  useEffect(() => {
    checkUserRole();
  }, []);

  async function checkUserRole() {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, role")
        .eq("id", user.id)
        .single();

      if (profile) {
        const firstInitial = profile.first_name ? profile.first_name[0] : "";
        const lastInitial = profile.last_name ? profile.last_name[0] : "";
        setInitials((firstInitial + lastInitial).toUpperCase() || "U");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/signin");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none group">
        <Avatar className="h-8 w-8 bg-gradient-to-br from-rugby-teal/10 to-rugby-teal/20 hover:from-rugby-teal/20 hover:to-rugby-teal/30 transition-all duration-300 ring-2 ring-rugby-teal/20 group-hover:ring-rugby-teal/40">
          <AvatarFallback className="text-rugby-teal font-semibold bg-transparent">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-2 bg-gradient-to-b from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-900/80 backdrop-blur-xl border-rugby-teal/20 shadow-xl shadow-rugby-teal/10"
      >
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-teal/10 rounded-md transition-colors duration-200">
            <div className="p-1.5 rounded-full bg-rugby-teal/10">
              <Users className="w-4 h-4 text-rugby-teal" />
            </div>
            <span className="font-medium">Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-teal/10 rounded-md transition-colors duration-200">
            <div className="p-1.5 rounded-full bg-rugby-yellow/10">
              <Settings className="w-4 h-4 text-rugby-yellow" />
            </div>
            <span className="font-medium">Settings</span>
          </DropdownMenuItem>
        </Link>
        {isAdmin && (
          <>
            <DropdownMenuSeparator className="my-2 bg-rugby-teal/10" />
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              Admin Panel
            </div>
            <Link href="/admin">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-teal/10 rounded-md transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-rugby-teal/10">
                  <LayoutDashboard className="w-4 h-4 text-rugby-teal" />
                </div>
                <span className="font-medium">Dashboard</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/players">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-teal/10 rounded-md transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-rugby-teal/10">
                  <Users className="w-4 h-4 text-rugby-teal" />
                </div>
                <span className="font-medium">Players</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/matches">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-teal/10 rounded-md transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-rugby-teal/10">
                  <Calendar className="w-4 h-4 text-rugby-teal" />
                </div>
                <span className="font-medium">Matches</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/championship">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-teal/10 rounded-md transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-rugby-teal/10">
                  <Trophy className="w-4 h-4 text-rugby-teal" />
                </div>
                <span className="font-medium">Championship</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/articles">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-teal/10 rounded-md transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-rugby-teal/10">
                  <FileText className="w-4 h-4 text-rugby-teal" />
                </div>
                <span className="font-medium">Articles</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/training">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-teal/10 rounded-md transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-rugby-teal/10">
                  <Dumbbell className="w-4 h-4 text-rugby-teal" />
                </div>
                <span className="font-medium">Training</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/gallery">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-teal/10 rounded-md transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-rugby-teal/10">
                  <Image className="w-4 h-4 text-rugby-teal" />
                </div>
                <span className="font-medium">Gallery</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/live">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-teal/10 rounded-md transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-rugby-teal/10">
                  <Play className="w-4 h-4 text-rugby-teal" />
                </div>
                <span className="font-medium">Live Streams</span>
              </DropdownMenuItem>
            </Link>
          </>
        )}
        <DropdownMenuSeparator className="my-2 bg-rugby-teal/10" />
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-rugby-red/10 rounded-md transition-colors duration-200 text-rugby-red"
          onClick={handleSignOut}
        >
          <div className="p-1.5 rounded-full bg-rugby-red/10">
            <LogOut className="w-4 h-4 text-rugby-red" />
          </div>
          <span className="font-medium">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
