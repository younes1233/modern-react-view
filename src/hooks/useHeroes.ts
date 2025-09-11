import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { heroService, HeroAPI, CreateSingleHeroRequest, CreateSliderRequest, UpdateHeroRequest, CreateSlideRequest, UpdateSlideRequest } from '@/services/heroService';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSingleHeroRequest) => heroService.createSingleHero(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast({
        title: "Success",
        description: "Hero created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create hero",
        variant: "destructive"
      });
    }
  });
};

// Create slider
export const useCreateSlider = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSliderRequest) => heroService.createSlider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast({
        title: "Success",
        description: "Slider created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create slider",
        variant: "destructive"
      });
    }
  });
};

// Add slide to slider
export const useAddSlide = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sliderId, data }: { sliderId: number; data: CreateSlideRequest }) => 
      heroService.addSlide(sliderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast({
        title: "Success",
        description: "Slide added successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add slide",
        variant: "destructive"
      });
    }
  });
};

// Update hero
export const useUpdateHero = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHeroRequest }) => 
      heroService.updateHero(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast({
        title: "Success",
        description: "Hero updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update hero",
        variant: "destructive"
      });
    }
  });
};

// Update slide
export const useUpdateSlide = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sliderId, slideId, data }: { sliderId: number; slideId: number; data: UpdateSlideRequest }) => 
      heroService.updateSlide(sliderId, slideId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast({
        title: "Success",
        description: "Slide updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update slide",
        variant: "destructive"
      });
    }
  });
};

// Delete hero
export const useDeleteHero = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => heroService.deleteHero(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast({
        title: "Success",
        description: "Hero deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete hero",
        variant: "destructive"
      });
    }
  });
};

// Delete slide
export const useDeleteSlide = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sliderId, slideId }: { sliderId: number; slideId: number }) => 
      heroService.deleteSlide(sliderId, slideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast({
        title: "Success",
        description: "Slide deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete slide",
        variant: "destructive"
      });
    }
  });
};

// Reorder heroes
export const useReorderHeroes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (order: number[]) => heroService.reorderHeroes(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast({
        title: "Success",
        description: "Heroes reordered successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reorder heroes",
        variant: "destructive"
      });
    }
  });
};

// Reorder slides
export const useReorderSlides = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sliderId, order }: { sliderId: number; order: number[] }) => 
      heroService.reorderSlides(sliderId, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-heroes'] });
      toast({
        title: "Success",
        description: "Slides reordered successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reorder slides",
        variant: "destructive"
      });
    }
  });
};