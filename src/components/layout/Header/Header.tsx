'use client';

import { Search, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

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

  return (
    <header className="w-full bg-bg-light dark:bg-bg-dark border-b border-gray-200 dark:border-gray-800">
      <div className="container-width">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-content-light dark:text-content-dark">
            Rugby Team
          </Link>

          <div className="hidden md:flex items-center space-x-8">
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

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button className="p-2 hover:bg-card-bg-light dark:hover:bg-card-bg-dark rounded-full transition-colors">
              <Search className="w-5 h-5 text-content-light dark:text-content-dark" />
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="p-2 hover:bg-card-bg-light dark:hover:bg-card-bg-dark rounded-full transition-colors"
                >
                  <User className="w-5 h-5 text-content-light dark:text-content-dark" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-card-bg-light dark:hover:bg-card-bg-dark rounded-full transition-colors"
                >
                  <LogOut className="w-5 h-5 text-content-light dark:text-content-dark" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="p-2 hover:bg-card-bg-light dark:hover:bg-card-bg-dark rounded-full transition-colors"
              >
                <User className="w-5 h-5 text-content-light dark:text-content-dark" />
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 
