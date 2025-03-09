import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Consistent auth storage key to prevent conflicts
const AUTH_STORAGE_KEY = 'rugby-portal-auth-storage';

// Create Supabase clients with better browser compatibility
export const supabase = createClientComponentClient({
  supabaseUrl: supabaseUrl,
  supabaseKey: supabaseAnonKey,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: AUTH_STORAGE_KEY, // Use consistent storage key
      flowType: 'pkce', // Use PKCE flow for better security and compatibility
      // Disable localStorage to force cookie-only auth for better cross-browser consistency
      storage: {
        getItem: (key) => {
          if (typeof document === 'undefined') return null;
          const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${key}=`))
            ?.split('=')[1];
          if (value) return JSON.parse(decodeURIComponent(value));
          return null;
        },
        setItem: (key, value) => {
          if (typeof document === 'undefined') return;
          const maxAge = 7 * 24 * 60 * 60; // 7 days
          const encodedValue = encodeURIComponent(JSON.stringify(value));
          document.cookie = `${key}=${encodedValue}; max-age=${maxAge}; path=/; samesite=lax`;
        },
        removeItem: (key) => {
          if (typeof document === 'undefined') return;
          document.cookie = `${key}=; max-age=0; path=/; samesite=lax`;
        },
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      timeout: 30000, // 30 seconds
    },
    global: {
      fetch: (...args) => {
        // Use a custom fetch with credentials included
        return fetch(...args, {
          credentials: 'include',
          // Add shorter timeout for fetch operations to prevent hanging in production
          signal: args[1]?.signal || new AbortController().signal,
          // @ts-ignore - custom option for shorter timeout
          timeout: 10000 // 10 seconds timeout
        });
      }
    }
  }
});

// For server-side operations or when you need direct client access
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security and compatibility
  },
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 30000, // 30 seconds
  },
  global: {
    fetch: (...args) => {
      return fetch(...args, {
        credentials: 'include',
        // Add shorter timeout for fetch operations to prevent hanging in production
        signal: args[1]?.signal || new AbortController().signal,
        // @ts-ignore - custom option for shorter timeout
        timeout: 10000 // 10 seconds timeout
      });
    }
  }
});

// Helper function for database operations with retry
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      // Add timeout to operation
      const operationPromise = operation();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), 8000)
      );
      
      return await Promise.race([operationPromise, timeoutPromise]);
    } catch (error: any) {
      lastError = error;
      
      // Only retry on specific errors that might be temporary
      const isRetryable = 
        error.code === 'PGRST301' || // Timeout
        error.code === '57014' || // Query cancelled
        error.code === '23505' || // Unique violation (might be due to race condition)
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('connection');
      
      if (!isRetryable) {
        throw error;
      }
      
      const delay = Math.min(initialDelay * (2 ** retryCount), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
      console.warn(`Retrying database operation (${retryCount}/${maxRetries}) after error:`, error.message);
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}; 