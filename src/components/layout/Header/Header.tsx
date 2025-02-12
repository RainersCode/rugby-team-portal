"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/auth-helpers-nextjs";
import { MobileNav } from "@/components/mobile-nav";
import UserNav from "./UserNav";
import { useLanguage } from "@/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Globe, Check } from "lucide-react";
import Image from "next/image";

type NavItem = {
  href: string;
  label: string;
};

type DropdownNavItem = {
  label: string;
  items: NavItem[];
};

type MainNavItem = NavItem | DropdownNavItem;

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();
  const { language, setLanguage, translations } = useLanguage();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setIsAdmin(profile?.role === "admin");
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const isLinkActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const isDropdownActive = (items: { href: string }[]) =>
    items.some((item) => isLinkActive(item.href));

  const mainNavItems: MainNavItem[] = [
    { href: "/", label: translations.home },
    { href: "/team", label: translations.team },
    { href: "/activities", label: translations.activities },
    { href: "/matches", label: translations.matches },
    { href: "/training", label: translations.training },
    { href: "/tournaments", label: translations.tournaments },
    {
      label: translations.media,
      items: [
        { href: "/gallery", label: translations.gallery },
        { href: "/news", label: translations.news },
        { href: "/live", label: translations.live },
        { href: "/videos", label: translations.videos },
      ],
    },
    {
      label: translations.info,
      items: [
        { href: "/about", label: translations.about },
        { href: "/contact", label: translations.contact },
      ],
    },
  ];

  const renderNavItem = (item: MainNavItem) => {
    if ("items" in item) {
      return (
        <DropdownMenu key={item.label}>
          <DropdownMenuTrigger
            className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 group inline-flex items-center ${
              isDropdownActive(item.items)
                ? "text-rugby-teal"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            {item.label}
            <ChevronDown className="ml-1 h-4 w-4" />
            {isDropdownActive(item.items) ? (
              <>
                <span className="absolute inset-x-1 -bottom-px h-0.5 bg-gradient-to-r from-rugby-teal via-rugby-teal/80 to-rugby-teal animate-shimmer" />
                <span className="absolute -inset-1 rounded-lg bg-rugby-teal/10 scale-90" />
              </>
            ) : (
              <span className="absolute inset-x-1 -bottom-px h-0.5 bg-gradient-to-r from-rugby-teal to-rugby-teal/60 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-56 bg-rugby-teal/95 border-none shadow-lg backdrop-blur-sm p-0"
          >
            {item.items.map((subItem: NavItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                passHref
                className="w-full"
              >
                <DropdownMenuItem
                  className={`w-full px-6 py-3 cursor-pointer text-white hover:bg-white/10 transition-colors duration-200 ${
                    isLinkActive(subItem.href) ? "bg-white/20" : ""
                  }`}
                >
                  {subItem.label}
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 group ${
          isLinkActive(item.href)
            ? "text-rugby-teal"
            : "text-foreground/60 hover:text-foreground"
        }`}
      >
        {item.label}
        {isLinkActive(item.href) ? (
          <>
            <span className="absolute inset-x-1 -bottom-px h-0.5 bg-gradient-to-r from-rugby-teal via-rugby-teal/80 to-rugby-teal animate-shimmer" />
            <span className="absolute -inset-1 rounded-lg bg-rugby-teal/10 scale-90" />
          </>
        ) : (
          <span className="absolute inset-x-1 -bottom-px h-0.5 bg-gradient-to-r from-rugby-teal to-rugby-teal/60 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
        )}
      </Link>
    );
  };

  const LanguageSwitcher = () => {
    const handleLanguageChange = (newLang: 'en' | 'lv') => {
      console.log('Language switcher: changing to', newLang);
      setLanguage(newLang);
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <Globe className="w-4 h-4 mr-1.5" />
          <span className="font-medium">{language === 'en' ? 'EN' : 'LV'}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[140px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg p-1">
          <DropdownMenuItem
            onClick={() => handleLanguageChange('en')}
            className="flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center">
              <span className="mr-2">🇬🇧</span>
              <span>English</span>
            </div>
            {language === 'en' && <Check className="w-4 h-4 text-rugby-teal" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleLanguageChange('lv')}
            className="flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center">
              <span className="mr-2">🇱🇻</span>
              <span>Latviešu</span>
            </div>
            {language === 'lv' && <Check className="w-4 h-4 text-rugby-teal" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-card-bg-light/75 dark:bg-card-bg-dark/75 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20" />
      <div className="container-width mx-auto flex h-16 items-center px-4 relative">
        {/* Mobile Layout */}
        <div className="flex w-full items-center justify-between md:hidden">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="group flex items-center hover:opacity-90 transition-all duration-200"
            >
              <Image
                src="/fnx-logo/fēniks_logo-removebg-preview.png"
                alt="Rugby Club Logo"
                width={50}
                height={20}
                className="object-contain mb-1"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <MobileNav />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex w-full items-center justify-between">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="group flex items-center hover:opacity-90 transition-all duration-200"
            >
              <Image
                src="/fnx-logo/fēniks_logo-removebg-preview.png"
                alt="Rugby Club Logo"
                width={70}
                height={25}
                className="object-contain mb-1"
              />
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            {mainNavItems.map(renderNavItem)}
          </nav>
          <div className="flex items-center space-x-6 flex-shrink-0">
            <LanguageSwitcher />
            {user ? (
              <UserNav user={user} isAdmin={isAdmin} />
            ) : (
              <Link
                href="/auth/signin"
                className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-rugby-teal px-6 py-2 text-sm font-medium text-white hover:scale-105 transition-all duration-300 shadow-lg shadow-rugby-teal/20 hover:shadow-xl hover:shadow-rugby-teal/30"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-rugby-teal via-rugby-teal/80 to-rugby-teal opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative font-semibold tracking-wide">
                  {translations.signIn || 'Sign In'}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
