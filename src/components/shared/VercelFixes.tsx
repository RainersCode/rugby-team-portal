'use client';

import { useEffect } from 'react';
import { initializeVercelFixes } from '@/utils/clearCache';

/**
 * Component that applies fixes for Vercel deployment issues
 * This loads as early as possible in the app lifecycle
 */
export default function VercelFixes() {
  useEffect(() => {
    // Only apply in browser environment
    if (typeof window === 'undefined') return;
    
    // Fix for unhandled promises
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault(); // Prevent the default handling
      console.warn('Unhandled promise rejection:', event.reason);
      
      // If this is a Supabase error, log it without crashing
      if (event.reason?.message?.includes('message channel closed')) {
        console.warn('Supabase message channel closed - this is expected during page transitions');
        return;
      }
    };

    // Add global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Fix for message channel issues in admin console
    const fixMessageChannelIssues = () => {
      // Patch Promise.prototype to catch common admin console issues
      const originalThen = Promise.prototype.then;
      Promise.prototype.then = function(onFulfilled, onRejected) {
        const wrappedOnRejected = (reason: any) => {
          // Check if this is a message channel issue and suppress it
          if (typeof reason === 'object' && 
              reason?.message?.includes('message channel closed') &&
              (document.location.pathname.includes('/admin') || 
               document.referrer.includes('/admin'))) {
            console.warn('Suppressed message channel error in admin console');
            // Return a resolved promise instead of propagating the error
            return Promise.resolve(null);
          }
          
          // Otherwise, call the original reject handler
          return onRejected ? onRejected(reason) : Promise.reject(reason);
        };
        
        return originalThen.call(this, onFulfilled, wrappedOnRejected);
      };
    };
    
    // Apply message channel fix
    fixMessageChannelIssues();
    
    // Apply Vercel specific fixes
    if (window.location.hostname.includes('vercel.app')) {
      console.log('Applying Vercel deployment fixes');
      
      // Initialize fetch overrides and other fixes
      initializeVercelFixes();
      
      // Apply specific fix for Supabase cookies if needed
      const fixSupabaseCookies = () => {
        // Check if we're in a Vercel environment but cookies aren't working
        const hasBrokenCookies = !document.cookie.includes('supabase');
        
        if (hasBrokenCookies) {
          console.log('Attempting to fix Supabase cookies for Vercel deployment');
          
          // Add a hidden iframe to force cookie sync on Vercel
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = `${window.location.origin}/api/auth/cookie-fix`;
          document.body.appendChild(iframe);
          
          // Clean up after 5 seconds
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 5000);
        }
      };
      
      // Run the cookie fix with slight delay to ensure other initialization happens first
      setTimeout(fixSupabaseCookies, 1000);
    }
    
    return () => {
      // Clean up the event listener
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  // This component doesn't render anything
  return null;
} 