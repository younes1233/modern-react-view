import { useState, useEffect } from 'react';
import { storeCountryService, StoreCountry } from '@/services/storeCountryService';
import { toast } from '@/hooks/use-toast';

export function useStoreCountries() {
  const [countries, setCountries] = useState<StoreCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeCountryService.getCountries();
      
      if (!response.error && response.details?.data) {
        setCountries(response.details.data);
      } else {
        setError('Failed to load countries');
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError('Failed to load countries');
      toast({
        title: "Error",
        description: "Failed to load countries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  return {
    countries,
    loading,
    error,
    refetch: fetchCountries,
  };
}