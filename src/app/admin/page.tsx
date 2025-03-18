"use client";

import { Container, Heading, Spinner, Text, VStack, Button, HStack, Box, useToast, SimpleGrid } from '@chakra-ui/react';
import { useEffect, useState, useCallback, useRef } from 'react';
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

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const [stats, setStats] = useState<Stats | null>(
    // Initialize from cache if available
    hasAdminCache() ? getCachedAdminStats() : null
  );
  
  const [loading, setLoading] = useState(!hasAdminCache());
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const toast = useToast();

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
      
      toast({
        title: 'Error fetching stats',
        description: error.message || 'There was a problem loading the admin dashboard',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, toast]);

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
      
      // Check URL params for refresh command
      const url = new URL(window.location.href);
      if (url.searchParams.has('refresh')) {
        handleForceRefresh();
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
      <Container maxW="container.xl" py={10}>
        <VStack spacing={6} align="center">
          <Heading as="h1" size="xl">Admin Dashboard</Heading>
          <Text>You do not have permission to access this page.</Text>
        </VStack>
      </Container>
    );
  }

  if (loading && !stats) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={6} align="center">
          <Heading as="h1" size="xl">Admin Dashboard</Heading>
          <Spinner size="xl" />
          <Text>Loading stats...</Text>
          
          {/* Options for user if loading takes too long */}
          <Box mt={8} p={4} borderWidth="1px" borderRadius="lg">
            <VStack spacing={4}>
              <Text fontWeight="bold">Taking longer than expected?</Text>
              
              {hasAdminCache() && (
                <Button 
                  leftIcon={<ArrowPathIcon width={20} />} 
                  colorScheme="blue"
                  onClick={() => {
                    setStats(getCachedAdminStats());
                    setLoading(false);
                  }}
                >
                  Load from cache
                </Button>
              )}
              
              <Button 
                colorScheme="orange" 
                onClick={() => {
                  // Force reload the page with cache buster
                  window.location.href = '/admin?refresh=' + Date.now();
                }}
              >
                Force Reload Page
              </Button>
              
              <Button 
                colorScheme="red"
                onClick={() => {
                  clearAdminCache();
                  window.location.reload();
                }}
              >
                Clear Cache & Reload
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={6} align="center">
          <Heading as="h1" size="xl">Admin Dashboard</Heading>
          <Text color="red.500">Error: {error}</Text>
          <Button 
            colorScheme="blue" 
            onClick={() => fetchStatsStable()}
          >
            Try Again
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading as="h1" size="xl">Admin Dashboard</Heading>
          <Button 
            leftIcon={<ArrowPathIcon width={20} />} 
            colorScheme="blue"
            isLoading={loading}
            onClick={() => fetchStatsStable()}
          >
            Refresh
          </Button>
        </HStack>

        {stats && (
          <>
            <StatsGroup
              stats={[
                { name: 'Total Members', value: stats.totalMembers },
                { name: 'Active Players', value: stats.activePlayers },
                { name: 'Total Matches', value: stats.totalMatches },
              ]}
            />

            <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
              <Heading as="h2" size="md" mb={4}>New Members by Month</Heading>
              <Box h="400px">
                <LineGraph data={stats.membersByMonth} />
              </Box>
            </Box>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                <Heading as="h2" size="md" mb={4}>Quick Links</Heading>
                <VStack align="stretch" spacing={4}>
                  <Button colorScheme="teal" as="a" href="/admin/players">
                    Manage Players
                  </Button>
                  <Button colorScheme="teal" as="a" href="/admin/matches">
                    Manage Matches
                  </Button>
                  <Button colorScheme="teal" as="a" href="/admin/gallery">
                    Manage Gallery
                  </Button>
                </VStack>
              </Box>
              
              <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                <Heading as="h2" size="md" mb={4}>System Status</Heading>
                <VStack align="stretch" spacing={2}>
                  <Text><strong>Database:</strong> Connected</Text>
                  <Text><strong>Last Updated:</strong> {new Date().toLocaleTimeString()}</Text>
                  <Text><strong>Session Status:</strong> Active</Text>
                  <Button 
                    mt={4}
                    size="sm"
                    colorScheme="red"
                    onClick={() => {
                      clearAdminCache();
                      toast({
                        title: 'Cache cleared',
                        description: 'Admin cache has been cleared successfully',
                        status: 'success',
                        duration: 3000,
                      });
                    }}
                  >
                    Clear Admin Cache
                  </Button>
                </VStack>
              </Box>
            </SimpleGrid>
          </>
        )}
      </VStack>
    </Container>
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
