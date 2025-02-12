'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error parameters in URL
    const errorCode = searchParams?.get('error_code');
    const errorDescription = searchParams?.get('error_description');
    
    if (errorCode === 'otp_expired') {
      setError('The password reset link has expired. Please request a new one.');
    } else if (errorDescription) {
      setError(decodeURIComponent(errorDescription));
    }
  }, [searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // First check if we have an active session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Your password reset link has expired. Please request a new one.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Redirect to sign in page after successful password update
      router.push('/auth/signin?message=Password updated successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setLoading(false);
    }
  };

  // If there's an error about expired link or missing session, show a different view
  if (error?.includes('expired') || error?.includes('invalid')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900 p-4">
        <div className="max-w-md w-full">
          <div className="bg-card backdrop-blur-xl border border-rugby-teal/20 rounded-2xl shadow-xl shadow-rugby-teal/10 p-6 md:p-8 space-y-6 transition-all duration-300">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-rugby-teal">Link Expired</h2>
              <p className="text-muted-foreground">
                {error}
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/reset-password"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-rugby-teal hover:bg-rugby-teal/90 rounded-lg transition-all duration-200"
                >
                  Request New Reset Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900 p-4">
      <div className="max-w-md w-full">
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
            Set New Password
          </h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <div className="bg-card backdrop-blur-xl border border-rugby-teal/20 rounded-2xl shadow-xl shadow-rugby-teal/10 p-6 md:p-8 space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-rugby-teal/20">
          <form className="space-y-6" onSubmit={handleUpdatePassword}>
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
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1.5">
                  New Password
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
                    className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-gray-900/50 border border-rugby-teal/20 rounded-lg shadow-sm transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rugby-teal/20 focus:border-rugby-teal"
                    placeholder="Enter new password"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80 mb-1.5">
                  Confirm New Password
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
                    className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-gray-900/50 border border-rugby-teal/20 rounded-lg shadow-sm transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rugby-teal/20 focus:border-rugby-teal"
                    placeholder="Confirm new password"
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
                Back to sign in
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
                  Updating password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 