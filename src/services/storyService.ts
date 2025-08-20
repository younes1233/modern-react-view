
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

class StoryService {
  private storageKey = 'store_stories';

  getStories(): Story[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const storiesData: StoriesData = JSON.parse(data);
      // Filter out expired stories
      const now = new Date().toISOString();
      const activeStories = storiesData.stories.filter(story => story.expiresAt > now);
      
      // If we filtered out expired stories, update localStorage
      if (activeStories.length !== storiesData.stories.length) {
        this.saveStories(activeStories);
      }
      
      return activeStories.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error loading stories:', error);
      return [];
    }
  }

  saveStories(stories: Story[]): void {
    try {
      const storiesData: StoriesData = { stories };
      localStorage.setItem(this.storageKey, JSON.stringify(storiesData));
      window.dispatchEvent(new Event('storiesUpdated'));
    } catch (error) {
      console.error('Error saving stories:', error);
    }
  }

  createStory(story: Omit<Story, 'id' | 'createdAt' | 'expiresAt'>): Story {
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
    const stories = this.getStories();
    const index = stories.findIndex(story => story.id === id);
    
    if (index === -1) return null;
    
    stories[index] = { ...stories[index], ...updates };
    this.saveStories(stories);
    
    return stories[index];
  }

  deleteStory(id: string): boolean {
    const stories = this.getStories();
    const filteredStories = stories.filter(story => story.id !== id);
    
    if (filteredStories.length === stories.length) return false;
    
    this.saveStories(filteredStories);
    return true;
  }

  reorderStories(storyIds: string[]): void {
    const stories = this.getStories();
    const reorderedStories = storyIds.map((id, index) => {
      const story = stories.find(s => s.id === id);
      return story ? { ...story, order: index } : null;
    }).filter(Boolean) as Story[];
    
    this.saveStories(reorderedStories);
  }
}

export const storyService = new StoryService();
