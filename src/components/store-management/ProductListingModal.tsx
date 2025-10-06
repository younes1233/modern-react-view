
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
import { adminProductService, AdminProductAPI } from "@/services/adminProductService";
import { useFlatCategories } from "@/hooks/useCategories";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useFieldError } from "@/components/ui/form-error-display";
import { createFieldUpdater } from "@/utils/validation";

interface ProductListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (listing: CreateProductListingRequest | UpdateProductListingRequest) => Promise<void>;
  listing: ProductListingAPI | null;
  mode: 'add' | 'edit';
}

export function ProductListingModal({ isOpen, onClose, onSave, listing, mode }: ProductListingModalProps) {
  // Initialize validation system
  const {
    validationErrors,
    setErrors,
    clearErrors,
    clearFieldError,
    handleBackendErrors,
    showToastError
  } = useFormValidation({
    enableScrollToError: true,
    scrollDelay: 200
  });

  // Use field error renderer
  const renderFieldError = useFieldError(validationErrors);

  const [formData, setFormData] = useState<CreateProductListingRequest>({
    title: '',
    type: 'featured',
    max_products: 8,
    layout: 'grid',
    show_title: true,
    is_active: true
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch categories from API
  const { data: categories = [], isLoading: isLoadingCategories } = useFlatCategories();

  // Fetch products from API
  const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-products', searchTerm],
    queryFn: async () => {
      console.log('Fetching admin products for product listing modal...');
      return await adminProductService.getAdminProducts({
        q: searchTerm.trim() || undefined,
        page: 1,
        limit: 50
      });
    },
    select: (data) => {
      console.log('Processing admin products data:', data);
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

  const products: AdminProductAPI[] = productsResponse || [];

  useEffect(() => {
    if (mode === 'edit' && listing) {
      const baseFormData = {
        title: listing.title,
        type: listing.type,
        max_products: listing.max_products,
        layout: listing.layout,
        show_title: listing.show_title,
        is_active: listing.is_active
      };

      // Only include category_id if type is 'category'
      if (listing.type === 'category' && listing.category_id) {
        baseFormData.category_id = listing.category_id;
      }

      // Only include products if type is 'custom'
      if (listing.type === 'custom' && listing.products) {
        baseFormData.products = listing.products.map(p => p.id);
      }

      setFormData(baseFormData);
    } else {
      setFormData({
        title: '',
        type: 'featured',
        max_products: 8,
        layout: 'grid',
        show_title: true,
        is_active: true
      });
    }
    setSearchTerm('');
  }, [mode, listing, isOpen]);

  // Create field updater with automatic error clearing
  const updateField = createFieldUpdater(setFormData, clearFieldError);

  // Auto-populate title based on listing type and category
  const updateTypeAndTitle = (type: string) => {
    setFormData(prev => {
      let newTitle = '';

      // Auto-populate title based on type
      if (type !== 'custom') {
        switch (type) {
          case 'featured':
            newTitle = 'Featured Products';
            break;
          case 'newArrivals':
            newTitle = 'New Arrivals';
            break;
          case 'sale':
            newTitle = 'On Sale';
            break;
          case 'category':
            // For category, we'll set the title when category is selected
            const selectedCategory = categories.find(cat => cat.id === prev.category_id);
            newTitle = selectedCategory ? selectedCategory.name : 'Category Products';
            break;
          default:
            newTitle = 'Product Listing';
        }
      } else {
        // For custom type, clear the title to force user input
        newTitle = '';
      }

      return {
        ...prev,
        type,
        title: newTitle,
        // Clear category_id when switching away from category type
        ...(type !== 'category' && { category_id: undefined })
      };
    });

    // Clear validation errors
    clearFieldError('type');
    if (type !== 'custom') {
      clearFieldError('title'); // Clear title error since we're auto-populating
    }
    // Don't clear title error for custom type - user needs to enter title manually
  };

  // Update category and auto-populate title for category type
  const updateCategoryAndTitle = (categoryId: number) => {
    const selectedCategory = categories.find(cat => cat.id === categoryId);

    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      // Auto-populate title with category name for category type
      title: formData.type === 'category' && selectedCategory ? selectedCategory.name : prev.title
    }));

    clearFieldError('category_id');
    if (formData.type === 'category') {
      clearFieldError('title'); // Clear title error since we're auto-populating
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Validation logic
    const errors: Record<string, string[]> = {};

    // Basic validation
    if (!formData.title?.trim()) {
      errors.title = ["Title is required"];
    }

    if (!formData.type) {
      errors.type = ["Listing type is required"];
    }

    // Category validation for category type
    if (formData.type === 'category' && !formData.category_id) {
      errors.category_id = ["Category is required for category listings"];
    }

    // Custom products validation (backend requires at least 2 products)
    if (formData.type === 'custom') {
      if (!formData.products || formData.products.length === 0) {
        errors.products = ["Products are required for custom listings"];
      } else if (formData.products.length < 2) {
        errors.products = ["You must select at least 2 products for custom listings"];
      } else if (formData.products.length > formData.max_products) {
        errors.products = [`You cannot select more than ${formData.max_products} products`];
      }
    }

    // Max products validation
    if (formData.max_products < 2 || formData.max_products > 20) {
      errors.max_products = ["Maximum products must be between 2 and 20"];
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      // Prepare clean data based on listing type to match backend expectations
      const cleanData: CreateProductListingRequest | UpdateProductListingRequest = {
        title: formData.title,
        type: formData.type,
        max_products: formData.max_products,
        layout: formData.layout,
        show_title: formData.show_title,
        is_active: formData.is_active
      };

      // Only include category_id if type is 'category'
      if (formData.type === 'category' && formData.category_id) {
        cleanData.category_id = formData.category_id;
      }

      // Only include products if type is 'custom'
      if (formData.type === 'custom' && formData.products) {
        cleanData.products = formData.products;
      }

      await onSave(cleanData);
      clearErrors();
      onClose();
    } catch (error: any) {
      console.error('Save failed:', error);
      handleBackendErrors(error);
    }
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

    // Clear products validation error when user selects/deselects products
    if (validationErrors.products) {
      clearFieldError('products');
    }
  };

  // Handle modal close with error clearing
  const handleClose = () => {
    clearErrors();
    onClose();
  };


  const getFilteredProducts = () => {
    // Products are already filtered by the API search
    return products;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Product Listing' : 'Edit Product Listing'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Listing Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => updateTypeAndTitle(value)}>
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
              {renderFieldError('type')}
            </div>

            {formData.type === 'category' && (
              <div>
                <Label htmlFor="categoryFilter">Category *</Label>
                <Select value={formData.category_id?.toString()} onValueChange={(value) => updateCategoryAndTitle(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {renderFieldError('category_id')}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder={
                formData.type === 'custom'
                  ? "Enter a custom title for this listing"
                  : "Auto-populated (can be customized)"
              }
            />
            {renderFieldError('title')}
          </div>

          {formData.type === 'custom' && (
            <div className="space-y-4">
              <Label>Select Products *</Label>
              {renderFieldError('products')}
              
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
                          src={typeof product.media?.cover_image === 'string' ? product.media.cover_image : product.media?.cover_image?.urls?.original || '/placeholder.svg'} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.pricing?.[0]?.currency?.symbol || '$'}{product.pricing?.[0]?.net_price || 0}
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
              {renderFieldError('max_products')}
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Listing' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
