import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/sonner';
import { Package, Image, X, Loader2 } from "lucide-react";
import { Category } from "@/services/categoryService";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category, imageFile?: File, iconFile?: File) => Promise<void>;
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
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Category>({
    name: '',
    slug: '',
    image: '',
    icon: '',
    description: '',
    is_active: true,
    featured: true
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
        is_active: true,
        featured: true,
        parent_id: category?.parent_id || undefined
      });
      setPreviewImage('');
      setPreviewIcon('');
    }
    
    // Reset file states when modal opens/closes
    setImageFile(null);
    setIconFile(null);
  }, [mode, category, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const newSlug = generateSlug(name);
      // Auto-populate SEO title (max 60 chars for Google)
      const seoTitle = name.substring(0, 60);
      // Auto-populate SEO description with best practices
      const seoDescription = `Browse ${name} products at MeemHome. Quality ${name.toLowerCase()} with fast shipping and great prices.`;

      return {
        ...prev,
        name,
        slug: newSlug,
        seo_title: seoTitle,
        seo_description: seoDescription.substring(0, 160) // Google's recommended max
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (saving) return;

    // Validate required fields according to API specification
    if (!formData.name.trim()) {
      toast.error("Category name is required", { duration: 2500 });
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Slug is required", { duration: 2500 });
      return;
    }

    // For new categories, require image file upload
    if (mode === 'add' && !imageFile) {
      toast.error("Category image is required", { duration: 2500 });
      return;
    }

    // For new categories, require icon file upload
    if (mode === 'add' && !iconFile) {
      toast.error("Icon is required", { duration: 2500 });
      return;
    }

    setSaving(true);
    try {
      await onSave(formData, imageFile || undefined, iconFile || undefined);
      // Only close if save was successful - parent will handle success/error
    } catch (error) {
      // Error handling is done by parent, just reset saving state
      setSaving(false);
    }
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
    
    // Remove duplicates by creating a Map with unique IDs
    const uniqueCategories = Array.from(
      new Map(allCategories.map(cat => [cat.id, cat])).values()
    ).filter(cat => cat.id !== undefined);
    
    if (mode === 'edit' && category?.id) {
      return uniqueCategories.filter(cat => 
        cat.id !== category.id && 
        !isDescendantOf(cat, category.id)
      );
    }
    return uniqueCategories;
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
                 onChange={(e) => handleNameChange(e.target.value)}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo_title">SEO Title</Label>
              <span className={`text-xs ${(formData.seo_title?.length || 0) > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.seo_title?.length || 0}/60
              </span>
            </div>
            <Input
              id="seo_title"
              value={formData.seo_title || ''}
              onChange={(e) => {
                const value = e.target.value.substring(0, 60);
                setFormData(prev => ({ ...prev, seo_title: value }));
              }}
              placeholder="SEO title (auto-populated from category name)"
              maxLength={60}
            />
            <p className="text-xs text-gray-500">Optimal: 50-60 characters for Google search results</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo_description">SEO Description</Label>
              <span className={`text-xs ${(formData.seo_description?.length || 0) > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.seo_description?.length || 0}/160
              </span>
            </div>
            <Textarea
              id="seo_description"
              value={formData.seo_description || ''}
              onChange={(e) => {
                const value = e.target.value.substring(0, 160);
                setFormData(prev => ({ ...prev, seo_description: value }));
              }}
              placeholder="SEO meta description (auto-populated)"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500">Optimal: 150-160 characters for Google search results</p>
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
                {parentCategories.map((cat, index) => (
                  <SelectItem key={`parent-${cat.id}-${index}`} value={cat.id!.toString()}>
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
              Category Image *
            </Label>

            <FileUpload
              onFileSelect={handleImageUpload}
              accept="image/*"
              placeholder="Upload category image"
              maxFiles={1}
            />

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
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className={saving ? "cursor-not-allowed opacity-60" : ""}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className={saving ? "cursor-not-allowed opacity-80" : "hover:opacity-90 active:scale-95 transition-all"}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'add' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'add' ? 'Create Category' : 'Update Category'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
