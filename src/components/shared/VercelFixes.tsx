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
    
    // Fix for React error #418 related to MessagePort
    const fixReactMessagePortError = () => {
      // Check if we're in a development environment
      const isDev = process.env.NODE_ENV !== 'production';
      
      if (!isDev) {
        // In production, monkey-patch the MessagePort to handle communication errors
        const originalMessagePort = window.MessagePort;
        if (originalMessagePort && originalMessagePort.prototype) {
          const originalPostMessage = originalMessagePort.prototype.postMessage;
          
          // Override postMessage to catch errors
          originalMessagePort.prototype.postMessage = function(...args) {
            try {
              return originalPostMessage.apply(this, args);
            } catch (error) {
              console.warn('Suppressed MessagePort error:', error);
              // Just return undefined instead of crashing
              return undefined;
            }
          };
        }
      }
    };
    
    // Fix for admin 404 error and performance optimization
    const optimizeForAdmin = () => {
      // Only apply to admin pages
      if (window.location.pathname.startsWith('/admin')) {
        console.log('Applying admin performance optimizations');
        
        // 1. Preconnect to Supabase
        const preconnectLink = document.createElement('link');
        preconnectLink.rel = 'preconnect';
        preconnectLink.href = 'https://wlfcjbqqfdrnfhzzpjeg.supabase.co';
        document.head.appendChild(preconnectLink);
        
        // 2. Limit concurrent requests
        let activeRequests = 0;
        const MAX_CONCURRENT = 5;
        const requestQueue: Array<() => void> = [];
        
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          const url = args[0]?.toString() || '';
          
          // For Supabase requests, enforce limits
          if (url.includes('supabase') || url.includes('wlfcjbqqfdrnfhzzpjeg')) {
            return new Promise((resolve, reject) => {
              const executeRequest = () => {
                activeRequests++;
                
                const requestPromise = originalFetch.apply(this, args)
                  .then(response => {
                    activeRequests--;
                    if (requestQueue.length > 0) {
                      const nextRequest = requestQueue.shift();
                      if (nextRequest) nextRequest();
                    }
                    return response;
                  })
                  .catch(error => {
                    activeRequests--;
                    if (requestQueue.length > 0) {
                      const nextRequest = requestQueue.shift();
                      if (nextRequest) nextRequest();
                    }
                    throw error;
                  });
                
                resolve(requestPromise);
              };
              
              if (activeRequests < MAX_CONCURRENT) {
                executeRequest();
              } else {
                requestQueue.push(executeRequest);
              }
            });
          }
          
          // For other requests, proceed normally
          return originalFetch.apply(this, args);
        };
      }
    };
    
    // Apply message channel fix
    fixMessageChannelIssues();
    
    // Apply React error #418 fix (safely try)
    try {
      fixReactMessagePortError();
    } catch (e) {
      console.warn('Could not apply MessagePort fix:', e);
    }
    
    // Apply performance optimizations for admin
    try {
      optimizeForAdmin();
    } catch (e) {
      console.warn('Could not apply admin optimizations:', e);
    }
    
    // Fix for Next.js RSC loading issues
    const fixRscLoadingIssues = () => {
      // Monkey patch fetch to avoid errors with RSC routes
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0]?.toString() || '';
        
        // Check if this is an RSC request (containing _rsc parameter)
        if (url.includes('_rsc=')) {
          // Modify the request to avoid 404 errors
          try {
            const urlObj = new URL(url);
            // Clean up the RSC parameter
            urlObj.searchParams.delete('_rsc');
            args[0] = urlObj.toString();
            
            // Add special header to indicate this was an RSC request
            if (!args[1]) args[1] = {};
            if (!args[1].headers) args[1].headers = {};
            args[1].headers['x-nextjs-data'] = '1';
          } catch (e) {
            console.warn('Error parsing RSC URL:', e);
          }
        }
        
        return originalFetch.apply(this, args);
      };
    };
    
    // Apply RSC fix
    fixRscLoadingIssues();
    
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
      
      // Add special handler for prefetching to prevent 404 errors
      const fixPrefetchIssues = () => {
        // Find all link elements and update their prefetch behavior
        const updatePrefetchLinks = () => {
          const links = document.querySelectorAll('a[href^="/admin"]');
          links.forEach(link => {
            // Remove any existing prefetch attributes
            link.removeAttribute('prefetch');
            
            // Add data attribute to indicate no prefetching
            link.setAttribute('data-no-prefetch', 'true');
            
            // Add event listener to forcibly remove prefetch before navigation
            link.addEventListener('click', (e) => {
              // Find and remove any prefetch link elements
              const prefetchLinks = document.querySelectorAll('link[rel="prefetch"][href*="_rsc"]');
              prefetchLinks.forEach(pl => pl.remove());
            });
          });
        };
        
        // Run immediately
        updatePrefetchLinks();
        
        // And also set up a mutation observer to handle dynamically added links
        const observer = new MutationObserver(mutations => {
          let shouldUpdate = false;
          mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
              shouldUpdate = true;
            }
          });
          
          if (shouldUpdate) {
            updatePrefetchLinks();
          }
        });
        
        // Start observing the document
        observer.observe(document.body, { 
          childList: true,
          subtree: true 
        });
        
        return () => observer.disconnect();
      };
      
      // Apply prefetch fix with a delay to ensure DOM is ready
      setTimeout(fixPrefetchIssues, 1000);
      
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