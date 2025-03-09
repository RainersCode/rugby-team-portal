"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
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
  user?: User; // Make user optional since we'll get it from context if not provided
}

export default function UserNav({ user: propUser }: UserNavProps) {
  const router = useRouter();
  const [initials, setInitials] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { user: contextUser, isAdmin } = useAuth();
  const supabase = createClientComponentClient();
  
  // Use user from props if provided, otherwise from context
  const user = propUser || contextUser;

  useEffect(() => {
    if (user) {
      console.log("UserNav: User data available, fetching profile", user.id);
      fetchUserProfile();
    } else {
      console.log("UserNav: No user data available");
    }
  }, [user]);

  async function fetchUserProfile() {
    try {
      if (!user || !user.id) {
        console.log("UserNav: No user ID, skipping profile fetch");
        return;
      }
      
      console.log("UserNav: Fetching profile for user", user.id);
      
      // First check if we can get first name and last name from user metadata
      let firstInitial = "";
      let lastInitial = "";
      
      if (user.user_metadata && 
          (user.user_metadata.first_name || user.user_metadata.last_name)) {
        console.log("UserNav: Using metadata for initials");
        firstInitial = user.user_metadata.first_name ? user.user_metadata.first_name[0] : "";
        lastInitial = user.user_metadata.last_name ? user.user_metadata.last_name[0] : "";
        setDisplayName(
          [user.user_metadata.first_name, user.user_metadata.last_name]
            .filter(Boolean)
            .join(" ") || user.email?.split("@")[0] || ""
        );
      } else {
        // Fetch from profiles table
        console.log("UserNav: Fetching profile from database");
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("UserNav: Error fetching profile:", error);
          throw error;
        }

        console.log("UserNav: Profile data:", profile);
        
        if (profile) {
          firstInitial = profile.first_name ? profile.first_name[0] : "";
          lastInitial = profile.last_name ? profile.last_name[0] : "";
          setDisplayName(
            [profile.first_name, profile.last_name]
              .filter(Boolean)
              .join(" ") || user.email?.split("@")[0] || ""
          );
        }
      }

      // If we still don't have initials, use email
      if (!firstInitial && !lastInitial && user.email) {
        console.log("UserNav: Using email for initials");
        const nameParts = user.email.split("@")[0].split(/[._-]/);
        if (nameParts.length > 1) {
          firstInitial = nameParts[0][0] || "";
          lastInitial = nameParts[1][0] || "";
        } else {
          firstInitial = nameParts[0][0] || "";
          lastInitial = nameParts[0][1] || "";
        }
        setDisplayName(user.email.split("@")[0]);
      }
      
      const userInitials = (firstInitial + lastInitial).toUpperCase();
      console.log("UserNav: Setting initials to:", userInitials || "U");
      setInitials(userInitials || "U");
      
    } catch (error) {
      console.error("UserNav: Error in fetchUserProfile:", error);
      // Use email as fallback
      if (user && user.email) {
        const email = user.email.split("@")[0];
        setInitials(email.substring(0, 2).toUpperCase());
        setDisplayName(email);
      } else {
        setInitials("U");
        setDisplayName("User");
      }
    }
  }

  const handleSignOut = async () => {
    try {
      console.log("UserNav: Signing out");
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

  // If no user is found, don't render anything
  if (!user) {
    console.log("UserNav: No user, not rendering");
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none group">
        <Avatar className="h-8 w-8 bg-white/10 hover:bg-white/20 transition-all duration-300 ring-2 ring-white/20 group-hover:ring-white/40 rounded-none">
          <AvatarFallback className="text-white font-semibold bg-transparent">
            {initials || user.email?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-2 bg-rugby-teal/95 backdrop-blur-xl border-none shadow-xl rounded-none"
      >
        <Link href="/profile" className="block">
          <DropdownMenuItem className="group cursor-pointer flex items-center gap-2 px-3 py-2.5 hover:bg-white rounded-none transition-colors duration-200">
            <div className="p-1.5 rounded-none bg-white/10 group-hover:bg-rugby-teal/10">
              <Users className="w-4 h-4 text-white group-hover:text-rugby-teal" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white group-hover:text-rugby-teal">
                {displayName || user.email || "User"}
              </span>
              <span className="text-xs text-white/70 group-hover:text-rugby-teal/70">View Profile</span>
            </div>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="my-2 bg-white/20" />

        {isAdmin && (
          <>
            <Link href="/admin" className="block">
              <DropdownMenuItem className="group cursor-pointer flex items-center gap-2 px-3 py-2 hover:bg-white rounded-none transition-colors duration-200">
                <LayoutDashboard className="w-4 h-4 text-white group-hover:text-rugby-teal" />
                <span className="text-sm text-white group-hover:text-rugby-teal">Admin Dashboard</span>
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator className="my-2 bg-white/20" />
          </>
        )}

        <DropdownMenuItem
          onClick={handleSignOut}
          className="group cursor-pointer flex items-center gap-2 px-3 py-2 hover:bg-white rounded-none transition-colors duration-200"
        >
          <LogOut className="w-4 h-4 text-white group-hover:text-rugby-teal" />
          <span className="text-sm text-white group-hover:text-rugby-teal">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
