
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
import { Story } from "@/services/storyService";
import { useStories } from "@/hooks/useStories";
import { toast } from '@/components/ui/sonner';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story?: Story | null;
  onSuccess: () => void;
}

export const StoryModal = ({ isOpen, onClose, story, onSuccess }: StoryModalProps) => {
  const { createStory, updateStory, loading } = useStories();
  // Removed useToast hook;
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    isActive: true,
    order: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title,
        content: story.content || "",
        backgroundColor: story.backgroundColor || "#000000",
        textColor: story.textColor || "#ffffff",
        isActive: story.isActive,
        order: story.order,
      });
      setPreviewImage(story.image);
      setSelectedFile(null);
    } else {
      setFormData({
        title: "",
        content: "",
        backgroundColor: "#000000",
        textColor: "#ffffff",
        isActive: true,
        order: 0,
      });
      setPreviewImage("");
      setSelectedFile(null);
    }
  }, [story]);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      
      // Check file size (additional client-side validation)
      const maxSizeInMB = 2; // 2MB limit
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast.error(`Please select an image smaller than ${maxSizeInMB}MB`, { duration: 2500 });
        return;
      }
      
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a story title", { duration: 2500 });
      return;
    }

    if (!story && !selectedFile) {
      toast.error("Please select an image for the story", { duration: 2500 });
      return;
    }

    try {
      // Calculate expires at (24 hours from now)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      if (story) {
        // Update existing story
        await updateStory(story.id, {
          title: formData.title,
          content: formData.content,
          image: selectedFile || undefined,
          backgroundColor: formData.backgroundColor,
          textColor: formData.textColor,
          isActive: formData.isActive,
          expiresAt,
          order: formData.order,
        });
      } else {
        // Create new story
        await createStory({
          title: formData.title,
          content: formData.content,
          image: selectedFile!,
          backgroundColor: formData.backgroundColor,
          textColor: formData.textColor,
          isActive: formData.isActive,
          expiresAt,
          order: formData.order,
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Story submission error:', error);
      // Error handling is done in the hook, but we can add specific handling here
      if (error instanceof Error && error.message.includes('413')) {
        toast.error("The image file is too large. Please try a smaller image or compress it.", { duration: 2500 });
      }
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
              placeholder="Upload story image (recommended: 600*600, max 2MB)"
              maxFileSize={2} // 2MB limit
            />
            {previewImage && (
              <div className="mt-2">
                <img
                  src={previewImage}
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
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">{formData.content.length}/1000 characters</p>
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
                  maxLength={7}
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
                  maxLength={7}
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : story ? "Update Story" : "Create Story"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
