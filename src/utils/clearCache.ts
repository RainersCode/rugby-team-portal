/**
 * Utility to help clear browser cache in certain situations
 * Particularly useful for Vercel deployments where stale cookies can cause issues
 */

/**
 * Utilities for managing cache and connection issues on Vercel
 */

/**
 * Clear all admin-related cache items from session storage
 */
export function clearAdminCache() {
  // Clear specific admin cache items
  sessionStorage.removeItem('adminStats');
  sessionStorage.removeItem('adminLastVisit');
  sessionStorage.removeItem('adminIsActive');
  sessionStorage.removeItem('adminData');
  sessionStorage.removeItem('isAdminUser');
  
  console.log('Admin cache cleared');
  
  // Optional: also clear any fetch cache if needed
  if ('caches' in window) {
    try {
      caches.delete('next-data').then(() => {
        console.log('Next.js data cache cleared');
      });
    } catch (e) {
      console.warn('Error clearing caches:', e);
    }
  }
}

/**
 * Forcefully reload the page
 */
export function hardReload() {
  window.location.reload();
}

/**
 * Initialize Vercel-specific fixes for fetch and connections
 */
export function initializeVercelFixes() {
  // Apply service worker unregistration if needed
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // Clear any stale cache
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('next-data')) {
          caches.delete(cacheName);
        }
      });
    });
  }
  
  // Add global cache control headers to all fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    // If this is an object-form request, add headers
    if (typeof args[0] === 'string' && args[0].includes('/admin')) {
      if (!args[1]) args[1] = {};
      if (!args[1].headers) args[1].headers = {};
      
      // Add cache control headers
      args[1].headers = {
        ...args[1].headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
    }
    
    return originalFetch.apply(this, args);
  };
}

/**
 * Force a refresh of the admin dashboard
 */
export function refreshAdminDashboard() {
  // Clear cache
  clearAdminCache();
  
  // Dispatch custom event for components to respond to
  const refreshEvent = new CustomEvent('adminRefreshRequested', {
    detail: { timestamp: Date.now() }
  });
  window.dispatchEvent(refreshEvent);
  
  // Reload if we're on the admin page
  if (window.location.pathname.includes('/admin')) {
    setTimeout(() => {
      window.location.href = '/admin?refresh=' + Date.now();
    }, 100);
  }
}

/**
 * Attempt to recover admin session without full page reload
 * @returns Promise<boolean> - Whether recovery was successful
 */
export async function recoverAdminSession(): Promise<boolean> {
  console.log('Attempting to recover admin session');
  
  // Try to fetch from API to restore session
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (response.ok) {
      // Success - dispatch event to notify components
      const recoveryEvent = new CustomEvent('adminSessionRecovered', {
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(recoveryEvent);
      
      // Force components to refetch state
      setTimeout(() => {
        const forceRefresh = new CustomEvent('adminForceRefresh', {
          detail: { timestamp: Date.now() }
        });
        window.dispatchEvent(forceRefresh);
      }, 200);
      
      return true;
    }
  } catch (error) {
    console.error('Session recovery failed:', error);
  }
  
  return false;
}

/**
 * Check if admin cache is available
 */
export function hasAdminCache(): boolean {
  return !!sessionStorage.getItem('adminStats') && 
         !!sessionStorage.getItem('isAdminUser');
}

/**
 * Get cached admin stats if available
 */
export function getCachedAdminStats(): any {
  try {
    const statsJson = sessionStorage.getItem('adminStats');
    if (statsJson) {
      return JSON.parse(statsJson);
    }
  } catch (e) {
    console.error('Error parsing cached admin stats:', e);
  }
  return null;
}

/**
 * Save admin stats to cache
 */
export function saveAdminStatsToCache(stats: any): void {
  try {
    sessionStorage.setItem('adminStats', JSON.stringify(stats));
    sessionStorage.setItem('adminLastUpdated', Date.now().toString());
  } catch (e) {
    console.error('Error saving admin stats to cache:', e);
  }
}

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