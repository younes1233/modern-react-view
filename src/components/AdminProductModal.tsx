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
import { cn } from "@/lib/utils";

import { useAttributes } from "@/hooks/useAttributes";
import { Checkbox } from "@/components/ui/checkbox";
import { AttributeManager } from "./AttributeManager";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { ProductVariantForm, VariantEntry } from "./ProductVariantForm";

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>; // parent posts with multipart/form-data
  product?: AdminProductAPI | null;
  mode: "add" | "edit";
  isLoading?: boolean; // Add loading state prop
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
    ["description", payload.description],
    ["seo_title", payload.seo_title],
    ["seo_description", payload.seo_description],
    ["barcode", payload.barcode],
    ["qr_code", payload.qr_code],
    ["serial_number", payload.serial_number],
    ["stock", payload.stock],
    ["delivery_type", payload.delivery_type],
  ];

  // Only include shelf_id in create mode
  if (payload.mode === 'create') {
    scalars.push(["shelf_id", payload.shelf_id]);
  }
  scalars.forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      fd.append(k, String(v));
    } else if (k === 'category_id') {
      // Send empty string for nullable category_id when undefined
      fd.append(k, '');
    }
  });

  // ---- Booleans as 1/0 ----
  appendBool(fd, "has_variants", !!payload.has_variants);
  appendBool(fd, "is_seller_product", !!payload.is_seller_product);
  appendBool(fd, "is_on_sale", !!payload.is_on_sale);
  appendBool(fd, "is_featured", !!payload.is_featured);
  appendBool(fd, "is_new_arrival", !!payload.is_new_arrival);
  appendBool(fd, "is_best_seller", !!payload.is_best_seller);
  appendBool(fd, "is_vat_exempt", !!payload.is_vat_exempt);

  // ---- Delivery cost ----
  if (payload.delivery_type === "company") {
    fd.append("delivery_cost", ""); // Send empty string for company delivery (Laravel treats as null)
  } else if (payload.delivery_cost != null && payload.delivery_cost !== "") {
    fd.append("delivery_cost", String(payload.delivery_cost));
  }

  // ---- Files / images ----
  if (typeof window !== 'undefined' && payload.cover_image instanceof File) {
    fd.append("cover_image", payload.cover_image);
  } else if (typeof payload.cover_image === "string" && payload.cover_image) {
    fd.append("cover_image_existing", payload.cover_image);
  }

  // Handle additional images with enhanced management
  const newImages: File[] = [];
  const existingImages: string[] = [];

  (payload.images || []).forEach((img: any) => {
    if (typeof window !== 'undefined' && img instanceof File) {
      newImages.push(img);
    } else if (typeof img === "string" && img) {
      existingImages.push(img);
    }
  });

  // Append new images
  newImages.forEach((img, i) => {
    fd.append(`images[${i}]`, img);
  });

  // Append existing images to preserve
  existingImages.forEach((url, i) => {
    fd.append(`images_existing[${i}]`, url);
  });

  // Append images to delete (if any)
  if (payload.images_to_delete && payload.images_to_delete.length > 0) {
    console.log('🗑️ Images to delete:', payload.images_to_delete);
    payload.images_to_delete.forEach((imageId: number, i: number) => {
      console.log(`🗑️ Adding images_to_delete[${i}] = ${imageId}`);
      fd.append(`images_to_delete[${i}]`, String(imageId));
    });
  }

  // ---- Arrays of objects ----
  appendArrayOfObjects(fd, "product_prices", payload.product_prices || []);
  appendArrayOfObjects(fd, "specifications", payload.specifications || []);

  // ---- Variants ----
  (payload.variants || []).forEach((v: any, i: number) => {
    // Include variant ID for updates (crucial for backend to know this is an existing variant)
    if (v.id != null) {
      fd.append(`variants[${i}][id]`, String(v.id));
    }

    // Handle variant images with enhanced management
    if (v.delete_image === true) {
      fd.append(`variants[${i}][delete_image]`, "1");  // Use "1" for boolean true, Laravel expects 1/0
    } else {
      fd.append(`variants[${i}][delete_image]`, "0");  // Always send delete_image field, use "0" for false
    }

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

    if (v.delivery_type != null && v.delivery_type !== "") {
      fd.append(`variants[${i}][delivery_type]`, String(v.delivery_type));
    }
    // Only send delivery_cost for meemhome delivery or when explicitly set
    const variantDeliveryType = v.delivery_type || payload.delivery_type;
    if (variantDeliveryType === "company") {
      fd.append(`variants[${i}][delivery_cost]`, ""); // Send empty string for company delivery
    } else if (v.delivery_cost != null && v.delivery_cost !== "") {
      fd.append(`variants[${i}][delivery_cost]`, String(v.delivery_cost));
    }
    if (v.stock != null && v.stock !== "") {
      fd.append(`variants[${i}][stock]`, String(v.stock));
    }
    // Only send shelf_id in create mode
    if (payload.mode === 'create' && v.shelf_id != null && v.shelf_id !== "") {
      fd.append(`variants[${i}][shelf_id]`, String(v.shelf_id));
    }
  });

  return fd;
}

// VariantEntry type is now imported from ProductVariantForm

const DELIVERY_TYPES = [
  { value: 'meemhome', label: 'Meemhome Delivery' },
  { value: 'company', label: 'Delivery Company' }
];

