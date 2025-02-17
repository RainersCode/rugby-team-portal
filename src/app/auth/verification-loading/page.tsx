import { Suspense } from 'react';
import VerificationLoading from '@/components/auth/VerificationLoading';

export default function VerificationLoadingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationLoading />
    </Suspense>
  );
} 