import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { heroService, HeroAPI, CreateSingleHeroRequest, CreateSliderRequest, UpdateHeroRequest, CreateSlideRequest, UpdateSlideRequest } from '@/services/heroService';
import { toast } from '@/components/ui/sonner';

// Public heroes for store front
export const useHeroes = () => {
  return useQuery({
    queryKey: ['heroes'],
    queryFn: async () => {
      console.log('useHeroes: Fetching heroes from API...');
      const response = await heroService.getPublicHeroes();
      console.log('useHeroes: Raw API response:', response);
      
      if (response && response.details) {
        console.log('useHeroes: Heroes data found:', response.details);
        return response.details;
      }
      console.log('useHeroes: No details in response, returning empty array');
      return [];
    }
  });
};

// Admin heroes for management
export const useAdminHeroes = () => {
  return useQuery({
    queryKey: ['admin-heroes'],
    queryFn: async () => {
      const response = await heroService.getAdminHeroes();
      return response;
    },
    select: (data) => {
      if (data && data.details) {
        return data.details;
      }
      return [];
    }
  });
};

// Create single hero
export const useCreateSingleHero = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: (data: CreateSingleHeroRequest) => heroService.createSingleHero(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast.success("Hero created successfully", { duration: 2000 });
    },
    onError: () => {
      toast.error("Failed to create hero", { duration: 2500 });
    }
  });
};

// Create slider
export const useCreateSlider = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: (data: CreateSliderRequest) => heroService.createSlider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast.success("Slider created successfully", { duration: 2000 });
    },
    onError: () => {
      toast.error("Failed to create slider", { duration: 2500 });
    }
  });
};

// Add slide to slider
export const useAddSlide = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: ({ sliderId, data }: { sliderId: number; data: CreateSlideRequest }) => 
      heroService.addSlide(sliderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast.success("Slide added successfully", { duration: 2000 });
    },
    onError: () => {
      toast.error("Failed to add slide", { duration: 2500 });
    }
  });
};

// Update hero
export const useUpdateHero = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHeroRequest }) => 
      heroService.updateHero(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast.success("Hero updated successfully", { duration: 2000 });
    },
    onError: () => {
      toast.error("Failed to update hero", { duration: 2500 });
    }
  });
};

// Update slide
export const useUpdateSlide = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: ({ sliderId, slideId, data }: { sliderId: number; slideId: number; data: UpdateSlideRequest }) => 
      heroService.updateSlide(sliderId, slideId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast.success("Slide updated successfully", { duration: 2000 });
    },
    onError: () => {
      toast.error("Failed to update slide", { duration: 2500 });
    }
  });
};

// Delete hero
export const useDeleteHero = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: (id: number) => heroService.deleteHero(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast.success("Hero deleted successfully", { duration: 2000 });
    },
    onError: () => {
      toast.error("Failed to delete hero", { duration: 2500 });
    }
  });
};

// Delete slide
export const useDeleteSlide = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: ({ sliderId, slideId }: { sliderId: number; slideId: number }) => 
      heroService.deleteSlide(sliderId, slideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast.success("Slide deleted successfully", { duration: 2000 });
    },
    onError: () => {
      toast.error("Failed to delete slide", { duration: 2500 });
    }
  });
};

// Reorder heroes
export const useReorderHeroes = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: (order: number[]) => heroService.reorderHeroes(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast.success("Heroes reordered successfully", { duration: 2000 });
    },
    onError: () => {
      toast.error("Failed to reorder heroes", { duration: 2500 });
    }
  });
};

// Reorder slides
export const useReorderSlides = () => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: ({ sliderId, order }: { sliderId: number; order: number[] }) => 
      heroService.reorderSlides(sliderId, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast.success("Slides reordered successfully", { duration: 2000 });
    },
    onError: () => {
      toast.error("Failed to reorder slides", { duration: 2500 });
    }
  });
};