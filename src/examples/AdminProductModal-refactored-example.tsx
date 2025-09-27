import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import our new validation system
import { useFormValidation } from "@/hooks/useFormValidation";
import { FormErrorDisplay, useFieldError } from "@/components/ui/form-error-display";
import {
  validateProductBasics,
  validateProductVariants,
  validateCoverImage,
  validateDeliveryMethod,
  validateDetailedVariants,
  validateProductSpecifications,
  validatePricing,
  validateVariantDelivery,
  createFieldUpdater,
  ProductFormData,
  VariantEntry,
  SpecificationEntry
} from "@/utils/validation";

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  product?: any | null;
  mode: "add" | "edit";
  isLoading?: boolean;
}

/**
 * Example of how to refactor AdminProductModal to use the new validation system
 * This maintains 100% of the original functionality while making it reusable
 */
export function AdminProductModalRefactored({
  isOpen,
  onClose,
  onSave,
  product,
  mode,
  isLoading = false
}: AdminProductModalProps) {

  // Use our new validation hook instead of manual state management
  const {
    validationErrors,
    setErrors,
    clearErrors,
    clearFieldError,
    addFieldError,
    hasErrors,
    validateRequiredFields,
    handleBackendErrors,
    showToastError
  } = useFormValidation({
    enableScrollToError: true,
    scrollDelay: 200
  });

  // Use the field error renderer hook
  const renderFieldError = useFieldError(validationErrors);

  // Form state (same as before)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    slug: "",
    net_price: "",
    cost_price: "",
    has_variants: false,
    delivery_type: "meemhome",
    delivery_cost: 0,
    cover_image: ""
  });

  const [variantEntries, setVariantEntries] = useState<VariantEntry[]>([]);
  const [specifications, setSpecifications] = useState<SpecificationEntry[]>([]);
  const [mainImage, setMainImage] = useState<File | string>("");

  // Create the field updater with automatic error clearing
  const updateField = createFieldUpdater(setFormData, clearFieldError);

  // Handle form submission with new validation system
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    // Clear previous errors
    clearErrors();

    // 1. Basic validation using extracted functions
    const basicErrors = validateProductBasics(formData);
    const variantErrors = validateProductVariants(formData, variantEntries);
    const imageErrors = validateCoverImage(mainImage, formData);

    // Combine basic validation errors
    const allErrors = { ...basicErrors, ...variantErrors, ...imageErrors };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    // 2. Complex validation with toast messages (keeping original behavior)
    const deliveryValidation = validateDeliveryMethod(formData);
    if (!deliveryValidation.isValid) {
      showToastError("Error", deliveryValidation.message!);
      return;
    }

    const detailedVariantValidation = validateDetailedVariants(formData, variantEntries);
    if (!detailedVariantValidation.isValid) {
      showToastError("Error", detailedVariantValidation.message!);
      return;
    }

    const specValidation = validateProductSpecifications(formData, specifications, variantEntries);
    if (!specValidation.isValid) {
      showToastError("Error", specValidation.message!);
      return;
    }

    // 3. Build prices array (same logic as before)
    const prices = [];
    if (formData.cost_price && formData.net_price) {
      const costPrice = parseFloat(formData.cost_price);
      const netPrice = parseFloat(formData.net_price);
      if (!isNaN(costPrice) && !isNaN(netPrice)) {
        prices.push({
          net_price: netPrice,
          cost: costPrice,
          country_id: 1 // or get from context
        });
      }
    }

    const pricingValidation = validatePricing(prices, variantEntries);
    if (!pricingValidation.isValid) {
      showToastError("Error", pricingValidation.message!);
      return;
    }

    const variantDeliveryValidation = validateVariantDelivery(formData, variantEntries);
    if (!variantDeliveryValidation.isValid) {
      showToastError("Error", variantDeliveryValidation.message!);
      return;
    }

    // 4. Build form data and submit (same as before)
    try {
      // ... build FormData logic here (same as original)
      const fd = new FormData(); // simplified for example
      await onSave(fd);
      clearErrors();
      onClose();
    } catch (error: any) {
      // Use the new backend error handler
      handleBackendErrors(error);
    }
  };

  // Handle close with error clearing
  const handleClose = () => {
    clearErrors();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto p-0 w-full max-w-5xl">
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>

            {/* Essential Product Information */}
            <div className="space-y-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl">
              <Label className="text-lg font-semibold">Essential Information</Label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter product name"
                  />
                  {/* Use the new error display component */}
                  {renderFieldError('name')}
                </div>

                <div>
                  <Label>SKU *</Label>
                  <Input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => updateField('sku', e.target.value)}
                    placeholder="Enter SKU"
                  />
                  {/* Same error display pattern */}
                  {renderFieldError('sku')}
                </div>

                <div>
                  <Label>URL Slug *</Label>
                  <Input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="product-url-slug"
                  />
                  {renderFieldError('slug')}
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4 p-6 bg-gradient-to-r from-amber-50 to-yellow-50/50 rounded-xl">
              <Label className="text-lg font-semibold">Pricing *</Label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cost Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
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
                    value={formData.net_price}
                    onChange={(e) => updateField('net_price', e.target.value)}
                    placeholder="Enter net price"
                    required
                  />
                  {renderFieldError('net_price')}
                </div>
              </div>

              {/* Real-time price validation warning (same as original) */}
              {formData.net_price && formData.cost_price &&
               parseFloat(formData.net_price) < parseFloat(formData.cost_price) && (
                <p className="text-sm text-red-600">Net price cannot be less than cost price</p>
              )}
            </div>

            {/* Cover Image Section */}
            <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl">
              <Label className="text-lg font-semibold">Cover Image *</Label>
              {/* FileUpload component would go here */}
              {renderFieldError('cover_image')}
            </div>

            {/* Variants Section - only show if has_variants is true */}
            {formData.has_variants && (
              <div className="space-y-4 p-6 bg-gradient-to-r from-cyan-50 to-teal-50/50 rounded-xl">
                <Label className="text-lg font-semibold">Product Variants</Label>
                {renderFieldError('variants')}
                {/* Variant form fields would go here */}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
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

export default AdminProductModalRefactored;