export function AdminProductModal({ isOpen, onClose, onSave, product, mode, isLoading = false }: AdminProductModalProps) {
  const { country, store, warehouse, user } = useAuth();
  const { shelves = [] } = useShelves();

  const [formData, setFormData] = useState<CreateProductData>(
    {
      store_id: 1,
      category_id: undefined,
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
        shelf_id: undefined,
          delivery_type: "meemhome",
          delivery_cost: 0,
      net_price: '',
      cost_price: '',
      product_prices: [],
      specifications: [],
      variants: [],
    }
  );

  const [mainImage, setMainImage] = useState<File | string>("");
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [thumbnails, setThumbnails] = useState<{ id: number; file: File | string; url: string; alt: string }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]); // Track additional image IDs to delete

  const [priceEntries, setPriceEntries] = useState<{ net_price: string; cost: string }[]>([]);
  const [specifications, setSpecifications] = useState<{ id: number; name: string; value: string }[]>([]);
  const [variantEntries, setVariantEntries] = useState<VariantEntry[]>([]);

  // Track if SEO fields have been manually edited
  const [seoTitleEdited, setSeoTitleEdited] = useState(false);
  const [seoDescriptionEdited, setSeoDescriptionEdited] = useState(false);

  // Double click outside protection
  const [lastClickTime, setLastClickTime] = useState(0);
  const [clickConfirmNeeded, setClickConfirmNeeded] = useState(false);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Helper function to render validation errors for a field
  const renderFieldError = (fieldName: string) => {
    const errors = validationErrors[fieldName];
    if (!errors || errors.length === 0) return null;

    return (
      <div className="validation-error text-red-600 text-sm mt-1" data-field={fieldName}>
        {errors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </div>
    );
  };

  // Helper function to scroll to first error field within the modal
  const scrollToFirstError = () => {
    console.log('Current validation errors:', validationErrors);
    const errorKeys = Object.keys(validationErrors);
    console.log('Error keys:', errorKeys);
    const firstErrorField = errorKeys[0];
    console.log('Scrolling to error field:', firstErrorField);

    if (firstErrorField) {
      setTimeout(() => {
        // Check if it's a variant-specific error
        if (firstErrorField.startsWith('variant_') && firstErrorField.includes('_attributes')) {
          // Extract variant ID from error key like "variant_123_attributes"
          const variantId = firstErrorField.split('_')[1];
          console.log('Scrolling to variant attributes for variant ID:', variantId);

          // Find the specific variant's attribute section
          const variantAttributeSection = document.querySelector(`[data-variant-id="${variantId}"] .variant-attributes`) as HTMLElement;
          if (variantAttributeSection) {
            console.log('Found variant attribute section:', variantAttributeSection);
            variantAttributeSection.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });

            // Add a temporary highlight to draw attention
            variantAttributeSection.classList.add('ring-2', 'ring-red-500', 'ring-opacity-50');
            setTimeout(() => {
              variantAttributeSection.classList.remove('ring-2', 'ring-red-500', 'ring-opacity-50');
            }, 3000);

            console.log('Scrolled to variant attribute section');
            return;
          }
        }

        // Default behavior for other errors
        const validationError = document.querySelector('.validation-error') as HTMLElement;
        if (validationError) {
          console.log('Found validation error element:', validationError);

          validationError.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });

          console.log('Scrolled to validation error');
        }
      }, 200);
    }
  };

  const { toast } = useToast();
  const { data: categories = [], isLoading: categoriesLoading } = useFlatCategories();
  const { data: attributes = [], isLoading: attributesLoading } = useAttributes();

  // Scroll to first error when validation errors change
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      scrollToFirstError();
    }
  }, [validationErrors]);

  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        store_id: product.store?.id || 1,
        category_id: product.category?.id || undefined,
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
        cover_image: (product.media?.cover_image as any)?.urls?.original || "",
        images: product.media?.additional_images?.map((t: any) => (t as any)?.urls?.original).filter(Boolean) || [],
        stock: (() => {
          // Debug logging for stock population
          console.log('Product available_countries:', product.available_countries);
          console.log('Product full data for debugging:', {
            hasAvailableCountries: !!product.available_countries?.length,
            firstCountryInventory: product.available_countries?.[0]?.inventory,
            hasVariants: product.variants?.length > 0,
            productKeys: Object.keys(product)
          });

          // If available_countries exists, use it
          if (product.available_countries?.length > 0) {
            if (!product.variants?.length) {
              // Simple product
              return product.available_countries[0]?.inventory?.[0]?.stock || "";
            } else {
              // Product with variants
              const firstVariant = product.available_countries[0]?.inventory?.[0];
              return firstVariant?.inventories?.[0]?.stock || "";
            }
          }

          // Fallback: if available_countries is missing, return empty for now
          // User will need to enter stock manually
          return "";
        })(),
        shelf_id: (() => {
          if (product.available_countries?.length > 0) {
            if (!product.variants?.length) {
              return product.available_countries[0]?.inventory?.[0]?.shelf?.id || undefined;
            }
            const firstVariant = product.available_countries[0]?.inventory?.[0];
            return firstVariant?.inventories?.[0]?.shelf?.id || undefined;
          }
          return undefined; // No fallback for shelf
        })(),
        delivery_type: product.delivery?.delivery_type || "meemhome",
        delivery_cost: product.delivery?.delivery_cost || 0,
        product_prices: [],
        cost_price: product.pricing?.[0]?.cost || "",
        net_price: product.pricing?.[0]?.net_price || "",
        variants: product.variants?.map(variant => ({
          id: variant.id,
          sku: variant.identifiers?.sku || "",
          barcode: variant.identifiers?.barcode || "",
          qr_code: variant.identifiers?.qr_code || "",
          serial_number: variant.identifiers?.serial_number || "",
          image: variant.image || "",
          imagePreviewUrl: variant.image || "",
          variations: variant.variations?.map((variation: any) => variation.id) || [],
          product_variant_prices: variant.prices?.map((price: any) => ({
            id: price.id,
            net_price: parseFloat(price.net_price),
            cost: parseFloat(price.cost),
            vat_percentage: price.vat_percentage
          })) || [],
          stock: variant.stock?.[0]?.stock || 0,
          delivery_type: "meemhome", // Default or get from variant if available
          delivery_cost: "0" // Default or get from variant if available
        })) || [],
      });

      const coverImageUrl = product.media?.cover_image?.urls?.original || "";
      setMainImage(coverImageUrl);
      setMainImagePreview(coverImageUrl);
      setThumbnails(
        product.media?.additional_images?.map((t: any) => ({ id: t.id, file: t.urls?.original || "", url: t.urls?.original || "", alt: t.alt_text })) || []
      );
      setPriceEntries([]);
      const existingSpecs = product.specifications?.map((s: any) => ({ id: s.id, name: s.name, value: s.value })) || [];
      const requiredSpecs = ["weight", "height", "width", "length"];

      const allSpecs = requiredSpecs.map((reqSpec, index) => {
        const existing = existingSpecs.find(spec => spec.name.toLowerCase() === reqSpec.toLowerCase());
        return existing || { id: Date.now() + index, name: reqSpec, value: "" };
      });

      const additionalSpecs = existingSpecs.filter(spec =>
        !requiredSpecs.some(req => req.toLowerCase() === spec.name.toLowerCase())
      );

      setSpecifications([...allSpecs, ...additionalSpecs]);

      // Populate variant entries for UI form fields
      console.log('🔍 Original product variants data:', product.variants);
      const variantEntries = product.variants?.map(variant => {
        console.log('🔍 Processing variant:', {
          id: variant.id,
          image: variant.image,
          stockArray: variant.stock,
          pricesArray: variant.prices,
          deliveryData: variant.delivery
        });

        // Extract stock - variant.stock is an array of inventory records
        const stockValue = variant.stock && Array.isArray(variant.stock) && variant.stock.length > 0
          ? variant.stock[0].stock
          : 0;

        // Extract pricing - variant.prices is an array of price records
        const variantPrices = variant.prices && Array.isArray(variant.prices) && variant.prices.length > 0
          ? {
              net_price: variant.prices[0].net_price.toString(),
              cost: variant.prices[0].cost.toString()
            }
          : { net_price: "", cost: "" };

        // Extract delivery info from delivery object
        const deliveryType = variant.delivery?.delivery_type || "inherit";
        const deliveryCost = variant.delivery?.delivery_cost || "";

        console.log('🔍 Extracted data for variant', variant.id, {
          stock: stockValue,
          prices: variantPrices,
          delivery: { type: deliveryType, cost: deliveryCost }
        });

        // Handle variant image - safely access URL
        const variantImageUrl = typeof variant.image === 'string'
          ? variant.image
          : (variant.image as any)?.urls?.thumbnails?.mobile || (variant.image as any)?.urls?.original || "";

        const variantEntry = {
          id: variant.id,
          image: variantImageUrl,
          delete_image: false, // Initialize deletion flag for existing variants
          variations: variant.variations?.map(variation => {
            // Use the attribute value ID from the API response
            // Fallback: if id is missing, log the issue and return 0 temporarily
            if (!variation.id) {
              console.warn('⚠️ Missing variation.id for:', variation);
              return 0; // Temporary fallback
            }
            return variation.id;
          }) || [],
          variantPrices,
          variantSpecs: [], // May need to map variant specifications if available
          delivery_type: deliveryType,
          delivery_cost: String(deliveryCost),
          stock: stockValue,
          shelf_id: undefined // Variants don't inherit shelf by default
        };

        // Set imagePreviewUrl for existing images so they display properly
        if (variantImageUrl) {
          (variantEntry as any).imagePreviewUrl = variantImageUrl;
        }

        return variantEntry;
      }) || [];

      console.log('🔍 Setting variant entries for edit mode:', variantEntries);
      setVariantEntries(variantEntries);
      setImagesToDelete([]); // Reset image deletion tracking for edit mode
    } else {
      setFormData({
        store_id: store ? parseInt(store as string) || 1 : 1,
        category_id: undefined,
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
        shelf_id: undefined,
        delivery_type: "meemhome",
        delivery_cost: 0,
        net_price: '',
        cost_price: '',
        product_prices: [],
        specifications: [],
        variants: [],
      });
      setMainImage(null);
      setMainImagePreview("");
      setThumbnails([]);
      setPriceEntries([]);
      setSpecifications([
        { id: Date.now(), name: "weight", value: "29" },
        { id: Date.now() + 1, name: "height", value: "66" },
        { id: Date.now() + 2, name: "width", value: "66" },
        { id: Date.now() + 3, name: "length", value: "66" },
      ]);
      setVariantEntries([]);
      setImagesToDelete([]); // Reset image deletion tracking
      setSeoTitleEdited(false);
      setSeoDescriptionEdited(false);
      setClickConfirmNeeded(false);
      setLastClickTime(0);
    }
  }, [product, mode, isOpen, store, warehouse, user?.isSeller, country?.id]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
      // Auto-populate SEO title only if user hasn't manually edited it
      seo_title: seoTitleEdited ? prev.seo_title : name
    }));

    // Clear validation errors for name and slug when user types
    if (validationErrors.name) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
    if (validationErrors.slug) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.slug;
        return newErrors;
      });
    }
  };

  const handleDescriptionChange = (description: string) => {
    setFormData((prev) => ({
      ...prev,
      description,
      // Auto-populate SEO description only if user hasn't manually edited it
      seo_description: seoDescriptionEdited ? prev.seo_description :
        description.length > 255 ? description.substring(0, 252) + '...' : description
    }));
  };

  const updateField = <K extends keyof CreateProductData>(
    field: K,
    value: CreateProductData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field as string]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

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
      console.log('🗑️ Removing thumbnail:', { id, thumbnailToRemove });

      // Remove from thumbnails display
      setThumbnails((prev) => prev.filter((t) => t.id !== id));

      // If it's an existing image (string URL), track it for deletion
      if (typeof thumbnailToRemove.file === 'string' && mode === 'edit') {
        console.log('🔍 Looking for existing image in additional_images:', product?.media?.additional_images);

        // Find the actual database ID from the product data - ONLY for additional images, not variant images
        const existingImage = product?.media?.additional_images?.find(
          img => img.urls?.original === thumbnailToRemove.file
        );

        console.log('🔍 Found existing image:', existingImage);

        if (existingImage?.id) {
          console.log('🗑️ Adding to images_to_delete:', existingImage.id);
          setImagesToDelete(prev => {
            const newList = [...prev, existingImage.id];
            console.log('🗑️ Updated images_to_delete list:', newList);
            return newList;
          });
        }
      }

      // Update the form data images array
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
  const addVariant = () => {
    setVariantEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        image: "",
        delete_image: false, // Initialize deletion flag
        variations: [],
        variantPrices: { net_price: "", cost: "" },
        variantSpecs: [],
        delivery_type: "inherit",
        delivery_cost: "",
        stock: 0,
        shelf_id: undefined,
      },
    ]);
    // Clear validation error when variant is added
    if (validationErrors.variants) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.variants;
        return newErrors;
      });
    }
  };
  const removeVariant = (variantId: number) =>
    setVariantEntries((prev) => prev.filter((v) => v.id !== variantId));

  const updateVariantField = (
    variantId: number,
    field: string,
    value: any
  ) =>
    setVariantEntries((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );



  const updateVariantPrice = (
    variantId: number,
    field: keyof { net_price: string; cost: string },
    value: string
  ) =>
    setVariantEntries((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, variantPrices: { ...v.variantPrices, [field]: value } }
          : v
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

  // Handle close with double click outside protection
  const handleClose = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;

    if (timeDiff < 800) { // 800ms window for double click
      // Clear validation errors when closing modal
      setValidationErrors({});
      onClose();
      setClickConfirmNeeded(false);
      setLastClickTime(0);
    } else {
      setLastClickTime(currentTime);
      setClickConfirmNeeded(true);
      toast({
        title: "Click again to exit",
        description: "Click outside the form again to close it",
        variant: "default"
      });

      // Reset confirmation after 2 seconds
      setTimeout(() => {
        setClickConfirmNeeded(false);
        setLastClickTime(0);
      }, 2000);
    }
  };

  // Cancel button should close immediately without double-click requirement
  const handleCancel = () => {
    setValidationErrors({});
    setClickConfirmNeeded(false);
    setLastClickTime(0);
    onClose();
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if already loading
    if (isLoading) {
      return;
    }

    // Clear any previous validation errors
    setValidationErrors({});

    const errors: Record<string, string[]> = {};

    if (!formData.name) errors.name = ["Product name is required"];
    if (!formData.sku) errors.sku = ["SKU is required"];
    if (!formData.slug) errors.slug = ["URL slug is required"];

    // Price validation depends on variant configuration
    // For non-variant products, prices are always required
    if (!formData.has_variants) {
      if (!formData.net_price) errors.net_price = ["Net price is required"];
      if (!formData.cost_price) errors.cost_price = ["Cost price is required"];
    }

    // Validate variants when has_variants is true
    if (formData.has_variants && variantEntries.length === 0) {
      errors.variants = ["At least one variant is required when 'Has Variants' is enabled. Please add a variant or disable 'Has Variants'."];
    }

    // Validate that each variant has at least one attribute selected
    if (formData.has_variants && variantEntries.length > 0) {
      for (let i = 0; i < variantEntries.length; i++) {
        const variant = variantEntries[i];
        if (!variant.variations || variant.variations.length === 0) {
          errors[`variant_${variant.id}_attributes`] = [`Variant ${i + 1} must have at least one attribute value selected`];
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Validate cover image is required
    if (!mainImage && !formData.cover_image) {
      setValidationErrors({ cover_image: ["Cover image is required"] });
      return;
    }

    // Validate delivery method for non-variant products
    if (!formData.has_variants && !formData.delivery_type) {
      toast({ title: "Error", description: "Delivery method is required", variant: "destructive" });
      return;
    }

    // Validate variants if has_variants is true
    if (formData.has_variants) {
      if (variantEntries.length === 0) {
        toast({ title: "Error", description: "At least one variant is required when 'Has Variants' is enabled", variant: "destructive" });
        return;
      }

      for (let i = 0; i < variantEntries.length; i++) {
        const variant = variantEntries[i];
        if (variant.variations.length === 0) {
          toast({ title: "Error", description: `Variant ${i + 1} must have at least one attribute value selected`, variant: "destructive" });
          return;
        }
        if (!variant.stock || variant.stock <= 0) {
          toast({ title: "Error", description: `Variant ${i + 1} must have stock quantity greater than 0`, variant: "destructive" });
          return;
        }
      }

      // Check which variants have prices (backend fallback logic)
      const variantsWithoutPrice = [];
      for (let i = 0; i < variantEntries.length; i++) {
        const variant = variantEntries[i];
        const hasVariantPrice = variant.variantPrices.net_price && variant.variantPrices.cost;

        if (!hasVariantPrice) {
          variantsWithoutPrice.push(i);
        }
      }

      // If some variants lack prices, product price is required as fallback
      if (variantsWithoutPrice.length > 0) {
        if (!formData.cost_price) {
          errors.cost_price = [`Cost price is required as fallback for variants ${variantsWithoutPrice.map(i => i + 1).join(', ')} that don't have pricing`];
        }
        if (!formData.net_price) {
          errors.net_price = [`Net price is required as fallback for variants ${variantsWithoutPrice.map(i => i + 1).join(', ')} that don't have pricing`];
        }
      }
    }

    // Check for validation errors before continuing
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Validate specifications with backend fallback logic
    const validSpecs = specifications.filter((s) => s.name.trim() !== "" && s.value.trim() !== "");
    const requiredSpecNames = ['weight', 'height', 'width', 'length']; // ✅ Include weight as per backend

    let mustCheckProductSpecifications = false;

    if (formData.has_variants && variantEntries.length > 0) {
      // Check each variant for missing specs
      for (let variantIndex = 0; variantIndex < variantEntries.length; variantIndex++) {
        const variant = variantEntries[variantIndex];
        const variantSpecNames = variant.variantSpecs
          .map(s => s.name.toLowerCase().trim())
          .filter(name => name !== "");

        const missingInVariant = requiredSpecNames.filter(reqSpec =>
          !variantSpecNames.includes(reqSpec.toLowerCase())
        );

        if (missingInVariant.length > 0) {
          mustCheckProductSpecifications = true;
          break;
        }
      }
    } else {
      // No variants, so product specs must have all required specs
      mustCheckProductSpecifications = true;
    }

    if (mustCheckProductSpecifications) {
      const productSpecNames = validSpecs
        .map(s => s.name.toLowerCase().trim());

      const missingInProduct = requiredSpecNames.filter(reqSpec =>
        !productSpecNames.includes(reqSpec.toLowerCase())
      );

      if (missingInProduct.length > 0) {
        toast({
          title: "Error",
          description: `Missing required product specifications: ${missingInProduct.join(', ')}`,
          variant: "destructive"
        });
        return;
      }
    }

    // Build prices array from the single cost_price and net_price fields
    const prices = [];
    if (formData.cost_price && formData.net_price) {
      const costPrice = parseFloat(formData.cost_price);
      const netPrice = parseFloat(formData.net_price);
      if (!isNaN(costPrice) && !isNaN(netPrice)) {
        prices.push({
          net_price: netPrice,
          cost: costPrice
        });
      }
    }

    // Validate that net price is greater than cost (allow equal for special cases)
    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      if (price.net_price < price.cost) {
        toast({
          title: "Error",
          description: `Net price cannot be less than cost in price entry ${i + 1}`,
          variant: "destructive"
        });
        return;
      }
    }

    const specs = specifications
      .map((s) => ({ name: s.name, value: s.value }))
      .filter((s) => s.name.trim() !== "" && s.value.trim() !== "");

    let variantsPayload: any[] = [];
    if (formData.has_variants && variantEntries.length > 0) {
      // Validate variant prices and delivery settings
      for (let variantIndex = 0; variantIndex < variantEntries.length; variantIndex++) {
        const variant = variantEntries[variantIndex];

        // Validate variant pricing
        if (variant.variantPrices.net_price && variant.variantPrices.cost) {
          const netPrice = parseFloat(variant.variantPrices.net_price);
          const cost = parseFloat(variant.variantPrices.cost);

          if (!isNaN(netPrice) && !isNaN(cost) && netPrice < cost) {
            toast({
              title: "Error",
              description: `Net price cannot be less than cost in variant ${variantIndex + 1}`,
              variant: "destructive"
            });
            return;
          }
        }

        // Validate variant delivery settings (inherit from product if not set)
        const variantDeliveryType = variant.delivery_type || formData.delivery_type;
        const variantDeliveryCost = variant.delivery_cost;

        if (variantDeliveryType === 'company' && variantDeliveryCost) {
          toast({
            title: "Error",
            description: `Variant ${variantIndex + 1}: Delivery cost cannot be set for company delivery type`,
            variant: "destructive"
          });
          return;
        }

        if (variantDeliveryType === 'meemhome' && !variantDeliveryCost && !formData.delivery_cost) {
          toast({
            title: "Error",
            description: `Variant ${variantIndex + 1}: Delivery cost is required for meemhome delivery type`,
            variant: "destructive"
          });
          return;
        }
      }

      variantsPayload = variantEntries.map((variant) => {
        const variations = variant.variations;
        const variantPricesParsed = [];
        if (variant.variantPrices.net_price && variant.variantPrices.cost) {
          const netPrice = parseFloat(variant.variantPrices.net_price);
          const cost = parseFloat(variant.variantPrices.cost);
          if (!isNaN(netPrice) && !isNaN(cost)) {
            variantPricesParsed.push({ net_price: netPrice, cost: cost });
          }
        }

        const variantSpecsParsed = variant.variantSpecs
          .map((s) => ({ name: s.name, value: s.value }))
          .filter((s) => s.name.trim() !== "" && s.value.trim() !== "");

        // Only set delivery_type if it's not "inherit" and is a valid type
        const delivery_type = variant.delivery_type && variant.delivery_type !== "inherit" ? variant.delivery_type : undefined;
        const delivery_cost = delivery_type === "meemhome" && variant.delivery_cost ? parseFloat(variant.delivery_cost) : undefined;
        const stock = variant.stock || 0;

        const variantData: any = {
          id: variant.id, // Include variant ID for updates
          image: variant.image,
          delete_image: variant.delete_image, // Include deletion flag
          variations,
          stock,
          product_variant_prices: variantPricesParsed.length > 0 ? (variantPricesParsed as any) : [],
          product_variant_specifications: variantSpecsParsed.length > 0 ? variantSpecsParsed : [],
        };

        // Only add delivery fields if they have valid values
        if (delivery_type) {
          variantData.delivery_type = delivery_type;
        }
        if (delivery_cost !== undefined) {
          variantData.delivery_cost = delivery_cost;
        }

        // Only add shelf_id if it's explicitly set (override) and in add mode
        if (mode === 'add' && variant.shelf_id !== undefined) {
          variantData.shelf_id = variant.shelf_id;
        }

        return variantData;
      });
    }

    const sanitized: CreateProductData & { mode?: string; images_to_delete?: number[] } = {
      ...(formData as CreateProductData),
      has_variants: formData.has_variants === true,
      is_seller_product: formData.is_seller_product === true,
      is_on_sale: formData.is_on_sale === true,
      is_featured: formData.is_featured === true,
      is_new_arrival: formData.is_new_arrival === true,
      is_best_seller: formData.is_best_seller === true,
      is_vat_exempt: formData.is_vat_exempt === true,
      product_prices: prices as any,
      specifications: specs,
      cover_image: (mainImage || formData.cover_image) as any,
      images: thumbnails.map((t) => t.file) as any,
      images_to_delete: imagesToDelete.length > 0 ? imagesToDelete : undefined,
      variants: variantsPayload as any,
      mode: mode,
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
            delivery_type: v.delivery_type ?? '',
            delivery_cost: v.delivery_cost ?? '',
          }))
        );
      }
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

    try {
      await onSave(fd);
      // Clear any previous validation errors on success
      setValidationErrors({});
      // Only close modal if save was successful
      onClose();
    } catch (error: any) {
      // Keep modal open on error so user can see the error message and try again
      console.error('Save failed:', error);
      console.log('Error details:', error.details);
      console.log('Error response:', error.response);

      // Extract validation errors from the error response
      // Backend returns errors like: response.details.slug, response.details.name, etc.
      if (error.response && error.response.details) {
        console.log('Setting validation errors:', error.response.details);
        setValidationErrors(error.response.details);
      } else {
        console.log('No validation errors found, clearing state');
        // Clear validation errors if it's not a validation error
        setValidationErrors({});
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* <DialogHeader>
        <DialogTitle>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
      </DialogHeader> */}
      <DialogContent className="max-h-[85vh] overflow-y-auto p-0 w-full max-w-5xl bg-gradient-to-br from-gray-50/30 to-white">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 p-6 mb-6 z-10">
          <h2 className="text-2xl font-bold text-gray-900">{mode === 'add' ? 'Create New Product' : 'Edit Product'}</h2>
          <p className="text-sm text-gray-600 mt-1">Fill in the information below to {mode === 'add' ? 'create' : 'update'} your product</p>
        </div>
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* 1. Essential Product Information */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/60 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <Label className="text-lg font-semibold text-gray-900">Essential Information</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Enter product name" required />
                {renderFieldError('name')}
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category_id ? String(formData.category_id) : "0"}
                  onValueChange={(v) => updateField('category_id', v === "0" ? undefined : parseInt(v, 10) as any)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {formData.category_id ? categories.find((c) => c.id === formData.category_id)?.name : "No category"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No category</SelectItem>
                    {!categoriesLoading && categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>SKU *</Label>
                <Input type="text" value={formData.sku} onChange={(e) => updateField('sku', e.target.value)} placeholder="Enter SKU" required />
                {renderFieldError('sku')}
              </div>
              <div>
                <Label>Serial Number</Label>
                <Input type="text" value={formData.serial_number} onChange={(e) => updateField('serial_number', e.target.value)} placeholder="Serial Number" />
              </div>
              <div>
                <Label>URL Slug *</Label>
                <Input type="text" value={formData.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="product-url-slug" required />
                {renderFieldError('slug')}
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => updateField('status', value as any)}>
                  <SelectTrigger>
                    <SelectValue>{formData.status}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => handleDescriptionChange(e.target.value)} placeholder="Product description" rows={3} />
              </div>
            </div>
          </div>

          {/* 2. Pricing */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-amber-50 to-yellow-50/50 rounded-xl border border-amber-200/60 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <Label className="text-lg font-semibold text-gray-900">Pricing *</Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Cost Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_price || ''}
                  onChange={(e) => updateField('cost_price', e.target.value)}
                  placeholder="Enter cost price"
                  required
                />
                {renderFieldError('cost_price')}
              </div>
              <div>
                <Label>Net Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.net_price || ''}
                  onChange={(e) => updateField('net_price', e.target.value)}
                  placeholder="Enter net price"
                  required
                />
                {renderFieldError('net_price')}
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Switch checked={!!formData.is_vat_exempt} onCheckedChange={(checked) => updateField('is_vat_exempt', checked as any)} />
                <Label>VAT Exempt</Label>
              </div>
            </div>
            {formData.net_price && formData.cost_price && parseFloat(formData.net_price) < parseFloat(formData.cost_price) && (
              <p className="text-sm text-red-600">Net price cannot be less than cost price</p>
            )}
          </div>

          {/* 3. Product Type - Critical Toggle */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-200/60 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <Label className="text-lg font-semibold text-gray-900">Product Configuration</Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-blue-50">
              <Switch
                checked={!!formData.has_variants}
                onCheckedChange={(checked) => {
                  updateField('has_variants', checked as any);
                  // Auto-add a default variant when enabling variants
                  if (checked && variantEntries.length === 0) {
                    setVariantEntries([{
                      id: Date.now(),
                      image: "",
                      variations: [],
                      variantPrices: { net_price: "", cost: "" },
                      variantSpecs: [],
                      delivery_type: "inherit",
                      delivery_cost: "",
                      stock: 0,
                      shelf_id: undefined,
                    }]);
                  }
                  // Clear variants when disabling
                  if (!checked) {
                    setVariantEntries([]);
                  }
                  // Clear validation error when toggling has_variants
                  if (validationErrors.variants) {
                    setValidationErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.variants;
                      return newErrors;
                    });
                  }
                }}
              />
              <Label className="font-medium">This product has variants (sizes, colors, etc.)</Label>
            </div>
            <p className="text-sm text-muted-foreground">⚠️ Enable this before setting up inventory and delivery to avoid losing data</p>
          </div>

          {/* 4. Inventory & Logistics */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50 to-violet-50/50 rounded-xl border border-purple-200/60 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <Label className="text-lg font-semibold text-gray-900">Inventory & Logistics</Label>
            </div>

            <div className="space-y-4">
              {/* Stock - Only for non-variant products */}
              {!formData.has_variants && (
                <div>
                  <Label>Stock *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow digits 0-9, prevent scientific notation
                      if (value === '' || (/^\d+$/.test(value) && !value.includes('e'))) {
                        updateField('stock', value as any);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent 'e', 'E', '+', '-', '.' from being typed
                      if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter stock quantity"
                    required
                  />
                  {renderFieldError('stock')}
                </div>
              )}

              {/* Shelf - Always show in create mode (needed for variant inheritance) */}
              {mode === 'add' && (
                <div>
                  <Label>Shelf {formData.has_variants ? '(Default for variants)' : ''}</Label>
                  <Select
                    value={formData.shelf_id ? String(formData.shelf_id) : "0"}
                    onValueChange={(value) => updateField('shelf_id', value === "0" ? undefined : parseInt(value, 10) as any)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {formData.shelf_id ? shelves.find((s) => s.id === formData.shelf_id)?.name : "No shelf"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No shelf</SelectItem>
                      {shelves.map((shelf) => (
                        <SelectItem key={shelf.id} value={String(shelf.id)}>
                          {shelf.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.has_variants && (
                    <div className="text-xs text-muted-foreground mt-1">
                      This will be the default shelf for variants unless overridden
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Settings - Always show (used as fallback for variants) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  Delivery Method *
                  {formData.has_variants && <span className="text-xs text-muted-foreground ml-1">(fallback for variants)</span>}
                </Label>
                <Select value={formData.delivery_type || ''} onValueChange={(value) => {
                  updateField('delivery_type', value);
                  // Clear delivery cost when switching to company delivery
                  if (value === 'company') {
                    updateField('delivery_cost', null as any);
                  }
                }} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError('delivery_type')}
              </div>
              <div>
                <Label>
                  Delivery Cost {formData.delivery_type === 'meemhome' ? '*' : ''}
                  {formData.has_variants && <span className="text-xs text-muted-foreground ml-1">(fallback for variants)</span>}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.delivery_type === 'company' ? '' : (formData.delivery_cost || '')}
                  onChange={(e) => updateField('delivery_cost', e.target.value ? (parseFloat(e.target.value) as any) : (0 as any))}
                  placeholder="Enter delivery cost"
                  disabled={formData.delivery_type === 'company'}
                  required={formData.delivery_type === 'meemhome'}
                />
                {formData.delivery_type === 'company' && (
                  <div className="text-xs text-muted-foreground mt-1">Delivery cost is handled by the delivery company</div>
                )}
                {renderFieldError('delivery_cost')}
              </div>
            </div>
          </div>

          {/* 5. Product Images */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl border border-green-200/60 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Label className="text-lg font-semibold text-gray-900">Product Images</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Main Product Image *</Label>
                <FileUpload onFileSelect={handleMainImageUpload} accept="image/*" showPreview={false} />
                {mainImagePreview && (
                  <div className="mt-2 relative inline-block">
                    <img src={mainImagePreview} alt="Main product" className="h-20 w-20 object-cover rounded" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={() => {
                        setMainImage(null);
                        setMainImagePreview('');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {renderFieldError('cover_image')}
              </div>
              <div>
                <Label>Additional Images</Label>
                <FileUpload onFileSelect={handleThumbnailUpload} accept="image/*" maxFiles={10} showPreview={false} />
                {thumbnails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {thumbnails.map((thumb) => (
                      <div key={thumb.id} className="relative">
                        <img src={thumb.url} alt={thumb.alt} className="h-16 w-16 object-cover rounded" />
                        <Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full" onClick={() => removeThumbnail(thumb.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* 6. Product Specifications */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-rose-50 to-pink-50/50 rounded-xl border border-rose-200/60 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                <Label className="text-lg font-semibold text-gray-900">Product Specifications *</Label>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 active:scale-95 hover:shadow-md"
                onClick={addSpecification}
              >
                Add Specification
              </Button>
            </div>
            {renderFieldError('specifications')}
            {specifications.map((spec, index) => {
              const isRequired = index < 4;
              const unitMap: Record<string, string> = {
                weight: 'kg',
                height: 'cm',
                width: 'cm',
                length: 'cm'
              };
              const unit = unitMap[spec.name.toLowerCase()];

              return (
                <div key={spec.id} className="grid grid-cols-3 gap-2 items-center">
                  <Input
                    type="text"
                    value={spec.name}
                    onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                    placeholder="Name"
                    disabled={isRequired}
                    className={isRequired ? "bg-gray-100" : ""}
                  />
                  <div className="relative">
                    <Input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      placeholder="Value"
                    />
                    {unit && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                        {unit}
                      </span>
                    )}
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeSpecification(index)} disabled={isRequired}>Remove</Button>
                </div>
              );
            })}
          </div>

          {/* 7. Product Variants - Only show if has_variants is true */}
          {formData.has_variants && (
            <div className="space-y-4 p-6 bg-gradient-to-r from-cyan-50 to-teal-50/50 rounded-xl border border-cyan-200/60 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <Label className="text-lg font-semibold text-gray-900">Product Variants</Label>
              </div>
              {renderFieldError('variants')}
              {variantEntries.map((variant) => (
                <div key={variant.id} className="border p-4 rounded space-y-2" data-variant-id={variant.id}>
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
                      showPreview={false}
                    />
                    {(() => {
                      const v = variant as any;
                      const previewUrl = v.imagePreviewUrl || (typeof v.image === 'string' ? v.image : '');
                      return previewUrl ? (
                        <div className="mt-2 relative inline-block">
                          <img src={previewUrl} alt="Variant" className="w-32 h-32 object-cover rounded" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={() => {
                              // Check if this is an existing image (string) vs new upload (File)
                              const v = variant as any;
                              if (typeof v.image === 'string' && v.image && mode === 'edit') {
                                // For existing images, mark for deletion
                                updateVariantField(variant.id, 'delete_image', true);
                                updateVariantField(variant.id, 'image', '');
                                updateVariantField(variant.id, 'imagePreviewUrl', '');
                              } else {
                                // For new uploads, just clear
                                updateVariantField(variant.id, 'image', '');
                                updateVariantField(variant.id, 'imagePreviewUrl', '');
                                updateVariantField(variant.id, 'delete_image', false);
                              }
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Variant variations */}
                  <div className="variant-attributes">
                    <Label>Attribute Values *</Label>
                    {renderFieldError(`variant_${variant.id}_attributes`)}
                    {attributesLoading ? (
                      <div className="text-muted-foreground mt-2">Loading attributes...</div>
                    ) : attributes.length === 0 ? (
                      <div className="text-muted-foreground mt-2">No attributes available</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                        {attributes.map((attribute) => {
                          const attributeOptions: MultiSelectOption[] = attribute.values.map((value: any) => ({
                            id: value.id,
                            label: value.value,
                            value: value.value.toLowerCase(),
                            color: value.hex_color || undefined
                          }));

                          // Find the currently selected value for this attribute
                          const selectedAttributeValue = variant.variations.find(varId =>
                            attribute.values.some((val: any) => val.id === varId)
                          ) || null;

                          return (
                            <div key={attribute.id} className="space-y-2">
                              <Label className="text-sm font-medium">{attribute.name} ({attribute.type})</Label>
                              <MultiSelect
                                options={attributeOptions}
                                selected={selectedAttributeValue}
                                onSelectionChange={(selected) => {
                                  // Remove any existing values for this attribute
                                  const otherAttributeValues = variant.variations.filter(varId =>
                                    !attribute.values.some((val: any) => val.id === varId)
                                  );

                                  // Add the new selected value (if any)
                                  const newVariations = selected
                                    ? [...otherAttributeValues, selected as number]
                                    : otherAttributeValues;

                                  setVariantEntries(prev =>
                                    prev.map(v =>
                                      v.id === variant.id
                                        ? { ...v, variations: newVariations }
                                        : v
                                    )
                                  );

                                  // Clear validation error for this variant's attributes when user selects an attribute
                                  const errorKey = `variant_${variant.id}_attributes`;
                                  if (validationErrors[errorKey]) {
                                    setValidationErrors((prev) => {
                                      const newErrors = { ...prev };
                                      delete newErrors[errorKey];
                                      return newErrors;
                                    });
                                  }
                                }}
                                placeholder={`Select ${attribute.name.toLowerCase()}...`}
                                searchPlaceholder={`Search ${attribute.name.toLowerCase()}...`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {variant.variations.length > 0 && (
                      <div className="mt-3 p-2 bg-muted/50 rounded-md">
                        <div className="text-xs text-muted-foreground">Selected attribute values: {variant.variations.join(', ')}</div>
                      </div>
                    )}
                  </div>

                  {/* Variant Pricing Overrides */}
                  <div className="space-y-2">
                    <Label>Variant Prices (overrides)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cost Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.variantPrices.cost}
                          onChange={(e) => updateVariantPrice(variant.id, 'cost', e.target.value)}
                          placeholder="Cost (optional)"
                        />
                      </div>
                      <div>
                        <Label>Net Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.variantPrices.net_price}
                          onChange={(e) => updateVariantPrice(variant.id, 'net_price', e.target.value)}
                          placeholder="Net Price (optional)"
                        />
                      </div>
                    </div>
                    {variant.variantPrices.net_price && variant.variantPrices.cost && parseFloat(variant.variantPrices.net_price) < parseFloat(variant.variantPrices.cost) && (
                      <p className="text-sm text-red-600">Net price cannot be less than cost price</p>
                    )}
                  </div>

                  {/* Variant Specs Overrides */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Variant Specifications (overrides)</Label>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 active:scale-95 hover:shadow-md"
                        onClick={() => addVariantSpec(variant.id)}
                      >
                        Add Specification
                      </Button>
                    </div>
                    {variant.variantSpecs.map((spec, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                        <Input type="text" value={spec.name} onChange={(e) => updateVariantSpec(variant.id, idx, 'name', e.target.value)} placeholder="Name" />
                        <Input type="text" value={spec.value} onChange={(e) => updateVariantSpec(variant.id, idx, 'value', e.target.value)} placeholder="Value" />
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeVariantSpec(variant.id, idx)}>Remove</Button>
                      </div>
                    ))}
                  </div>

                   {/* Variant inventory and delivery overrides */}
                   <div className={cn(
                     "grid gap-4",
                     mode === 'add' ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"
                   )}>
                     <div>
                       <Label>Stock *</Label>
                       <Input
                         type="number"
                         value={variant.stock || ''}
                         onChange={(e) => updateVariantField(variant.id, 'stock', parseInt(e.target.value) || 0)}
                         placeholder="Stock quantity"
                         required
                       />
                     </div>

                     {/* Only show shelf override in create mode */}
                     {mode === 'add' && (
                       <div>
                         <Label>Shelf (override)</Label>
                         <Select
                           value={variant.shelf_id ? String(variant.shelf_id) : "inherit"}
                           onValueChange={(value) => updateVariantField(variant.id, 'shelf_id', value === "inherit" ? undefined : parseInt(value))}
                         >
                           <SelectTrigger>
                             <SelectValue>
                               {variant.shelf_id
                                 ? shelves.find((s) => s.id === variant.shelf_id)?.name || "Unknown shelf"
                                 : formData.shelf_id
                                   ? `Use main: ${shelves.find((s) => s.id === formData.shelf_id)?.name || "No shelf"}`
                                   : "Use main: No shelf"
                               }
                             </SelectValue>
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="inherit">Use main product shelf</SelectItem>
                             <SelectItem value="0">No shelf</SelectItem>
                             {shelves.map((shelf) => (
                               <SelectItem key={shelf.id} value={String(shelf.id)}>
                                 {shelf.name}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                     )}

                     <div>
                       <Label>Delivery Type (override)</Label>
                       <Select value={variant.delivery_type || ''} onValueChange={(value) => updateVariantField(variant.id, 'delivery_type', value)}>
                         <SelectTrigger>
                           <SelectValue placeholder="Select delivery method" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="inherit">Use main product delivery method</SelectItem>
                           {DELIVERY_TYPES.map((type) => (
                             <SelectItem key={type.value} value={type.value}>
                               {type.label}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label>
                         Delivery Cost {
                           (variant.delivery_type === 'meemhome' || (!variant.delivery_type && formData.delivery_type === 'meemhome'))
                           ? '*'
                           : ''
                         }
                       </Label>
                       <Input
                         type="number"
                         value={
                           (!variant.delivery_type || variant.delivery_type === 'inherit')
                             ? formData.delivery_cost || ''
                             : variant.delivery_cost || ''
                         }
                         onChange={(e) => updateVariantField(variant.id, 'delivery_cost', e.target.value)}
                         placeholder={
                           (!variant.delivery_type || variant.delivery_type === 'inherit')
                             ? `Use main product cost: ${formData.delivery_cost || '0'}`
                             : "Delivery Cost"
                         }
                         disabled={
                           (!variant.delivery_type || variant.delivery_type === 'inherit') ||
                           variant.delivery_type === 'company' ||
                           (!variant.delivery_type && formData.delivery_type === 'company')
                         }
                         required={variant.delivery_type === 'meemhome' || (!variant.delivery_type && formData.delivery_type === 'meemhome')}
                       />
                       {(!variant.delivery_type || variant.delivery_type === 'inherit') && (
                         <div className="text-xs text-muted-foreground mt-1">
                           Use main product delivery cost: {formData.delivery_cost || '0'}
                         </div>
                       )}
                       {(variant.delivery_type === 'company' || (!variant.delivery_type && formData.delivery_type === 'company')) && (
                         <div className="text-xs text-muted-foreground mt-1">Delivery cost is handled by the delivery company</div>
                       )}
                     </div>
                   </div>
                </div>
              ))}

              {/* Add Variant button - moved to bottom */}
              <div className="pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200 active:scale-95 hover:shadow-md"
                  onClick={addVariant}
                >
                  Add Another Variant
                </Button>
              </div>
            </div>
          )}

          {/* 8. Marketing & Promotion */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-orange-50 to-amber-50/50 rounded-xl border border-orange-200/60 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <Label className="text-lg font-semibold text-gray-900">Marketing & Promotion</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            </div>
          </div>

          {/* 9. SEO & Meta Information */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-slate-50 to-gray-50/50 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <Label className="text-lg font-semibold text-gray-900">SEO & Meta Information</Label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>SEO Title</Label>
                <Input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => {
                    setSeoTitleEdited(true);
                    updateField('seo_title', e.target.value);
                  }}
                  placeholder={formData.name ? `Auto-filled: ${formData.name}` : "SEO Title for search engines"}
                />
              </div>
              <div>
                <Label>SEO Description</Label>
                <Textarea
                  value={formData.seo_description}
                  onChange={(e) => {
                    setSeoDescriptionEdited(true);
                    updateField('seo_description', e.target.value);
                  }}
                  placeholder={formData.description ? `Auto-filled: ${formData.description.substring(0, 60)}...` : "SEO description for search engines"}
                  rows={2}
                  maxLength={255}
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {(formData.seo_description || '').length}/255 characters
                </div>
              </div>
            </div>
          </div>

          {/* Quick Attribute Management */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-xl border border-emerald-200/60 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <Label className="text-lg font-semibold text-gray-900">Quick Attribute Management</Label>
            </div>
            <AttributeManager />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{mode === 'add' ? 'Creating...' : 'Updating...'}</span>
                </div>
              ) : (
                mode === 'add' ? 'Create Product' : 'Update Product'
              )}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AdminProductModal;
