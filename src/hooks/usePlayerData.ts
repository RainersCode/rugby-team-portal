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
      // Ensure the data structure is valid
      const validatedPlayer = {
        name: player.name || '',
        position: player.position || '',
        number: typeof player.number === 'number' ? player.number : 0,
        image: player.image || '',
        stats: {
          matches: typeof player.stats?.matches === 'number' ? player.stats.matches : 0,
          tries: typeof player.stats?.tries === 'number' ? player.stats.tries : 0,
          tackles: typeof player.stats?.tackles === 'number' ? player.stats.tackles : 0,
        },
        social: {
          instagram: player.social?.instagram || '',
          twitter: player.social?.twitter || '',
        },
        achievements: Array.isArray(player.achievements) ? player.achievements : [],
      };

      console.log('Creating player with validated data:', validatedPlayer);
      
      const response = await fetch(`/api/admin/data?table=players&_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedPlayer),
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
      // Ensure we're sending valid data structure
      const updateData: any = { id };
      
      // Only include fields that are provided
      if (player.name !== undefined) updateData.name = player.name;
      if (player.position !== undefined) updateData.position = player.position;
      if (player.number !== undefined) updateData.number = typeof player.number === 'number' ? player.number : 0;
      if (player.image !== undefined) updateData.image = player.image;
      
      // Handle nested objects carefully
      if (player.stats) {
        updateData.stats = {
          matches: typeof player.stats.matches === 'number' ? player.stats.matches : 0,
          tries: typeof player.stats.tries === 'number' ? player.stats.tries : 0,
          tackles: typeof player.stats.tackles === 'number' ? player.stats.tackles : 0,
        };
      }
      
      if (player.social) {
        updateData.social = {
          instagram: player.social.instagram || '',
          twitter: player.social.twitter || '',
        };
      }
      
      if (player.achievements !== undefined) {
        updateData.achievements = Array.isArray(player.achievements) ? player.achievements : [];
      }
      
      console.log('Updating player with validated data:', updateData);
      
      const response = await fetch(`/api/admin/data?table=players&update=true&_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
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
      
      // First fetch the player to confirm it exists
      console.log('Verifying player exists before deletion');
      try {
        const verifyResponse = await fetch(`/api/admin/data?table=players&id=${id}&_t=${Date.now()}`);
        if (!verifyResponse.ok) {
          console.log('Player not found or not accessible, proceeding with delete anyway');
        } else {
          const playerData = await verifyResponse.json();
          console.log('Found player to delete:', playerData);
        }
      } catch (verifyError) {
        console.warn('Error verifying player existence:', verifyError);
        // Continue with deletion attempt regardless
      }
      
      // Make the delete request
      console.log(`Making DELETE request to /api/admin/data?table=players&id=${id}`);
      const response = await fetch(`/api/admin/data?table=players&id=${id}&_t=${Date.now()}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log(`Delete response status: ${response.status} ${response.statusText}`);
      
      // Instead of trying to parse the response immediately, get the text first
      const responseText = await response.text();
      console.log('Delete response text:', responseText);
      
      if (!response.ok) {
        let errorMessage = `Failed to delete player: ${response.status} ${response.statusText}`;
        try {
          // Only try to parse as JSON if it looks like JSON
          if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
            const errorData = JSON.parse(responseText);
            console.error('Error response:', errorData);
            errorMessage = errorData.error || errorData.details || errorMessage;
          } else {
            errorMessage = responseText || errorMessage;
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Try to parse the successful response
      let data;
      try {
        if (responseText.trim()) {
          data = JSON.parse(responseText);
        } else {
          data = { success: true };
        }
      } catch (e) {
        console.warn('Could not parse delete response as JSON, using text instead');
        data = { success: true, text: responseText };
      }
      
      console.log('Delete operation completed successfully:', data);
      
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