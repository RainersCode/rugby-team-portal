'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/';
  const { translations } = useLanguage();
  const { refreshAuth } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Call our API endpoint
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      // Successfully signed in - refresh the auth context
      await refreshAuth();
      
      // Redirect to the specified page
      router.push(redirectTo);
    } catch (error) {
      setError(error instanceof Error ? error.message : translations.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900 p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <img 
              src="/fnx-logo/fēniks_logo-removebg-preview.png" 
              alt="Rugby Club Logo" 
              className="h-16 w-auto"
            />
          </div>
          <p className="text-muted-foreground font-medium">{translations.signIn}</p>
        </div>

        {/* Card Container */}
        <div className="bg-card backdrop-blur-xl border border-rugby-teal/20 rounded-none shadow-lg p-6 md:p-8 space-y-6 transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSignIn}>
            {error && (
              <div className="bg-rugby-red/10 text-rugby-red p-4 rounded-none text-sm font-medium animate-shake">
                <p className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-none bg-rugby-red" />
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1.5">
                  {translations.email || 'Email address'}
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
                    className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-gray-900/50 border border-rugby-teal/20 rounded-none shadow-none transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rugby-teal focus:border-rugby-teal"
                    placeholder={translations.enterEmail || "Enter your email"}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1.5">
                  {translations.password || 'Password'}
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
                    className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-gray-900/50 border border-rugby-teal/20 rounded-none shadow-none transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rugby-teal focus:border-rugby-teal"
                    placeholder={translations.enterPassword || "Enter your password"}
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
                {translations.forgotPassword || 'Forgot password?'}
              </Link>
              <Link 
                href="/auth/signup"
                className="text-rugby-teal hover:text-rugby-teal/80 transition-colors font-medium"
              >
                {translations.createAccount || 'Create account'}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-rugby-teal hover:bg-rugby-teal/90 rounded-none transition-all duration-200 disabled:opacity-50 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {translations.signingIn || 'Signing in...'}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:translate-x-[-2px]" />
                  {translations.signIn}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 