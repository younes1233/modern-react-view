
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ProductListing } from "@/data/storeData";

interface ProductListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (listing: Omit<ProductListing, 'id'>) => void;
  listing: ProductListing | null;
  mode: 'add' | 'edit';
}

export function ProductListingModal({ isOpen, onClose, onSave, listing, mode }: ProductListingModalProps) {
  const [formData, setFormData] = useState<Omit<ProductListing, 'id'>>({
    title: '',
    subtitle: '',
    type: 'featured',
    categoryFilter: '',
    productIds: [],
    maxProducts: 8,
    layout: 'grid',
    showTitle: true,
    isActive: true,
    order: 1
  });

  useEffect(() => {
    if (mode === 'edit' && listing) {
      setFormData({
        title: listing.title,
        subtitle: listing.subtitle || '',
        type: listing.type,
        categoryFilter: listing.categoryFilter || '',
        productIds: listing.productIds || [],
        maxProducts: listing.maxProducts,
        layout: listing.layout,
        showTitle: listing.showTitle,
        isActive: listing.isActive,
        order: listing.order
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        type: 'featured',
        categoryFilter: '',
        productIds: [],
        maxProducts: 8,
        layout: 'grid',
        showTitle: true,
        isActive: true,
        order: 1
      });
    }
  }, [mode, listing, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const updateField = <K extends keyof Omit<ProductListing, 'id'>>(
    field: K,
    value: Omit<ProductListing, 'id'>[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Tools' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Product Listing' : 'Edit Product Listing'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Featured Products"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Listing Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => updateField('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured Products</SelectItem>
                  <SelectItem value="newArrivals">New Arrivals</SelectItem>
                  <SelectItem value="sale">Sale Items</SelectItem>
                  <SelectItem value="category">Category Filter</SelectItem>
                  <SelectItem value="custom">Custom Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Optional subtitle"
            />
          </div>

          {formData.type === 'category' && (
            <div>
              <Label htmlFor="categoryFilter">Category</Label>
              <Select value={formData.categoryFilter} onValueChange={(value) => updateField('categoryFilter', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Maximum Products: {formData.maxProducts}</Label>
              <Slider
                value={[formData.maxProducts]}
                onValueChange={(value) => updateField('maxProducts', value[0])}
                min={2}
                max={20}
                step={2}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>2</span>
                <span>20</span>
              </div>
            </div>

            <div>
              <Label htmlFor="layout">Layout</Label>
              <Select value={formData.layout} onValueChange={(value: any) => updateField('layout', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="slider">Slider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showTitle">Show Section Title</Label>
            <Switch
              id="showTitle"
              checked={formData.showTitle}
              onCheckedChange={(checked) => updateField('showTitle', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => updateField('isActive', checked)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              {mode === 'add' ? 'Add Listing' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
