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
        // Group heroes: return parent heroes with their slides nested
        const allHeroes = data.details.heroes;
        const parentHeroes = allHeroes.filter(hero => hero.type !== 'slide');
        
        // Add slides to their parent heroes
        return parentHeroes.map(parent => {
          if (parent.type === 'slider') {
            const slides = allHeroes.filter(hero => 
              hero.type === 'slide' && hero.parent_id === parent.id
            );
            return { ...parent, slides, slides_count: slides.length };
          }
          return parent;
        });
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

export const useAddSlide = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ heroId, data }: { heroId: number; data: CreateHeroRequest }) => 
      heroService.addSlide(heroId, data),
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