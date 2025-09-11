import { useQuery } from '@tanstack/react-query';
import { storeHeroService } from '@/services/storeHeroService';

// Store heroes hook specifically for the store front
export const useStoreHeroes = () => {
  return useQuery({
    queryKey: ['store-heroes'],
    queryFn: async () => {
      console.log('useStoreHeroes: Fetching store heroes from API...');
      const response = await storeHeroService.getStoreHeroes();
      console.log('useStoreHeroes: Raw API response:', response);
      
      if (response && response.success && response.data) {
        console.log('useStoreHeroes: Heroes data found:', response.data);
        return response.data;
      }
      console.log('useStoreHeroes: No heroes data found, returning empty array');
      return [];
    }
  });
};