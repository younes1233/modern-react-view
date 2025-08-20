
import { 
  getStoriesFromMock, 
  createStoryMock, 
  updateStoryMock, 
  deleteStoryMock 
} from "@/data/storiesData";

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

export interface StoriesData {
  stories: Story[];
}

// Configuration flag to switch between mock and API data
const USE_MOCK_DATA = true; // Set to false when API is ready

class StoryService {
  private storageKey = 'store_stories';

  getStories(): Story[] {
    if (USE_MOCK_DATA) {
      return this.getStoriesFromMock();
    }
    
    // TODO: Replace with API call
    return this.getStoriesFromLocalStorage();
  }

  private getStoriesFromMock(): Story[] {
    try {
      return getStoriesFromMock();
    } catch (error) {
      console.error('Error loading stories from mock:', error);
      return [];
    }
  }

  private getStoriesFromLocalStorage(): Story[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const storiesData: StoriesData = JSON.parse(data);
      // Filter out expired stories
      const now = new Date().toISOString();
      const activeStories = storiesData.stories.filter(story => story.expiresAt > now);
      
      // If we filtered out expired stories, update localStorage
      if (activeStories.length !== storiesData.stories.length) {
        this.saveStoriesToLocalStorage(activeStories);
      }
      
      return activeStories.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error loading stories from localStorage:', error);
      return [];
    }
  }

  private saveStoriesToLocalStorage(stories: Story[]): void {
    try {
      const storiesData: StoriesData = { stories };
      localStorage.setItem(this.storageKey, JSON.stringify(storiesData));
      window.dispatchEvent(new Event('storiesUpdated'));
    } catch (error) {
      console.error('Error saving stories to localStorage:', error);
    }
  }

  // TODO: Replace with API call
  private async saveStoriesToAPI(stories: Story[]): Promise<void> {
    // Implementation will go here when API is ready
    console.log('API save not implemented yet:', stories);
  }

  saveStories(stories: Story[]): void {
    if (USE_MOCK_DATA) {
      // For mock data, we don't persist changes
      window.dispatchEvent(new Event('storiesUpdated'));
    } else {
      this.saveStoriesToLocalStorage(stories);
    }
  }

  createStory(story: Omit<Story, 'id' | 'createdAt' | 'expiresAt'>): Story {
    if (USE_MOCK_DATA) {
      const newStory = createStoryMock(story);
      window.dispatchEvent(new Event('storiesUpdated'));
      return newStory;
    }

    // TODO: Replace with API call
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const newStory: Story = {
      ...story,
      id: Date.now().toString(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const stories = this.getStories();
    stories.push(newStory);
    this.saveStories(stories);
    
    return newStory;
  }

  updateStory(id: string, updates: Partial<Story>): Story | null {
    if (USE_MOCK_DATA) {
      const updatedStory = updateStoryMock(id, updates);
      if (updatedStory) {
        window.dispatchEvent(new Event('storiesUpdated'));
      }
      return updatedStory;
    }

    // TODO: Replace with API call
    const stories = this.getStories();
    const index = stories.findIndex(story => story.id === id);
    
    if (index === -1) return null;
    
    stories[index] = { ...stories[index], ...updates };
    this.saveStories(stories);
    
    return stories[index];
  }

  deleteStory(id: string): boolean {
    if (USE_MOCK_DATA) {
      const success = deleteStoryMock(id);
      if (success) {
        window.dispatchEvent(new Event('storiesUpdated'));
      }
      return success;
    }

    // TODO: Replace with API call
    const stories = this.getStories();
    const filteredStories = stories.filter(story => story.id !== id);
    
    if (filteredStories.length === stories.length) return false;
    
    this.saveStories(filteredStories);
    return true;
  }

  reorderStories(storyIds: string[]): void {
    if (USE_MOCK_DATA) {
      // Mock data doesn't support reordering persistently
      console.log('Reordering not supported in mock mode');
      return;
    }

    // TODO: Replace with API call
    const stories = this.getStories();
    const reorderedStories = storyIds.map((id, index) => {
      const story = stories.find(s => s.id === id);
      return story ? { ...story, order: index } : null;
    }).filter(Boolean) as Story[];
    
    this.saveStories(reorderedStories);
  }

  // Method to switch to API mode (call this when API is ready)
  enableAPIMode(): void {
    // This will be used to switch from mock to API data
    console.log('Switching to API mode - implement API endpoints first');
  }
}

export const storyService = new StoryService();
