import BaseApiService from './baseApiService';

// Store Hero Types
export interface StoreHeroSlide {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_text: string | null;
  cta_link: string | null;
}

export interface StoreHero {
  id: number;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  type: 'single' | 'slider';
  slides?: StoreHeroSlide[];
}

export interface StoreHeroResponse {
  success: boolean;
  data: StoreHero[];
}

class StoreHeroService extends BaseApiService {
  // Get all heroes for store front
  async getStoreHeroes(): Promise<StoreHeroResponse> {
    console.log('StoreHeroService: Making GET request to /heroes');
    const response = await this.get<StoreHeroResponse>('/heroes');
    console.log('StoreHeroService: Store heroes response:', response);
    return response;
  }
}

export const storeHeroService = new StoreHeroService();
export default storeHeroService;