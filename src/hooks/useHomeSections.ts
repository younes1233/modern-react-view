
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeSectionService, HomeSectionAPI, CreateHomeSectionRequest, UpdateHomeSectionRequest } from '@/services/homeSectionService';
import { toast } from '@/components/ui/sonner';

export const useHomeSections = () => {
  

  return useQuery({
    queryKey: ['homeSections'],
    queryFn: async () => {
      console.log('useHomeSections: Fetching home sections...');
      const response = await homeSectionService.getHomeSections();
      console.log('useHomeSections: API response:', response);
      return response;
    },
    select: (data) => {
      console.log('useHomeSections: Selecting data:', data);
      if (data && data.details && data.details.home_sections) {
        return data.details.home_sections;
      }
      return [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCreateHomeSection = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: (data: CreateHomeSectionRequest) => homeSectionService.createHomeSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      toast.success("Home section created successfully", { duration: 2000 });
    },
    onError: (error: any) => {
      console.error('Create home section error:', error);
      toast.error(error.message || "Failed to create home section", { duration: 2500 });
    }
  });
};

export const useUpdateHomeSection = () => {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHomeSectionRequest }) =>
      homeSectionService.updateHomeSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      toast.success("Home section updated successfully", { duration: 2000 });
    },
    onError: (error: any) => {
      console.error('Update home section error:', error);
      toast.error(error.message || "Failed to update home section", { duration: 2500 });
    }
  });
};

export const useDeleteHomeSection = () => {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: (id: number) => homeSectionService.deleteHomeSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      toast.success("Home section deleted successfully", { duration: 2000 });
    },
    onError: (error: any) => {
      console.error('Delete home section error:', error);
      toast.error(error.message || "Failed to delete home section", { duration: 2500 });
    }
  });
};

export const useReorderHomeSections = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: (order: number[]) => homeSectionService.reorderHomeSections(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      toast.success("Home sections reordered successfully", { duration: 2000 });
    },
    onError: (error: any) => {
      console.error('Reorder home sections error:', error);
      toast.error(error.message || "Failed to reorder home sections", { duration: 2500 });
    }
  });
};
