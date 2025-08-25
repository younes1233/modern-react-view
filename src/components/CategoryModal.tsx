import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Package, Image, X } from "lucide-react";
import { Category } from "@/services/categoryService";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category, imageFile?: File, iconFile?: File) => void;
  category?: Category | null;
  mode: 'add' | 'edit';
  categories?: Category[];
}

export function CategoryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  category, 
  mode,
  categories = []
}: CategoryModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Category>({
    name: '',
    slug: '',
    image: '',
    icon: '',
    description: '',
    order: 0,
    is_active: true,
    featured: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewIcon, setPreviewIcon] = useState<string>('');

  useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData(category);
      // Set preview images from existing category
      if (category.images?.urls?.original) {
        setPreviewImage(category.images.urls.original);
      } else if (category.image) {
        setPreviewImage(category.image);
      }
      
      if (category.icon) {
        setPreviewIcon(category.icon);
      }
    } else if (mode === 'add') {
      setFormData({
        name: '',
        slug: '',
        image: '',
        icon: '',
        description: '',
        order: 0,
        is_active: true,
        featured: false,
        parent_id: category?.parent_id || undefined
      });
      setPreviewImage('');
      setPreviewIcon('');
    }
    
    // Reset file states when modal opens/closes
    setImageFile(null);
    setIconFile(null);
  }, [mode, category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields according to API specification
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        title: "Validation Error",
        description: "Slug is required",
        variant: "destructive"
      });
      return;
    }

    // For new categories, require either file upload or URL for icon
    if (mode === 'add' && !iconFile && !formData.icon?.trim()) {
      toast({
        title: "Validation Error",
        description: "Icon is required (upload file or provide URL)",
        variant: "destructive"
      });
      return;
    }

    onSave(formData, imageFile || undefined, iconFile || undefined);
    onClose();
  };

  const handleImageUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleIconUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setIconFile(file);
      setPreviewIcon(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewImage('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const removeIcon = () => {
    setIconFile(null);
    setPreviewIcon('');
    setFormData(prev => ({ ...prev, icon: '' }));
  };

  const getAvailableParentCategories = () => {
    const flattenCategories = (cats: Category[]): Category[] => {
      const result: Category[] = [];
      cats.forEach(cat => {
        result.push(cat);
        if (cat.children) {
          result.push(...flattenCategories(cat.children));
        }
      });
      return result;
    };

    const allCategories = flattenCategories(categories);
    
    if (mode === 'edit' && category?.id) {
      return allCategories.filter(cat => 
        cat.id !== category.id && 
        cat.id !== undefined && 
        !isDescendantOf(cat, category.id)
      );
    }
    return allCategories.filter(cat => cat.id !== undefined);
  };

  const isDescendantOf = (category: Category, ancestorId: number): boolean => {
    if (category.parent_id === ancestorId) return true;
    
    const flattenCategories = (cats: Category[]): Category[] => {
      const result: Category[] = [];
      cats.forEach(cat => {
        result.push(cat);
        if (cat.children) {
          result.push(...flattenCategories(cat.children));
        }
      });
      return result;
    };
    
    const allCategories = flattenCategories(categories);
    const parent = allCategories.find(cat => cat.id === category.parent_id);
    return parent ? isDescendantOf(parent, ancestorId) : false;
  };

  const parentCategories = getAvailableParentCategories();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {mode === 'add' ? 'Add New Category' : 'Edit Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="category-slug"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order *</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                placeholder="Display order"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.is_active ? "active" : "inactive"} 
                onValueChange={(value: "active" | "inactive") => 
                  setFormData(prev => ({ ...prev, is_active: value === "active" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="featured">Featured Category</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter category description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seo_title">SEO Title</Label>
              <Input
                id="seo_title"
                value={formData.seo_title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                placeholder="SEO title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo_description">SEO Description</Label>
            <Textarea
              id="seo_description"
              value={formData.seo_description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
              placeholder="SEO description"
              rows={3}
            />
          </div>

          {/* Parent Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="parent">Parent Category (Optional)</Label>
            <Select 
              value={formData.parent_id?.toString() || 'none'} 
              onValueChange={(value) => 
                setFormData(prev => ({ 
                  ...prev, 
                  parent_id: value === 'none' ? undefined : parseInt(value) 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent (Root Category)</SelectItem>
                {parentCategories
                  .filter(cat => cat.id !== undefined)
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id!.toString()}>
                      {cat.level && cat.level > 0 ? `${' '.repeat(cat.level * 2)}└ ${cat.name}` : cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Image Upload */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Category Image
            </Label>
            
            <FileUpload
              onFileSelect={handleImageUpload}
              accept="image/*"
              placeholder="Upload category image"
              maxFiles={1}
            />

            {/* Image URL Input as fallback */}
            <div className="space-y-2">
              <Label htmlFor="image">Or provide image URL</Label>
              <Input
                id="image"
                value={formData.image || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, image: e.target.value }));
                  if (e.target.value && !imageFile) {
                    setPreviewImage(e.target.value);
                  }
                }}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {previewImage && (
              <div className="relative group w-32">
                <img
                  src={previewImage}
                  alt="Category preview"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeImage}
                >
                  <X className="w-3 h-3" />
                </Button>
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-1 left-1 text-xs bg-black/50 text-white"
                >
                  {imageFile ? 'File' : 'URL'}
                </Badge>
              </div>
            )}
          </div>

          {/* Icon Upload */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Category Icon *
            </Label>
            
            <FileUpload
              onFileSelect={handleIconUpload}
              accept="image/*"
              placeholder="Upload category icon"
              maxFiles={1}
            />

            {/* Icon URL Input as fallback */}
            <div className="space-y-2">
              <Label htmlFor="icon">Or provide icon URL *</Label>
              <Input
                id="icon"
                value={formData.icon || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, icon: e.target.value }));
                  if (e.target.value && !iconFile) {
                    setPreviewIcon(e.target.value);
                  }
                }}
                placeholder="https://example.com/icon.png"
                required={mode === 'add' && !iconFile}
              />
            </div>

            {previewIcon && (
              <div className="relative group w-16">
                <img
                  src={previewIcon}
                  alt="Icon preview"
                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeIcon}
                >
                  <X className="w-3 h-3" />
                </Button>
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-1 left-1 text-xs bg-black/50 text-white"
                >
                  {iconFile ? 'File' : 'URL'}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Create Category' : 'Update Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
