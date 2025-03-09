'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkingSession: boolean;
  session: Session | null;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  isAuthenticated: false,
  checkingSession: true,
  session: null,
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();

  // Add debounce to prevent multiple auth checks in quick succession
  const refreshAuth = async () => {
    const now = Date.now();
    // Only refresh if it's been at least 5 seconds since the last refresh
    if (now - lastRefresh < 5000) {
      console.log('Skipping auth refresh - too soon since last refresh');
      return;
    }
    
    setLastRefresh(now);
    setCheckingSession(true);
    try {
      console.log('Refreshing auth state...');
      
      // Use the API endpoint for refreshing instead of direct Supabase call
      const response = await fetch('/api/auth/refresh', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setCheckingSession(false);
          return;
        }
        
        // Fall back to direct Supabase call if API fails
        const { data: { session: newSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error refreshing session:', error);
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          return;
        }
        
        if (newSession?.user) {
          setUser(newSession.user);
          setSession(newSession);
          await checkAdminStatus(newSession.user.id);
        } else {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
        
        return;
      }
      
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await checkAdminStatus(data.user.id);
      } else {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Unexpected error during auth refresh:', error);
      
      // Last resort fallback to direct Supabase call
      try {
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        if (fallbackSession?.user) {
          setUser(fallbackSession.user);
          setSession(fallbackSession);
          await checkAdminStatus(fallbackSession.user.id);
        } else {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
      } catch (fallbackError) {
        console.error('Fallback auth check failed:', fallbackError);
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
    } finally {
      setCheckingSession(false);
    }
  };
  
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setIsAdmin(false);
      } else {
        setIsAdmin(profile?.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    const initialCheck = async () => {
      setIsLoading(true);
      await refreshAuth();
      setIsLoading(false);
    };

    initialCheck();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          
          // If on an admin page, redirect to home
          if (pathname.startsWith('/admin')) {
            router.push('/');
          }
          return;
        }
        
        if (newSession?.user) {
          setUser(newSession.user);
          setSession(newSession);
          await checkAdminStatus(newSession.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  // Periodically refresh token in the background
  useEffect(() => {
    // Refresh auth every 15 minutes to prevent token expiration (tokens expire after 1 hour)
    const intervalId = setInterval(() => {
      refreshAuth();
    }, 15 * 60 * 1000); // 15 minutes
    
    // Also refresh on window focus
    const handleFocus = () => {
      refreshAuth();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        isAuthenticated: !!user,
        checkingSession,
        session,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 