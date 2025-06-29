
import BaseApiService, { ApiResponse } from './baseApiService';

export interface HomeSectionAPI {
  id: number;
  type: 'banner' | 'productListing';
  item_id: number;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  item?: any;
}

export interface CreateHomeSectionRequest {
  type: 'banner' | 'productListing';
  item_id: number;
  is_active: boolean;
}

export interface UpdateHomeSectionRequest {
  type?: 'banner' | 'productListing';
  item_id?: number;
  is_active?: boolean;
}

class HomeSectionService extends BaseApiService {
  // Get all home sections
  async getHomeSections(): Promise<ApiResponse<{ home_sections: HomeSectionAPI[] }>> {
    console.log('Fetching home sections from API...');
    const response = await this.get<ApiResponse<{ home_sections: HomeSectionAPI[] }>>('/home-sections');
    console.log('Home sections API response:', response);
    return response;
  }

  // Create a new home section
  async createHomeSection(data: CreateHomeSectionRequest): Promise<ApiResponse<{ home_section: HomeSectionAPI }>> {
    console.log('Creating home section:', data);
    const response = await this.post<ApiResponse<{ home_section: HomeSectionAPI }>>('/home-sections', data);
    console.log('Create home section response:', response);
    return response;
  }

  // Update a home section
  async updateHomeSection(id: number, data: UpdateHomeSectionRequest): Promise<ApiResponse<{ home_section: HomeSectionAPI }>> {
    console.log('Updating home section:', id, data);
    const response = await this.put<ApiResponse<{ home_section: HomeSectionAPI }>>(`/home-sections/${id}`, data);
    console.log('Update home section response:', response);
    return response;
  }

  // Delete a home section
  async deleteHomeSection(id: number): Promise<ApiResponse<{ home_sections: HomeSectionAPI[] }>> {
    console.log('Deleting home section:', id);
    const response = await this.delete<ApiResponse<{ home_sections: HomeSectionAPI[] }>>(`/home-sections/${id}`);
    console.log('Delete home section response:', response);
    return response;
  }

  // Reorder home sections
  async reorderHomeSections(order: number[]): Promise<ApiResponse<{ home_sections: HomeSectionAPI[] }>> {
    console.log('Reordering home sections:', order);
    const response = await this.put<ApiResponse<{ home_sections: HomeSectionAPI[] }>>('/home-sections/reorder', { order });
    console.log('Reorder home sections response:', response);
    return response;
  }
}

export const homeSectionService = new HomeSectionService();
export default homeSectionService;
