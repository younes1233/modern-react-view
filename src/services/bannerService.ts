
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

interface BannerAPIData {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  alt?: string;
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
    image: string;
    alt?: string;
    cta_text?: string;
    cta_link?: string;
    position: 'hero' | 'secondary' | 'sidebar';
    is_active?: boolean;
  }): Promise<BannerCreateResponse> {
    return this.post<BannerCreateResponse>('/banners', bannerData);
  }

  async updateBanner(
    id: number,
    bannerData: Partial<{
      title: string;
      subtitle: string;
      image: string;
      alt: string;
      cta_text: string;
      cta_link: string;
      position: 'hero' | 'secondary' | 'sidebar';
      is_active: boolean;
    }>
  ): Promise<BannerCreateResponse> {
    return this.put<BannerCreateResponse>(`/banners/${id}`, bannerData);
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
