import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold text-secondary-navy">Check Your Email</h2>
        <div className="mt-4 text-gray-600">
          <p className="mb-4">
            We've sent you an email with a link to verify your account.
            Please check your inbox and click the link to complete your registration.
          </p>
          <p className="text-sm">
            Didn't receive an email?{' '}
            <Link href="/auth/signin" className="text-primary-blue hover:text-accent-blue">
              Try signing in again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 