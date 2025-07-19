
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { ProductListingAPI, CreateProductListingRequest, UpdateProductListingRequest } from "@/services/productListingService";
import { useQuery } from "@tanstack/react-query";
import { productService, ProductAPI } from "@/services/productService";

interface ProductListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (listing: CreateProductListingRequest | UpdateProductListingRequest) => void;
  listing: ProductListingAPI | null;
  mode: 'add' | 'edit';
}

export function ProductListingModal({ isOpen, onClose, onSave, listing, mode }: ProductListingModalProps) {
  const [formData, setFormData] = useState<CreateProductListingRequest>({
    title: '',
    subtitle: '',
    type: 'featured',
    max_products: 8,
    layout: 'grid',
    show_title: true,
    is_active: true
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products from API
  const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      console.log('Fetching products for product listing modal...');
      if (searchTerm.trim()) {
        // Use search when there's a search term
        return await productService.searchProducts(searchTerm, 1, 1, {
          limit: 50 // Get more products for better suggestions
        });
      } else {
        // Get general products list
        return await productService.getProducts(1, 1, 1, 50);
      }
    },
    select: (data) => {
      console.log('Processing products data:', data);
      if (data && data.details && data.details.products) {
        if (Array.isArray(data.details.products.data)) {
          return data.details.products.data;
        } else if (Array.isArray(data.details.products)) {
          return data.details.products;
        }
      }
      return [];
    },
    enabled: isOpen, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const products: ProductAPI[] = productsResponse || [];

  useEffect(() => {
    if (mode === 'edit' && listing) {
      setFormData({
        title: listing.title,
        subtitle: listing.subtitle || '',
        type: listing.type,
        category_id: listing.category_id,
        products: listing.products?.map(p => p.id) || [],
        max_products: listing.max_products,
        layout: listing.layout,
        show_title: listing.show_title,
        is_active: listing.is_active
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        type: 'featured',
        max_products: 8,
        layout: 'grid',
        show_title: true,
        is_active: true
      });
    }
    setSearchTerm('');
  }, [mode, listing, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = <K extends keyof CreateProductListingRequest>(
    field: K,
    value: CreateProductListingRequest[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelection = (productId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        products: [...(prev.products || []), productId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        products: (prev.products || []).filter(id => id !== productId)
      }));
    }
  };

  const categories = [
    { value: 1, label: 'Electronics' },
    { value: 2, label: 'Furniture' },
    { value: 3, label: 'Fashion' },
    { value: 4, label: 'Home & Tools' }
  ];

  const getFilteredProducts = () => {
    // Products are already filtered by the API search
    return products;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <Select value={formData.category_id?.toString()} onValueChange={(value) => updateField('category_id', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value.toString()}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.type === 'custom' && (
            <div className="space-y-4">
              <Label>Select Products</Label>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products by name, category, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {isLoadingProducts ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Loading products...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {getFilteredProducts().map((product) => (
                      <div key={product.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                        <Checkbox
                          checked={(formData.products || []).includes(product.id)}
                          onCheckedChange={(checked) => handleProductSelection(product.id, checked as boolean)}
                        />
                        <img 
                          src={product.media?.cover_image || '/placeholder.svg'} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.pricing?.final?.currency?.symbol || '$'}{product.pricing?.final?.price || 0}
                          </p>
                          {product.identifiers?.sku && (
                            <p className="text-xs text-gray-400">SKU: {product.identifiers.sku}</p>
                          )}
                          <p className="text-xs text-gray-400">{product.category?.name}</p>
                        </div>
                      </div>
                    ))}
                    {!isLoadingProducts && getFilteredProducts().length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No products found matching your search.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Selected: {formData.products?.length || 0} products
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Maximum Products: {formData.max_products}</Label>
              <Slider
                value={[formData.max_products]}
                onValueChange={(value) => updateField('max_products', value[0])}
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
              checked={formData.show_title}
              onCheckedChange={(checked) => updateField('show_title', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={formData.is_active}
              onCheckedChange={(checked) => updateField('is_active', checked)}
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
