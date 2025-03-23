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
      const response = await fetch('/api/admin/data?table=players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(player),
      });

      // Log full response for debugging
      const responseText = await response.text();
      console.log(`API Response (${response.status}):`, responseText);
      
      if (!response.ok) {
        let errorMessage = 'Failed to create player';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

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
      const response = await fetch(`/api/admin/data?table=players&update=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...player }),
      });

      // Log full response for debugging
      const responseText = await response.text();
      console.log(`API Response (${response.status}):`, responseText);
      
      if (!response.ok) {
        let errorMessage = 'Failed to update player';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

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
      const response = await fetch(`/api/admin/data?table=players&id=${id}`, {
        method: 'DELETE',
      });

      // Log full response for debugging
      const responseText = await response.text();
      console.log(`API Response (${response.status}):`, responseText);
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete player';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

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