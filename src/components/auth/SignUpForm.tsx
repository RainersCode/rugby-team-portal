'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { translations } = useLanguage();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(translations.passwordsDoNotMatch || 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(translations.passwordTooShort || 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: '',
            last_name: '',
            role: 'user'
          }
        },
      });

      if (error) throw error;

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError(translations.emailAlreadyRegistered || 'This email is already registered. Please sign in instead.');
        return;
      }

      // Show success message and redirect to verify email page
      router.push('/auth/verify-email');
    } catch (error) {
      setError(error instanceof Error ? error.message : translations.error);
    } finally {
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
          <p className="text-muted-foreground font-medium">{translations.createAccount || 'Create your account'}</p>
        </div>

        {/* Card Container */}
        <div className="bg-card backdrop-blur-xl border border-rugby-teal/20 rounded-none shadow-lg p-6 md:p-8 space-y-6 transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSignUp}>
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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-gray-900/50 border border-rugby-teal/20 rounded-none shadow-none transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rugby-teal focus:border-rugby-teal"
                    placeholder={translations.createPassword || "Create a password"}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80 mb-1.5">
                  {translations.confirmPassword || 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-gray-900/50 border border-rugby-teal/20 rounded-none shadow-none transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rugby-teal focus:border-rugby-teal"
                    placeholder={translations.confirmYourPassword || "Confirm your password"}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center text-sm">
              <Link 
                href="/auth/signin" 
                className="text-rugby-teal hover:text-rugby-teal/80 transition-colors font-medium inline-flex items-center gap-1.5 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[-2px]" />
                {translations.backToSignIn || 'Back to sign in'}
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
                  {translations.creatingAccount || 'Creating account...'}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:translate-x-[-2px]" />
                  {translations.createAccount || 'Create account'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 