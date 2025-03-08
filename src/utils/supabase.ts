import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase clients directly to avoid React hook rule violations
// This works better with the Next.js and React lifecycle
export const supabase = createClientComponentClient({
  supabaseUrl: supabaseUrl,
  supabaseKey: supabaseAnonKey,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public',
    },
    realtime: {
      timeout: 30000, // 30 seconds
    },
  }
});

// For server-side operations or when you need direct client access
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 30000, // 30 seconds
  },
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