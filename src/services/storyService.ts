
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
    const formData = new FormData();
    
    // Add required fields
    formData.append('title', data.title);
    formData.append('image', data.image);
    
    // Add optional fields only if they exist and are not empty
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
      formData.append('is_active', data.is_active ? 'true' : 'false');
    }
    if (data.expires_at) {
      formData.append('expires_at', data.expires_at);
    }
    if (data.order_index !== undefined && data.order_index > 0) {
      formData.append('order_index', data.order_index.toString());
    }

    console.log('Creating story with FormData:', {
      title: data.title,
      hasImage: !!data.image,
      imageSize: data.image?.size,
      imageName: data.image?.name,
      content: data.content,
      background_color: data.background_color,
      text_color: data.text_color,
      is_active: data.is_active,
      expires_at: data.expires_at,
      order_index: data.order_index
    });

    const response = await this.request<StoryResponse>('/stories', {
      method: 'POST',
      body: formData,
    });
    return response.details.story;
  }

  async updateStory(id: string, data: UpdateStoryData): Promise<Story> {
    const formData = new FormData();
    
    // Add fields only if they exist
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
      formData.append('is_active', data.is_active ? 'true' : 'false');
    }
    if (data.expires_at) {
      formData.append('expires_at', data.expires_at);
    }
    if (data.order_index !== undefined && data.order_index > 0) {
      formData.append('order_index', data.order_index.toString());
    }

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
