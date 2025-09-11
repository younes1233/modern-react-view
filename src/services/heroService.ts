import BaseApiService, { ApiResponse } from './baseApiService';

// Data models matching the new API spec
export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  order: number;
}

export interface HeroAPI {
  id: number;
  title: string;
  subtitle?: string;
  image_url?: string;
  cta_text?: string;
  cta_link?: string;
  is_active: boolean;
  order: number;
  type: 'single' | 'slider';
  slides?: HeroSlide[];
  created_at: string;
  updated_at: string;
}

export interface CreateSingleHeroRequest {
  title: string;
  subtitle?: string;
  image: File;
  cta_text?: string;
  cta_link?: string;
  is_active: boolean;
  type: 'single';
}

export interface CreateSliderRequest {
  title: string;
  is_active: boolean;
  type: 'slider';
}

export interface UpdateHeroRequest {
  title: string;
  subtitle?: string;
  image?: File;
  cta_text?: string;
  cta_link?: string;
  is_active: boolean;
}

export interface CreateSlideRequest {
  title: string;
  subtitle?: string;
  image: File;
  cta_text?: string;
  cta_link?: string;
}

export interface UpdateSlideRequest {
  title: string;
  subtitle?: string;
  image?: File;
  cta_text?: string;
  cta_link?: string;
}

class HeroService extends BaseApiService {
  // Get all heroes (public - store front)
  async getPublicHeroes(): Promise<ApiResponse<HeroAPI[]>> {
    console.log('HeroService: Making GET request to /heroes');
    const response = await this.get<{ success: boolean; data: HeroAPI[] }>('/heroes');
    console.log('HeroService: Public heroes response:', response);
    
    // Return the response data directly since there's no is_active filtering needed
    const transformedResponse = {
      error: !response.success,
      message: response.success ? 'Success' : 'Error',
      details: response.data || []
    };
    console.log('HeroService: Transformed response:', transformedResponse);
    return transformedResponse;
  }

  // Get all heroes (admin)
  async getAdminHeroes(): Promise<ApiResponse<HeroAPI[]>> {
    const response = await this.get<{ success: boolean; data: HeroAPI[] }>('/admin/heroes');
    // Transform to match ApiResponse structure
    return {
      error: !response.success,
      message: response.success ? 'Success' : 'Error',
      details: response.data
    };
  }

  // Create single hero
  async createSingleHero(data: CreateSingleHeroRequest): Promise<ApiResponse<HeroAPI>> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    formData.append('image', data.image);
    if (data.cta_text) formData.append('cta_text', data.cta_text);
    if (data.cta_link) formData.append('cta_link', data.cta_link);
    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('type', data.type);

    const response = await this.postFormData<ApiResponse<HeroAPI>>('/admin/heroes', formData);
    return response;
  }

  // Create slider
  async createSlider(data: CreateSliderRequest): Promise<ApiResponse<HeroAPI>> {
    const response = await this.post<ApiResponse<HeroAPI>>('/admin/heroes', {
      title: data.title,
      is_active: data.is_active ? 1 : 0,
      type: data.type
    });
    return response;
  }

  // Add slide to slider
  async addSlide(sliderId: number, data: CreateSlideRequest): Promise<ApiResponse<HeroSlide>> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    formData.append('image', data.image);
    if (data.cta_text) formData.append('cta_text', data.cta_text);
    if (data.cta_link) formData.append('cta_link', data.cta_link);

    const response = await this.postFormData<ApiResponse<HeroSlide>>(`/admin/heroes/${sliderId}/slides`, formData);
    return response;
  }

  // Update hero/slider
  async updateHero(id: number, data: UpdateHeroRequest): Promise<ApiResponse<HeroAPI>> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    if (data.image) formData.append('image', data.image);
    if (data.cta_text) formData.append('cta_text', data.cta_text);
    if (data.cta_link) formData.append('cta_link', data.cta_link);
    formData.append('is_active', data.is_active ? '1' : '0');

    const response = await this.putFormData<ApiResponse<HeroAPI>>(`/admin/heroes/${id}`, formData);
    return response;
  }

  // Update slide
  async updateSlide(sliderId: number, slideId: number, data: UpdateSlideRequest): Promise<ApiResponse<HeroSlide>> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    if (data.image) formData.append('image', data.image);
    if (data.cta_text) formData.append('cta_text', data.cta_text);
    if (data.cta_link) formData.append('cta_link', data.cta_link);

    const response = await this.putFormData<ApiResponse<HeroSlide>>(`/admin/heroes/${sliderId}/slides/${slideId}`, formData);
    return response;
  }

  // Delete hero/slider
  async deleteHero(id: number): Promise<ApiResponse<{}>> {
    const response = await this.delete<ApiResponse<{}>>(`/admin/heroes/${id}`);
    return response;
  }

  // Delete slide
  async deleteSlide(sliderId: number, slideId: number): Promise<ApiResponse<{}>> {
    const response = await this.delete<ApiResponse<{}>>(`/admin/heroes/${sliderId}/slides/${slideId}`);
    return response;
  }

  // Reorder heroes
  async reorderHeroes(order: number[]): Promise<ApiResponse<{}>> {
    const response = await this.post<ApiResponse<{}>>('/admin/heroes/reorder', { order });
    return response;
  }

  // Reorder slides in slider
  async reorderSlides(sliderId: number, order: number[]): Promise<ApiResponse<{}>> {
    const response = await this.post<ApiResponse<{}>>(`/admin/heroes/${sliderId}/slides/reorder`, { order });
    return response;
  }
}

export const heroService = new HeroService();
export default heroService;