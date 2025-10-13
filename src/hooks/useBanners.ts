import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { bannerService, BannerImages } from '@/services/bannerService';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  images: BannerImages;
  ctaText?: string;
  ctaLink?: string;
  position: 'hero' | 'secondary' | 'sidebar';
  isActive: boolean;
  order: number;
}

export interface BannerFormData {
  title: string;
  subtitle?: string;
  image?: File;
  ctaText?: string;
  ctaLink?: string;
  position: 'hero' | 'secondary' | 'sidebar';
  isActive: boolean;
  order: number;
}

// Transform API data to internal format
const transformBannerFromAPI = (apiBanner: any): Banner => ({
  id: apiBanner.id,
  title: apiBanner.title,
  subtitle: apiBanner.subtitle,
  images: apiBanner.images,
  ctaText: apiBanner.cta_text,
  ctaLink: apiBanner.cta_link,
  position: apiBanner.position,
  isActive: Boolean(apiBanner.is_active),
  order: apiBanner.order,
});

export const useBanners = () => {
  const queryClient = useQueryClient();
  

  const {
    data: banners = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      console.log('useBanners: Fetching banners from API...');
      const response = await bannerService.getBanners();
      
      if (response.error) {
        throw new Error(response.message);
      }

      const transformedBanners = response.details.banners.map(transformBannerFromAPI);
      console.log('useBanners: Transformed banners:', transformedBanners);
      return transformedBanners;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const addBannerMutation = useMutation({
    mutationFn: async (bannerData: BannerFormData) => {
      if (!bannerData.image) {
        throw new Error('Image is required');
      }

      const apiData = {
        title: bannerData.title,
        subtitle: bannerData.subtitle,
        image: bannerData.image,
        cta_text: bannerData.ctaText,
        cta_link: bannerData.ctaLink,
        position: bannerData.position,
        is_active: bannerData.isActive,
      };

      const response = await bannerService.createBanner(apiData);
      
      if (response.error) {
        throw new Error(response.message);
      }

      return transformBannerFromAPI(response.details.banner);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Success",
        description: "Banner created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to create banner',
        variant: "destructive"
      });
    }
  });

  return {
    banners,
    isLoading,
    error: error?.message || null,
    addBanner: addBannerMutation.mutateAsync,
    updateBanner: async (id: number, bannerData: Partial<BannerFormData>) => {
      // This is simplified for now, you can convert to mutations later if needed
      throw new Error('Update not implemented yet');
    },
    deleteBanner: async (id: number) => {
      // This is simplified for now, you can convert to mutations later if needed
      throw new Error('Delete not implemented yet');
    },
    reorderBanners: async (bannerIds: number[]) => {
      // This is simplified for now, you can convert to mutations later if needed
      throw new Error('Reorder not implemented yet');
    },
    refetch,
  };
};
