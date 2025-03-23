'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminData } from './useAdminData';
import { toast } from '@/components/ui/use-toast';

// Type definitions for tournament data
export interface TeamType {
  id: string;
  name: string;
  status: "active" | "inactive";
  season_id?: string;
}

export interface StandingType {
  id: string;
  team_id: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points_for: number;
  try_bonus_points: number;
  losing_bonus_points: number;
  total_points: number;
  team_name?: string;
  season_id?: string;
}

export interface SeasonType {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface CupMatchType {
  id: string;
  team1_id: string;
  team2_id: string;
  team1_score: number | null;
  team2_score: number | null;
  match_date: string;
  round: string;
  venue: string;
  team1_name?: string;
  team2_name?: string;
}

export function useTournamentData(tournament: 'championship' | 'sevens' | 'cup', initialTab: string = 'standings') {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentSeason, setCurrentSeason] = useState<SeasonType | null>(null);
  const [loadingCurrentSeason, setLoadingCurrentSeason] = useState(true);
  
  // Get the current season
  const {
    data: seasons,
    loading: loadingSeasons,
    error: seasonsError,
    fetchData: fetchSeasons,
  } = useAdminData<SeasonType>({
    table: `${tournament}_seasons`,
    fetchOnMount: true,
    onSuccess: (data) => {
      const current = data.find(season => season.is_current);
      if (current) {
        setCurrentSeason(current);
      }
      setLoadingCurrentSeason(false);
    },
    onError: () => {
      setLoadingCurrentSeason(false);
    }
  });

  // Get all teams for the current season
  const {
    data: teams,
    loading: loadingTeams,
    error: teamsError,
    fetchData: fetchTeams,
    createItem: createTeam,
    updateItem: updateTeam,
    deleteItem: deleteTeam,
    refresh: refreshTeams,
  } = useAdminData<TeamType>({
    table: `${tournament}_teams`,
    fetchOnMount: false,
  });

  // Get all standings for the current season
  const {
    data: standings,
    loading: loadingStandings,
    error: standingsError,
    fetchData: fetchStandings,
    createItem: createStanding,
    updateItem: updateStanding,
    deleteItem: deleteStanding,
    refresh: refreshStandings,
  } = useAdminData<StandingType>({
    table: `${tournament}_standings`,
    fetchOnMount: false,
  });

  // Get cup matches
  const {
    data: cupMatches,
    loading: loadingCupMatches,
    error: cupMatchesError,
    fetchData: fetchCupMatches,
    createItem: createCupMatch,
    updateItem: updateCupMatch,
    deleteItem: deleteCupMatch,
    refresh: refreshCupMatches,
  } = useAdminData<CupMatchType>({
    table: 'cup_matches',
    fetchOnMount: tournament === 'cup',
  });

  // Change tab and load relevant data
  const changeTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Load data for the current season and tab
  const loadData = useCallback(async () => {
    if (!currentSeason) return;

    if (activeTab === 'teams' || activeTab === 'standings') {
      // Fetch teams for the current season
      await fetchTeams({ 
        orderBy: 'name',
        select: '*',
      });

      if (activeTab === 'standings') {
        // Fetch standings for the current season
        await fetchStandings({
          orderBy: 'position',
          select: '*',
        });
      }
    } else if (activeTab === 'seasons') {
      // Already loaded in initial data fetch
    } 
    
    if (tournament === 'cup') {
      // Fetch cup matches
      await fetchCupMatches({
        orderBy: 'round',
        orderDirection: 'desc',
      });
    }
  }, [activeTab, currentSeason, fetchTeams, fetchStandings, fetchCupMatches, tournament]);

  // Initial data load when season changes
  useEffect(() => {
    if (currentSeason) {
      loadData();
    }
  }, [currentSeason, loadData]);

  // Update data when tab changes
  useEffect(() => {
    if (currentSeason) {
      loadData();
    }
  }, [activeTab, loadData, currentSeason]);

  // Set a season as the current season
  const setAsCurrentSeason = useCallback(async (seasonId: string) => {
    if (!seasonId) return;
    
    try {
      // First, update all seasons to not be current
      for (const season of seasons) {
        if (season.is_current) {
          await updateTeam({
            ...season,
            is_current: false
          });
        }
      }
      
      // Then set the selected season as current
      const seasonToUpdate = seasons.find(s => s.id === seasonId);
      if (seasonToUpdate) {
        const updatedSeason = await updateTeam({
          ...seasonToUpdate,
          is_current: true
        });
        
        setCurrentSeason(updatedSeason);
        toast({
          title: "Success",
          description: `${seasonToUpdate.name} set as current season`,
        });
      }
    } catch (error) {
      console.error('Error setting current season:', error);
      toast({
        title: "Error",
        description: "Failed to set current season",
        variant: "destructive",
      });
    }
  }, [seasons, updateTeam]);

