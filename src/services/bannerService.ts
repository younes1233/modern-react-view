
import BaseApiService from './baseApiService';

interface BannerResponse {
  error: boolean;
  message: string;
  details: {
    banners: BannerAPIData[];
  };
}

interface BannerCreateResponse {
  error: boolean;
  message: string;
  details: {
    banner: BannerAPIData;
  };
}

interface BannerImages {
  urls: {
    original: string;
    banner: {
      desktop: string;
      tablet: string;
      mobile: string;
    };
  };
  alt?: string | null;
}

interface BannerAPIData {
  id: number;
  title: string;
  subtitle?: string;
  images: BannerImages;
  cta_text?: string;
  cta_link?: string;
  position: 'hero' | 'secondary' | 'sidebar';
  is_active: boolean;
  order: number;
}

class BannerService extends BaseApiService {
  constructor() {
    super();
    // Ensure token is loaded from localStorage if available
    const token = localStorage.getItem('auth_token');
    if (token && !this.getToken()) {
      this.setToken(token);
    }
  }

  async getBanners(): Promise<BannerResponse> {
    return this.get<BannerResponse>('/banners');
  }

  async createBanner(bannerData: {
    title: string;
    subtitle?: string;
    image: File;
    cta_text?: string;
    cta_link?: string;
    position: 'hero' | 'secondary' | 'sidebar';
    is_active?: boolean;
  }): Promise<BannerCreateResponse> {
    const formData = new FormData();
    formData.append('title', bannerData.title);
    if (bannerData.subtitle) formData.append('subtitle', bannerData.subtitle);
    formData.append('image', bannerData.image);
    if (bannerData.cta_text) formData.append('cta_text', bannerData.cta_text);
    if (bannerData.cta_link) formData.append('cta_link', bannerData.cta_link);
    formData.append('position', bannerData.position);
    formData.append('is_active', String(bannerData.is_active ?? true));

    return this.postFormData<BannerCreateResponse>('/banners', formData);
  }

  async updateBanner(
    id: number,
    bannerData: Partial<{
      title: string;
      subtitle: string;
      image: File;
      cta_text: string;
      cta_link: string;
      position: 'hero' | 'secondary' | 'sidebar';
      is_active: boolean;
    }>
  ): Promise<BannerCreateResponse> {
    const formData = new FormData();
    
    if (bannerData.title) formData.append('title', bannerData.title);
    if (bannerData.subtitle) formData.append('subtitle', bannerData.subtitle);
    if (bannerData.image) formData.append('image', bannerData.image);
    if (bannerData.cta_text) formData.append('cta_text', bannerData.cta_text);
    if (bannerData.cta_link) formData.append('cta_link', bannerData.cta_link);
    if (bannerData.position) formData.append('position', bannerData.position);
    if (bannerData.is_active !== undefined) formData.append('is_active', String(bannerData.is_active));

    return this.putFormData<BannerCreateResponse>(`/banners/${id}`, formData);
  }

  async deleteBanner(id: number): Promise<BannerResponse> {
    return this.delete<BannerResponse>(`/banners/${id}`);
  }

  async reorderBanners(bannerIds: number[]): Promise<BannerResponse> {
    return this.put<BannerResponse>('/banners/reorder', bannerIds);
  }
}

// Create and export a singleton instance
export const bannerService = new BannerService();
export default bannerService;
export type { BannerImages, BannerAPIData };
