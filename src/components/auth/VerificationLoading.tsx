'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerificationLoading() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your email...');
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animate the dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Update messages over time to keep user informed
    const messages = [
      { time: 0, text: 'Verifying your email' },
      { time: 2000, text: 'Setting up your account' },
      { time: 4000, text: 'Almost there' },
    ];

    messages.forEach(({ time, text }) => {
      setTimeout(() => setMessage(text), time);
    });

    // Redirect after verification is likely complete
    const redirectTimeout = setTimeout(() => {
      window.location.href = '/';
    }, 6000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(redirectTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900 p-4">
      <div className="max-w-md w-full space-y-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 text-rugby-teal animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {message}{dots}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please wait while we complete your account setup
          </p>
        </div>
      </div>
    </div>
  );
} 