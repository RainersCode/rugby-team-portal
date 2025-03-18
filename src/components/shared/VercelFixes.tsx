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
  }, []);
  
  // This component doesn't render anything
  return null;
} 