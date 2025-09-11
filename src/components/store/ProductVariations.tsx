
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductVariation, calculateVariationPrice } from '@/data/storeData';

interface ProductVariationsProps {
  variations: ProductVariation[];
  basePrice: number;
  onVariationChange: (selectedVariations: ProductVariation[]) => void;
  onImageChange?: (imageIndex: number) => void;
}

export function ProductVariations({ variations, basePrice, onVariationChange, onImageChange }: ProductVariationsProps) {
  const [selectedVariations, setSelectedVariations] = useState<ProductVariation[]>([]);

  // Group variations by type
  const groupedVariations = variations.reduce((acc, variation) => {
    if (!acc[variation.type]) {
      acc[variation.type] = [];
    }
    acc[variation.type].push(variation);
    return acc;
  }, {} as Record<string, ProductVariation[]>);

  const handleVariationSelect = (variation: ProductVariation) => {
    const currentSelected = getSelectedVariationForType(variation.type);
    
    let newSelections: ProductVariation[];
    if (currentSelected?.id === variation.id) {
      // Unselect if clicking the same variation
      newSelections = selectedVariations.filter(v => v.type !== variation.type);
    } else {
      // Select new variation
      newSelections = selectedVariations.filter(v => v.type !== variation.type);
      newSelections.push(variation);
      
      // Handle image change if variation has an image
      if (variation.imageIndex !== undefined && onImageChange) {
        onImageChange(variation.imageIndex);
      }
    }
    
    setSelectedVariations(newSelections);
    onVariationChange(newSelections);
  };

  const getSelectedVariationForType = (type: string) => {
    return selectedVariations.find(v => v.type === type);
  };

  const currentPrice = calculateVariationPrice(basePrice, selectedVariations);

  return (
    <div className="space-y-6">
      {Object.entries(groupedVariations).map(([type, typeVariations]) => {
        const selectedForType = getSelectedVariationForType(type);
        
        return (
          <div key={type} className="space-y-3">
            <h4 className="font-semibold text-gray-900 capitalize">
              {type}: {selectedForType && (
                <span className="font-normal text-gray-600">{selectedForType.value}</span>
              )}
            </h4>
            
            {type === 'color' ? (
              <div className="flex flex-wrap gap-2">
                {typeVariations.map((variation) => (
                  <button
                    key={variation.id}
                    onClick={() => handleVariationSelect(variation)}
                    disabled={variation.stock === 0}
                    className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                      selectedForType?.id === variation.id
                        ? 'border-cyan-500 ring-2 ring-cyan-200'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${variation.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{
                      backgroundColor: variation.value.toLowerCase(),
                    }}
                    title={`${variation.value}${variation.priceModifier ? ` (+$${variation.priceModifier})` : ''}`}
                  >
                    {variation.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {typeVariations.map((variation) => (
                  <Button
                    key={variation.id}
                    variant={selectedForType?.id === variation.id ? "default" : "outline"}
                    onClick={() => handleVariationSelect(variation)}
                    disabled={variation.stock === 0}
                    className={`relative ${
                      selectedForType?.id === variation.id
                        ? 'bg-cyan-600 hover:bg-cyan-700'
                        : 'hover:border-cyan-500'
                    }`}
                  >
                    {variation.value}
                    {variation.priceModifier !== undefined && variation.priceModifier !== 0 && (
                      <span className="ml-1 text-xs">
                        ({variation.priceModifier > 0 ? '+' : ''}${variation.priceModifier})
                      </span>
                    )}
                    {variation.stock === 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs px-1 py-0">
                        Out
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {selectedVariations.length > 0 && currentPrice !== basePrice && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price with selected options:</span>
            <span className="text-lg font-bold text-gray-900">${currentPrice.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
