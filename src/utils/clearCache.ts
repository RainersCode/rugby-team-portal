/**
 * Utility to help clear browser cache in certain situations
 * Particularly useful for Vercel deployments where stale cookies can cause issues
 */

// Check if this is a Vercel production environment
const isVercelProduction = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('vercel.app');
};

// Generate a unique cache key for this session
export const generateCacheKey = () => {
  return `cache_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Helper to clear specific cached resources
export const clearImageCache = (imageUrl: string) => {
  if (!imageUrl) return imageUrl;
  
  // If already has a cache buster, remove it
  const urlWithoutParams = imageUrl.split('?')[0];
  
  // Add a cache buster
  return `${urlWithoutParams}?v=${Date.now()}`;
};

// Function to help with Supabase storage URLs
export const getUncachedStorageUrl = (path: string, bucket: string = 'photos') => {
  if (!path) return '';
  if (path.includes('?')) {
    // Remove any existing query parameters
    path = path.split('?')[0];
  }
  
  // Add a cache buster
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}?v=${Date.now()}`;
};

// Clear all supabase-related cookies (useful for auth debugging)
export const clearSupabaseCookies = () => {
  if (typeof document === 'undefined') return;
  
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    
    if (name.includes('supabase') || name.includes('rugby-portal-auth')) {
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
    }
  }
};

// Force a clean reload of the app
export const forceCleanReload = () => {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear cookies related to auth
  clearSupabaseCookies();
  
  // Force reload without cache
  window.location.reload();
};

// Use this at app initialization if needed
export const initializeVercelFixes = () => {
  if (!isVercelProduction()) return;
  
  // For Vercel deployments, add cache control headers to all fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    // Add cache control headers to all requests
    if (args[1] && typeof args[1] === 'object') {
      args[1] = {
        ...args[1],
        headers: {
          ...args[1].headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      };
    }
    
    return originalFetch.apply(this, args);
  };
}; 