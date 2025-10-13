import { useState, useEffect } from 'react';
import { shelfService, Shelf } from '../services/shelfService';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook to manage and fetch shelves for the warehouse from AuthContext.
 *
 * This hook automatically fetches shelves when the warehouse changes in the context.
 * It returns the list of shelves, loading and error states, and a refetch function 
 * for manual refreshes.
 */
export const useShelves = () => {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { warehouse } = useAuth();

  const fetchShelves = async () => {
    // If no warehouse is selected in context, clear the list and stop loading.
    if (!warehouse?.id) {
      setShelves([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await shelfService.getShelvesByWarehouse(warehouse.id);
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

  // Refetch when the warehouse changes in context
  useEffect(() => {
    fetchShelves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouse?.id]);

  return {
    shelves,
    loading,
    error,
    refetch: fetchShelves,
  };
};