'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * Hook to verify if the current user is an admin
 * Enhanced with better session persistence and recovery
 */
export function useRequireAdmin() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const loginInProgressRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  // Check if there's a clear parameter in the URL
  const clearRequested = searchParams?.get('clear') === '1';
  
  // If clear is requested, clear sessionStorage
  useEffect(() => {
    if (clearRequested && typeof window !== 'undefined') {
      console.log('Clearing session storage as requested');
      sessionStorage.removeItem('rk-admin-status');
      sessionStorage.removeItem('rk-admin-user');
      sessionStorage.removeItem('admin-dashboard-stats');
    }
  }, [clearRequested]);

  // Function to check admin status
  const checkAdmin = useCallback(async () => {
    try {
      if (loginInProgressRef.current) {
        console.log('Login already in progress, skipping duplicate check');
        return;
      }
      
      loginInProgressRef.current = true;
      setIsLoading(true);
      
      console.log('useRequireAdmin: Starting admin check');
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (!session) {
        console.log('No session found, redirecting to login');
        setIsReady(true);
        setIsAdmin(false);
        setUser(null);
        
        // Clear any cached admin status
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.removeItem('rk-admin-status');
            sessionStorage.removeItem('rk-admin-user');
          } catch (e) {
            console.warn('Error accessing sessionStorage:', e);
          }
        }
        
        // Use a short delay before redirecting to avoid flash of content
        setTimeout(() => {
          const currentUrl = window.location.pathname;
          router.push(`/auth/signin?redirect=${encodeURIComponent(currentUrl)}`);
        }, 100);
        
        return;
      }
      
      setSessionChecked(true);
      console.log('Session found, checking admin status');
      
      // Check if the user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      const isUserAdmin = profile?.role === 'admin';
      console.log('Admin check result:', isUserAdmin);
      
      // Cache the admin status and user data in sessionStorage
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('rk-admin-status', isUserAdmin ? 'true' : 'false');
          sessionStorage.setItem('rk-admin-user', JSON.stringify(session.user));
        } catch (e) {
          console.warn('Error saving to sessionStorage:', e);
        }
      }
      
      setUser(session.user);
      setIsAdmin(isUserAdmin);
      
      if (!isUserAdmin) {
        // If not admin, redirect to home
        toast.error('You do not have permission to access the admin area');
        router.push('/');
      }
      
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setUser(null);
      
      // Only redirect if this is the first check and we haven't checked session yet
      if (!sessionChecked) {
        const currentUrl = window.location.pathname;
        router.push(`/auth/signin?redirect=${encodeURIComponent(currentUrl)}`);
      }
    } finally {
      setIsReady(true);
      setIsLoading(false);
      loginInProgressRef.current = false;
    }
  }, [router, supabase, sessionChecked]);

  // Keep track of auth state across page navigations
  useEffect(() => {
    // Check for forced admin session (development only)
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const forceAdmin = localStorage.getItem('force-admin') === 'true';
      if (forceAdmin) {
        console.log('DEVELOPMENT MODE: Forcing admin access');
        setIsAdmin(true);
        setIsReady(true);
        setIsLoading(false);
        return;
      }
    }
  
    // Try to restore from sessionStorage first (faster than waiting for Supabase)
    if (typeof window !== 'undefined') {
      try {
        const cachedAdmin = sessionStorage.getItem('rk-admin-status');
        const cachedUser = sessionStorage.getItem('rk-admin-user');
        
        if (cachedAdmin === 'true' && cachedUser) {
          console.log('Found cached admin status, restoring');
          setIsAdmin(true);
          setUser(JSON.parse(cachedUser));
          setIsLoading(false);
          // Still perform the full check, but this gives an immediate response
        }
      } catch (e) {
        console.warn('Error accessing sessionStorage:', e);
      }
    }

    // Perform a full admin check
    checkAdmin();
    
    // Set up subscription to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setUser(null);
        
        if (window.location.pathname.startsWith('/admin')) {
          console.log('Signed out while in admin area, redirecting to login');
          router.push('/auth/signin');
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-check admin status when auth state changes
        console.log('User signed in or token refreshed, re-checking admin status');
        checkAdmin();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, checkAdmin]);
  
  // Add a special recovery mechanism
  useEffect(() => {
    // Only apply this if admin check is failing
    if (typeof window !== 'undefined' && !isAdmin && !isLoading) {
      // Listen for visibility changes - if tab regains focus, recheck admin
      const handleVisibility = () => {
        if (document.visibilityState === 'visible' && 
            window.location.pathname.startsWith('/admin')) {
          console.log('Page became visible in admin area, rechecking admin status');
          checkAdmin();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibility);
      
      // Set up a recovery timer - if we're not admin after 3 seconds in admin area,
      // and we're not loading, try checking again
      let recoveryTimer: any = null;
      if (window.location.pathname.startsWith('/admin')) {
        recoveryTimer = setTimeout(() => {
          if (!isAdmin && !isLoading) {
            console.log('Recovery timer triggered, rechecking admin status');
            checkAdmin();
          }
        }, 3000);
      }
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibility);
        if (recoveryTimer) clearTimeout(recoveryTimer);
      };
    }
  }, [isAdmin, isLoading, checkAdmin]);
  
  return { isAdmin, isReady, user, isLoading };
} 