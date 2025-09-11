import { useQuery } from '@tanstack/react-query';
import { heroService, HeroAPI } from '@/services/heroService';

export const useHeroes = () => {
  return useQuery({
    queryKey: ['heroes'],
    queryFn: async () => {
      console.log('useHeroes: Fetching heroes...');
      const response = await heroService.getHeroes();
      console.log('useHeroes: API response:', response);
      return response;
    },
    select: (data) => {
      console.log('useHeroes: Selecting data:', data);
      if (data && data.details && data.details.heroes) {
        return data.details.heroes.filter(hero => hero.isActive);
      }
      return [];
    }
  });
};