  // Create a new item (team, standing, or season)
  const createItem = useCallback(async (itemType: 'team' | 'standing' | 'season', data: any) => {
    try {
      if (!currentSeason && itemType !== 'season') {
        throw new Error('No current season selected');
      }
      
      const itemData = {
        ...data,
        ...(itemType !== 'season' && { season_id: currentSeason?.id }),
      };
      
      if (itemType === 'team') {
        return await createTeam(itemData);
      } else if (itemType === 'standing') {
        return await createStanding(itemData);
      } else if (itemType === 'season') {
        // Custom season creation with smart handling of is_current
        const seasonsApi = useAdminData<SeasonType>({
          table: `${tournament}_seasons`,
          fetchOnMount: false,
        });
        
        if (itemData.is_current) {
          // If setting a new season as current, update all others
          for (const season of seasons) {
            if (season.is_current) {
              await seasonsApi.updateItem({
                ...season,
                is_current: false
              });
            }
          }
        }
        
        const newSeason = await seasonsApi.createItem(itemData);
        await fetchSeasons();
        
        if (itemData.is_current) {
          setCurrentSeason(newSeason);
        }
        
        return newSeason;
      }
    } catch (error: any) {
      console.error(`Error creating ${itemType}:`, error);
      toast({
        title: `Error creating ${itemType}`,
        description: error.message || 'An error occurred',
        variant: "destructive",
      });
      throw error;
    }
  }, [currentSeason, createTeam, createStanding, fetchSeasons, tournament, seasons]);

  // Update an existing item
  const updateItem = useCallback(async (itemType: 'team' | 'standing' | 'season' | 'cup_match', data: any) => {
    try {
      if (itemType === 'team') {
        return await updateTeam(data);
      } else if (itemType === 'standing') {
        return await updateStanding(data);
      } else if (itemType === 'season') {
        // Custom season update with smart handling of is_current
        const seasonsApi = useAdminData<SeasonType>({
          table: `${tournament}_seasons`,
          fetchOnMount: false,
        });
        
        if (data.is_current) {
          // If setting a season as current, update all others
          for (const season of seasons) {
            if (season.is_current && season.id !== data.id) {
              await seasonsApi.updateItem({
                ...season,
                is_current: false
              });
            }
          }
        }
        
        const updatedSeason = await seasonsApi.updateItem(data);
        await fetchSeasons();
        
        if (data.is_current) {
          setCurrentSeason(updatedSeason);
        }
        
        return updatedSeason;
      } else if (itemType === 'cup_match') {
        return await updateCupMatch(data);
      }
    } catch (error: any) {
      console.error(`Error updating ${itemType}:`, error);
      toast({
        title: `Error updating ${itemType}`,
        description: error.message || 'An error occurred',
        variant: "destructive",
      });
      throw error;
    }
  }, [updateTeam, updateStanding, fetchSeasons, tournament, seasons, updateCupMatch]);

  // Delete an item
  const deleteItem = useCallback(async (itemType: 'team' | 'standing' | 'season' | 'cup_match', id: string) => {
    try {
      if (itemType === 'team') {
        return await deleteTeam(id);
      } else if (itemType === 'standing') {
        return await deleteStanding(id);
      } else if (itemType === 'season') {
        const seasonToDelete = seasons.find(s => s.id === id);
        
        if (seasonToDelete?.is_current) {
          throw new Error('Cannot delete the current season');
        }
        
        const seasonsApi = useAdminData<SeasonType>({
          table: `${tournament}_seasons`,
          fetchOnMount: false,
        });
        
        await seasonsApi.deleteItem(id);
        await fetchSeasons();
        return id;
      } else if (itemType === 'cup_match') {
        return await deleteCupMatch(id);
      }
    } catch (error: any) {
      console.error(`Error deleting ${itemType}:`, error);
      toast({
        title: `Error deleting ${itemType}`,
        description: error.message || 'An error occurred',
        variant: "destructive",
      });
      throw error;
    }
  }, [deleteTeam, deleteStanding, fetchSeasons, seasons, deleteCupMatch]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (tournament === 'cup') {
      await refreshCupMatches();
      return;
    }
    
    await fetchSeasons();
    
    if (activeTab === 'teams') {
      await refreshTeams();
    } else if (activeTab === 'standings') {
      await refreshStandings();
    }
  }, [tournament, activeTab, refreshCupMatches, fetchSeasons, refreshTeams, refreshStandings]);

  return {
    // Data
    currentSeason,
    teams,
    standings,
    seasons,
    cupMatches,
    
    // State
    activeTab,
    isLoading: loadingCurrentSeason || loadingTeams || loadingStandings || loadingSeasons || loadingCupMatches,
    error: seasonsError || teamsError || standingsError || cupMatchesError,
    
    // Actions
    setActiveTab: changeTab,
    refreshData,
    createItem,
    updateItem,
    deleteItem,
    setAsCurrentSeason
  };
}