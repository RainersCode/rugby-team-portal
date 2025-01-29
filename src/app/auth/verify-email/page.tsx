'use client';

import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-secondary-navy">Check Your Email</h2>
          <p className="mt-4 text-center text-gray-600">
            We&apos;ve sent you an email with a link to verify your account. Please check your inbox and click the link to complete your registration.
          </p>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the email?{' '}
            <Link href="/auth/signin" className="text-primary-blue hover:text-accent-blue">
              Try signing in again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 