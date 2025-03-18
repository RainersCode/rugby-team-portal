'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * This component provides a safety fallback for admin pages
 * It checks if the page has been stuck loading for too long and offers recovery options
 */
export default function AdminRecovery() {
  const pathname = usePathname();
  const router = useRouter();
  const loadingTimerRef = useRef<any>(null);
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const recoveryTimerRef = useRef<any>(null);
  const supabase = createClientComponentClient();
  
  // Only run on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  
  useEffect(() => {
    if (!isAdminPage) return;
    
    const checkNeedsRecovery = () => {
      // Look for loading indicators on the page
      const loadingElements = document.querySelectorAll('.animate-spin');
      const loadingText = document.body.innerText.includes('Loading dashboard');
      
      // If we found loading indicators and we're on an admin page, the page might be stuck
      if ((loadingElements.length > 0 || loadingText) && isAdminPage) {
        console.log('AdminRecovery: Loading indicators detected, may need recovery');
        setNeedsRecovery(true);
      } else {
        setNeedsRecovery(false);
      }
    };
    
    // Wait 8 seconds before checking if the page needs recovery
    loadingTimerRef.current = setTimeout(() => {
      checkNeedsRecovery();
      
      // Set up periodic checks every 5 seconds
      const intervalCheck = setInterval(checkNeedsRecovery, 5000);
      
      return () => clearInterval(intervalCheck);
    }, 8000);
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      if (recoveryTimerRef.current) {
        clearTimeout(recoveryTimerRef.current);
      }
    };
  }, [isAdminPage, pathname]);
  
  const attemptRecovery = async () => {
    setRecoveryAttempted(true);
    
    try {
      // 1. Force refresh the session
      await supabase.auth.refreshSession();
      
      // 2. Wait a moment and check if the page has recovered
      recoveryTimerRef.current = setTimeout(() => {
        const loadingElements = document.querySelectorAll('.animate-spin');
        const loadingText = document.body.innerText.includes('Loading dashboard');
        
        if ((loadingElements.length > 0 || loadingText) && isAdminPage) {
          // If still loading, force reload the page
          window.location.href = `/admin?recovery=1&t=${Date.now()}`;
        } else {
          // Page has recovered
          setNeedsRecovery(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Recovery failed:', error);
      // If recovery failed, suggest a full reload
      window.location.href = `/admin?recovery=1&t=${Date.now()}`;
    }
  };
  
  if (!isAdminPage || !needsRecovery) {
    return null;
  }
  
  // Render a recovery UI if the admin page appears to be stuck loading
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-md border border-amber-300">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-amber-500">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="font-medium text-sm">Admin page loading issue detected</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            The admin dashboard appears to be taking longer than expected to load.
          </p>
          
          <div className="flex space-x-2">
            {recoveryAttempted ? (
              <button 
                onClick={() => window.location.href = `/admin?recovery=force&t=${Date.now()}`}
                className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Force Reload
              </button>
            ) : (
              <button 
                onClick={attemptRecovery}
                className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center"
              >
                <Loader2 className="animate-spin h-3 w-3 mr-1" />
                Attempt Recovery
              </button>
            )}
            
            <button 
              onClick={() => setNeedsRecovery(false)}
              className="text-xs px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 