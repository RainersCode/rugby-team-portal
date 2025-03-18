'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Keep track of auth state across page navigations
  useEffect(() => {
    // Try to restore from sessionStorage first (faster than waiting for Supabase)
    if (typeof window !== 'undefined') {
      try {
        const cachedAdmin = sessionStorage.getItem('rk-admin-status');
        const cachedUser = sessionStorage.getItem('rk-admin-user');
        
        if (cachedAdmin === 'true' && cachedUser) {
          setIsAdmin(true);
          setUser(JSON.parse(cachedUser));
          // Still perform the full check, but this gives an immediate response
        }
      } catch (e) {
        console.warn('Error accessing sessionStorage:', e);
      }
    }

    // Function to check admin status
    const checkAdmin = async () => {
      try {
        setIsLoading(true);
        
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
            router.push('/auth/signin?redirect=/admin');
          }, 100);
          
          return;
        }
        
        setSessionChecked(true);
        
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
          router.push('/auth/signin?redirect=/admin');
        }
      } finally {
        setIsReady(true);
        setIsLoading(false);
      }
    };
    
    checkAdmin();
    
    // Set up subscription to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setUser(null);
        router.push('/auth/signin');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-check admin status when auth state changes
        checkAdmin();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);
  
  return { isAdmin, isReady, user, isLoading };
} 