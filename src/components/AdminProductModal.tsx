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
  // Specifications state holds an array of {id, name, value}. When adding a new product, we
  // prepopulate the first four entries with the required specifications: weight, height,
  // width and length. These are required by the API and cannot be removed. Additional
  // specifications can still be added via the "Add Spec" button.
  const [specifications, setSpecifications] = useState<{ id: number; name: string; value: string }[]>([]);

      /**
       * Variants state for has_variants=true.
       * Each variant entry contains an image upload, a comma separated list of attribute value IDs,
       * optional pricing overrides, optional delivery overrides, and optional specification overrides.
       */
      const [variantEntries, setVariantEntries] = useState<
        {
          id: number;
          image: string;
          variations: string;
          available_countries?: string;
          variantPrices: { country_id: string; net_price: string; cost: string; vat_percentage: string }[];
          variantSpecs: { id: number; name: string; value: string }[];
          delivery_method_id?: string;
          delivery_cost?: string;
        }[]
      >([]);
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
      // For a new product, initialise the specifications state with the required
      // attributes: weight, height, width and length. These entries cannot be removed
      // by the user and must have non-empty values before submission. Additional
      // specifications can be added on top of these entries.
      setSpecifications([
        { id: Date.now(), name: 'weight', value: '' },
        { id: Date.now() + 1, name: 'height', value: '' },
        { id: Date.now() + 2, name: 'width', value: '' },
        { id: Date.now() + 3, name: 'length', value: '' },
      ]);
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
    setSpecifications(prev => {
      // Prevent removal of the first four required specifications (weight, height, width, length)
      if (index < 4) {
        return prev;
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

      // Variant management handlers
      /**
       * Adds a new variant entry to the form. Variants are only used when
       * `has_variants` is true. Each variant starts with empty values for
       * image, variations, pricing overrides, delivery overrides and
       * specification overrides.
       */
      const addVariant = () => {
        setVariantEntries(prev => [
          ...prev,
          {
            id: Date.now(),
            image: '',
            variations: '',
            available_countries: '',
            variantPrices: [],
            variantSpecs: [],
            delivery_method_id: '',
            delivery_cost: '',
          },
        ]);
      };

      /**
       * Removes a variant entry by id.
       */
      const removeVariant = (variantId: number) => {
        setVariantEntries(prev => prev.filter(v => v.id !== variantId));
      };

      /**
       * Updates a top-level field of a variant, such as image, variations,
       * available_countries, delivery_method_id or delivery_cost.
       */
      const updateVariantField = (
        variantId: number,
        field: keyof (typeof variantEntries[number]),
        value: any,
      ) => {
        setVariantEntries(prev =>
          prev.map(v =>
            v.id === variantId
              ? {
                  ...v,
                  [field]: value,
                }
              : v,
          ),
        );
      };

      /**
       * Adds a pricing override entry to a specific variant. Each pricing
       * override corresponds to a product_variant_prices entry in the API.
       */
      const addVariantPrice = (variantId: number) => {
        setVariantEntries(prev =>
          prev.map(v =>
            v.id === variantId
              ? {
                  ...v,
                  variantPrices: [
                    ...v.variantPrices,
                    { country_id: '', net_price: '', cost: '', vat_percentage: '' },
                  ],
                }
              : v,
          ),
        );
      };

      /**
       * Updates a field of a variant's pricing override at a given index.
       */
      const updateVariantPrice = (
        variantId: number,
        index: number,
        field: keyof { country_id: string; net_price: string; cost: string; vat_percentage: string },
        value: string,
      ) => {
        setVariantEntries(prev =>
          prev.map(v => {
            if (v.id === variantId) {
              const updatedPrices = v.variantPrices.map((p, i) =>
                i === index
                  ? {
                      ...p,
                      [field]: value,
                    }
                  : p,
              );
              return { ...v, variantPrices: updatedPrices };
            }
            return v;
          }),
        );
      };

      /**
       * Removes a pricing override entry from a variant.
       */
      const removeVariantPrice = (variantId: number, index: number) => {
        setVariantEntries(prev =>
          prev.map(v => {
            if (v.id === variantId) {
              return {
                ...v,
                variantPrices: v.variantPrices.filter((_, i) => i !== index),
              };
            }
            return v;
          }),
        );
      };

      /**
       * Adds a specification override to a variant.
       */
      const addVariantSpec = (variantId: number) => {
        setVariantEntries(prev =>
          prev.map(v =>
            v.id === variantId
              ? {
                  ...v,
                  variantSpecs: [...v.variantSpecs, { id: Date.now(), name: '', value: '' }],
                }
              : v,
          ),
        );
      };

      /**
       * Updates a specification override for a variant.
       */
      const updateVariantSpec = (
        variantId: number,
        index: number,
        field: keyof { name: string; value: string },
        value: string,
      ) => {
        setVariantEntries(prev =>
          prev.map(v => {
            if (v.id === variantId) {
              const updatedSpecs = v.variantSpecs.map((s, i) =>
                i === index
                  ? {
                      ...s,
                      [field]: value,
                    }
                  : s,
              );
              return { ...v, variantSpecs: updatedSpecs };
            }
            return v;
          }),
        );
      };

      /**
       * Removes a specification override from a variant.
       */
      const removeVariantSpec = (variantId: number, index: number) => {
        setVariantEntries(prev =>
          prev.map(v => {
            if (v.id === variantId) {
              return {
                ...v,
                variantSpecs: v.variantSpecs.filter((_, i) => i !== index),
              };
            }
            return v;
          }),
        );
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

        // Build variants array if has_variants is true
        let variantsPayload: any[] = [];
        if (formData.has_variants && variantEntries.length > 0) {
          variantsPayload = variantEntries.map((variant) => {
            // Parse variations (attribute value IDs)
            const variations = variant.variations
              .split(',')
              .map((v) => v.trim())
              .filter((v) => v.length > 0)
              .map((v) => parseInt(v, 10))
              .filter((v) => !isNaN(v));
            // Parse available countries for variant (optional)
            const variantCountries = variant.available_countries
              ? variant.available_countries
                  .split(',')
                  .map((c) => c.trim())
                  .filter((c) => c.length > 0)
                  .map((c) => parseInt(c, 10))
                  .filter((c) => !isNaN(c))
              : undefined;
            // Parse variant prices
            const variantPricesParsed = variant.variantPrices
              .map((p) => ({
                country_id: parseInt(p.country_id, 10),
                net_price: parseFloat(p.net_price),
                cost: parseFloat(p.cost),
                vat_percentage: p.vat_percentage ? parseFloat(p.vat_percentage) : undefined,
              }))
              .filter((p) => !isNaN(p.country_id) && !isNaN(p.net_price) && !isNaN(p.cost));
            // Parse variant specs
            const variantSpecsParsed = variant.variantSpecs
              .map((s) => ({ name: s.name, value: s.value }))
              .filter((s) => s.name.trim() !== '' && s.value.trim() !== '');
            return {
              image: variant.image,
              variations: variations,
              available_countries: variantCountries,
              product_variant_prices: variantPricesParsed.length > 0 ? variantPricesParsed : undefined,
              delivery_method_id: variant.delivery_method_id ? parseInt(variant.delivery_method_id, 10) : undefined,
              delivery_cost: variant.delivery_cost ? parseFloat(variant.delivery_cost) : undefined,
              product_variant_specifications: variantSpecsParsed.length > 0 ? variantSpecsParsed : undefined,
            };
          });
        }

        const payload: CreateProductData = {
          ...formData,
          available_countries: countryIds,
          product_prices: prices,
          specifications: specs,
          cover_image: mainImage || formData.cover_image,
          images: thumbnails.map((t) => t.url),
          variants: variantsPayload,
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
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeSpecification(index)}
                  disabled={index < 4}
                >
                  Remove
                </Button>
              </div>
            ))}

            {/* Variants Section */}
            {formData.has_variants && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label>Variants</Label>
                  <Button type="button" onClick={addVariant} variant="secondary">
                    Add Variant
                  </Button>
                </div>
                {variantEntries.map((variant) => (
                  <div key={variant.id} className="border rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Variant</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVariant(variant.id)}
                      >
                        Remove
                      </Button>
                    </div>
                    {/* Variant image */}
                    <div>
                      <Label>Variant Image</Label>
                      <FileUpload
                        onUpload={(url: string) => updateVariantField(variant.id, 'image', url)}
                        accept="image/*"
                      />
                      {variant.image && (
                        <div className="mt-2">
                          <img src={variant.image} alt="Variant" className="w-24 h-24 object-cover rounded" />
                        </div>
                      )}
                    </div>
                    {/* Variant variations */}
                    <div>
                      <Label>Variations (attribute value IDs, comma separated)</Label>
                      <Input
                        value={variant.variations}
                        onChange={(e) => updateVariantField(variant.id, 'variations', e.target.value)}
                        placeholder="e.g., 1,2"
                      />
                    </div>
                    {/* Variant available countries (optional) */}
                    <div>
                      <Label>Available Countries (comma separated IDs)</Label>
                      <Input
                        value={variant.available_countries || ''}
                        onChange={(e) => updateVariantField(variant.id, 'available_countries', e.target.value)}
                        placeholder="e.g., 1,2,3"
                      />
                    </div>
                    {/* Variant Pricing Overrides */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Variant Prices (overrides)</Label>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => addVariantPrice(variant.id)}
                        >
                          Add Price
                        </Button>
                      </div>
                      {variant.variantPrices.map((p, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-2 mt-2">
                          <Input
                            type="number"
                            value={p.country_id}
                            onChange={(e) => updateVariantPrice(variant.id, idx, 'country_id', e.target.value)}
                            placeholder="Country ID"
                          />
                          <Input
                            type="number"
                            value={p.net_price}
                            onChange={(e) => updateVariantPrice(variant.id, idx, 'net_price', e.target.value)}
                            placeholder="Net Price"
                          />
                          <Input
                            type="number"
                            value={p.cost}
                            onChange={(e) => updateVariantPrice(variant.id, idx, 'cost', e.target.value)}
                            placeholder="Cost"
                          />
                          <Input
                            type="number"
                            value={p.vat_percentage}
                            onChange={(e) => updateVariantPrice(variant.id, idx, 'vat_percentage', e.target.value)}
                            placeholder="VAT % (optional)"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeVariantPrice(variant.id, idx)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    {/* Variant Specs Overrides */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Variant Specifications (overrides)</Label>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => addVariantSpec(variant.id)}
                        >
                          Add Spec
                        </Button>
                      </div>
                      {variant.variantSpecs.map((spec, idx) => (
                        <div key={spec.id} className="grid grid-cols-3 gap-2 mt-2">
                          <Input
                            value={spec.name}
                            onChange={(e) => updateVariantSpec(variant.id, idx, 'name', e.target.value)}
                            placeholder="Name"
                          />
                          <Input
                            value={spec.value}
                            onChange={(e) => updateVariantSpec(variant.id, idx, 'value', e.target.value)}
                            placeholder="Value"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeVariantSpec(variant.id, idx)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    {/* Variant delivery overrides */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Delivery Method ID (override)</Label>
                        <Input
                          type="number"
                          value={variant.delivery_method_id || ''}
                          onChange={(e) => updateVariantField(variant.id, 'delivery_method_id', e.target.value)}
                          placeholder="Delivery Method ID"
                        />
                      </div>
                      <div>
                        <Label>Delivery Cost (override)</Label>
                        <Input
                          type="number"
                          value={variant.delivery_cost || ''}
                          onChange={(e) => updateVariantField(variant.id, 'delivery_cost', e.target.value)}
                          placeholder="Delivery Cost"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
