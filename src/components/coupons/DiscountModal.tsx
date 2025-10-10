import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, CalendarIcon, Search, Package, Store, Tag, Globe } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useCategories } from "@/hooks/useCategories";
import { Discount, CreateDiscountRequest } from "@/services/discountService";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (discount: CreateDiscountRequest) => Promise<void>;
  editingDiscount?: Discount | null;
}

type DiscountScope = 'global' | 'product' | 'category';

interface DiscountFormData {
  type: 'percentage' | 'fixed' | 'discounted_price';
  value: number;
  label: string;
  description?: string;
  max_discount?: number;
  starts_at?: Date;
  expires_at?: Date;
  is_active: boolean;
  is_stackable: boolean;
  scope: DiscountScope;
  // Targeting
  product_ids: number[];
  category_ids: number[];
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDiscount
}) => {
  const [formData, setFormData] = useState<DiscountFormData>({
    type: 'percentage',
    value: 0,
    label: '',
    description: '',
    max_discount: undefined,
    starts_at: undefined,
    expires_at: undefined,
    is_active: true,
    is_stackable: false,
    scope: 'global',
    product_ids: [],
    category_ids: [],
  });

  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // Hooks for data fetching
  const { data: productData, isLoading: productsLoading } = useAdminProducts({
    q: productSearchTerm,
    limit: 50
  });
  const { categories, searchCategories } = useCategories();

  // Initialize form data when editing
  useEffect(() => {
    if (editingDiscount) {
      const scope: DiscountScope = editingDiscount.discountable_type === 'App\\Models\\Product' ? 'product' :
                                  editingDiscount.discountable_type === 'App\\Models\\Category' ? 'category' : 'global';

      setFormData({
        type: editingDiscount.type as 'percentage' | 'fixed' | 'discounted_price',
        value: editingDiscount.value,
        label: editingDiscount.label || '',
        description: editingDiscount.label || '',
        max_discount: editingDiscount.max_discount || undefined,
        starts_at: editingDiscount.starts_at ? new Date(editingDiscount.starts_at) : undefined,
        expires_at: editingDiscount.expires_at ? new Date(editingDiscount.expires_at) : undefined,
        is_active: editingDiscount.is_active,
        is_stackable: editingDiscount.is_stackable,
        scope,
        product_ids: scope === 'product' ? [editingDiscount.discountable_id!] : [],
        category_ids: scope === 'category' ? [editingDiscount.discountable_id!] : [],
      });
    } else {
      // Reset form for new discount
      setFormData({
        type: 'percentage',
        value: 0,
        label: '',
        description: '',
        max_discount: undefined,
        starts_at: undefined,
        expires_at: undefined,
        is_active: true,
        is_stackable: false,
        scope: 'global',
        product_ids: [],
        category_ids: [],
      });
    }
  }, [editingDiscount, isOpen]);

  const handleSave = async () => {
    try {
      const discountData: CreateDiscountRequest = {
        type: formData.type,
        value: formData.value,
        label: formData.label,
        max_discount: formData.max_discount,
        starts_at: formData.starts_at ? formData.starts_at.toISOString() : undefined,
        expires_at: formData.expires_at ? formData.expires_at.toISOString() : undefined,
        is_active: formData.is_active,
        is_stackable: formData.is_stackable,
      };

      // Add targeting based on scope
      switch (formData.scope) {
        case 'product':
          discountData.discountable_type = 'product';
          discountData.discountable_ids = formData.product_ids;
          break;
        case 'category':
          discountData.discountable_type = 'category';
          discountData.discountable_ids = formData.category_ids;
          break;
        // 'global' - no additional targeting needed
      }

      await onSave(discountData);
      onClose();
    } catch (error) {
      console.error('Failed to save discount:', error);
    }
  };

  const handleProductSelection = (productId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        product_ids: [...prev.product_ids, productId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        product_ids: prev.product_ids.filter(id => id !== productId)
      }));
    }
  };

  const removeProduct = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids.filter(id => id !== productId)
    }));
  };

  const handleCategorySelection = (categoryId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        category_ids: [...prev.category_ids, categoryId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        category_ids: prev.category_ids.filter(id => id !== categoryId)
      }));
    }
  };

  const getScopeIcon = (scope: DiscountScope) => {
    switch (scope) {
      case 'global': return <Globe className="w-4 h-4" />;
      case 'product': return <Package className="w-4 h-4" />;
      case 'category': return <Tag className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getScopeDescription = (scope: DiscountScope) => {
    switch (scope) {
      case 'global': return 'Applies to all products store-wide';
      case 'product': return 'Applies to specific products only';
      case 'category': return 'Applies to all products in selected categories';
      default: return '';
    }
  };

  // Get products from the hook data
  const products = productData?.products || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingDiscount ? 'Edit' : 'Create'} Discount</DialogTitle>
          <DialogDescription>
            {editingDiscount ? 'Update' : 'Create a new'} discount for products, categories, or entire stores
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Configure the discount type and value</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Discount Name</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Summer Sale 20% Off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'percentage' | 'fixed' | 'discounted_price') => {
                    const newFormData = { ...formData, type: value };
                    if (value === 'discounted_price') {
                      newFormData.scope = 'product';
                    }
                    setFormData(newFormData);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="discounted_price">Discounted Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the discount"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">
                    {formData.type === 'percentage' ? 'Percentage (%)' : 
                     formData.type === 'fixed' ? 'Amount ($)' : 'New Price ($)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder={formData.type === 'percentage' ? '20' : 
                                formData.type === 'fixed' ? '50' : '99.99'}
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                  />
                </div>
                {formData.type === 'percentage' && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount ($)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.max_discount || ''}
                      onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) || undefined })}
                      placeholder="100"
                      min="0"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scope and Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scope">Discount Scope</Label>
              <Select 
                value={formData.scope} 
                onValueChange={(value: DiscountScope) => setFormData({ ...formData, scope: value })}
                disabled={formData.type === 'discounted_price'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global" disabled={formData.type === 'discounted_price'}>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Global - All products</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="product">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>Product - Specific products</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="category" disabled={formData.type === 'discounted_price'}>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>Category - Product categories</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                {formData.type === 'discounted_price' 
                  ? 'Discounted price requires specific product targeting'
                  : getScopeDescription(formData.scope)}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Active Status</div>
                  <div className="text-xs text-muted-foreground">Enable immediately</div>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Stackable</div>
                  <div className="text-xs text-muted-foreground">Can combine with others</div>
                </div>
                <Switch
                  checked={formData.is_stackable}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_stackable: checked })}
                />
              </div>
            </div>
          </div>

          {/* Scope-specific Configuration */}
          {formData.scope === 'product' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Products</CardTitle>
                <CardDescription>Choose which products this discount applies to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products by name, category, or SKU..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {productsLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Loading products...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {products.map((product: any) => (
                        <div key={product.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                          <Checkbox
                            checked={formData.product_ids.includes(product.id)}
                            onCheckedChange={(checked) => handleProductSelection(product.id, checked as boolean)}
                          />
                          <img 
                            src={typeof product.media?.cover_image === 'string' ? product.media.cover_image : product.media?.cover_image?.urls?.original || '/placeholder.svg'} 
                            alt={product.title || product.name} 
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.title || product.name}</p>
                            <p className="text-sm text-gray-500">
                              {product.pricing?.[0]?.currency?.symbol || '$'}{product.pricing?.[0]?.net_price || product.price || 0}
                            </p>
                            {(product.sku || product.identifiers?.sku) && (
                              <p className="text-xs text-gray-400">SKU: {product.sku || product.identifiers?.sku}</p>
                            )}
                            <p className="text-xs text-gray-400">{product.category?.name}</p>
                          </div>
                        </div>
                      ))}
                      {!productsLoading && products.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No products found matching your search.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Selected: {formData.product_ids.length} products
                </p>
              </CardContent>
            </Card>
          )}

          {formData.scope === 'category' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Categories</CardTitle>
                <CardDescription>Choose which categories this discount applies to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search categories..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {!categories ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Loading categories...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {categories?.data?.filter((category: any) => 
                        !categorySearchTerm || category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
                      ).map((category: any) => (
                        <div key={category.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                          <Checkbox
                            checked={formData.category_ids.includes(category.id)}
                            onCheckedChange={(checked) => handleCategorySelection(category.id, checked as boolean)}
                          />
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Tag className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{category.name}</p>
                            <p className="text-xs text-gray-400">ID: {category.id}</p>
                            {category.parent && (
                              <p className="text-xs text-gray-400">Parent: {category.parent.name}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {categories?.data?.filter((category: any) => 
                        !categorySearchTerm || category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No categories found matching your search.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Selected: {formData.category_ids.length} categories
                </p>
              </CardContent>
            </Card>
          )}


          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule (Optional)</CardTitle>
              <CardDescription>Set start and end dates for this discount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.starts_at && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.starts_at ? format(formData.starts_at, "PPP") : <span>No start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.starts_at}
                        onSelect={(date) => setFormData({ ...formData, starts_at: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.expires_at && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expires_at ? format(formData.expires_at, "PPP") : <span>No end date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expires_at}
                        onSelect={(date) => setFormData({ ...formData, expires_at: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingDiscount ? 'Update' : 'Create'} Discount
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};