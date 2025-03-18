"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import LineGraph from '@/components/stats/LineGraph';
import StatsGroup from '@/components/stats/StatsGroup';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { supabase } from '@/utils/supabaseClient';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { 
  clearAdminCache, 
  getCachedAdminStats, 
  hasAdminCache, 
  saveAdminStatsToCache
} from '@/utils/clearCache';

// Define the type for our stats
interface Stats {
  totalMembers: number;
  activePlayers: number;
  totalMatches: number;
  membersByMonth: { name: string; value: number }[];
}

// Component to handle URL search params - wrapped in Suspense
function AdminURLHandler({ onRefresh }: { onRefresh: () => void }) {
  // Using Next.js hooks inside a client component wrapped in Suspense
  useEffect(() => {
    // Check URL params for refresh command
    const url = new URL(window.location.href);
    if (url.searchParams.has('refresh')) {
      onRefresh();
    }
  }, [onRefresh]);
  
  return null; // This component doesn't render anything
}

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const [stats, setStats] = useState<Stats | null>(
    // Initialize from cache if available
    hasAdminCache() ? getCachedAdminStats() : null
  );
  
  const [loading, setLoading] = useState(!hasAdminCache());
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  } | null>(null);

  // Function to show toast
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ title, message, type, visible: true });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Stable version of fetchStats to avoid dependency issues
  const fetchStatsStable = useCallback(async () => {
    // Don't fetch if we're not an admin or if we've fetched recently (within 30 seconds)
    if (!isAdmin || Date.now() - lastFetchRef.current < 30000) {
      return;
    }

    // Update fetch timestamp
    lastFetchRef.current = Date.now();
    
    try {
      setLoading(true);
      setError(null);

      // Fetch total members
      const { count: totalMembers, error: membersError } = await supabase
        .from('players')
        .select('id', { count: 'exact' });
      
      if (membersError) throw membersError;

      // Fetch active players
      const { count: activePlayers, error: activePlayersError } = await supabase
        .from('players')
        .select('id', { count: 'exact' })
        .eq('active', true);
      
      if (activePlayersError) throw activePlayersError;

      // Fetch total matches
      const { count: totalMatches, error: matchesError } = await supabase
        .from('matches')
        .select('id', { count: 'exact' });
      
      if (matchesError) throw matchesError;

      // Fetch members by month
      const { data: membersByMonthData, error: membersByMonthError } = await supabase
        .from('players')
        .select('created_at');
      
      if (membersByMonthError) throw membersByMonthError;

      // Process the data to get members by month
      const membersByMonth = processMembersByMonth(membersByMonthData);

      // Set the stats
      const newStats = {
        totalMembers: totalMembers || 0,
        activePlayers: activePlayers || 0,
        totalMatches: totalMatches || 0,
        membersByMonth,
      };
      
      setStats(newStats);
      
      // Save to cache for future use
      saveAdminStatsToCache(newStats);
      
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError(error.message || 'Failed to fetch stats');
      
      showToast(
        'Error fetching stats',
        error.message || 'There was a problem loading the admin dashboard',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Function to handle admin page return
  const handleAdminReturn = useCallback(() => {
    console.log('Admin page return detected');
    
    // If we have cached stats, use them immediately
    if (hasAdminCache()) {
      const cachedStats = getCachedAdminStats();
      setStats(cachedStats);
      
      // Then refresh in the background
      fetchStatsStable();
    } else {
      // No cache, fetch fresh
      fetchStatsStable();
    }
  }, [fetchStatsStable]);
  
  // Function to handle back button
  const handleBackButton = useCallback(() => {
    console.log('Back button used to navigate to admin');
    // Always refresh when back button is used
    fetchStatsStable();
  }, [fetchStatsStable]);
  
  // Event handler for forced refresh requests
  const handleForceRefresh = useCallback(() => {
    console.log('Force refresh requested');
    clearAdminCache();
    fetchStatsStable();
  }, [fetchStatsStable]);

  useEffect(() => {
    if (isAdmin && !authLoading) {
      // Listen for admin navigation events
      window.addEventListener('adminPageReturn', handleAdminReturn);
      window.addEventListener('adminBackButtonUsed', handleBackButton);
      window.addEventListener('adminForceRefresh', handleForceRefresh);
      
      // Determine if we should fetch or use cache
      if (hasAdminCache()) {
        // We already loaded from cache in initial state
        // Still fetch in background for fresh data
        fetchStatsStable();
      } else {
        // No cache, fetch fresh
        fetchStatsStable();
      }
      
      return () => {
        window.removeEventListener('adminPageReturn', handleAdminReturn);
        window.removeEventListener('adminBackButtonUsed', handleBackButton);
        window.removeEventListener('adminForceRefresh', handleForceRefresh);
      };
    }
  }, [isAdmin, authLoading, fetchStatsStable, handleAdminReturn, handleBackButton, handleForceRefresh]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p>Loading stats...</p>
          
          {/* Options for user if loading takes too long */}
          <div className="mt-8 p-4 border border-gray-200 rounded-lg">
            <div className="flex flex-col space-y-4">
              <p className="font-bold">Taking longer than expected?</p>
              
              {hasAdminCache() && (
                <button 
                  className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => {
                    setStats(getCachedAdminStats());
                    setLoading(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Load from cache
                </button>
              )}
              
              <button 
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                onClick={() => {
                  // Force reload the page with cache buster
                  window.location.href = '/admin?refresh=' + Date.now();
                }}
              >
                Force Reload Page
              </button>
              
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => {
                  clearAdminCache();
                  window.location.reload();
                }}
              >
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-red-500">Error: {error}</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => fetchStatsStable()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Wrap URL handler in Suspense to fix the Next.js warning */}
      <Suspense fallback={null}>
        <AdminURLHandler onRefresh={handleForceRefresh} />
      </Suspense>
      
      {/* Toast message */}
      {toastMessage && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded shadow-md z-50 ${
            toastMessage.type === 'error' ? 'bg-red-500' : 
            toastMessage.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
          } text-white`}
        >
          <div className="font-bold">{toastMessage.title}</div>
          <div>{toastMessage.message}</div>
        </div>
      )}
      
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button 
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
            onClick={() => fetchStatsStable()}
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></div>
            ) : (
              <ArrowPathIcon className="h-5 w-5 mr-2" />
            )}
            Refresh
          </button>
        </div>

        {stats && (
          <>
            <StatsGroup
              stats={[
                { name: 'Total Members', value: stats.totalMembers },
                { name: 'Active Players', value: stats.activePlayers },
                { name: 'Total Matches', value: stats.totalMatches },
              ]}
            />

            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h2 className="text-lg font-medium mb-4">New Members by Month</h2>
              <div className="h-[400px]">
                <LineGraph data={stats.membersByMonth} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h2 className="text-lg font-medium mb-4">Quick Links</h2>
                <div className="flex flex-col space-y-4">
                  <a 
                    href="/admin/players"
                    className="px-4 py-2 bg-teal-500 text-white rounded text-center hover:bg-teal-600"
                  >
                    Manage Players
                  </a>
                  <a 
                    href="/admin/matches"
                    className="px-4 py-2 bg-teal-500 text-white rounded text-center hover:bg-teal-600"
                  >
                    Manage Matches
                  </a>
                  <a 
                    href="/admin/gallery"
                    className="px-4 py-2 bg-teal-500 text-white rounded text-center hover:bg-teal-600"
                  >
                    Manage Gallery
                  </a>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h2 className="text-lg font-medium mb-4">System Status</h2>
                <div className="flex flex-col space-y-2">
                  <p><strong>Database:</strong> Connected</p>
                  <p><strong>Last Updated:</strong> {new Date().toLocaleTimeString()}</p>
                  <p><strong>Session Status:</strong> Active</p>
                  <button 
                    className="mt-4 px-4 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    onClick={() => {
                      clearAdminCache();
                      showToast(
                        'Cache cleared',
                        'Admin cache has been cleared successfully',
                        'success'
                      );
                    }}
                  >
                    Clear Admin Cache
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Function to process members by month
function processMembersByMonth(data: any[] | null) {
  if (!data) return [];

  const counts: Record<string, number> = {};
  const now = new Date();
  
  // Initialize the last 12 months with zero counts
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    counts[monthKey] = 0;
  }

  // Count members by their creation month
  data.forEach(member => {
    const createdAt = new Date(member.created_at);
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    
    if (counts[monthKey] !== undefined) {
      counts[monthKey]++;
    }
  });

  // Convert to the format expected by the graph component
  return Object.entries(counts).map(([key, value]) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    return {
      name: `${monthName} ${year}`,
      value: value,
    };
  });
} 
