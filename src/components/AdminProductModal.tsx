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
import { useAuth } from "@/contexts/AuthContext";
import { useShelves } from "@/hooks/useShelves";
import { useDeliveryMethods } from "@/hooks/useDeliveryMethods";
import { useAttributes } from "@/hooks/useAttributes";
import { Checkbox } from "@/components/ui/checkbox";
import { AttributeManager } from "./AttributeManager";

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void; // parent posts with multipart/form-data
  product?: AdminProductAPI | null;
  mode: "add" | "edit";
}

const DEBUG_PRODUCTS = true; // flip to false in production

function fileInfo(f: unknown) {
  if (typeof window !== "undefined" && f instanceof File) {
    return { name: f.name, size: f.size, type: f.type };
  }
  return f as any;
}

function safeClone<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof window !== "undefined" && v instanceof File ? fileInfo(v) : v))
  );
}

// ===== FormData helpers (Laravel-friendly) =====
function appendBool(fd: FormData, key: string, val: boolean | undefined | null) {
  fd.append(key, val ? "1" : "0"); // Laravel boolean rule friendly
}

function appendArrayOfObjects(fd: FormData, base: string, arr: Record<string, any>[]) {
  (arr || []).forEach((obj, i) => {
    Object.entries(obj || {}).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((vv, j) => fd.append(`${base}[${i}][${k}][${j}]`, String(vv)));
      } else if (typeof window !== 'undefined' && v instanceof File) {
        fd.append(`${base}[${i}][${k}]`, v);
      } else if (v !== undefined && v !== null) {
        fd.append(`${base}[${i}][${k}]`, String(v));
      }
    });
  });
}

function buildFormDataFromPayload(payload: any) {
  const fd = new FormData();

  // ---- Scalars ----
  const scalars: Array<[string, any]> = [
    ["store_id", payload.store_id],
    ["category_id", payload.category_id],
    ["name", payload.name],
    ["slug", payload.slug],
    ["sku", payload.sku],
    ["status", payload.status],
    ["seller_product_status", payload.seller_product_status], // ✅ add this
    ["country_id", payload.country_id],
    ["description", payload.description],
    ["seo_title", payload.seo_title],
    ["seo_description", payload.seo_description],
    ["barcode", payload.barcode],
    ["qr_code", payload.qr_code],
    ["serial_number", payload.serial_number],
    ["stock", payload.stock],
    ["warehouse_id", payload.warehouse_id],
    ["shelf_id", payload.shelf_id],
    ["delivery_method_id", payload.delivery_method_id],
  ];
  scalars.forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
  });

  // ---- Booleans as 1/0 ----
  appendBool(fd, "has_variants", !!payload.has_variants);
  appendBool(fd, "is_seller_product", !!payload.is_seller_product);
  appendBool(fd, "is_on_sale", !!payload.is_on_sale);
  appendBool(fd, "is_featured", !!payload.is_featured);
  appendBool(fd, "is_new_arrival", !!payload.is_new_arrival);
  appendBool(fd, "is_best_seller", !!payload.is_best_seller);
  appendBool(fd, "is_vat_exempt", !!payload.is_vat_exempt);

  // ---- Delivery cost rule ----
  if (!payload.delivery_method_id && payload.delivery_cost != null) {
    fd.append("delivery_cost", String(payload.delivery_cost));
  }

  // ---- Files / images ----
  if (typeof window !== 'undefined' && payload.cover_image instanceof File) {
    fd.append("cover_image", payload.cover_image);
  } else if (typeof payload.cover_image === "string" && payload.cover_image) {
    fd.append("cover_image_existing", payload.cover_image);
  }

  (payload.images || []).forEach((img: any, i: number) => {
    if (typeof window !== 'undefined' && img instanceof File) {
      fd.append(`images[${i}]`, img);
    } else if (typeof img === "string" && img) {
      fd.append(`images_existing[${i}]`, img);
    }
  });

  // ---- Arrays of objects ----
  appendArrayOfObjects(fd, "product_prices", payload.product_prices || []);
  appendArrayOfObjects(fd, "specifications", payload.specifications || []);

  // ---- Variants ----
  (payload.variants || []).forEach((v: any, i: number) => {
    if (typeof window !== 'undefined' && v.image instanceof File) {
      fd.append(`variants[${i}][image]`, v.image);
    } else if (typeof v.image === "string" && v.image) {
      fd.append(`variants[${i}][image_existing]`, v.image);
    }
    (v.variations || []).forEach((val: number, j: number) => {
      fd.append(`variants[${i}][variations][${j}]`, String(val));
    });

    appendArrayOfObjects(fd, `variants[${i}][product_variant_prices]`, v.product_variant_prices || []);
    appendArrayOfObjects(fd, `variants[${i}][product_variant_specifications]`, v.product_variant_specifications || []);

    if (v.delivery_method_id != null && v.delivery_method_id !== "") {
      fd.append(`variants[${i}][delivery_method_id]`, String(v.delivery_method_id));
    } else if (v.delivery_cost != null && v.delivery_cost !== "") {
      fd.append(`variants[${i}][delivery_cost]`, String(v.delivery_cost));
    }
  });

  return fd;
}

