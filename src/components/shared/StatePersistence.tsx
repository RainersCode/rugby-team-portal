'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Component that helps maintain state persistence across admin page navigations
 * This is especially important for the admin dashboard and authentication state
 */
export default function StatePersistence() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  
  useEffect(() => {
    // Skip for page transitions that are within the admin section
    const isAdminPath = pathname?.startsWith('/admin');
    const wasAdminPath = previousPathname.current?.startsWith('/admin');
    
    if (isAdminPath || wasAdminPath) {
      // Store this route for the next navigation
      if (isAdminPath) {
        try {
          // Save that we're in the admin area
          sessionStorage.setItem('was-in-admin', 'true');
          
          // Store timestamp of last admin page visit
          sessionStorage.setItem('last-admin-visit', Date.now().toString());
        } catch (e) {
          console.warn('StatePersistence: Failed to update sessionStorage', e);
        }
      }
      
      // If we're navigating away from admin, create "back to admin" state
      if (wasAdminPath && !isAdminPath) {
        try {
          sessionStorage.setItem('admin-return-path', previousPathname.current || '/admin');
        } catch (e) {
          console.warn('StatePersistence: Failed to save return path', e);
        }
      }
    }
    
    // Process various admin navigation scenarios
    const handleAdminNavigation = () => {
      if (!isAdminPath) return;
      
      try {
        // Check if this is a return to admin
        const wasInAdmin = sessionStorage.getItem('was-in-admin') === 'true';
        const lastVisitStr = sessionStorage.getItem('last-admin-visit');
        
        if (wasInAdmin && lastVisitStr) {
          const lastVisit = parseInt(lastVisitStr, 10);
          const currentTime = Date.now();
          const timeSinceLastVisit = currentTime - lastVisit;
          
          // If it's been less than 10 minutes, consider this a return to admin
          // rather than a fresh visit - helps with state persistence
          if (timeSinceLastVisit < 10 * 60 * 1000) {
            console.log('StatePersistence: Returning to admin area after brief navigation');
            
            // Dispatch a custom event that can be listened for in admin components
            const returnEvent = new CustomEvent('adminPageReturn', {
              detail: { 
                previousPath: previousPathname.current,
                timeSinceLastVisit
              }
            });
            window.dispatchEvent(returnEvent);
          }
          
          // Update timestamp
          sessionStorage.setItem('last-admin-visit', currentTime.toString());
        }
      } catch (e) {
        console.warn('StatePersistence: Error handling admin navigation', e);
      }
    };
    
    // Call handler
    handleAdminNavigation();
    
    // Remember current path for next navigation
    previousPathname.current = pathname;
  }, [pathname]);
  
  // Add a listener for the back button to preserve admin state
  useEffect(() => {
    const handlePopState = () => {
      // Check if we're returning to admin via back button
      const isReturningToAdmin = window.location.pathname.startsWith('/admin');
      
      if (isReturningToAdmin) {
        // Dispatch event to notify admin components
        const backEvent = new CustomEvent('adminBackButtonUsed');
        window.dispatchEvent(backEvent);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
} 