import { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Package, Sparkles, Clock } from 'lucide-react';

interface ProductVariant {
  id: number;
  slug: string;
  sku: string;
  image: string;
  original_price: number;
  price: number;
  currency: {
    code: string;
    symbol: string;
  };
  applied_discounts: Array<{
    id: number;
    name: string;
    type: string;
    value: number;
    discount_amount: number;
  }>;
  stock: number;
  variations: Array<{
    attribute: string;
    type: string;
    value: string;
    slug: string;
    hex_color?: string;
    image?: string;
  }>;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant;
  onVariantChange: (variant: ProductVariant | null) => void;
  onImageChange?: (imageIndex: number) => void;
  isLoading?: boolean;
  showInfoCard?: boolean;
  showSelectionOptions?: boolean;
  externalSelections?: {[key: string]: string};
  onSelectionsChange?: (selections: {[key: string]: string}) => void;
}

const ProductVariantsComponent = ({
  variants,
  selectedVariant,
  onVariantChange,
  onImageChange,
  isLoading = false,
  showInfoCard = true,
  showSelectionOptions = true,
  externalSelections,
  onSelectionsChange
}: ProductVariantsProps) => {
  const [selectedVariations, setSelectedVariations] = useState<{[key: string]: string}>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (!variants || variants.length === 0) return null;

  // When only showing info card, use external selections if available, otherwise derive from selectedVariant
  const effectiveSelectedVariations = !showSelectionOptions
    ? (externalSelections || (selectedVariant
        ? selectedVariant.variations.reduce((acc, variation) => {
            acc[variation.attribute] = variation.value;
            return acc;
          }, {} as {[key: string]: string})
        : {}))
    : selectedVariations;

  // Helper functions
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'out', label: 'Out of Stock', color: 'text-red-600' };
    if (stock <= 5) return { status: 'low', label: `Only ${stock} left`, color: 'text-orange-600' };
    if (stock <= 10) return { status: 'limited', label: `${stock} in stock`, color: 'text-yellow-600' };
    return { status: 'available', label: 'In Stock', color: 'text-green-600' };
  };

  const getVariationAvailability = (attribute: string, value: string) => {
    // Get current selections excluding the attribute we're checking
    const otherSelections = Object.entries(selectedVariations).filter(([attr]) => attr !== attribute);

    // Find variants that match this specific variation
    const matchingVariants = variants.filter(variant => {
      // Must have the variation we're checking
      const hasTargetVariation = variant.variations.some(v =>
        v.attribute === attribute && v.value === value
      );

      if (!hasTargetVariation) return false;

      // Must match all other currently selected variations
      const matchesOtherSelections = otherSelections.every(([selectedAttr, selectedValue]) => {
        return variant.variations.some(v =>
          v.attribute === selectedAttr && v.value === selectedValue
        );
      });

      return matchesOtherSelections;
    });

    const availableVariants = matchingVariants.filter(variant => variant.stock > 0);
    const unavailableReasons = [];

    // If no variants match at all, this combination doesn't exist
    if (matchingVariants.length === 0) {
      unavailableReasons.push('Not available in this combination');
    } else if (availableVariants.length === 0) {
      // All matching variants are out of stock
      unavailableReasons.push('Out of stock');
    }

    // Check which specific selections make this unavailable
    if (otherSelections.length > 0 && matchingVariants.length === 0) {
      const conflictingSelections = otherSelections
        .filter(([selectedAttr, selectedValue]) => {
          // Check if this value would be available without this conflicting selection
          const testSelections = otherSelections.filter(([attr]) => attr !== selectedAttr);
          const testVariants = variants.filter(variant => {
            const hasTarget = variant.variations.some(v => v.attribute === attribute && v.value === value);
            if (!hasTarget) return false;

            return testSelections.every(([testAttr, testValue]) => {
              return variant.variations.some(v => v.attribute === testAttr && v.value === testValue);
            });
          });
          return testVariants.length > 0;
        })
        .map(([attr, val]) => `${val} ${attr.toLowerCase()}`);

      if (conflictingSelections.length > 0) {
        unavailableReasons.push(`Not available with ${conflictingSelections.join(', ')}`);
      }
    }

    return {
      isAvailable: availableVariants.length > 0,
      hasStock: availableVariants.length > 0,
      totalStock: availableVariants.reduce((sum, variant) => sum + variant.stock, 0),
      unavailableReasons: unavailableReasons
    };
  };

  const areAllAttributesSelected = () => {
    const allAttributes = Object.keys(variationGroups);
    const selectedAttributes = Object.keys(selectedVariations);
    return selectedAttributes.length === allAttributes.length;
  };

  const getMissingAttributes = () => {
    const allAttributes = Object.keys(variationGroups);
    const selectedAttributes = Object.keys(effectiveSelectedVariations);
    return allAttributes.filter(attr => !selectedAttributes.includes(attr));
  };

  // Group variations by attribute
  const variationGroups = variants.reduce((groups, variant) => {
    variant.variations.forEach(variation => {
      if (!groups[variation.attribute]) {
        groups[variation.attribute] = new Set();
      }
      groups[variation.attribute].add(JSON.stringify(variation));
    });
    return groups;
  }, {} as {[key: string]: Set<string>});

  const handleVariationSelect = async (attribute: string, variation: any) => {
    const availability = getVariationAvailability(attribute, variation.value);

    // If clicking an already selected variation, do nothing.
    if (selectedVariations[attribute] === variation.value) {
      return;
    }

    // Don't allow selection of unavailable variations
    if (!availability.isAvailable) return;

    setIsTransitioning(true);

    // Select new variation
    const newSelections = {
      ...selectedVariations,
      [attribute]: variation.value,
    };

    // Handle image change if variation has an image
    if (variation.image_index !== undefined && onImageChange) {
      onImageChange(variation.image_index);
    }

    setSelectedVariations(newSelections);

    // Notify parent component of selection changes
    if (onSelectionsChange) {
      onSelectionsChange(newSelections);
    }

    // Get all available attributes
    const allAttributes = Object.keys(variationGroups);
    const selectedAttributes = Object.keys(newSelections);

    // Only find matching variant if ALL attributes are selected
    let matchingVariant = null;
    if (selectedAttributes.length === allAttributes.length) {
      matchingVariant = variants.find(variant => {
        return Object.keys(newSelections).every(attr => {
          return variant.variations.some(v => v.attribute === attr && v.value === newSelections[attr]);
        });
      });
    }

    onVariantChange(matchingVariant || null);

    // Add slight delay for transition effect
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className="space-y-6">
      {isLoading && showSelectionOptions && (
        <div className="flex items-center space-x-2 text-gray-500">
          <Clock className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading variants...</span>
        </div>
      )}

      {showSelectionOptions && Object.entries(variationGroups).map(([attribute, variationSet]) => {
        const variations = Array.from(variationSet).map(str => JSON.parse(str));
        const selectedValue = selectedVariations[attribute];

        return (
          <div key={attribute} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-lg">{attribute}</h4>
              {selectedValue && (
                <Badge variant="outline" className="text-xs">
                  Selected: {selectedValue}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {variations.map((variation, index) => {
                const isSelected = selectedValue === variation.value;
                const availability = getVariationAvailability(attribute, variation.value);
                const isAvailable = availability.isAvailable;
                const isColor = variation.type === 'color';

                if (isColor) {
                  return (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <button
                        onClick={() => handleVariationSelect(attribute, variation)}
                        disabled={!isAvailable}
                        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                          isSelected
                            ? 'border-cyan-500 scale-110 shadow-lg'
                            : isAvailable
                              ? 'border-gray-300 hover:border-gray-400 hover:scale-105'
                              : 'border-gray-200 opacity-40 cursor-not-allowed grayscale'
                        } ${isTransitioning ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: isAvailable ? variation.hex_color : '#e5e7eb' }}
                        title={isAvailable ? variation.value : `${variation.value} - ${availability.unavailableReasons.join(', ')}`}
                      >
                        {isSelected && (
                          <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-cyan-500 bg-white rounded-full" />
                        )}
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-0.5 bg-gray-400 rotate-45"></div>
                          </div>
                        )}
                      </button>
                      <span className={`text-xs text-center ${
                        isAvailable ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {variation.value}
                      </span>
                    </div>
                  );
                }

                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVariationSelect(attribute, variation)}
                    disabled={!isAvailable}
                    className={`relative transition-all duration-300 ${
                      isSelected
                        ? "bg-cyan-600 hover:bg-cyan-700 shadow-lg scale-105"
                        : isAvailable
                          ? "hover:scale-105 hover:shadow-md"
                          : "opacity-40 cursor-not-allowed border-gray-300 text-gray-400 bg-gray-50"
                    } ${isTransitioning ? 'animate-pulse' : ''}`}
                    title={isAvailable ? variation.value : `${variation.value} - ${availability.unavailableReasons.join(', ')}`}
                  >
                    {variation.value}
                    {isSelected && (
                      <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-cyan-500 bg-white rounded-full" />
                    )}
                    {!isAvailable && (
                      <AlertTriangle className="absolute -top-1 -right-1 w-4 h-4 text-gray-400 bg-white rounded-full" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Compact Variant Selection Status */}
      {showInfoCard && Object.keys(effectiveSelectedVariations).length > 0 && (
        <Card className={`border transition-all duration-300 ${
          selectedVariant
            ? (isTransitioning ? 'border-cyan-300 bg-cyan-50' : 'border-cyan-200 bg-cyan-50/70')
            : 'border-orange-200 bg-orange-50/70'
        }`}>
          <CardContent className="p-3">
            {selectedVariant ? (
              /* Complete Selection Summary */
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <span className="font-medium text-sm text-gray-900">Selected: </span>
                    <span className="text-sm text-gray-700">
                      {selectedVariant.variations.map(v => v.value).join(' · ')}
                    </span>
                  </div>
                </div>
                {(() => {
                  const stockStatus = getStockStatus(selectedVariant.stock);
                  return (
                    <Badge className={`text-xs ${
                      stockStatus.status === 'out' ? 'bg-red-500' :
                      stockStatus.status === 'low' ? 'bg-orange-500' :
                      stockStatus.status === 'limited' ? 'bg-yellow-500' :
                      'bg-green-500'
                    } text-white`}>
                      <Package className="w-2 h-2 mr-1" />
                      {stockStatus.label}
                    </Badge>
                  );
                })()}
              </div>
            ) : (
              /* Incomplete Selection Warning */
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="w-3 h-3 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm text-gray-900">Please complete selection</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs text-gray-600">Need: </span>
                    {getMissingAttributes().map((attr, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 px-1 py-0">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Memoize ProductVariants - only re-render if variants or selectedVariant changes
export const ProductVariants = memo(ProductVariantsComponent, (prevProps, nextProps) => {
  return prevProps.variants === nextProps.variants &&
         prevProps.selectedVariant?.id === nextProps.selectedVariant?.id &&
         prevProps.showInfoCard === nextProps.showInfoCard &&
         prevProps.showSelectionOptions === nextProps.showSelectionOptions;
});