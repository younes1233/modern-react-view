
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeSectionService, HomeSectionAPI, CreateHomeSectionRequest, UpdateHomeSectionRequest } from '@/services/homeSectionService';
import { useToast } from '@/hooks/use-toast';

export const useHomeSections = () => {
  const { toast } = useToast();

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
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateHomeSectionRequest) => homeSectionService.createHomeSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      toast({
        title: "Success",
        description: "Home section created successfully"
      });
    },
    onError: (error: any) => {
      console.error('Create home section error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create home section",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateHomeSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHomeSectionRequest }) => 
      homeSectionService.updateHomeSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      toast({
        title: "Success",
        description: "Home section updated successfully"
      });
    },
    onError: (error: any) => {
      console.error('Update home section error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update home section",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteHomeSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => homeSectionService.deleteHomeSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      toast({
        title: "Success",
        description: "Home section deleted successfully"
      });
    },
    onError: (error: any) => {
      console.error('Delete home section error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete home section",
        variant: "destructive"
      });
    }
  });
};

export const useReorderHomeSections = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (order: number[]) => homeSectionService.reorderHomeSections(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      toast({
        title: "Success",
        description: "Home sections reordered successfully"
      });
    },
    onError: (error: any) => {
      console.error('Reorder home sections error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reorder home sections",
        variant: "destructive"
      });
    }
  });
};
