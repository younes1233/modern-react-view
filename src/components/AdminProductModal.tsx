// This component is adapted from the original AdminProductModal.tsx in the remote repository.
// It has been updated to support the new Product API which requires additional fields like store_id,
// seller_product_status, flags for best seller and VAT exemption, inventory details, pricing and specifications.

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { useFlatCategories } from "@/hooks/useCategories";
import { AdminProductAPI, CreateProductData } from "@/services/adminProductService";
import { X } from "lucide-react";

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: CreateProductData) => void;
  product?: AdminProductAPI | null;
  mode: 'add' | 'edit';
}

/**
 * AdminProductModal allows creating or editing a product.
 * The form captures all fields required by the new API.
 */
export function AdminProductModal({ isOpen, onClose, onSave, product, mode }: AdminProductModalProps) {
  // Maintain form data with default values for all required fields.
  const [formData, setFormData] = useState<CreateProductData>({
    store_id: 1,
    category_id: 1,
    name: '',
    slug: '',
    sku: '',
    status: 'active',
    has_variants: false,
    is_seller_product: false,
    seller_product_status: 'draft',
    description: '',
    seo_title: '',
    seo_description: '',
    barcode: '',
    qr_code: '',
    serial_number: '',
    is_on_sale: false,
    is_featured: false,
    is_new_arrival: false,
    is_best_seller: false,
    is_vat_exempt: false,
    cover_image: '',
    images: [],
    stock: 0,
    warehouse_id: undefined,
    warehouse_zone_id: undefined,
    shelf_id: undefined,
    delivery_method_id: undefined,
    delivery_cost: 0,
    available_countries: [],
    product_prices: [],
    specifications: [],
    variants: [],
  });
  // Local states for image previews and dynamic lists
  const [mainImage, setMainImage] = useState<string>('');
  const [thumbnails, setThumbnails] = useState<{ id: number; url: string; alt: string }[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string>('');
  const [priceEntries, setPriceEntries] = useState<
    { country_id: string; net_price: string; cost: string; vat_percentage: string }[]
  >([]);
  const [specifications, setSpecifications] = useState<{ id: number; name: string; value: string }[]>([]);
  const { toast } = useToast();
  const { data: categories = [], isLoading: categoriesLoading } = useFlatCategories();

  useEffect(() => {
    if (product && mode === 'edit') {
      // When editing, populate the form with existing product values.
      setFormData({
        store_id: product.store?.id || 1,
        category_id: product.category?.id || 1,
        name: product.name,
        slug: product.slug,
        sku: product.identifiers?.sku || '',
        status: product.status,
        has_variants: product.variants?.length > 0,
        is_seller_product: product.flags?.seller_product_status !== 'not_seller',
        seller_product_status: (product.flags?.seller_product_status as any) || 'draft',
        description: product.description || '',
        seo_title: product.meta?.seo_title || '',
        seo_description: product.meta?.seo_description || '',
        barcode: product.identifiers?.barcode || '',
        qr_code: product.identifiers?.qr_code || '',
        serial_number: product.identifiers?.serial_number || '',
        is_on_sale: product.flags?.on_sale || false,
        is_featured: product.flags?.is_featured || false,
        is_new_arrival: product.flags?.is_new_arrival || false,
        is_best_seller: product.flags?.is_best_seller || false,
        is_vat_exempt: product.flags?.is_vat_exempt || false,
        cover_image: product.media?.cover_image?.image || '',
        images: product.media?.thumbnails?.map((t) => t.image) || [],
        stock: 0,
        warehouse_id: undefined,
        warehouse_zone_id: undefined,
        shelf_id: undefined,
        delivery_method_id: undefined,
        delivery_cost: 0,
        available_countries: [],
        product_prices: [],
        specifications: product.specifications?.map((s) => ({ name: s.name, value: s.value })) || [],
        variants: [],
      });
      // Populate local states for dynamic lists if necessary
      setMainImage(product.media?.cover_image?.image || '');
      setThumbnails(
        product.media?.thumbnails?.map((t) => ({
          id: t.id,
          url: t.image,
          alt: t.alt_text,
        })) || []
      );
      setAvailableCountries('');
      setPriceEntries([]);
      setSpecifications(
        product.specifications?.map((s) => ({
          id: s.id,
          name: s.name,
          value: s.value,
        })) || []
      );
    } else {
      // Reset all fields when adding a new product
      setFormData({
        store_id: 1,
        category_id: 1,
        name: '',
        slug: '',
        sku: '',
        status: 'active',
        has_variants: false,
        is_seller_product: false,
        seller_product_status: 'draft',
        description: '',
        seo_title: '',
        seo_description: '',
        barcode: '',
        qr_code: '',
        serial_number: '',
        is_on_sale: false,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_vat_exempt: false,
        cover_image: '',
        images: [],
        stock: 0,
        warehouse_id: undefined,
        warehouse_zone_id: undefined,
        shelf_id: undefined,
        delivery_method_id: undefined,
        delivery_cost: 0,
        available_countries: [],
        product_prices: [],
        specifications: [],
        variants: [],
      });
      setMainImage('');
      setThumbnails([]);
      setAvailableCountries('');
      setPriceEntries([]);
      setSpecifications([]);
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

  // Generic field updater
  const updateField = <K extends keyof CreateProductData>(field: K, value: CreateProductData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Image handlers
  const handleMainImageUpload = (files: File[]) => {
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setMainImage(url);
      updateField('cover_image', url);
    }
  };

  const handleThumbnailUpload = (files: File[]) => {
    const newThumbnails = files.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      alt: file.name
    }));
    setThumbnails(prev => [...prev, ...newThumbnails]);
    updateField('images', [...(formData.images || []), ...newThumbnails.map(t => t.url)]);
  };

  const removeThumbnail = (id: number) => {
    setThumbnails(prev => prev.filter(t => t.id !== id));
    const updatedImages = (formData.images || []).filter((_, idx) => thumbnails[idx]?.id !== id);
    updateField('images', updatedImages);
  };

  // Pricing handlers
  const addPriceEntry = () => {
    setPriceEntries(prev => [...prev, { country_id: '', net_price: '', cost: '', vat_percentage: '' }]);
  };

  const updatePriceEntry = (index: number, field: keyof { country_id: string; net_price: string; cost: string; vat_percentage: string }, value: string) => {
    setPriceEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removePriceEntry = (index: number) => {
    setPriceEntries(prev => prev.filter((_, idx) => idx !== index));
  };

  // Specification handlers
  const addSpecification = () => {
    setSpecifications(prev => [...prev, { id: Date.now(), name: '', value: '' }]);
  };
  const updateSpecification = (index: number, field: 'name' | 'value', value: string) => {
    setSpecifications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  const removeSpecification = (index: number) => {
    setSpecifications(prev => prev.filter((_, idx) => idx !== index));
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
    // Parse available countries string into number array
    const countryIds = availableCountries
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .map((c) => parseInt(c, 10))
      .filter((c) => !isNaN(c));

    // Build product prices from dynamic entries
    const prices = priceEntries
      .map((p) => ({
        country_id: parseInt(p.country_id, 10),
        net_price: parseFloat(p.net_price),
        cost: parseFloat(p.cost),
        vat_percentage: p.vat_percentage ? parseFloat(p.vat_percentage) : undefined,
      }))
      .filter((p) => !isNaN(p.country_id) && !isNaN(p.net_price) && !isNaN(p.cost));

    // Build specifications from dynamic entries
    const specs = specifications
      .map((s) => ({ name: s.name, value: s.value }))
      .filter((s) => s.name.trim() !== '' && s.value.trim() !== '');

    const payload: CreateProductData = {
      ...formData,
      available_countries: countryIds,
      product_prices: prices,
      specifications: specs,
      cover_image: mainImage || formData.cover_image,
      images: thumbnails.map((t) => t.url),
    };

    onSave(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    {/*
       The dialog content can grow very tall because the product form contains
       many fields. Without constraining its height and enabling scrolling,
       long forms may overflow the viewport and users will be unable to reach
       the bottom of the modal. To fix this we set a maximum height and
       enable vertical scrolling on the DialogContent element. The `max-h`
       value of 80vh means the modal will take up at most 80% of the
       viewport height, and `overflow-y-auto` allows the inner form to
       scroll independently when its content exceeds that height.
    */}
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <Label>SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                placeholder="Enter SKU"
                required
              />
            </div>
            <div>
              <Label>URL Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="product-url-slug"
              />
            </div>
            <div>
              <Label>Store ID *</Label>
              <Input
                type="number"
                value={formData.store_id}
                onChange={(e) => updateField('store_id', parseInt(e.target.value || '0', 10))}
                placeholder="Store ID"
                required
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Product description"
                rows={3}
              />
            </div>
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => updateField('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status">{formData.status}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={String(formData.category_id)}
                onValueChange={(value: any) => updateField('category_id', parseInt(value, 10))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category">
                    {categories.find((c) => c.id === formData.category_id)?.name || 'Select category'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {!categoriesLoading &&
                    categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Flags */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasVariants"
                checked={formData.has_variants}
                onCheckedChange={(checked) => updateField('has_variants', checked)}
              />
              <Label htmlFor="hasVariants">Has Variants</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isOnSale"
                checked={formData.is_on_sale}
                onCheckedChange={(checked) => updateField('is_on_sale', checked)}
              />
              <Label htmlFor="isOnSale">On Sale</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isFeatured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => updateField('is_featured', checked)}
              />
              <Label htmlFor="isFeatured">Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isNewArrival"
                checked={formData.is_new_arrival}
                onCheckedChange={(checked) => updateField('is_new_arrival', checked)}
              />
              <Label htmlFor="isNewArrival">New Arrival</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isBestSeller"
                checked={formData.is_best_seller}
                onCheckedChange={(checked) => updateField('is_best_seller', checked)}
              />
              <Label htmlFor="isBestSeller">Best Seller</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isVatExempt"
                checked={formData.is_vat_exempt}
                onCheckedChange={(checked) => updateField('is_vat_exempt', checked)}
              />
              <Label htmlFor="isVatExempt">VAT Exempt</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isSellerProduct"
                checked={formData.is_seller_product}
                onCheckedChange={(checked) => updateField('is_seller_product', checked)}
              />
              <Label htmlFor="isSellerProduct">Seller Product</Label>
            </div>
            <div>
              <Label>Seller Product Status</Label>
              <Select
                value={formData.seller_product_status}
                onValueChange={(value: any) =>
                  updateField('seller_product_status', value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status">{formData.seller_product_status}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="not_seller">Not Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Identifiers */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Barcode</Label>
              <Input
                value={formData.barcode || ''}
                onChange={(e) => updateField('barcode', e.target.value)}
                placeholder="Barcode"
              />
            </div>
            <div>
              <Label>QR Code</Label>
              <Input
                value={formData.qr_code || ''}
                onChange={(e) => updateField('qr_code', e.target.value)}
                placeholder="QR Code"
              />
            </div>
            <div>
              <Label>Serial Number</Label>
              <Input
                value={formData.serial_number || ''}
                onChange={(e) => updateField('serial_number', e.target.value)}
                placeholder="Serial Number"
              />
            </div>
          </div>

          {/* Inventory and Delivery */}
          {!formData.has_variants && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={formData.stock || 0}
                  onChange={(e) => updateField('stock', parseInt(e.target.value || '0', 10))}
                  placeholder="Stock quantity"
                />
              </div>
              <div>
                <Label>Warehouse ID</Label>
                <Input
                  type="number"
                  value={formData.warehouse_id || ''}
                  onChange={(e) => updateField('warehouse_id', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  placeholder="Warehouse ID"
                />
              </div>
              <div>
                <Label>Warehouse Zone ID</Label>
                <Input
                  type="number"
                  value={formData.warehouse_zone_id || ''}
                  onChange={(e) => updateField('warehouse_zone_id', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  placeholder="Zone ID"
                />
              </div>
              <div>
                <Label>Shelf ID</Label>
                <Input
                  type="number"
                  value={formData.shelf_id || ''}
                  onChange={(e) => updateField('shelf_id', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  placeholder="Shelf ID"
                />
              </div>
              <div>
                <Label>Delivery Method ID</Label>
                <Input
                  type="number"
                  value={formData.delivery_method_id || ''}
                  onChange={(e) => updateField('delivery_method_id', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  placeholder="Delivery Method ID"
                />
              </div>
              <div>
                <Label>Delivery Cost</Label>
                <Input
                  type="number"
                  value={formData.delivery_cost || 0}
                  onChange={(e) => updateField('delivery_cost', parseFloat(e.target.value || '0'))}
                  placeholder="Delivery Cost"
                />
              </div>
            </div>
          )}

          {/* Available Countries */}
          <div>
            <Label>Available Countries (comma separated IDs)</Label>
            <Input
              value={availableCountries}
              onChange={(e) => setAvailableCountries(e.target.value)}
              placeholder="e.g., 1,2,3"
            />
          </div>

          {/* Pricing Entries */}
          <div>
            <div className="flex items-center justify-between">
              <Label>Product Prices</Label>
              <Button type="button" onClick={addPriceEntry} variant="secondary">
                Add Price
              </Button>
            </div>
            {priceEntries.map((entry, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 mt-2">
                <Input
                  type="number"
                  value={entry.country_id}
                  onChange={(e) => updatePriceEntry(index, 'country_id', e.target.value)}
                  placeholder="Country ID"
                />
                <Input
                  type="number"
                  value={entry.net_price}
                  onChange={(e) => updatePriceEntry(index, 'net_price', e.target.value)}
                  placeholder="Net Price"
                />
                <Input
                  type="number"
                  value={entry.cost}
                  onChange={(e) => updatePriceEntry(index, 'cost', e.target.value)}
                  placeholder="Cost"
                />
                <Input
                  type="number"
                  value={entry.vat_percentage}
                  onChange={(e) => updatePriceEntry(index, 'vat_percentage', e.target.value)}
                  placeholder="VAT % (optional)"
                />
                <Button type="button" variant="destructive" onClick={() => removePriceEntry(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between">
              <Label>Specifications</Label>
              <Button type="button" onClick={addSpecification} variant="secondary">
                Add Specification
              </Button>
            </div>
            {specifications.map((spec, index) => (
              <div key={spec.id} className="grid grid-cols-3 gap-2 mt-2">
                <Input
                  value={spec.name}
                  onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                  placeholder="Name"
                />
                <Input
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  placeholder="Value"
                />
                <Button type="button" variant="destructive" onClick={() => removeSpecification(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {/* Images */}
          <div>
            <Label>Main Product Image</Label>
            <FileUpload onUpload={handleMainImageUpload} accept="image/*" />
            {mainImage && (
              <div className="mt-2">
                <img src={mainImage} alt="Main product" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
          </div>
          <div>
            <Label>Additional Images</Label>
            <FileUpload onUpload={handleThumbnailUpload} accept="image/*" multiple />
            {thumbnails.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {thumbnails.map((thumbnail) => (
                  <div key={thumbnail.id} className="relative">
                    <img src={thumbnail.url} alt={thumbnail.alt} className="w-full h-24 object-cover rounded" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => removeThumbnail(thumbnail.id)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{mode === 'add' ? 'Create Product' : 'Update Product'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
