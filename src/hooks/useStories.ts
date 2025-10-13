
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storyService, Story } from '@/services/storyService';
import { toast } from '@/components/ui/sonner';

export const useStories = () => {
  const queryClient = useQueryClient();
  

  const {
    data: stories = [],
    isLoading: loading,
    error,
    refetch: fetchStories
  } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      console.log('useStories: Fetching stories from API...');
      const data = await storyService.getStories();
      console.log('useStories: Stories data:', data);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    stories,
    loading,
    error: error?.message || null,
    fetchStories,
    createStory: async (data: any) => {
      throw new Error('Create story not implemented yet');
    },
    updateStory: async (id: string, data: any) => {
      throw new Error('Update story not implemented yet');
    },
    deleteStory: async (id: string) => {
      throw new Error('Delete story not implemented yet');
    },
  };
};
