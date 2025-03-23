'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useRequireAdmin() {
  const { user, isAdmin, isLoading, isAdminVerifying, refreshAuth } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      console.log("useRequireAdmin: Checking admin status");
      
      // If we're still loading auth state, wait
      if (isLoading) {
        console.log("useRequireAdmin: Auth is still loading");
        return;
      }
      
      // If there's no user, redirect to login
      if (!user) {
        console.log("useRequireAdmin: No user, redirecting to login");
        router.push('/auth/signin?redirect=/admin');
        return;
      }
      
      // If we haven't attempted verification yet, do it now
      if (!verificationAttempted) {
        console.log("useRequireAdmin: Starting admin verification");
        setVerificationAttempted(true);
        
        try {
          // Refresh auth to ensure we have the latest status
          if (!adminChecked) {
            console.log("useRequireAdmin: Refreshing auth to check admin status");
            await refreshAuth();
            setAdminChecked(true);
          }
        } catch (error) {
          console.error("useRequireAdmin: Error refreshing auth", error);
        }
        
        return; // Wait for the next render cycle after refreshAuth
      }
      
      // If we're actively verifying admin status, wait
      if (isAdminVerifying) {
        console.log("useRequireAdmin: Admin verification in progress");
        return;
      }
      
      // At this point, verification has been attempted and completed
      
      // User is admin, allow access
      if (isAdmin) {
        console.log("useRequireAdmin: User is admin, allowing access");
        setIsReady(true);
      } else {
        // User is not admin, redirect to home
        console.log("useRequireAdmin: User is not admin, redirecting to home");
        router.push('/');
      }
    };
    
    checkAdmin();
  }, [user, isAdmin, isLoading, isAdminVerifying, router, adminChecked, refreshAuth, verificationAttempted]);
  
  return { isReady, isAdmin, user };
} 