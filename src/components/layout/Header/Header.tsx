'use client';

import { Search, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const Header = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  const mainNavItems = [
    { label: 'News', href: '/news' },
    { label: 'Team', href: '/team' },
    { label: 'Shop', href: '/shop' },
    { label: 'Matches', href: '/matches' },
    { label: 'Members', href: '/members' },
    { label: 'Club', href: '/club' },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const renderNavItems = () => (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-8">
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-content-medium dark:text-content-medium hover:text-primary-blue dark:hover:text-accent-blue transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );

  return (
    <header className="w-full bg-bg-light dark:bg-bg-dark border-b border-gray-200 dark:border-gray-800">
      <div className="container-width">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-content-light dark:text-content-dark">
            Rugby Team
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {renderNavItems()}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <button className="p-2 hover:bg-card-bg-light dark:hover:bg-card-bg-dark rounded-full transition-colors">
                <Search className="w-5 h-5 text-content-light dark:text-content-dark" />
              </button>
              {user ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="flex items-center gap-2"
                >
                  <Link href="/auth/signin">
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-card-bg-light dark:hover:bg-card-bg-dark transition-colors"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[300px] sm:w-[400px] p-0 bg-bg-light dark:bg-bg-dark border-l border-gray-200 dark:border-gray-800"
              >
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <SheetTitle>Menu</SheetTitle>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 hover:bg-card-bg-light dark:hover:bg-card-bg-dark transition-colors" 
                        asChild
                      >
                        <SheetClose>
                          <X className="h-5 w-5" />
                          <span className="sr-only">Close</span>
                        </SheetClose>
                      </Button>
                    </div>
                  </SheetHeader>
                  <div className="flex-1 overflow-auto px-6">
                    <div className="py-6 border-b">
                      {renderNavItems()}
                    </div>
                    <div className="py-6">
                      <div className="flex items-center justify-between mb-6">
                        <ThemeToggle />
                        <button className="p-2 hover:bg-card-bg-light dark:hover:bg-card-bg-dark rounded-full transition-colors">
                          <Search className="w-5 h-5 text-content-light dark:text-content-dark" />
                        </button>
                      </div>
                      {user ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSignOut}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          asChild
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Link href="/auth/signin">
                            Sign In
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 