type VariantEntry = {
  id: number;
  image: File | string;
  variations: number[];
  variantPrices: { net_price: string; cost: string }[];
  variantSpecs: { id: number; name: string; value: string }[];
  delivery_method_id?: string;
  delivery_cost?: string;
};

export function AdminProductModal({ isOpen, onClose, onSave, product, mode }: AdminProductModalProps) {
  const { country, store, warehouse, user } = useAuth();
  const { shelves = [] } = useShelves();
  const { data: deliveryMethods = [], isLoading: deliveryMethodsLoading } = useDeliveryMethods();

  const [formData, setFormData] = useState<CreateProductData & { country_id?: number }>(
    {
      store_id: 1,
      category_id: 1,
      name: "",
      slug: "",
      sku: "",
      status: "active",
      has_variants: false,
      is_seller_product: false,
      seller_product_status: "not_seller",
      description: "",
      seo_title: "",
      seo_description: "",
      barcode: "",
      qr_code: "",
      serial_number: "",
      is_on_sale: false,
      is_featured: false,
      is_new_arrival: false,
      is_best_seller: false,
      is_vat_exempt: false,
      cover_image: "",
      images: [],
      stock: 0,
      warehouse_id: undefined,
      shelf_id: undefined,
      delivery_method_id: undefined,
      delivery_cost: 0,
      product_prices: [],
      specifications: [],
      variants: [],
      country_id: country?.id,
    }
  );

  const [mainImage, setMainImage] = useState<File | string>("");
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [thumbnails, setThumbnails] = useState<{ id: number; file: File | string; url: string; alt: string }[]>([]);

  const [priceEntries, setPriceEntries] = useState<{ net_price: string; cost: string }[]>([]);
  const [specifications, setSpecifications] = useState<{ id: number; name: string; value: string }[]>([]);
  const [variantEntries, setVariantEntries] = useState<VariantEntry[]>([]);

  const { toast } = useToast();
  const { data: categories = [], isLoading: categoriesLoading } = useFlatCategories();
  const { data: attributes = [], isLoading: attributesLoading } = useAttributes();

  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        store_id: product.store?.id || 1,
        category_id: product.category?.id || 1,
        name: product.name,
        slug: product.slug,
        sku: product.identifiers?.sku || "",
        status: product.status,
        has_variants: !!(product.variants?.length > 0),
        is_seller_product: !!user?.isSeller,
        seller_product_status: "not_seller",
        description: product.description || "",
        seo_title: product.meta?.seo_title || "",
        seo_description: product.meta?.seo_description || "",
        barcode: product.identifiers?.barcode || "",
        qr_code: product.identifiers?.qr_code || "",
        serial_number: product.identifiers?.serial_number || "",
        is_on_sale: !!product.flags?.on_sale,
        is_featured: !!product.flags?.is_featured,
        is_new_arrival: !!product.flags?.is_new_arrival,
        is_best_seller: false,
        is_vat_exempt: !!product.flags?.is_vat_exempt,
        cover_image: product.media?.cover_image?.image || "",
        images: product.media?.thumbnails?.map((t) => t.image) || [],
        stock: 0,
        warehouse_id: undefined,
        shelf_id: undefined,
        delivery_method_id: undefined,
        delivery_cost: 0,
        product_prices: [],
        specifications: product.specifications?.map((s) => ({ name: s.name, value: s.value })) || [],
        variants: [],
        country_id: country?.id,
      });

      const coverImageUrl = product.media?.cover_image?.image || "";
      setMainImage(coverImageUrl);
      setMainImagePreview(coverImageUrl);
      setThumbnails(
        product.media?.thumbnails?.map((t) => ({ id: t.id, file: t.image, url: t.image, alt: t.alt_text })) || []
      );
      setPriceEntries([]);
      setSpecifications(
        product.specifications?.map((s) => ({ id: s.id, name: s.name, value: s.value })) || []
      );
      setVariantEntries([]);
    } else {
      setFormData({
        store_id: store ? parseInt(store as string) || 1 : 1,
        category_id: 1,
        name: "",
        slug: "",
        sku: "",
        status: "active",
        has_variants: false,
        is_seller_product: !!user?.isSeller,
        seller_product_status: "not_seller",
        description: "",
        seo_title: "",
        seo_description: "",
        barcode: "",
        qr_code: "",
        serial_number: "",
        is_on_sale: false,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_vat_exempt: false,
        cover_image: "",
        images: [],
        stock: 0,
        warehouse_id: warehouse?.id,
        shelf_id: undefined,
        delivery_method_id: undefined,
        delivery_cost: 0,
        product_prices: [],
        specifications: [],
        variants: [],
        country_id: country?.id,
      });
      setMainImage("");
      setMainImagePreview("");
      setThumbnails([]);
      setPriceEntries([]);
      setSpecifications([
        { id: Date.now(), name: "weight", value: "" },
        { id: Date.now() + 1, name: "height", value: "" },
        { id: Date.now() + 2, name: "width", value: "" },
        { id: Date.now() + 3, name: "length", value: "" },
      ]);
      setVariantEntries([]);
    }
  }, [product, mode, isOpen, store, warehouse, user?.isSeller, country?.id]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name, slug: generateSlug(name) }));
  };

  const updateField = <K extends keyof (CreateProductData & { country_id?: number })>(
    field: K,
    value: (CreateProductData & { country_id?: number })[K]
  ) => setFormData((prev) => ({ ...prev, [field]: value }));

  // Image handlers
  const handleMainImageUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setMainImage(file);
      setMainImagePreview(url);
      updateField("cover_image", file as any);
    }
  };

  const handleThumbnailUpload = (files: File[]) => {
    const newThumbnails = files.map((file, index) => ({
      id: Date.now() + index,
      file,
      url: URL.createObjectURL(file),
      alt: file.name,
    }));
    setThumbnails((prev) => [...prev, ...newThumbnails]);
    updateField("images", [...(formData.images || []), ...newThumbnails.map((t) => t.file)] as any);
  };

  const removeThumbnail = (id: number) => {
    const thumbnailToRemove = thumbnails.find(t => t.id === id);
    if (thumbnailToRemove) {
      setThumbnails((prev) => prev.filter((t) => t.id !== id));
      const updatedImages = (formData.images || []).filter((img) => img !== thumbnailToRemove.file);
      updateField("images", updatedImages as any);
    }
  };

  // Pricing handlers
  const addPriceEntry = () => setPriceEntries((p) => [...p, { net_price: "", cost: "" }]);
  const updatePriceEntry = (
    index: number,
    field: keyof { net_price: string; cost: string },
    value: string
  ) => {
    setPriceEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  const removePriceEntry = (index: number) =>
    setPriceEntries((prev) => prev.filter((_, idx) => idx !== index));

  // Spec handlers
  const addSpecification = () =>
    setSpecifications((prev) => [...prev, { id: Date.now(), name: "", value: "" }]);
  const updateSpecification = (index: number, field: "name" | "value", value: string) =>
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  const removeSpecification = (index: number) =>
    setSpecifications((prev) => (index < 4 ? prev : prev.filter((_, idx) => idx !== index)));

  // Variants
  const addVariant = () =>
    setVariantEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        image: "",
        variations: [],
        variantPrices: [],
        variantSpecs: [],
        delivery_method_id: "",
        delivery_cost: "",
      },
    ]);
  const removeVariant = (variantId: number) =>
    setVariantEntries((prev) => prev.filter((v) => v.id !== variantId));

  const updateVariantField = (
    variantId: number,
    field: "image" | "variations" | "delivery_method_id" | "delivery_cost",
    value: any
  ) =>
    setVariantEntries((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );

  const updateVariantAttributeValues = (variantId: number, attributeValueId: number, checked: boolean) => {
    setVariantEntries((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          const updatedVariations = checked
            ? [...v.variations, attributeValueId]
            : v.variations.filter(id => id !== attributeValueId);
          return { ...v, variations: updatedVariations };
        }
        return v;
      })
    );
  };

  const addVariantPrice = (variantId: number) =>
    setVariantEntries((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, variantPrices: [...v.variantPrices, { net_price: "", cost: "" }] } : v
      )
    );

  const updateVariantPrice = (
    variantId: number,
    index: number,
    field: keyof { net_price: string; cost: string },
    value: string
  ) =>
    setVariantEntries((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, variantPrices: v.variantPrices.map((p, idx) => (idx === index ? { ...p, [field]: value } : p)) }
          : v
      )
    );

  const removeVariantPrice = (variantId: number, index: number) =>
    setVariantEntries((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, variantPrices: v.variantPrices.filter((_, idx) => idx !== index) } : v
      )
    );

  const addVariantSpec = (variantId: number) =>
    setVariantEntries((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, variantSpecs: [...v.variantSpecs, { id: Date.now(), name: "", value: "" }] } : v
      )
    );

  const updateVariantSpec = (variantId: number, index: number, field: "name" | "value", value: string) =>
    setVariantEntries((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, variantSpecs: v.variantSpecs.map((s, idx) => (idx === index ? { ...s, [field]: value } : s)) }
          : v
      )
    );

  const removeVariantSpec = (variantId: number, index: number) =>
    setVariantEntries((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, variantSpecs: v.variantSpecs.filter((_, idx) => idx !== index) } : v
      )
    );

  // Exclusive flags
  const handleExclusiveFlagChange = (
    flag: "is_on_sale" | "is_featured" | "is_new_arrival",
    checked: boolean
  ) => {
    if (checked) {
      updateField("is_on_sale", (flag === "is_on_sale") as any);
      updateField("is_featured", (flag === "is_featured") as any);
      updateField("is_new_arrival", (flag === "is_new_arrival") as any);
    } else {
      updateField(flag, false as any);
    }
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    // Validate delivery method for non-variant products
    if (!formData.has_variants && !formData.delivery_method_id) {
      toast({ title: "Error", description: "Delivery method is required", variant: "destructive" });
      return;
    }

    // Validate specifications
    const validSpecs = specifications.filter((s) => s.name.trim() !== "" && s.value.trim() !== "");
    if (validSpecs.length === 0) {
      toast({ title: "Error", description: "At least one specification is required", variant: "destructive" });
      return;
    }

    const prices = priceEntries
      .map((p) => ({ net_price: parseFloat(p.net_price), cost: parseFloat(p.cost) }))
      .filter((p) => !isNaN(p.net_price) && !isNaN(p.cost));

    const specs = specifications
      .map((s) => ({ name: s.name, value: s.value }))
      .filter((s) => s.name.trim() !== "" && s.value.trim() !== "");

    let variantsPayload: any[] = [];
    if (formData.has_variants && variantEntries.length > 0) {
      variantsPayload = variantEntries.map((variant) => {
        const variations = variant.variations;
        const variantPricesParsed = variant.variantPrices
          .map((p) => ({ net_price: parseFloat(p.net_price), cost: parseFloat(p.cost) }))
          .filter((p) => !isNaN(p.net_price) && !isNaN(p.cost));

        const variantSpecsParsed = variant.variantSpecs
          .map((s) => ({ name: s.name, value: s.value }))
          .filter((s) => s.name.trim() !== "" && s.value.trim() !== "");

        const delivery_method_id = variant.delivery_method_id ? parseInt(variant.delivery_method_id, 10) : undefined;
        const delivery_cost = delivery_method_id ? undefined : (variant.delivery_cost ? parseFloat(variant.delivery_cost) : undefined);

        return {
          image: variant.image,
          variations,
          product_variant_prices: variantPricesParsed.length > 0 ? (variantPricesParsed as any) : [],
          delivery_method_id,
          delivery_cost,
          product_variant_specifications: variantSpecsParsed.length > 0 ? variantSpecsParsed : [],
        };
      });
    }

    const sanitized: CreateProductData & { country_id?: number } = {
      ...(formData as CreateProductData),
      has_variants: formData.has_variants === true,
      is_seller_product: formData.is_seller_product === true,
      is_on_sale: formData.is_on_sale === true,
      is_featured: formData.is_featured === true,
      is_new_arrival: formData.is_new_arrival === true,
      is_best_seller: formData.is_best_seller === true,
      is_vat_exempt: formData.is_vat_exempt === true,
      country_id: (formData as any).country_id,
      product_prices: prices as any,
      specifications: specs,
      cover_image: (mainImage || formData.cover_image) as any,
      images: thumbnails.map((t) => t.file) as any,
      variants: variantsPayload as any,
    };

    if (DEBUG_PRODUCTS) {
      const safe = safeClone(sanitized);
      console.groupCollapsed(`%c[AdminProductModal] ${mode === 'add' ? 'Create' : 'Update'} payload (pre-FormData)`, 'color:#0ea5e9;font-weight:bold;');
      console.log('payload (raw):', sanitized);
      console.log('payload (safe):', safe);
      if ((safe as any).product_prices?.length) console.table((safe as any).product_prices);
      if (Array.isArray((safe as any).images)) {
        console.table(
          (safe as any).images.map((img: any, i: number) =>
            typeof img === 'string' ? { idx: i, type: 'url/string', value: img } : { idx: i, ...fileInfo(img) }
          )
        );
      }
      if (Array.isArray((safe as any).variants) && (safe as any).variants.length) {
        console.table(
          (safe as any).variants.map((v: any, i: number) => ({
            idx: i,
            variations: (v.variations || []).join(', '),
            prices: v.product_variant_prices?.length ?? 0,
            specs: v.product_variant_specifications?.length ?? 0,
            delivery_method_id: v.delivery_method_id ?? '',
            delivery_cost: v.delivery_cost ?? '',
          }))
        );
      }
      if (!(safe as any).country_id) console.warn('⚠ No country_id set');
      if (!(safe as any).sku) console.warn('⚠ No SKU set');
      if (!(safe as any).name) console.warn('⚠ No name set');
      console.groupEnd();
    }

    const fd = buildFormDataFromPayload(sanitized);

    if (DEBUG_PRODUCTS) {
      console.groupCollapsed('%c[AdminProductModal] FormData entries', 'color:#16a34a;font-weight:bold;');
      for (const [k, v] of fd.entries()) {
        // @ts-ignore
        const val = (typeof window !== 'undefined' && v instanceof File) ? { name: v.name, size: v.size, type: v.type } : v;
        console.log(k, val);
      }
      console.groupEnd();
    }

    onSave(fd);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
      </DialogHeader>
      <DialogContent className="max-h-[80vh] overflow-y-auto p-6 w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Name *</Label>
              <Input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Enter product name" required />
            </div>
            <div>
              <Label>SKU *</Label>
              <Input type="text" value={formData.sku} onChange={(e) => updateField('sku', e.target.value)} placeholder="Enter SKU" required />
            </div>
            <div>
              <Label>URL Slug</Label>
              <Input type="text" value={formData.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="product-url-slug" />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Product description" rows={3} />
            </div>
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateField('status', value as any)}>
                <SelectTrigger>
                  <SelectValue>{formData.status}</SelectValue>
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
              <Select value={String(formData.category_id)} onValueChange={(v) => updateField('category_id', parseInt(v, 10) as any)}>
                <SelectTrigger>
                  <SelectValue>
                    {categories.find((c) => c.id === formData.category_id)?.name || 'Select category'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {!categoriesLoading && categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Images */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Product Images</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Main Product Image</Label>
                <FileUpload onFileSelect={handleMainImageUpload} accept="image/*" />
                {mainImagePreview && (
                  <div className="mt-2">
                    <img src={mainImagePreview} alt="Main product" className="h-20 w-20 object-cover rounded" />
                  </div>
                )}
              </div>
              <div>
                <Label>Additional Images</Label>
                <FileUpload onFileSelect={handleThumbnailUpload} accept="image/*" maxFiles={10} />
                {thumbnails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {thumbnails.map((thumb) => (
                      <div key={thumb.id} className="relative">
                        <img src={thumb.url} alt={thumb.alt} className="h-16 w-16 object-cover rounded" />
                        <Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0" onClick={() => removeThumbnail(thumb.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Settings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Product Settings</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch checked={!!formData.has_variants} onCheckedChange={(checked) => updateField('has_variants', checked as any)} />
                <Label>Has Variants</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={!!formData.is_on_sale} onCheckedChange={(checked) => handleExclusiveFlagChange('is_on_sale', checked)} disabled={(formData.is_featured || formData.is_new_arrival) && !formData.is_on_sale} />
                <Label>On Sale</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={!!formData.is_featured} onCheckedChange={(checked) => handleExclusiveFlagChange('is_featured', checked)} disabled={(formData.is_on_sale || formData.is_new_arrival) && !formData.is_featured} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={!!formData.is_new_arrival} onCheckedChange={(checked) => handleExclusiveFlagChange('is_new_arrival', checked)} disabled={(formData.is_on_sale || formData.is_featured) && !formData.is_new_arrival} />
                <Label>New Arrival</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={!!formData.is_vat_exempt} onCheckedChange={(checked) => updateField('is_vat_exempt', checked as any)} />
                <Label>VAT Exempt</Label>
              </div>
            </div>
          </div>

          {/* Identifiers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Barcode</Label>
              <Input type="text" value={formData.barcode} onChange={(e) => updateField('barcode', e.target.value)} placeholder="Barcode" />
            </div>
            <div>
              <Label>QR Code</Label>
              <Input type="text" value={formData.qr_code} onChange={(e) => updateField('qr_code', e.target.value)} placeholder="QR Code" />
            </div>
            <div>
              <Label>Serial Number</Label>
              <Input type="text" value={formData.serial_number} onChange={(e) => updateField('serial_number', e.target.value)} placeholder="Serial Number" />
            </div>
          </div>

          {/* Inventory and Delivery */}
          {!formData.has_variants && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock</Label>
                <Input type="number" value={formData.stock} onChange={(e) => updateField('stock', parseInt(e.target.value || '0', 10) as any)} placeholder="Stock quantity" />
              </div>
              <div>
                <Label>Shelf</Label>
                <Select value={formData.shelf_id ? String(formData.shelf_id) : ''} onValueChange={(value) => updateField('shelf_id', value ? (parseInt(value, 10) as any) : (undefined as any))}>
                  <SelectTrigger>
                    <SelectValue>{shelves.find((s) => s.id === formData.shelf_id)?.name || 'Select Shelf'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {shelves.map((shelf) => (
                      <SelectItem key={shelf.id} value={String(shelf.id)}>
                        {shelf.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Delivery Method *</Label>
                <Select value={formData.delivery_method_id?.toString() || ''} onValueChange={(value) => updateField('delivery_method_id', value ? (parseInt(value) as any) : (undefined as any))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryMethodsLoading ? (
                      <SelectItem value="" disabled>Loading delivery methods...</SelectItem>
                    ) : deliveryMethods.length > 0 ? (
                      deliveryMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          {method.name} - {method.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No delivery methods available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Delivery Cost</Label>
                <Input type="number" step="0.01" min="0" value={formData.delivery_cost || ''} onChange={(e) => updateField('delivery_cost', e.target.value ? (parseFloat(e.target.value) as any) : (0 as any))} placeholder="Enter delivery cost" />
                {formData.delivery_method_id && (
                  <div className="text-xs text-muted-foreground mt-1">Delivery cost will be ignored when a delivery method is selected.</div>
                )}
              </div>
            </div>
          )}

          {/* SEO Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">SEO & Meta Information</Label>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>SEO Title</Label>
                <Input type="text" value={formData.seo_title} onChange={(e) => updateField('seo_title', e.target.value)} placeholder="SEO Title for search engines" />
              </div>
              <div>
                <Label>SEO Description</Label>
                <Textarea value={formData.seo_description} onChange={(e) => updateField('seo_description', e.target.value)} placeholder="SEO description for search engines" rows={2} />
              </div>
            </div>
          </div>

          {/* Product Prices */}
          <div className="space-y-2">
            <Label>Product Prices</Label>
            <Button type="button" variant="secondary" size="sm" onClick={addPriceEntry}>Add Price</Button>
            {priceEntries.map((entry, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-center">
                <Input type="number" value={entry.net_price} onChange={(e) => updatePriceEntry(index, 'net_price', e.target.value)} placeholder="Net Price" />
                <Input type="number" value={entry.cost} onChange={(e) => updatePriceEntry(index, 'cost', e.target.value)} placeholder="Cost" />
                <Button type="button" variant="destructive" size="sm" onClick={() => removePriceEntry(index)}>Remove</Button>
              </div>
            ))}
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <Label>Specifications *</Label>
            <Button type="button" variant="secondary" size="sm" onClick={addSpecification}>Add Specification</Button>
            {specifications.map((spec, index) => (
              <div key={spec.id} className="grid grid-cols-3 gap-2 items-center">
                <Input type="text" value={spec.name} onChange={(e) => updateSpecification(index, 'name', e.target.value)} placeholder="Name" />
                <Input type="text" value={spec.value} onChange={(e) => updateSpecification(index, 'value', e.target.value)} placeholder="Value" />
                <Button type="button" variant="destructive" size="sm" onClick={() => removeSpecification(index)} disabled={index < 4}>Remove</Button>
              </div>
            ))}
          </div>

          {/* Variants */}
          {formData.has_variants && (
            <div className="space-y-4">
              <Label>Variants</Label>
              <Button type="button" variant="secondary" size="sm" onClick={addVariant}>Add Variant</Button>
              {variantEntries.map((variant) => (
                <div key={variant.id} className="border p-4 rounded space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Variant</Label>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeVariant(variant.id)}>Remove</Button>
                  </div>

                  {/* Variant image */}
                  <div>
                    <Label>Variant Image</Label>
                    <FileUpload
                      onFileSelect={(files) => {
                        if (files.length > 0) {
                          const file = files[0];
                          const url = URL.createObjectURL(file);
                          updateVariantField(variant.id, 'image', file);
                          // @ts-ignore preview url for UI only
                          updateVariantField(variant.id, 'imagePreviewUrl', url);
                        }
                      }}
                      accept="image/*"
                    />
                    {(() => {
                      const v = variant as any;
                      const previewUrl = v.imagePreviewUrl || (typeof v.image === 'string' ? v.image : '');
                      return previewUrl ? (
                        <div className="mt-2">
                          <img src={previewUrl} alt="Variant" className="w-32 h-32 object-cover rounded" />
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Variant variations */}
                  <div>
                    <Label>Attribute Values</Label>
                    <div className="space-y-3 mt-2">
                      {attributesLoading ? (
                        <div className="text-muted-foreground">Loading attributes...</div>
                      ) : attributes.length === 0 ? (
                        <div className="text-muted-foreground">No attributes available</div>
                      ) : (
                        attributes.map((attribute) => (
                          <div key={attribute.id} className="space-y-2">
                            <Label className="text-sm font-medium">{attribute.name} ({attribute.type})</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {attribute.values.map((value: any) => (
                                <div key={value.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`variant-${variant.id}-attr-${value.id}`}
                                    checked={variant.variations.includes(value.id)}
                                    onCheckedChange={(checked) => updateVariantAttributeValues(variant.id, value.id, checked as boolean)}
                                  />
                                  <label htmlFor={`variant-${variant.id}-attr-${value.id}`} className="text-sm cursor-pointer flex items-center space-x-2">
                                    {value.hex_color && (
                                      <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: value.hex_color }} />
                                    )}
                                    <span>{value.value}</span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {variant.variations.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">Selected IDs: {variant.variations.join(', ')}</div>
                    )}
                  </div>

                  {/* Variant Pricing Overrides */}
                  <div className="space-y-2">
                    <Label>Variant Prices (overrides)</Label>
                    <Button type="button" variant="secondary" size="sm" onClick={() => addVariantPrice(variant.id)}>Add Price</Button>
                    {variant.variantPrices.map((p, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                        <Input type="number" value={p.net_price} onChange={(e) => updateVariantPrice(variant.id, idx, 'net_price', e.target.value)} placeholder="Net Price" />
                        <Input type="number" value={p.cost} onChange={(e) => updateVariantPrice(variant.id, idx, 'cost', e.target.value)} placeholder="Cost" />
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeVariantPrice(variant.id, idx)}>Remove</Button>
                      </div>
                    ))}
                  </div>

                  {/* Variant Specs Overrides */}
                  <div className="space-y-2">
                    <Label>Variant Specifications (overrides)</Label>
                    <Button type="button" variant="secondary" size="sm" onClick={() => addVariantSpec(variant.id)}>Add Spec</Button>
                    {variant.variantSpecs.map((spec, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                        <Input type="text" value={spec.name} onChange={(e) => updateVariantSpec(variant.id, idx, 'name', e.target.value)} placeholder="Name" />
                        <Input type="text" value={spec.value} onChange={(e) => updateVariantSpec(variant.id, idx, 'value', e.target.value)} placeholder="Value" />
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeVariantSpec(variant.id, idx)}>Remove</Button>
                      </div>
                    ))}
                  </div>

                  {/* Variant delivery overrides */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Delivery Method ID (override)</Label>
                      <Input type="number" value={variant.delivery_method_id || ''} onChange={(e) => updateVariantField(variant.id, 'delivery_method_id', e.target.value)} placeholder="Delivery Method ID" />
                    </div>
                    <div>
                      <Label>Delivery Cost (override)</Label>
                      <Input type="number" value={variant.delivery_cost || ''} onChange={(e) => updateVariantField(variant.id, 'delivery_cost', e.target.value)} placeholder="Delivery Cost" />
                      {variant.delivery_method_id && (
                        <div className="text-xs text-muted-foreground mt-1">Will be ignored when delivery method is set.</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Attribute Management */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Quick Attribute Management</Label>
            <AttributeManager />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">{mode === 'add' ? 'Create Product' : 'Update Product'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AdminProductModal;
