import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { heroService, HeroAPI, CreateHeroRequest, UpdateHeroRequest } from '@/services/heroService';
import { useToast } from '@/hooks/use-toast';

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
        // Filter to only include active heroes, but exclude individual slides
        // Slides will be included as part of their parent slider
        return data.details.heroes.filter(hero => 
          hero.is_active && hero.type !== 'slide'
        );
      }
      return [];
    }
  });
};

export const useAdminHeroes = () => {
  return useQuery({
    queryKey: ['admin-heroes'],
    queryFn: async () => {
      const response = await heroService.getHeroes();
      return response;
    },
    select: (data) => {
      if (data && data.details && data.details.heroes) {
        // Process the heroes to build the hierarchy
        const allHeroes = data.details.heroes;
        const result: HeroAPI[] = [];
        
        // First pass: add all non-slide heroes
        allHeroes.forEach(hero => {
          if (hero.type !== 'slide') {
            result.push({
              ...hero,
              slides: [],
              slides_count: 0
            });
          }
        });
        
        // Second pass: add slides to their parent sliders
        allHeroes.forEach(hero => {
          if (hero.type === 'slide' && hero.parent_id) {
            const parent = result.find(h => h.id === hero.parent_id);
            if (parent) {
              if (!parent.slides) parent.slides = [];
              parent.slides.push(hero);
              parent.slides_count = parent.slides.length;
            }
          }
        });
        
        return result;
      }
      return [];
    }
  });
};

export const useHero = (id: number) => {
  return useQuery({
    queryKey: ['hero', id],
    queryFn: async () => {
      const response = await heroService.getHero(id);
      return response;
    },
    select: (data) => {
      if (data && data.details && data.details.hero) {
        return data.details.hero;
      }
      return null;
    }
  });
};

export const useCreateHero = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateHeroRequest) => heroService.createHero(data),
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