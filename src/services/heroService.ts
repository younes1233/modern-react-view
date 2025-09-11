import BaseApiService, { ApiResponse } from './baseApiService';

export interface HeroImages {
  original: string;
  hero: {
    desktop: string;
    mobile: string;
  };
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  images: HeroImages;
  cta_text: string;
  cta_link: string;
  order: number;
  parent_id: number;
  is_active: boolean;
  type: 'single' | 'slider' | 'slide';
  created_at: string;
  updated_at: string;
}

export interface HeroAPI {
  id: number;
  title: string;
  subtitle: string;
  images: HeroImages;
  cta_text: string;
  cta_link: string;
  order: number;
  parent_id: number | null;
  is_active: boolean;
  type: 'single' | 'slider' | 'slide';
  created_at: string;
  updated_at: string;
  slides?: HeroAPI[];
  slides_count?: number;
}

export interface CreateHeroRequest {
  title: string;
  subtitle?: string;
  background_image: File;
  cta_text?: string;
  cta_link?: string;
  type: 'single' | 'slider' | 'slide';
  parent_id?: number;
  is_active: boolean;
}

export interface UpdateHeroRequest {
  title: string;
  subtitle?: string;
  background_image?: File;
  cta_text?: string;
  cta_link?: string;
  type: 'single' | 'slider' | 'slide';
  parent_id?: number;
  is_active: boolean;
}

class HeroService extends BaseApiService {
  // Get all heroes (admin view - includes all types)
  async getHeroes(): Promise<ApiResponse<{ heroes: HeroAPI[] }>> {
    console.log('Fetching heroes from API...');
    const response = await this.get<ApiResponse<{ heroes: HeroAPI[] }>>('/admin/heroes');
    console.log('Heroes API response:', response);
    return response;
  }

  // Get single hero
  async getHero(id: number): Promise<ApiResponse<{ hero: HeroAPI }>> {
    const response = await this.get<ApiResponse<{ hero: HeroAPI }>>(`/admin/heroes/${id}`);
    return response;
  }

  // Create hero - this creates either single, slider, or slide
  async createHero(data: CreateHeroRequest): Promise<ApiResponse<{ hero: HeroAPI }>> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    formData.append('background_image', data.background_image);
    if (data.cta_text) formData.append('cta_text', data.cta_text);
    if (data.cta_link) formData.append('cta_link', data.cta_link);
    formData.append('type', data.type);
    if (data.parent_id) formData.append('parent_id', data.parent_id.toString());
    formData.append('is_active', data.is_active ? '1' : '0');

    const response = await this.postFormData<ApiResponse<{ hero: HeroAPI }>>('/admin/heroes', formData);
    return response;
  }

  // Update hero
  async updateHero(id: number, data: UpdateHeroRequest): Promise<ApiResponse<{ hero: HeroAPI }>> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    if (data.background_image) formData.append('background_image', data.background_image);
    if (data.cta_text) formData.append('cta_text', data.cta_text);
    if (data.cta_link) formData.append('cta_link', data.cta_link);
    formData.append('type', data.type);
    if (data.parent_id) formData.append('parent_id', data.parent_id.toString());
    formData.append('is_active', data.is_active ? '1' : '0');

    const response = await this.putFormData<ApiResponse<{ hero: HeroAPI }>>(`/admin/heroes/${id}`, formData);
    return response;
  }

  // Delete hero
  async deleteHero(id: number): Promise<ApiResponse<{}>> {
    const response = await this.delete<ApiResponse<{}>>(`/admin/heroes/${id}`);
    return response;
  }

  // Reorder heroes
  async reorderHeroes(order: number[]): Promise<ApiResponse<{ heroes: HeroAPI[] }>> {
    const response = await this.request<ApiResponse<{ heroes: HeroAPI[] }>>('/admin/heroes/reorder', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order }),
    });
    return response;
  }
}

export const heroService = new HeroService();
export default heroService;