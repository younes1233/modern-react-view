import { useQuery } from '@tanstack/react-query';
import { storeCountryService, StoreCountry } from '@/services/storeCountryService';

export function useStoreCountries() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['store-countries'],
    queryFn: async () => {
      const response = await storeCountryService.getCountries();

      if (response && response.data) {
        return response.data;
      }
      throw new Error('Failed to load countries');
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - countries rarely change
    gcTime: 60 * 60 * 1000, // 1 hour in cache
  });

  return {
    countries: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}