import { useQuery } from '@tanstack/react-query';
import { categoryService, Category } from '../services/categoryService';

export const useStoreCategories = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => {
      const response = await categoryService.getStoreCategories();

      if (!response.error && response.details?.categories) {
        return response.details.categories;
      }
      throw new Error(response.message || 'Failed to load categories');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
  });

  return {
    categories: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};