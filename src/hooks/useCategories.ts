import { useQuery } from '@tanstack/react-query';
import { categoryService, Category, CategoryFilters } from '@/services/categoryService';

export const useCategories = (filters: CategoryFilters = {}) => {
  return useQuery({
    queryKey: ['categories', filters],
    queryFn: async () => {
      const response = await categoryService.getCategories(filters);
      return response.details || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFlatCategories = () => {
  return useQuery({
    queryKey: ['categories', 'flat'],
    queryFn: async () => {
      const response = await categoryService.getFlatCategories();
      // Handle both single category and array responses
      if (response.details) {
        if (Array.isArray(response.details)) {
          return response.details;
        } else if ((response.details as any).categories) {
          return (response.details as any).categories;
        } else if ((response.details as any).category) {
          return [(response.details as any).category];
        }
      }
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const response = await categoryService.getCategory(id);
      return response.details;
    },
    enabled: !!id,
  });
};