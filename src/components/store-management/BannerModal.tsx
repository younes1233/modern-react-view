
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { BannerImages } from "@/services/bannerService";
import { BannerFormData } from "@/hooks/useBanners";

interface Banner {
  id?: number;
  title: string;
  subtitle?: string;
  images: BannerImages;
  ctaText?: string;
  ctaLink?: string;
  position: 'hero' | 'secondary' | 'sidebar';
  isActive: boolean;
  order: number;
}

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: BannerFormData) => void;
  banner?: Banner | null;
  mode: 'add' | 'edit';
}

export function BannerModal({ isOpen, onClose, onSave, banner, mode }: BannerModalProps) {
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    image: undefined,
    ctaText: '',
    ctaLink: '',
    position: 'hero',
    isActive: true,
    order: 1
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (banner && mode === 'edit') {
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        image: undefined, // Don't set existing image as File
        ctaText: banner.ctaText || '',
        ctaLink: banner.ctaLink || '',
        position: banner.position,
        isActive: banner.isActive,
        order: banner.order
      });
      setSelectedFiles([]);
    } else {
      setFormData({
        title: '',
        subtitle: '',
        image: undefined,
        ctaText: '',
        ctaLink: '',
        position: 'hero',
        isActive: true,
        order: 1
      });
      setSelectedFiles([]);
    }
  }, [banner, mode, isOpen]);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setFormData(prev => ({ 
      ...prev, 
      image: files.length > 0 ? files[0] : undefined 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: "Error",
        description: "Please enter a banner title",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'add' && !formData.image) {
      toast({
        title: "Error",
        description: "Please select an image",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Banner' : 'Edit Banner'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Banner Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter banner title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Enter subtitle (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Banner Image {mode === 'add' ? '*' : '(optional for updates)'}</Label>
            <FileUpload
              onFileSelect={handleFileSelect}
              maxFiles={1}
              accept="image/*"
              placeholder="Drop banner image here or click to upload"
              maxFileSize={5}
            />
            {mode === 'edit' && banner && selectedFiles.length === 0 && (
              <div className="text-sm text-gray-500 mt-2">
                Current image will be kept if no new image is selected
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Select value={formData.position} onValueChange={(value: 'hero' | 'secondary' | 'sidebar') => setFormData(prev => ({ ...prev, position: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hero">Hero (Main banner)</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="sidebar">Sidebar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ctaText">Call to Action Text</Label>
              <Input
                id="ctaText"
                value={formData.ctaText}
                onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                placeholder="e.g., Shop Now"
              />
            </div>
            
            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ctaLink">Call to Action Link</Label>
            <Input
              id="ctaLink"
              value={formData.ctaLink}
              onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
              placeholder="e.g., /store/categories"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {mode === 'add' ? 'Add Banner' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
