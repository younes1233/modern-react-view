
import { useState, useEffect } from 'react';
import { storyService, Story } from '@/services/storyService';
import { useToast } from '@/hooks/use-toast';

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await storyService.getStories();
      setStories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stories';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (data: {
    title: string;
    content?: string;
    image: File;
    backgroundColor?: string;
    textColor?: string;
    isActive?: boolean;
    expiresAt?: string;
    order?: number;
  }) => {
    setLoading(true);
    try {
      const newStory = await storyService.createStory({
        title: data.title,
        content: data.content,
        image: data.image,
        background_color: data.backgroundColor,
        text_color: data.textColor,
        is_active: data.isActive,
        expires_at: data.expiresAt,
        order_index: data.order,
      });
      
      setStories(prev => [...prev, newStory]);
      toast({
        title: "Success",
        description: "Story created successfully",
      });
      return newStory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create story';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStory = async (id: string, data: {
    title?: string;
    content?: string;
    image?: File;
    backgroundColor?: string;
    textColor?: string;
    isActive?: boolean;
    expiresAt?: string;
    order?: number;
  }) => {
    setLoading(true);
    try {
      const updatedStory = await storyService.updateStory(id, {
        title: data.title,
        content: data.content,
        image: data.image,
        background_color: data.backgroundColor,
        text_color: data.textColor,
        is_active: data.isActive,
        expires_at: data.expiresAt,
        order_index: data.order,
      });
      
      setStories(prev => prev.map(story => story.id === id ? updatedStory : story));
      toast({
        title: "Success",
        description: "Story updated successfully",
      });
      return updatedStory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update story';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async (id: string) => {
    setLoading(true);
    try {
      const updatedStories = await storyService.deleteStory(id);
      setStories(updatedStories);
      toast({
        title: "Success",
        description: "Story deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete story';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading,
    error,
    fetchStories,
    createStory,
    updateStory,
    deleteStory,
  };
};
