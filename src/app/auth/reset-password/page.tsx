import { Suspense } from 'react';
import ResetPasswordRequestForm from '@/components/auth/ResetPasswordRequestForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[600px] flex items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordRequestForm />
      </Suspense>
    </div>
  );
} 