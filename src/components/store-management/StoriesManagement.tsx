
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, Clock } from "lucide-react";
import { storyService, Story } from "@/services/storyService";
import { StoryModal } from "./StoryModal";
import { useToast } from "@/hooks/use-toast";

export const StoriesManagement = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStories();
    
    const handleStoriesUpdate = () => {
      loadStories();
    };
    
    window.addEventListener('storiesUpdated', handleStoriesUpdate);
    return () => window.removeEventListener('storiesUpdated', handleStoriesUpdate);
  }, []);

  const loadStories = () => {
    const loadedStories = storyService.getStories();
    setStories(loadedStories);
  };

  const handleCreateStory = () => {
    setEditingStory(null);
    setIsModalOpen(true);
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setIsModalOpen(true);
  };

  const handleDeleteStory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      const success = storyService.deleteStory(id);
      if (success) {
        toast({
          title: "Success",
          description: "Story deleted successfully",
        });
        loadStories();
      }
    }
  };

  const handleToggleActive = (story: Story) => {
    const updated = storyService.updateStory(story.id, { isActive: !story.isActive });
    if (updated) {
      toast({
        title: "Success",
        description: `Story ${updated.isActive ? 'activated' : 'deactivated'}`,
      });
      loadStories();
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stories Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Create and manage Instagram-like stories for your store</p>
        </div>
        <Button onClick={handleCreateStory} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Story
        </Button>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No stories yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first story to engage customers</p>
              <Button onClick={handleCreateStory} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Story
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge variant={story.isActive ? "default" : "secondary"}>
                    {story.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{story.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {formatTimeRemaining(story.expiresAt)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditStory(story)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(story)}
                    className="gap-2"
                  >
                    {story.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {story.isActive ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteStory(story.id)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        story={editingStory}
        onSuccess={() => {
          setIsModalOpen(false);
          loadStories();
        }}
      />
    </div>
  );
};
