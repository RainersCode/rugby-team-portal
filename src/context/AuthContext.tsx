'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';

// Add profile type
interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  [key: string]: any; // Allow for other fields
}

// Extended User type with profile
interface ExtendedUser extends User {
  profile?: UserProfile;
}

type AuthContextType = {
  user: ExtendedUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAdminVerifying: boolean;
  isAuthenticated: boolean;
  checkingSession: boolean;
  session: Session | null;
  refreshAuth: () => Promise<void>;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  isAdminVerifying: false,
  isAuthenticated: false,
  checkingSession: true,
  session: null,
  refreshAuth: async () => {},
  clearAuth: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminVerifying, setIsAdminVerifying] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [explicitlyLoggedOut, setExplicitlyLoggedOut] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();

  // Add debounce to prevent multiple auth checks in quick succession
  const refreshAuth = async () => {
    // Skip refresh if user explicitly logged out in this session
    if (explicitlyLoggedOut) {
      console.log('AuthContext: Skipping auth refresh - user explicitly logged out');
      return;
    }
  
    const now = Date.now();
    // Only refresh if it's been at least 5 seconds since the last refresh
    if (now - lastRefresh < 5000) {
      console.log('AuthContext: Skipping auth refresh - too soon since last refresh');
      return;
    }
    
    setLastRefresh(now);
    setCheckingSession(true);
    try {
      console.log('AuthContext: Refreshing auth state...');
      
      // Use the API endpoint for refreshing instead of direct Supabase call
      const response = await fetch('/api/auth/refresh', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        console.log(`AuthContext: Refresh API returned ${response.status}`);
        
        if (response.status === 401) {
          // User is not authenticated
          console.log('AuthContext: User not authenticated');
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setCheckingSession(false);
          return;
        }
        
        // Fall back to direct Supabase call if API fails
        console.log('AuthContext: API refresh failed, falling back to direct Supabase call');
        const { data: { session: newSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error refreshing session:', error);
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          return;
        }
        
        if (newSession?.user) {
          console.log('AuthContext: Got session from direct call for user:', newSession.user.id);
          const extendedUser: ExtendedUser = newSession.user;
          setUser(extendedUser);
          setSession(newSession);
          await checkAdminStatus(newSession.user.id);
        } else {
          console.log('AuthContext: No session from direct call');
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
        
        return;
      }
      
      const data = await response.json();
      console.log('AuthContext: Auth refresh response success:', data.user?.id);
      
      if (data.user) {
        // Store user with profile data
        const extendedUser: ExtendedUser = data.user;
        console.log('AuthContext: Setting user with profile:', extendedUser.profile);
        
        setUser(extendedUser);
        setSession(data.session);
        
        // Use isAdmin from the response directly if available
        if (typeof data.isAdmin === 'boolean') {
          console.log('AuthContext: Setting admin status from API:', data.isAdmin);
          setIsAdmin(data.isAdmin);
        } else {
          console.log('AuthContext: Admin status not provided by API, checking manually');
          await checkAdminStatus(data.user.id);
        }
      } else {
        console.log('AuthContext: No user data in response');
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('AuthContext: Unexpected error during auth refresh:', error);
      
      // Last resort fallback to direct Supabase call
      try {
        console.log('AuthContext: Error during refresh, attempting final fallback');
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        if (fallbackSession?.user) {
          console.log('AuthContext: Got session from fallback for user:', fallbackSession.user.id);
          const extendedUser: ExtendedUser = fallbackSession.user;
          setUser(extendedUser);
          setSession(fallbackSession);
          await checkAdminStatus(fallbackSession.user.id);
        } else {
          console.log('AuthContext: No session from fallback');
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
      } catch (fallbackError) {
        console.error('AuthContext: Fallback auth check failed:', fallbackError);
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
    } finally {
      setCheckingSession(false);
    }
  };
  
  const checkAdminStatus = async (userId: string) => {
    if (!userId) {
      console.log('AuthContext: No userId provided for admin check');
      setIsAdmin(false);
      return;
    }
    
    // Set admin verification in progress
    setIsAdminVerifying(true);
    
    try {
      console.log('AuthContext: Checking admin status for user:', userId);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('AuthContext: Error fetching user profile:', profileError);
        setIsAdmin(false);
      } else {
        const adminStatus = profile?.role === 'admin';
        console.log('AuthContext: User admin status:', adminStatus);
        setIsAdmin(adminStatus);
        
        // Also update the user object with profile data if we don't already have it
        if (profile && user && !user.profile) {
          console.log('AuthContext: Updating user with profile data');
          setUser({ 
            ...user, 
            profile: profile 
          });
        }
      }
    } catch (error) {
      console.error('AuthContext: Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      // Always mark verification as complete
      setIsAdminVerifying(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    const initialCheck = async () => {
      console.log('AuthContext: Performing initial auth check');
      setIsLoading(true);
      try {
        await refreshAuth();
      } catch (error) {
        console.error('AuthContext: Error during initial auth check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialCheck();
  }, []);

  // Add explicit method to clear auth state
  const clearAuth = () => {
    console.log('AuthContext: Explicitly clearing auth state');
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setExplicitlyLoggedOut(true);
    
    // Also try to clear supabase auth directly
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('supabase.auth.token');
      } catch (e) {
        console.error('AuthContext: Error clearing storage:', e);
      }
    }
  };

  // Reset logout flag when user navigates to sign in page
  useEffect(() => {
    if (pathname === '/auth/signin') {
      console.log('AuthContext: User navigated to signin, resetting logout flag');
      setExplicitlyLoggedOut(false);
    }
  }, [pathname]);

  // Handle logout events more explicitly
  useEffect(() => {
    // Listen for custom logout event
    const handleLogout = () => {
      console.log('AuthContext: Logout event received');
      clearAuth();
    };

    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Handle auth state changes
  useEffect(() => {
    try {
      console.log('AuthContext: Setting up auth state change listener');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('AuthContext: Auth state changed:', event);
          
          if (event === 'SIGNED_OUT') {
            console.log('AuthContext: User signed out');
            clearAuth();
            
            // If on an admin page, redirect to home
            if (pathname.startsWith('/admin')) {
              router.push('/');
            }
            return;
          }
          
          if (event === 'SIGNED_IN' && newSession?.user) {
            console.log('AuthContext: User signed in:', newSession.user.id);
            const extendedUser: ExtendedUser = newSession.user;
            setUser(extendedUser);
            setSession(newSession);
            await checkAdminStatus(newSession.user.id);
          }
          
          if (event === 'TOKEN_REFRESHED' && newSession?.user) {
            console.log('AuthContext: Token refreshed for user:', newSession.user.id);
            const extendedUser: ExtendedUser = newSession.user;
            setUser(extendedUser);
            setSession(newSession);
          }
        }
      );

      return () => {
        console.log('AuthContext: Cleaning up auth state change listener');
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('AuthContext: Error setting up auth state change listener:', error);
    }
  }, [supabase, router, pathname]);

  // Add window focus event to check auth status when tab regains focus
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('AuthContext: Setting up window focus handler');
      
      const handleFocus = () => {
        console.log('AuthContext: Window focused, checking auth status');
        // Check if session is present in local storage to avoid unnecessary checks
        const hasSessionInStorage = localStorage.getItem('supabase.auth.token') !== null;
        
        // Only refresh auth if we think we might be authenticated or we've explicitly set user to null
        if (hasSessionInStorage || user === null) {
          // Add a small delay to ensure any pending auth operations complete
          setTimeout(() => {
            refreshAuth();
          }, 100);
        }
      };
      
      window.addEventListener('focus', handleFocus);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user]);

  // Periodically refresh token in the background
  useEffect(() => {
    console.log('AuthContext: Setting up refresh interval');
    // Refresh auth every 15 minutes to prevent token expiration (tokens expire after 1 hour)
    const intervalId = setInterval(() => {
      console.log('AuthContext: Interval refresh triggered');
      refreshAuth();
    }, 15 * 60 * 1000); // 15 minutes
    
    // Also refresh on window focus
    const handleFocus = () => {
      console.log('AuthContext: Window focus refresh triggered');
      refreshAuth();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      console.log('AuthContext: Cleaning up refresh interval');
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // For debugging
  useEffect(() => {
    console.log('AuthContext: Auth state updated -', 
      user ? `User: ${user.id}, Admin: ${isAdmin}` : 'No user');
  }, [user, isAdmin]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        isAdminVerifying,
        isAuthenticated: !!user,
        checkingSession,
        session,
        refreshAuth,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 