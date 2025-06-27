
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
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
  image: apiBanner.image,
  ctaText: apiBanner.cta_text,
  ctaLink: apiBanner.cta_link,
  position: apiBanner.position,
  isActive: Boolean(apiBanner.is_active),
  order: apiBanner.order,
});

// Transform internal format to API data
const transformBannerToAPI = (banner: Omit<Banner, 'id'>) => ({
  title: banner.title,
  subtitle: banner.subtitle,
  image: banner.image,
  alt: banner.title, // Use title as alt if not provided
  cta_text: banner.ctaText,
  cta_link: banner.ctaLink,
  position: banner.position,
  is_active: banner.isActive,
});

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getBanners();
      
      if (response.error) {
        throw new Error(response.message);
      }

      const transformedBanners = response.details.banners.map(transformBannerFromAPI);
      setBanners(transformedBanners);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch banners';
      setError(errorMessage);
      console.error('Error fetching banners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addBanner = async (bannerData: Omit<Banner, 'id'>) => {
    try {
      const apiData = transformBannerToAPI(bannerData);
      const response = await apiService.createBanner(apiData);
      
      if (response.error) {
        throw new Error(response.message);
      }

      const newBanner = transformBannerFromAPI(response.details.banner);
      setBanners(prev => [...prev, newBanner]);
      
      toast({
        title: "Success",
        description: "Banner created successfully"
      });
      
      return newBanner;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create banner';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateBanner = async (id: number, bannerData: Partial<Omit<Banner, 'id'>>) => {
    try {
      const apiData = transformBannerToAPI(bannerData as Omit<Banner, 'id'>);
      const response = await apiService.updateBanner(id, apiData);
      
      if (response.error) {
        throw new Error(response.message);
      }

      const updatedBanner = transformBannerFromAPI(response.details.banner);
      setBanners(prev => prev.map(banner => 
        banner.id === id ? updatedBanner : banner
      ));
      
      toast({
        title: "Success",
        description: "Banner updated successfully"
      });
      
      return updatedBanner;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update banner';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteBanner = async (id: number) => {
    try {
      const response = await apiService.deleteBanner(id);
      
      if (response.error) {
        throw new Error(response.message);
      }

      // API returns reordered banners after deletion
      const transformedBanners = response.details.banners.map(transformBannerFromAPI);
      setBanners(transformedBanners);
      
      toast({
        title: "Success",
        description: "Banner deleted successfully"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete banner';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const reorderBanners = async (bannerIds: number[]) => {
    try {
      const response = await apiService.reorderBanners(bannerIds);
      
      if (response.error) {
        throw new Error(response.message);
      }

      const transformedBanners = response.details.banners.map(transformBannerFromAPI);
      setBanners(transformedBanners);
      
      toast({
        title: "Success",
        description: "Banner order updated successfully"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder banners';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    banners,
    isLoading,
    error,
    addBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
    refetch: fetchBanners,
  };
};
