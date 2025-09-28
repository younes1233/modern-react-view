import { ValidationErrors } from '@/hooks/useFormValidation';

/**
 * Product-specific validation utilities extracted from AdminProductModal
 * These can be used as examples for creating validation functions for other forms
 */

export interface ProductFormData {
  name: string;
  sku: string;
  slug: string;
  net_price: string;
  cost_price: string;
  has_variants: boolean;
  delivery_type?: string;
  delivery_cost?: number;
  cover_image?: any;
  [key: string]: any;
}

export interface VariantEntry {
  id: number;
  variations: number[];
  stock: number;
  variantPrices: {
    net_price: string;
    cost: string;
  };
  delivery_type?: string;
  delivery_cost?: string | number;
  delete_image?: boolean;
  imagePreviewUrl?: string;
  image?: any;
  shelf_id?: any;
  variantSpecs?: any[];
  [key: string]: any;
}

export interface SpecificationEntry {
  name: string;
  value: string;
}

/**
 * Validate basic product fields (extracted from AdminProductModal)
 */
export function validateProductBasics(formData: ProductFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!formData.name) errors.name = ["Product name is required"];
  if (!formData.sku) errors.sku = ["SKU is required"];
  if (!formData.slug) errors.slug = ["URL slug is required"];
  if (!formData.net_price) errors.net_price = ["Net price is required"];
  if (!formData.cost_price) errors.cost_price = ["Cost price is required"];

  return errors;
}

/**
 * Validate product variants (extracted from AdminProductModal)
 */
export function validateProductVariants(
  formData: ProductFormData,
  variantEntries: VariantEntry[]
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate variants when has_variants is true
  if (formData.has_variants && variantEntries.length === 0) {
    errors.variants = ["At least one variant is required when 'Has Variants' is enabled. Please add a variant or disable 'Has Variants'."];
  }

  return errors;
}

/**
 * Validate cover image requirement (extracted from AdminProductModal)
 */
export function validateCoverImage(mainImage: any, formData: ProductFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!mainImage && !formData.cover_image) {
    errors.cover_image = ["Cover image is required"];
  }

  return errors;
}

/**
 * Validate delivery method (extracted from AdminProductModal)
 */
export function validateDeliveryMethod(formData: ProductFormData): { isValid: boolean; message?: string } {
  // Validate delivery method for non-variant products
  if (!formData.has_variants && !formData.delivery_type) {
    return {
      isValid: false,
      message: "Delivery method is required"
    };
  }

  return { isValid: true };
}

/**
 * Validate detailed variant requirements (extracted from AdminProductModal)
 */
export function validateDetailedVariants(
  formData: ProductFormData,
  variantEntries: VariantEntry[]
): { isValid: boolean; message?: string } {
  if (!formData.has_variants) {
    return { isValid: true };
  }

  if (variantEntries.length === 0) {
    return {
      isValid: false,
      message: "At least one variant is required when 'Has Variants' is enabled"
    };
  }

  for (let i = 0; i < variantEntries.length; i++) {
    const variant = variantEntries[i];

    if (variant.variations.length === 0) {
      return {
        isValid: false,
        message: `Variant ${i + 1} must have at least one attribute value selected`
      };
    }

    if (!variant.stock || variant.stock <= 0) {
      return {
        isValid: false,
        message: `Variant ${i + 1} must have stock quantity greater than 0`
      };
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
  if (variantsWithoutPrice.length > 0 && (!formData.cost_price || !formData.net_price)) {
    return {
      isValid: false,
      message: `Product prices are required as fallback for variants ${variantsWithoutPrice.map(i => i + 1).join(', ')} that don't have pricing`
    };
  }

  return { isValid: true };
}

/**
 * Validate product specifications (extracted from AdminProductModal)
 */
export function validateProductSpecifications(
  formData: ProductFormData,
  specifications: SpecificationEntry[],
  variantEntries: VariantEntry[]
): { isValid: boolean; message?: string } {
  const validSpecs = specifications.filter((s) => s.name.trim() !== "" && s.value.trim() !== "");
  const requiredSpecNames = ['weight', 'height', 'width', 'length'];

  let mustCheckProductSpecifications = false;

  if (formData.has_variants && variantEntries.length > 0) {
    // Check each variant for missing specs
    for (let variantIndex = 0; variantIndex < variantEntries.length; variantIndex++) {
      const variant = variantEntries[variantIndex];
      const variantSpecNames = (variant as any).variantSpecs
        ?.map((s: any) => s.name.toLowerCase().trim())
        .filter((name: string) => name !== "") || [];

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
      return {
        isValid: false,
        message: `Missing required product specifications: ${missingInProduct.join(', ')}`
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate pricing logic (extracted from AdminProductModal)
 */
export function validatePricing(
  prices: Array<{ net_price: number; cost: number }>,
  variantEntries: VariantEntry[]
): { isValid: boolean; message?: string } {
  // Validate that net price is greater than cost (allow equal for special cases)
  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];
    if (price.net_price < price.cost) {
      return {
        isValid: false,
        message: `Net price cannot be less than cost in price entry ${i + 1}`
      };
    }
  }

  // Validate variant prices
  for (let variantIndex = 0; variantIndex < variantEntries.length; variantIndex++) {
    const variant = variantEntries[variantIndex];

    if (variant.variantPrices.net_price && variant.variantPrices.cost) {
      const netPrice = parseFloat(variant.variantPrices.net_price);
      const cost = parseFloat(variant.variantPrices.cost);

      if (!isNaN(netPrice) && !isNaN(cost) && netPrice < cost) {
        return {
          isValid: false,
          message: `Net price cannot be less than cost in variant ${variantIndex + 1}`
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validate variant delivery settings (extracted from AdminProductModal)
 */
export function validateVariantDelivery(
  formData: ProductFormData,
  variantEntries: VariantEntry[]
): { isValid: boolean; message?: string } {
  for (let variantIndex = 0; variantIndex < variantEntries.length; variantIndex++) {
    const variant = variantEntries[variantIndex];

    // Validate variant delivery settings (inherit from product if not set)
    const variantDeliveryType = variant.delivery_type || formData.delivery_type;
    const variantDeliveryCost = variant.delivery_cost;

    if (variantDeliveryType === 'company' && variantDeliveryCost) {
      return {
        isValid: false,
        message: `Variant ${variantIndex + 1}: Delivery cost cannot be set for company delivery type`
      };
    }

    if (variantDeliveryType === 'meemhome' && !variantDeliveryCost && !formData.delivery_cost) {
      return {
        isValid: false,
        message: `Variant ${variantIndex + 1}: Delivery cost is required for meemhome delivery type`
      };
    }
  }

  return { isValid: true };
}

/**
 * Generic field update utility that clears validation errors
 * @param setFormData - Form data setter function
 * @param clearFieldError - Clear field error function from useFormValidation
 * @param field - Field name to update
 * @param value - New value
 */
export function createFieldUpdater<T>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  clearFieldError: (fieldName: string) => void
) {
  return <K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    clearFieldError(field as string);
  };
}