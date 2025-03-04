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
    try {
      // Call our API endpoint
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Sign out failed');
      }

      // Clear client-side state
      setInitials("");
      
      // Redirect to home page and force a full page reload
      window.location.href = '/';
    } catch (error) {
      console.error('Error during sign out:', error);
      // If there's an error, still try to refresh the page
      window.location.href = '/';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none group">
        <Avatar className="h-8 w-8 bg-white/10 hover:bg-white/20 transition-all duration-300 ring-2 ring-white/20 group-hover:ring-white/40">
          <AvatarFallback className="text-white font-semibold bg-transparent">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-2 bg-rugby-teal/95 backdrop-blur-xl border-none shadow-xl"
      >
        <Link href="/profile" className="block">
          <DropdownMenuItem className="group cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-white rounded-md transition-colors duration-200">
            <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-rugby-teal/10">
              <Users className="w-4 h-4 text-white group-hover:text-rugby-teal" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white group-hover:text-rugby-teal">{user.email}</span>
              <span className="text-xs text-white/70 group-hover:text-rugby-teal/70">View Profile</span>
            </div>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="my-2 bg-white/20" />

        {isAdmin && (
          <>
            <Link href="/admin" className="block">
              <DropdownMenuItem className="group cursor-pointer flex items-center gap-2 px-3 py-2 hover:bg-white rounded-md transition-colors duration-200">
                <LayoutDashboard className="w-4 h-4 text-white group-hover:text-rugby-teal" />
                <span className="text-sm text-white group-hover:text-rugby-teal">Admin Dashboard</span>
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator className="my-2 bg-white/20" />
          </>
        )}

        <DropdownMenuItem
          onClick={handleSignOut}
          className="group cursor-pointer flex items-center gap-2 px-3 py-2 hover:bg-white rounded-md transition-colors duration-200"
        >
          <LogOut className="w-4 h-4 text-white group-hover:text-rugby-teal" />
          <span className="text-sm text-white group-hover:text-rugby-teal">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
