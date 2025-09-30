import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductVariants } from './ProductVariants';
import { Product } from '@/data/storeData';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { useCountryCurrency } from '@/contexts/CountryCurrencyContext';

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
  onConfirm: (variantId: string) => void;
}

export function VariantSelectionModal({
  isOpen,
  onClose,
  product,
  quantity,
  onConfirm,
}: VariantSelectionModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const { selectedCountry, selectedCurrency } = useCountryCurrency();

  // Fetch full product details with variants
  const { data: fullProduct, isLoading, error } = useQuery({
    queryKey: ['product-variants', product.slug, selectedCountry?.id, selectedCurrency?.id],
    queryFn: async () => {
      const response = await productService.getProductBySlug(
        product.slug,
        selectedCountry?.id || 1,
        selectedCurrency?.id
      );
      return response?.details?.product || null;
    },
    enabled: isOpen && !!product.slug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Reset selected variant when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVariant(null);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedVariant) {
      onConfirm(selectedVariant.id.toString());
      onClose();
    }
  };

  const variants = fullProduct?.variants || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>Select Product Options</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Preview */}
          <div className="flex gap-3 items-center pb-4 border-b">
            <img
              src={typeof product.image === 'string' ? product.image : '/placeholder.svg'}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg border"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">
                Quantity: {quantity}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
              <span className="ml-3 text-gray-600">Loading options...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-600">
              <p>Failed to load product options.</p>
              <p className="text-sm mt-2">Please try again or visit the product page.</p>
            </div>
          )}

          {/* Variant Selection */}
          {!isLoading && !error && variants.length > 0 && (
            <ProductVariants
              variants={variants}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
              showInfoCard={true}
              showSelectionOptions={true}
            />
          )}

          {/* No Variants Found */}
          {!isLoading && !error && variants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No product options available.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedVariant}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}