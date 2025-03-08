import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cache for Supabase client instances
let supabaseClientInstance: ReturnType<typeof createClientComponentClient> | null = null;
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

// Create a cached Supabase client for client components
export const supabase = () => {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClientComponentClient({
      supabaseUrl: supabaseUrl,
      supabaseKey: supabaseAnonKey,
      options: {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        global: {
          fetch: customFetch,
        },
        // Add reasonable timeouts
        db: {
          schema: 'public',
        },
        realtime: {
          timeout: 30000, // 30 seconds
        },
      }
    });
  }
  return supabaseClientInstance;
};

// For server-side operations with retry capability
export const supabaseAdmin = () => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        fetch: customFetch,
      },
      // Add reasonable timeouts
      db: {
        schema: 'public',
      },
      realtime: {
        timeout: 30000, // 30 seconds
      },
    });
  }
  return supabaseAdminInstance;
};

// Custom fetch implementation with timeout and retry logic
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  // Define fetch options with timeout
  const fetchOptions: RequestInit = {
    ...init,
    signal: AbortSignal.timeout(20000), // 20 second timeout
  };

  // Retry configuration
  const maxRetries = 3;
  let retries = 0;
  let lastError: any = null;

  while (retries < maxRetries) {
    try {
      return await fetch(input, fetchOptions);
    } catch (error: any) {
      lastError = error;
      
      // Only retry on network errors or timeouts
      if (error.name !== 'AbortError' && !error.message?.includes('network')) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * 2 ** retries, 8000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      retries++;
      console.warn(`Retrying fetch (${retries}/${maxRetries}) after error:`, error.message);
    }
  }
  
  // If we've exhausted retries, throw the last error
  throw lastError;
};

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
      return await operation();
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