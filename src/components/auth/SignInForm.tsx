'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') || '/';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Reset loading state since we're about to navigate
      setLoading(false);
      
      // Navigate to the redirect URL
      if (redirectTo === window.location.pathname) {
        // If we're already on the redirect page, just refresh
        router.refresh();
      } else {
        router.push(redirectTo);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900 p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #00796B 0%, #009688 50%, #4DB6AC 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Rugby Club
          </h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Card Container */}
        <div className="bg-card backdrop-blur-xl border border-rugby-teal/20 rounded-2xl shadow-xl shadow-rugby-teal/10 p-6 md:p-8 space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-rugby-teal/20">
          <form className="space-y-6" onSubmit={handleSignIn}>
            {error && (
              <div className="bg-rugby-red/10 text-rugby-red p-4 rounded-lg text-sm font-medium animate-shake">
                <p className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rugby-red" />
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-gray-900/50 border border-rugby-teal/20 rounded-lg shadow-sm transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rugby-teal/20 focus:border-rugby-teal"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-gray-900/50 border border-rugby-teal/20 rounded-lg shadow-sm transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rugby-teal/20 focus:border-rugby-teal"
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/reset-password"
                className="text-rugby-teal hover:text-rugby-teal/80 transition-colors font-medium"
              >
                Forgot password?
              </Link>
              <Link 
                href="/auth/signup"
                className="text-rugby-teal hover:text-rugby-teal/80 transition-colors font-medium"
              >
                Create account
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-rugby-teal hover:bg-rugby-teal/90 rounded-lg transition-all duration-200 transform hover:translate-y-[-1px] hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:translate-x-[-2px]" />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 