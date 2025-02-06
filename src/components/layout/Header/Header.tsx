"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/auth-helpers-nextjs";
import { MobileNav } from "@/components/mobile-nav";
import UserNav from "./UserNav";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const mainNavItems = [
  { href: "/", label: "Home" },
  { href: "/team", label: "Team" },
  { href: "/matches", label: "Matches" },
  { href: "/training", label: "Training" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-card-bg-light/75 dark:bg-card-bg-dark/75 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20" />
      <div className="container-width mx-auto flex h-16 items-center px-4 relative">
        <div className="md:hidden">
          <MobileNav />
        </div>
        <div className="hidden md:flex w-full items-center justify-between">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="group flex items-center hover:opacity-90 transition-all duration-200"
            >
              <span
                className="text-xl font-bold relative"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                Rugby Club
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-300 group-hover:w-full" />
              </span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
                )}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-6 flex-shrink-0">
            <ThemeToggle />
            {user ? (
              <UserNav user={user} />
            ) : (
              <Link
                href="/auth/signin"
                className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-105 duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
