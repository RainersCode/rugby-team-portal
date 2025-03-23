'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function useRequireAdmin() {
  const { user, isAdmin, isLoading, isAdminVerifying, refreshAuth } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const delayedCheckRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Cleanup function to clear any active timeout
  useEffect(() => {
    return () => {
      if (delayedCheckRef.current) {
        clearTimeout(delayedCheckRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      console.log("useRequireAdmin: Checking admin status", { retryCount });
      
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
      } else if (retryCount < 5) {
        // Not yet admin, but we still have retries left
        console.log(`useRequireAdmin: Not yet admin, scheduling retry #${retryCount + 1}`);
        
        // Schedule a delayed retry with increasing delay
        const delay = Math.min(1000 * Math.pow(1.5, retryCount), 8000); // max 8 seconds
        
        // Clear any existing timeout
        if (delayedCheckRef.current) {
          clearTimeout(delayedCheckRef.current);
        }
        
        delayedCheckRef.current = setTimeout(async () => {
          console.log(`useRequireAdmin: Executing delayed admin check #${retryCount + 1}`);
          
          try {
            // Try direct database query as a more reliable check
            const supabase = createClientComponentClient();
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();
              
            if (!error && profile?.role === 'admin') {
              console.log("useRequireAdmin: Delayed check found admin status");
              setIsReady(true);
              return;
            }
            
            // Admin check failed, increment retry counter
            console.log("useRequireAdmin: Delayed check failed, will retry");
            setRetryCount(prev => prev + 1);
            
            // Also try refreshing auth again
            await refreshAuth();
          } catch (error) {
            console.error("useRequireAdmin: Error in delayed check", error);
            setRetryCount(prev => prev + 1);
          }
        }, delay);
      } else {
        // We've exhausted our retries, redirect to home
        console.log("useRequireAdmin: Exhausted retries, user is not admin");
        router.push('/');
      }
    };
    
    checkAdmin();
  }, [user, isAdmin, isLoading, isAdminVerifying, router, adminChecked, refreshAuth, verificationAttempted, retryCount]);
  
  return { isReady, isAdmin, user };
} 