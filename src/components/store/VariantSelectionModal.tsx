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
  onConfirm: (variantId: string, fullProduct?: Product) => void;
}

export function VariantSelectionModal({
  isOpen,
  onClose,
  product,
  quantity,
  onConfirm,
}: VariantSelectionModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string>('');
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

  // Reset selected variant and image when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVariant(null);
      // Set initial image to product's actual image
      let initialImage = '/placeholder.svg';
      
      if (typeof product.image === 'string') {
        initialImage = product.image;
      } else if (product.cover_image) {
        // Handle product cover_image from API
        if (typeof product.cover_image === 'string') {
          initialImage = product.cover_image;
        } else if (product.cover_image && typeof product.cover_image === 'object') {
          initialImage = product.cover_image.mobile || product.cover_image.desktop || '/placeholder.svg';
        }
      }
      
      setCurrentImage(initialImage);
    }
  }, [isOpen, product.image, product.cover_image]);

  // Update image when variant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.image) {
      // Handle image object structure from getApiImageData()
      let variantImageUrl = '/placeholder.svg';
      
      if (typeof selectedVariant.image === 'string') {
        variantImageUrl = selectedVariant.image;
      } else if (selectedVariant.image && typeof selectedVariant.image === 'object') {
        const imageObj = selectedVariant.image;
        
        if (imageObj.urls) {
          // Handle nested URL structure: urls.catalog.mobile, urls.main.mobile, etc.
          variantImageUrl = imageObj.urls.catalog?.mobile || 
                           imageObj.urls.catalog?.desktop || 
                           imageObj.urls.main?.mobile || 
                           imageObj.urls.main?.desktop || 
                           imageObj.urls.original || 
                           imageObj.urls.thumbnails?.mobile || 
                           '/placeholder.svg';
        } else {
          variantImageUrl = imageObj.desktop || imageObj.tablet || imageObj.mobile || imageObj.url || '/placeholder.svg';
        }
      }
      
      setCurrentImage(variantImageUrl);
    } else if (!selectedVariant) {
      // Reset to product image when no variant is selected
      let productImage = '/placeholder.svg';
      
      if (typeof product.image === 'string') {
        productImage = product.image;
      } else if (product.cover_image) {
        if (typeof product.cover_image === 'string') {
          productImage = product.cover_image;
        } else if (product.cover_image && typeof product.cover_image === 'object') {
          productImage = product.cover_image.mobile || product.cover_image.desktop || '/placeholder.svg';
        }
      }
      
      setCurrentImage(productImage);
    }
  }, [selectedVariant, product.image]);

  const handleConfirm = () => {
    if (selectedVariant) {
      onConfirm(selectedVariant.id.toString(), fullProduct);
      onClose();
    }
  };

  const handleImageChange = (imageIndex: number) => {
    // This could be used if we have multiple images for variants
    // For now, we'll handle image changes through variant selection
  };

  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    // Image update is handled by the useEffect above
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
            <div className="relative">
              <img
                src={currentImage || (typeof product.image === 'string' ? product.image : '/placeholder.svg')}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg border transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              {selectedVariant && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">✓</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">
                Quantity: {quantity}
              </p>
              {selectedVariant && (
                <p className="text-sm text-cyan-600 font-medium">
                  {selectedVariant.variations?.map((v: any) => v.value).join(' · ')}
                </p>
              )}
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
              onVariantChange={handleVariantChange}
              onImageChange={handleImageChange}
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