import { Suspense } from 'react';
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-[600px] flex items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <UpdatePasswordForm />
      </Suspense>
    </div>
  );
} 