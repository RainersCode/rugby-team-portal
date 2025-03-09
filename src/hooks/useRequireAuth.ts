'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type UseRequireAuthOptions = {
  redirectTo?: string;
  requireAdmin?: boolean;
};

export function useRequireAuth({
  redirectTo = '/auth/signin',
  requireAdmin = false,
}: UseRequireAuthOptions = {}) {
  const { user, isLoading, isAdmin, refreshAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // If still loading, wait
      if (isLoading) return;
      
      // Refresh auth state to ensure it's current
      await refreshAuth();
      
      // If user is not authenticated, redirect
      if (!user) {
        const encodedRedirect = encodeURIComponent(pathname);
        router.push(`${redirectTo}?redirect=${encodedRedirect}`);
        return;
      }
      
      // If admin is required but user is not admin, redirect to home
      if (requireAdmin && !isAdmin) {
        router.push('/');
        return;
      }
      
      // Auth check passed
      setIsReady(true);
    };
    
    checkAuth();
  }, [user, isLoading, isAdmin, router, pathname, redirectTo, requireAdmin, refreshAuth]);
  
  return { isReady, user, isAdmin };
} 