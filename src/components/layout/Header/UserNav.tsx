"use client";

import { useEffect, useState, useRef } from "react";
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

const USER_CACHE_KEY = 'rugby-portal-user-profile';

export default function UserNav({ user: propUser }: UserNavProps) {
  const router = useRouter();
  const [initials, setInitials] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { user: contextUser, isAdmin, isLoading, clearAuth } = useAuth();
  const supabase = createClientComponentClient();
  const fetchingRef = useRef(false);
  const [isChromeSetup, setIsChromeSetup] = useState(false);
  
  // Check if running in Chrome
  const isChrome = () => {
    if (typeof window !== 'undefined') {
      return window.navigator.userAgent.indexOf('Chrome') > -1;
    }
    return false;
  };
  
  // Use user from props if provided, otherwise from context
  const user = propUser || contextUser;

  // Chrome-specific direct fetch optimization
  useEffect(() => {
    const setupChromeProfile = async () => {
      if (isChrome() && user?.id && !isChromeSetup) {
        console.log("UserNav: Chrome detected, setting up direct profile fetch");
        setIsChromeSetup(true);
        
        try {
          // Direct fetch for Chrome to ensure we get profile data
          const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            const profileData = await response.json();
            if (profileData?.profile) {
              console.log("UserNav: Got profile from API:", profileData.profile);
              const first = profileData.profile.first_name?.[0] || '';
              const last = profileData.profile.last_name?.[0] || '';
              const fullInitials = (first + last).toUpperCase();
              
              if (fullInitials) {
                console.log("UserNav: Setting Chrome initials:", fullInitials);
                setInitials(fullInitials);
                setDisplayName([
                  profileData.profile.first_name, 
                  profileData.profile.last_name
                ].filter(Boolean).join(' '));
                
                // Cache for Chrome
                storeProfileCache(user.id, fullInitials, displayName);
              }
            }
          }
        } catch (error) {
          console.error("UserNav: Error in Chrome setup:", error);
        }
      }
    };
    
    setupChromeProfile();
  }, [user?.id, isChromeSetup]);
  
  // Store profile in cache
  const storeProfileCache = (userId: string, userInitials: string, userName: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify({
          userId,
          initials: userInitials,
          displayName: userName,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error("UserNav: Error writing to cache:", error);
      }
    }
  };

  // Check for cached profile data first to avoid flicker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedProfile = localStorage.getItem(USER_CACHE_KEY);
        if (cachedProfile) {
          const { userId, initials: cachedInitials, displayName: cachedName } = JSON.parse(cachedProfile);
          
          // Only use cache if it matches current user
          if (userId === user?.id) {
            console.log("UserNav: Using cached profile data");
            setInitials(cachedInitials);
            setDisplayName(cachedName);
          }
        }
      } catch (error) {
        console.error("UserNav: Error reading from cache:", error);
      }
    }
  }, [user?.id]);

  // Set initial values based on email to prevent blank avatar
  useEffect(() => {
    if (user?.email && !initials) {
      const emailInitial = user.email[0].toUpperCase();
      setInitials(emailInitial);
      setDisplayName(user.email.split('@')[0]);
    }
  }, [user?.email, initials]);

  // Then fetch complete profile data
  useEffect(() => {
    if (user && !isLoading && !fetchingRef.current) {
      fetchUserProfile();
    }
  }, [user?.id, isLoading]);

  async function fetchUserProfile() {
    try {
      if (!user || !user.id || fetchingRef.current) {
        return;
      }
      
      // Set flag to prevent multiple simultaneous fetches
      fetchingRef.current = true;
      
      console.log("UserNav: Fetching profile for user", user.id);
      
      // First check if we can get first name and last name from user metadata
      let firstInitial = "";
      let lastInitial = "";
      let userDisplayName = "";
      
      if (user.user_metadata && 
          (user.user_metadata.first_name || user.user_metadata.last_name)) {
        console.log("UserNav: Using metadata for initials");
        firstInitial = user.user_metadata.first_name ? user.user_metadata.first_name[0] : "";
        lastInitial = user.user_metadata.last_name ? user.user_metadata.last_name[0] : "";
        userDisplayName = [user.user_metadata.first_name, user.user_metadata.last_name]
          .filter(Boolean)
          .join(" ") || user.email?.split("@")[0] || "";
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
          userDisplayName = [profile.first_name, profile.last_name]
            .filter(Boolean)
            .join(" ") || user.email?.split("@")[0] || "";
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
        userDisplayName = user.email.split("@")[0];
      }
      
      // Only set initials if we actually have some
      const userInitials = (firstInitial + lastInitial).toUpperCase();
      if (userInitials) {
        // Update state in a single batch to prevent flicker
        // Only update if different to avoid unnecessary renders
        if (userInitials !== initials || userDisplayName !== displayName) {
          console.log("UserNav: Updating initials to:", userInitials);
          setInitials(userInitials);
          setDisplayName(userDisplayName);
          
          // Cache the result to avoid flickering on next load
          storeProfileCache(user.id, userInitials, userDisplayName);
        }
      }
      
    } catch (error) {
      console.error("UserNav: Error in fetchUserProfile:", error);
      // Email fallback already set in initial useEffect
    } finally {
      fetchingRef.current = false;
    }
  }

  const handleSignOut = async () => {
    try {
      console.log("UserNav: Signing out");
      
      // Directly clear auth context first
      clearAuth();
      
      // Dispatch custom event for any other components listening
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:logout'));
      }
      
      // Clear all possible caches
      if (typeof window !== 'undefined') {
        try {
          // Clear all local storage
          localStorage.removeItem(USER_CACHE_KEY);
          
          // Try to clear any supabase auth items
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('supabase') || key.includes('auth'))) {
              localStorage.removeItem(key);
            }
          }
          
          // Clear session storage too
          sessionStorage.clear();
        } catch (error) {
          console.error("UserNav: Error clearing storage:", error);
        }
      }
      
      // First do a client-side sign out
      try {
        await supabase.auth.signOut();
      } catch (localError) {
        console.error("UserNav: Error during client-side signout:", localError);
      }
      
      // Call our API endpoint with cache-busting parameter
      try {
        const response = await fetch(`/api/auth/signout?_=${Date.now()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.error("UserNav: Sign out API request failed", response.status);
        }
      } catch (apiError) {
        console.error("UserNav: API call error:", apiError);
      }

      // Clear client-side state
      setInitials("");
      setDisplayName("");
      
      // Force full page reload with aggressive cache busting
      const timestamp = Date.now();
      console.log("UserNav: Redirecting to home with cache busting:", timestamp);
      
      // Try to clear cookies by setting an expiry date in the past
      document.cookie = "supabase-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Redirect using hard refresh
      window.location.href = `/?forcereload=${timestamp}`;
    } catch (error) {
      console.error('Error during sign out:', error);
      // If there's an error, still try to refresh the page
      window.location.href = `/?forcereload=${Date.now()}`;
    }
  };

  // If no user is found, don't render anything
  if (!user) {
    return null;
  }

  // Ensure we always have some fallback initials
  const displayInitials = initials || (user.email?.[0]?.toUpperCase() || "U");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none group">
        <Avatar className="h-8 w-8 bg-white/10 hover:bg-white/20 transition-all duration-300 ring-2 ring-white/20 group-hover:ring-white/40 rounded-none">
          <AvatarFallback className="text-white font-semibold bg-transparent">
            {displayInitials}
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
                {displayName || user.email?.split("@")[0] || "User"}
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
