
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

    // Prepare JSON data (excluding order_index and image)
    const jsonData: any = {
      title: data.title.trim(),
    };

    // Add optional fields only if they have valid values
    if (data.content && data.content.trim()) {
      jsonData.content = data.content.trim();
    }
    if (data.background_color && data.background_color !== '#000000') {
      jsonData.background_color = data.background_color;
    }
    if (data.text_color && data.text_color !== '#ffffff') {
      jsonData.text_color = data.text_color;
    }
    if (data.is_active !== undefined) {
      jsonData.is_active = data.is_active; // Send as actual boolean
    }
    if (data.expires_at) {
      jsonData.expires_at = data.expires_at;
    }
    // Note: Removing order_index as API doesn't allow it in create endpoint

    // Create FormData with image and other fields
    const formData = new FormData();
    formData.append('image', data.image);
    
    // Append JSON fields to FormData
    Object.entries(jsonData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, String(value));
        }
      }
    });

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
      formData.append('is_active', data.is_active.toString());
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
