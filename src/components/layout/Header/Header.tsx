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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex w-full items-center justify-between">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/" className="flex items-center mr-8">
              <span className="font-bold text-lg">Rugby Club</span>
            </Link>
            <nav className="flex items-center space-x-8 text-sm font-medium">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <UserNav user={user} />
            ) : (
              <Link href="/auth/signin" className="text-sm font-medium">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
