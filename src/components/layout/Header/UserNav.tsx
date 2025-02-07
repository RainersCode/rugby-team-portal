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
  Settings,
  LayoutDashboard,
  FileText,
  Calendar,
  LogOut,
  Dumbbell,
  Image,
  Play
} from "lucide-react";

interface UserNavProps {
  user: User;
}

export default function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
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
        setIsAdmin(profile.role === "admin");
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
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer">
            Settings
          </DropdownMenuItem>
        </Link>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <Link href="/admin">
              <DropdownMenuItem className="cursor-pointer flex items-center">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Admin Dashboard
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/players">
              <DropdownMenuItem className="cursor-pointer flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Manage Players
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/articles">
              <DropdownMenuItem className="cursor-pointer flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Manage Articles
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/matches">
              <DropdownMenuItem className="cursor-pointer flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Matches
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/training">
              <DropdownMenuItem className="cursor-pointer flex items-center">
                <Dumbbell className="w-4 h-4 mr-2" />
                Manage Training
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/gallery">
              <DropdownMenuItem className="cursor-pointer flex items-center">
                <Image className="w-4 h-4 mr-2" />
                Manage Gallery
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/live">
              <DropdownMenuItem className="cursor-pointer flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Manage Live Streams
              </DropdownMenuItem>
            </Link>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 flex items-center"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
