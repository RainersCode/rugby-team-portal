'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ResetPasswordRequestForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { translations } = useLanguage();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password/update`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : translations.error);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900 p-4">
        <div className="max-w-md w-full space-y-8 p-6 bg-white dark:bg-gray-800 rounded-none shadow-md">
          <div>
            <h2 className="text-3xl font-bold text-center text-rugby-teal mb-2">{translations.checkYourEmail || 'Check Your Email'}</h2>
            <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
              {translations.resetEmailSent || "We've sent you an email with a link to reset your password. Please check your inbox and click the link to continue."}
            </p>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {translations.didntReceiveEmail || "Didn't receive the email?"}{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-rugby-teal hover:text-rugby-teal/80 transition-colors font-medium"
              >
                {translations.tryAgain || 'Try again'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <img 
              src="/fnx-logo/fēniks_logo-removebg-preview.png" 
              alt="Rugby Club Logo" 
              className="h-16 w-auto"
            />
          </div>
          <p className="text-muted-foreground font-medium">{translations.resetPasswordInstructions || 'Enter your email to reset your password'}</p>
        </div>

        <div className="bg-card backdrop-blur-xl border border-rugby-teal/20 rounded-none shadow-lg p-6 md:p-8 space-y-6 transition-all duration-300">
          <form className="space-y-6" onSubmit={handleResetRequest}>
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
                  {translations.sendingResetLink || 'Sending reset link...'}
                </>
              ) : (
                translations.sendResetLink || 'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 