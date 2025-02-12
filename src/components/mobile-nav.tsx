"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/auth-helpers-nextjs";
import UserNav from "@/components/layout/Header/UserNav";
import {
  Menu,
  Home,
  Users,
  Trophy,
  Newspaper,
  Info,
  Mail,
  Twitter,
  Instagram,
  Facebook,
  ArrowRight,
  Dumbbell,
  Calendar,
  Play,
  Image,
  Globe,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";

const mainNavItems = [
  { href: "/", label: "home", icon: Home },
  { href: "/team", label: "team", icon: Users },
  { href: "/matches", label: "matches", icon: Trophy },
  { href: "/training", label: "training", icon: Dumbbell },
  { href: "/activities", label: "activities", icon: Calendar },
  { href: "/live", label: "live", icon: Play },
  { href: "/gallery", label: "gallery", icon: Image },
  { href: "/news", label: "news", icon: Newspaper },
  { href: "/about", label: "about", icon: Info },
  { href: "/contact", label: "contact", icon: Mail },
];

const adminNavItems = [
  { href: "/admin", label: "adminPanel" },
  { href: "/admin/players", label: "team" },
  { href: "/admin/matches", label: "matches" },
  { href: "/admin/activities", label: "activities" },
  { href: "/admin/articles", label: "news" },
  { href: "/admin/live", label: "live" },
  { href: "/admin/gallery", label: "gallery" },
  { href: "/admin/about", label: "about" },
];

const socialLinks = [
  {
    href: "https://twitter.com/rugbyteam",
    icon: Twitter,
    color: "text-blue-400 hover:text-blue-500",
  },
  {
    href: "https://instagram.com/rugbyteam",
    icon: Instagram,
    color: "text-pink-500 hover:text-pink-600",
  },
  {
    href: "https://facebook.com/rugbyteam",
    icon: Facebook,
    color: "text-blue-600 hover:text-blue-700",
  },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const { language, setLanguage, translations } = useLanguage();

  useEffect(() => {
    checkUserRole();
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      await checkUserRole(); // Re-check role when auth state changes
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    } catch (error) {
      console.error("Error checking user role:", error);
      setIsAdmin(false);
    }
  };

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  };

  const LanguageSwitcher = () => {
    const handleLanguageChange = (newLang: 'en' | 'lv') => {
      console.log('Language switcher: changing to', newLang);
      setLanguage(newLang);
      setIsOpen(false);
    };

    return (
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-medium text-muted-foreground">{translations.language}</div>
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                language === 'en' ? 'bg-rugby-teal text-white' : 'hover:bg-rugby-teal/10'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">🇬🇧</span>
                <span>English</span>
              </div>
              {language === 'en' && <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleLanguageChange('lv')}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                language === 'lv' ? 'bg-rugby-teal text-white' : 'hover:bg-rugby-teal/10'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">🇱🇻</span>
                <span>Latviešu</span>
              </div>
              {language === 'lv' && <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden group"
        >
          <div className="flex flex-col gap-1.5 items-center justify-center w-6">
            <div className="w-6 h-[2px] bg-rugby-teal transition-all duration-200 group-hover:w-5" />
            <div className="w-5 h-[2px] bg-rugby-teal transition-all duration-200 group-hover:w-4" />
            <div className="w-4 h-[2px] bg-rugby-teal transition-all duration-200 group-hover:w-6" />
          </div>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] bg-card-bg-light dark:bg-card-bg-dark border-l border-gray-200 dark:border-gray-800 p-0 transition-transform duration-300 ease-in-out"
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <SheetTitle
                className="text-2xl font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #00796B 0%, #009688 50%, #4DB6AC 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                RK "Fēnikss"
              </SheetTitle>
              <div className="flex items-center">
                {user ? (
                  <UserNav user={user} />
                ) : (
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium text-rugby-teal hover:text-rugby-teal/80"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-foreground/80 dark:text-foreground/80">
              
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="px-6 py-4">
              <Link href="/contact">
                <Button
                  className="w-full mb-6 relative overflow-hidden group bg-rugby-teal hover:bg-rugby-teal/90"
                >
                  <span className="relative flex items-center justify-center gap-2 text-white font-semibold py-1">
                    {language === 'en' ? 'Contact Us' : 'Sazinies ar mums'} <ArrowRight className="w-4 h-4 animate-pulse" />
                  </span>
                </Button>
              </Link>

              <nav className="flex flex-col space-y-2">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 text-base rounded-md transition-colors flex items-center gap-3 ${
                      pathname === item.href
                        ? "bg-rugby-teal text-white font-medium"
                        : "text-muted-foreground hover:bg-rugby-teal/10"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-white' : 'text-rugby-teal'}`} />
                    <span className="font-medium">{translations[item.label]}</span>
                  </Link>
                ))}
              </nav>

              {isAdmin && (
                <div className="mt-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="admin-nav" className="border-none">
                      <AccordionTrigger className="flex items-center gap-3 py-3 text-base font-medium hover:no-underline hover:bg-rugby-teal/10 rounded-lg px-4 transition-colors text-rugby-teal">
                        <Menu className="w-5 h-5" />
                        {translations.adminPanel}
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-3">
                        <div className="flex flex-col space-y-2">
                          {adminNavItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className={`px-4 py-3.5 text-base rounded-md transition-colors flex items-center gap-3 min-h-[48px] ${
                                pathname === item.href
                                  ? "bg-rugby-teal text-white font-medium"
                                  : "text-muted-foreground hover:bg-rugby-teal/10"
                              }`}
                            >
                              <span className="font-medium">{translations[item.label]}</span>
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </div>
          </div>

          <LanguageSwitcher />

          <div className="border-t border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex justify-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rugby-teal hover:text-rugby-teal/80 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Rugby Team Portal v1.0
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
