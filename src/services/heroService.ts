import BaseApiService, { ApiResponse } from './baseApiService';

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  order: number;
}

export interface HeroAPI {
  id: number;
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  isSlider: boolean;
  slides: HeroSlide[];
}

class HeroService extends BaseApiService {
  // Get all heroes
  async getHeroes(): Promise<ApiResponse<{ heroes: HeroAPI[] }>> {
    console.log('Fetching heroes from API...');
    const response = await this.get<ApiResponse<{ heroes: HeroAPI[] }>>('/heroes');
    console.log('Heroes API response:', response);
    return response;
  }
}

export const heroService = new HeroService();
export default heroService;