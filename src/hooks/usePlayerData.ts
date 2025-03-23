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
      // Fetch players from our API
      const response = await fetch('/api/admin/data?table=players');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch players');
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
    try {
      const response = await fetch('/api/admin/data?table=players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(player),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create player');
      }

      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create player');
      console.error('Error creating player:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlayer = async (id: string, player: Partial<PlayerType>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/data?table=players&update=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...player }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update player');
      }

      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update player');
      console.error('Error updating player:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlayer = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/data?table=players&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete player');
      }

      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete player');
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