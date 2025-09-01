import { useState, useEffect } from 'react';
import { shelfService, Shelf } from '../services/shelfService';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook to manage and fetch shelves for a given warehouse.
 *
 * This hook accepts a warehouse ID (number or string). When the ID changes,
 * it will automatically refetch the shelves scoped to that warehouse. It
 * returns the list of shelves, loading and error states, and a refetch
 * function for manual refreshes.
 *
 * @param warehouseId The warehouse ID or undefined to reset the list.
 */
export const useShelves = (warehouseId?: number | string) => {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchShelves = async () => {
    // If no warehouseId is provided, clear the list and stop loading.
    if (!warehouseId) {
      setShelves([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const id =
        typeof warehouseId === 'string' ? parseInt(warehouseId, 10) : warehouseId;
      const response = await shelfService.getShelvesByWarehouse(id);
      if (!response.error && response.details) {
        setShelves(response.details.shelves || []);
      } else {
        setError(response.message || 'Failed to load shelves');
        setShelves([]);
        toast({
          title: 'Error',
          description: response.message || 'Failed to load shelves',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error fetching shelves:', err);
      setError('Failed to load shelves');
      setShelves([]);
      toast({
        title: 'Error',
        description: 'Failed to load shelves',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Refetch when the warehouseId changes
  useEffect(() => {
    fetchShelves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  return {
    shelves,
    loading,
    error,
    refetch: fetchShelves,
  };
};