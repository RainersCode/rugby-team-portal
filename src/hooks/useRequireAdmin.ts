'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useRequireAdmin() {
  const { user, isAdmin, isLoading, refreshAuth } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      console.log("useRequireAdmin: Checking admin status");
      
      if (isLoading) {
        console.log("useRequireAdmin: Auth is still loading");
        return;
      }
      
      if (!user) {
        console.log("useRequireAdmin: No user, redirecting to login");
        router.push('/auth/signin?redirect=/admin');
        return;
      }
      
      // Refresh auth to make sure we have the latest status
      try {
        if (!adminChecked) {
          console.log("useRequireAdmin: Refreshing auth to check admin status");
          await refreshAuth();
          setAdminChecked(true);
        }
        
        if (isAdmin) {
          console.log("useRequireAdmin: User is admin, allowing access");
          setIsReady(true);
        } else {
          console.log("useRequireAdmin: User is not admin, redirecting to home");
          router.push('/');
        }
      } catch (error) {
        console.error("useRequireAdmin: Error checking admin status", error);
        router.push('/');
      }
    };
    
    checkAdmin();
  }, [user, isAdmin, isLoading, router, adminChecked, refreshAuth]);
  
  return { isReady, isAdmin, user };
} 