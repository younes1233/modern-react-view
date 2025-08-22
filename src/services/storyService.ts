
import BaseApiService from './baseApiService';

export interface Story {
  id: string;
  title: string;
  image: string;
  content?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  expiresAt: string;
}

interface StoriesResponse {
  error: boolean;
  message: string;
  details: {
    stories: Story[];
  };
}

interface StoryResponse {
  error: boolean;
  message: string;
  details: {
    story: Story;
  };
}

interface CreateStoryData {
  title: string;
  content?: string;
  image: File;
  background_color?: string;
  text_color?: string;
  is_active?: boolean;
  expires_at?: string;
  order_index?: number;
}

interface UpdateStoryData {
  title?: string;
  content?: string;
  image?: File;
  background_color?: string;
  text_color?: string;
  is_active?: boolean;
  expires_at?: string;
  order_index?: number;
}

class StoryService extends BaseApiService {
  async getStories(): Promise<Story[]> {
    try {
      const response = await this.get<StoriesResponse>('/stories');
      return response.details.stories || [];
    } catch (error) {
      console.error('Error fetching stories:', error);
      return [];
    }
  }

  async createStory(data: CreateStoryData): Promise<Story> {
    console.log('Creating story with data:', {
      title: data.title,
      hasImage: !!data.image,
      imageSize: data.image?.size,
      imageName: data.image?.name,
      content: data.content,
      background_color: data.background_color,
      text_color: data.text_color,
      is_active: data.is_active,
      expires_at: data.expires_at,
    });

    // Create FormData with image and other fields
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('title', data.title.trim());
    
    // Add optional fields only if they have valid values
    if (data.content && data.content.trim()) {
      formData.append('content', data.content.trim());
    }
    if (data.background_color && data.background_color !== '#000000') {
      formData.append('background_color', data.background_color);
    }
    if (data.text_color && data.text_color !== '#ffffff') {
      formData.append('text_color', data.text_color);
    }
    if (data.is_active !== undefined) {
      // Convert boolean to string that Laravel expects: '1' for true, '0' for false
      formData.append('is_active', data.is_active ? '1' : '0');
    }
    if (data.expires_at) {
      formData.append('expires_at', data.expires_at);
    }
    // Note: Removing order_index as API doesn't allow it in create endpoint

    const response = await this.request<StoryResponse>('/stories', {
      method: 'POST',
      body: formData,
    });
    return response.details.story;
  }

  async updateStory(id: string, data: UpdateStoryData): Promise<Story> {
    const formData = new FormData();
    
    // Add fields only if they exist and are valid
    if (data.title && data.title.trim()) {
      formData.append('title', data.title.trim());
    }
    if (data.content !== undefined) {
      if (data.content.trim()) {
        formData.append('content', data.content.trim());
      }
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.background_color && data.background_color !== '#000000') {
      formData.append('background_color', data.background_color);
    }
    if (data.text_color && data.text_color !== '#ffffff') {
      formData.append('text_color', data.text_color);
    }
    if (data.is_active !== undefined) {
      // Convert boolean to string that Laravel expects: '1' for true, '0' for false
      formData.append('is_active', data.is_active ? '1' : '0');
    }
    if (data.expires_at) {
      formData.append('expires_at', data.expires_at);
    }
    // Note: Removing order_index as API doesn't allow it in update endpoint

    const response = await this.request<StoryResponse>(`/stories/${id}`, {
      method: 'PUT',
      body: formData,
    });
    return response.details.story;
  }

  async deleteStory(id: string): Promise<Story[]> {
    const response = await this.delete<StoriesResponse>(`/stories/${id}`);
    return response.details.stories || [];
  }
}

export const storyService = new StoryService();
