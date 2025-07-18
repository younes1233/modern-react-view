
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AdminProductAPI, CreateProductData } from "@/services/adminProductService";

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: CreateProductData) => void;
  product?: AdminProductAPI | null;
  mode: 'add' | 'edit';
}

export function AdminProductModal({ isOpen, onClose, onSave, product, mode }: AdminProductModalProps) {
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    slug: '',
    sku: '',
    short_description: '',
    long_description: '',
    status: 'active',
    has_variants: false,
    category_id: 1,
    is_seller_product: false,
    is_on_sale: false,
    is_featured: false,
    is_new_arrival: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        short_description: product.short_description || '',
        long_description: product.long_description || '',
        status: product.status,
        has_variants: product.has_variants,
        category_id: product.category_id || 1,
        is_seller_product: product.is_seller_product || false,
        is_on_sale: product.is_on_sale || false,
        is_featured: product.is_featured || false,
        is_new_arrival: product.is_new_arrival || false,
        store_id: product.store_id,
        product_prices: product.product_prices,
        specifications: product.specifications,
        variants: product.variants,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        sku: '',
        short_description: '',
        long_description: '',
        status: 'active',
        has_variants: false,
        category_id: 1,
        is_seller_product: false,
        is_on_sale: false,
        is_featured: false,
        is_new_arrival: false,
      });
    }
  }, [product, mode, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const updateField = <K extends keyof CreateProductData>(
    field: K,
    value: CreateProductData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                placeholder="Enter SKU"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              placeholder="product-url-slug"
            />
          </div>

          <div>
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) => updateField('short_description', e.target.value)}
              placeholder="Brief product description"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="long_description">Long Description</Label>
            <Textarea
              id="long_description"
              value={formData.long_description}
              onChange={(e) => updateField('long_description', e.target.value)}
              placeholder="Detailed product description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'draft') => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select value={formData.category_id?.toString()} onValueChange={(value) => updateField('category_id', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Electronics</SelectItem>
                  <SelectItem value="2">Furniture</SelectItem>
                  <SelectItem value="3">Fashion</SelectItem>
                  <SelectItem value="4">Home & Tools</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Flags */}
          <div className="space-y-4">
            <Label>Product Settings</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="has_variants">Has Variants</Label>
                <Switch
                  id="has_variants"
                  checked={formData.has_variants}
                  onCheckedChange={(checked) => updateField('has_variants', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured">Featured Product</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => updateField('is_featured', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_on_sale">On Sale</Label>
                <Switch
                  id="is_on_sale"
                  checked={formData.is_on_sale}
                  onCheckedChange={(checked) => updateField('is_on_sale', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_new_arrival">New Arrival</Label>
                <Switch
                  id="is_new_arrival"
                  checked={formData.is_new_arrival}
                  onCheckedChange={(checked) => updateField('is_new_arrival', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_seller_product">Seller Product</Label>
                <Switch
                  id="is_seller_product"
                  checked={formData.is_seller_product}
                  onCheckedChange={(checked) => updateField('is_seller_product', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Create Product' : 'Update Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
