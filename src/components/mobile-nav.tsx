"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import UserNav from "@/components/layout/Header/UserNav";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  Home,
  Users,
  Trophy,
  Newspaper,
  Info,
  Mail,
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
  { href: "/admin/tournaments", label: "tournaments" },
  { href: "/admin/activities", label: "activities" },
  { href: "/admin/articles", label: "news" },
  { href: "/admin/live", label: "live" },
  { href: "/admin/gallery", label: "gallery" },
  { href: "/admin/about", label: "about" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/rk_fenikss/",
    icon: Instagram,
    label: "Instagram",
  },
  {
    href: "https://www.facebook.com/RKFenikss",
    icon: Facebook,
    label: "Facebook",
  },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { language, setLanguage, translations } = useLanguage();

  const LanguageSwitcher = () => {
    const handleLanguageChange = (newLang: 'en' | 'lv') => {
      console.log('Language switcher: changing to', newLang);
      setLanguage(newLang);
      setIsOpen(false);
    };

    return (
      <div className="px-6 py-4 border-t border-white/20">
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-medium text-white/80">{translations.language}</div>
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-none transition-colors ${
                language === 'en' ? 'bg-white text-rugby-teal' : 'text-white hover:bg-white/10'
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
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-none transition-colors ${
                language === 'lv' ? 'bg-white text-rugby-teal' : 'text-white hover:bg-white/10'
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
          className="mr-2 px-2 text-base hover:bg-white/5 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden group rounded-none"
        >
          <div className="flex flex-col gap-1.5 items-center justify-center w-6">
            <div className="w-6 h-[2px] bg-rugby-teal transition-all duration-200 group-hover:bg-rugby-teal/80 group-hover:w-5" />
            <div className="w-5 h-[2px] bg-rugby-teal transition-all duration-200 group-hover:bg-rugby-teal/80 group-hover:w-4" />
            <div className="w-4 h-[2px] bg-rugby-teal transition-all duration-200 group-hover:bg-rugby-teal/80 group-hover:w-6" />
          </div>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] bg-rugby-teal dark:bg-rugby-teal border-l border-white/20 p-0 transition-transform duration-300 ease-in-out"
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/20 bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <SheetTitle
                className="text-2xl font-bold text-white"
              >
                RK "Fēnikss"
              </SheetTitle>
              <div className="flex items-center">
                {user ? (
                  <UserNav user={user} />
                ) : (
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/auth/signin');
                    }}
                    className="inline-flex items-center justify-center rounded-none text-sm font-medium text-white bg-rugby-teal hover:bg-rugby-teal-light h-9 px-4 py-2 transition-colors"
                  >
                    {translations.signIn || 'Sign In'}
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-white/80">
              
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="px-6 py-4">
              <Link href="/contact">
                <Button
                  className="w-full mb-6 relative overflow-hidden group bg-white hover:bg-white/90 rounded-none"
                >
                  <span className="relative flex items-center justify-center gap-2 text-rugby-teal font-semibold py-1">
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
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-none transition-colors ${
                      pathname === item.href
                        ? "bg-white text-rugby-teal"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{translations[item.label]}</span>
                  </Link>
                ))}
              </nav>

              {isAdmin && (
                <div className="mt-6 border-t border-white/20 pt-6">
                  <div className="text-sm font-medium text-white/80 mb-3">
                    {translations.adminPanel}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {adminNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-none transition-colors ${
                          pathname === item.href
                            ? "bg-white text-rugby-teal"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        <span>{translations[item.label]}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <LanguageSwitcher />

          <div className="border-t border-white/20 p-6 space-y-4">
            <div className="flex items-center justify-center gap-4 mt-6">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-none transition-all duration-300"
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-white/80 text-center">
              Rugby Team Portal v1.0
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
