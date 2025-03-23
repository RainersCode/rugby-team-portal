'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

interface FetchOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  select?: string;
}

interface AdminDataOptions<T> {
  table: string;
  initialData?: T[];
  fetchOnMount?: boolean;
  onSuccess?: (data: T[]) => void;
  onError?: (error: Error) => void;
}

export function useAdminData<T extends { id: string }>(options: AdminDataOptions<T>) {
  const { table, initialData = [], fetchOnMount = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async (fetchOptions?: FetchOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        table,
        t: Date.now().toString(),
        ...(fetchOptions?.limit && { limit: fetchOptions.limit.toString() }),
        ...(fetchOptions?.offset && { offset: fetchOptions.offset.toString() }),
        ...(fetchOptions?.orderBy && { orderBy: fetchOptions.orderBy }),
        ...(fetchOptions?.orderDirection && { orderDirection: fetchOptions.orderDirection }),
        ...(fetchOptions?.select && { select: fetchOptions.select })
      });
      
      const response = await fetch(`/api/admin/data?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }
      
      const fetchedData = await response.json();
      setData(fetchedData);
      
      if (onSuccess) {
        onSuccess(fetchedData);
      }
      
      return fetchedData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error(`Error fetching ${table}:`, error);
      setError(error);
      
      toast({
        title: `Error fetching ${table}`,
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [table, onSuccess, onError]);

  const getItemById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        table,
        id,
        t: Date.now().toString(),
      });
      
      const response = await fetch(`/api/admin/data?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }
      
      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error(`Error fetching item from ${table}:`, error);
      
      toast({
        title: `Error fetching item`,
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table]);

  const createItem = useCallback(async (item: Omit<T, 'id'>) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        table,
        t: Date.now().toString(),
      });
      
      const response = await fetch(`/api/admin/data?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }
      
      const newItem = await response.json();
      setData(prev => [newItem[0], ...prev]);
      
      toast({
        title: 'Success',
        description: 'Item created successfully',
      });
      
      return newItem[0];
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error(`Error creating item in ${table}:`, error);
      
      toast({
        title: 'Error creating item',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table]);

  const updateItem = useCallback(async (item: T) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        table,
        update: 'true',
        t: Date.now().toString(),
      });
      
      const response = await fetch(`/api/admin/data?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }
      
      const updatedItem = await response.json();
      setData(prev => prev.map(i => i.id === item.id ? updatedItem[0] : i));
      
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
      
      return updatedItem[0];
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error(`Error updating item in ${table}:`, error);
      
      toast({
        title: 'Error updating item',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        table,
        id,
        t: Date.now().toString(),
      });
      
      const response = await fetch(`/api/admin/data?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }
      
      setData(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
      
      return id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error(`Error deleting item from ${table}:`, error);
      
      toast({
        title: 'Error deleting item',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table]);

  // Fetch data on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchData, fetchOnMount]);

  return {
    data,
    loading,
    error,
    fetchData,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    refresh: fetchData,
  };
} 