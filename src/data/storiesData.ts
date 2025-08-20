
import { Story } from "@/services/storyService";

export const mockStories: Story[] = [
  {
    id: "1",
    title: "New Collection",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop",
    content: "Check out our latest fashion collection! Limited time offer - 30% off on all new arrivals.",
    backgroundColor: "#1a1a1a",
    textColor: "#ffffff",
    isActive: true,
    order: 0,
    createdAt: "2025-01-19T10:00:00.000Z",
    expiresAt: "2025-01-21T10:00:00.000Z"
  },
  {
    id: "2",
    title: "Flash Sale",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=600&fit=crop",
    content: "⚡ Flash Sale Alert! Up to 50% off on electronics. Hurry, only 6 hours left!",
    backgroundColor: "#ff4444",
    textColor: "#ffffff",
    isActive: true,
    order: 1,
    createdAt: "2025-01-19T14:00:00.000Z",
    expiresAt: "2025-01-21T14:00:00.000Z"
  },
  {
    id: "3",
    title: "Behind Scenes",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=600&fit=crop",
    content: "Take a look behind the scenes of our product photoshoot! Amazing team work in action.",
    backgroundColor: "#2d3748",
    textColor: "#f7fafc",
    isActive: true,
    order: 2,
    createdAt: "2025-01-19T16:00:00.000Z",
    expiresAt: "2025-01-21T16:00:00.000Z"
  },
  {
    id: "4",
    title: "Customer Love",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=600&fit=crop",
    content: "❤️ Amazing feedback from our customers! Thank you for choosing us. Your happiness is our priority.",
    backgroundColor: "#38a169",
    textColor: "#ffffff",
    isActive: true,
    order: 3,
    createdAt: "2025-01-19T18:00:00.000Z",
    expiresAt: "2025-01-21T18:00:00.000Z"
  },
  {
    id: "5",
    title: "Weekend Special",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=600&fit=crop",
    content: "🎉 Weekend Special! Free shipping on orders over $50. Valid until Sunday midnight.",
    backgroundColor: "#805ad5",
    textColor: "#ffffff",
    isActive: true,
    order: 4,
    createdAt: "2025-01-19T20:00:00.000Z",
    expiresAt: "2025-01-22T00:00:00.000Z"
  },
  {
    id: "6",
    title: "New Arrivals",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop",
    content: "✨ Fresh arrivals just landed! Discover the latest trends and styles in our new collection.",
    backgroundColor: "#e53e3e",
    textColor: "#ffffff",
    isActive: false,
    order: 5,
    createdAt: "2025-01-18T12:00:00.000Z",
    expiresAt: "2025-01-20T12:00:00.000Z"
  }
];

// This function will be replaced with API call later
export const getStoriesFromMock = (): Story[] => {
  // Filter out expired stories
  const now = new Date().toISOString();
  return mockStories.filter(story => story.expiresAt > now && story.isActive)
    .sort((a, b) => a.order - b.order);
};

// This function will be replaced with API call later
export const createStoryMock = (story: Omit<Story, 'id' | 'createdAt' | 'expiresAt'>): Story => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  const newStory: Story = {
    ...story,
    id: Date.now().toString(),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  mockStories.push(newStory);
  return newStory;
};

// This function will be replaced with API call later
export const updateStoryMock = (id: string, updates: Partial<Story>): Story | null => {
  const index = mockStories.findIndex(story => story.id === id);
  if (index === -1) return null;
  
  mockStories[index] = { ...mockStories[index], ...updates };
  return mockStories[index];
};

// This function will be replaced with API call later
export const deleteStoryMock = (id: string): boolean => {
  const index = mockStories.findIndex(story => story.id === id);
  if (index === -1) return false;
  
  mockStories.splice(index, 1);
  return true;
};
