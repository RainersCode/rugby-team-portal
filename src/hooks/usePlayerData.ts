import { useState, useEffect } from 'react';

export interface PlayerType {
  id: string;
  name: string;
  position: string;
  number: number;
  image: string;
  stats: {
    matches: number;
    tries: number;
    tackles: number;
  };
  social: {
    instagram: string;
    twitter: string;
  };
  achievements: string[];
}

export function usePlayerData() {
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch players from our API - include a timestamp to avoid caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/data?table=players&_t=${timestamp}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch players: ${response.status}`);
      }
      
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching players:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createPlayer = async (player: Omit<PlayerType, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Creating player with data:', player);
      const response = await fetch(`/api/admin/data?table=players&_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(player),
      });

      if (!response.ok) {
        // Try to parse response as JSON if possible
        let errorMessage = `Failed to create player: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          // If can't parse as JSON, use text
          const text = await response.text();
          console.error('Error response text:', text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Create response:', data);
      
      await fetchData();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create player';
      setError(errorMessage);
      console.error('Error creating player:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlayer = async (id: string, player: Partial<PlayerType>) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Updating player with ID and data:', id, player);
      
      // Create a new object with the id first to ensure it's included correctly
      const playerData = {
        id,
        ...player
      };
      
      const response = await fetch(`/api/admin/data?table=players&update=true&_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        // Try to parse response as JSON if possible
        let errorMessage = `Failed to update player: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          // If can't parse as JSON, use text
          const text = await response.text();
          console.error('Error response text:', text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Update response:', data);
      
      await fetchData();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update player';
      setError(errorMessage);
      console.error('Error updating player:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlayer = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Deleting player with ID:', id);
      const response = await fetch(`/api/admin/data?table=players&id=${id}&_t=${Date.now()}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Try to parse response as JSON if possible
        let errorMessage = `Failed to delete player: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          // If can't parse as JSON, use text
          const text = await response.text();
          console.error('Error response text:', text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Delete response:', data);
      
      await fetchData();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete player';
      setError(errorMessage);
      console.error('Error deleting player:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    players,
    isLoading,
    error,
    refreshData: fetchData,
    createPlayer,
    updatePlayer,
    deletePlayer,
  };
} 