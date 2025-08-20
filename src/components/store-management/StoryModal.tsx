
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { storyService, Story } from "@/services/storyService";
import { useToast } from "@/hooks/use-toast";

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story?: Story | null;
  onSuccess: () => void;
}

export const StoryModal = ({ isOpen, onClose, story, onSuccess }: StoryModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    content: "",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    isActive: true,
    order: 0,
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title,
        image: story.image,
        content: story.content || "",
        backgroundColor: story.backgroundColor || "#000000",
        textColor: story.textColor || "#ffffff",
        isActive: story.isActive,
        order: story.order,
      });
    } else {
      setFormData({
        title: "",
        image: "",
        content: "",
        backgroundColor: "#000000",
        textColor: "#ffffff",
        isActive: true,
        order: 0,
      });
    }
  }, [story]);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.image) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      if (story) {
        // Update existing story
        const updated = storyService.updateStory(story.id, formData);
        if (updated) {
          toast({
            title: "Success",
            description: "Story updated successfully",
          });
          onSuccess();
        }
      } else {
        // Create new story
        storyService.createStory(formData);
        toast({
          title: "Success",
          description: "Story created successfully",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save story",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{story ? "Edit Story" : "Create New Story"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter story title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Story Image *</Label>
            <FileUpload
              onFileSelect={handleFileSelect}
              maxFiles={1}
              accept="image/*"
              placeholder="Upload story image (recommended: 1080x1920)"
            />
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-32 h-56 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Optional)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Add text content for the story"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.textColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Saving..." : story ? "Update Story" : "Create Story"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
