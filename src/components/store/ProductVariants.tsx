import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
  onVariantChange: (variant: ProductVariant) => void;
}

export const ProductVariants = ({ variants, selectedVariant, onVariantChange }: ProductVariantsProps) => {
  const [selectedVariations, setSelectedVariations] = useState<{[key: string]: string}>({});

  if (!variants || variants.length === 0) return null;

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

  const handleVariationSelect = (attribute: string, variation: any) => {
    const newSelections = { ...selectedVariations, [attribute]: variation.value };
    setSelectedVariations(newSelections);

    // Find matching variant
    const matchingVariant = variants.find(variant => {
      return Object.keys(newSelections).every(attr => {
        return variant.variations.some(v => v.attribute === attr && v.value === newSelections[attr]);
      });
    });

    if (matchingVariant) {
      onVariantChange(matchingVariant);
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(variationGroups).map(([attribute, variationSet]) => {
        const variations = Array.from(variationSet).map(str => JSON.parse(str));
        const selectedValue = selectedVariations[attribute];

        return (
          <div key={attribute} className="space-y-2">
            <h4 className="font-medium text-gray-900">{attribute}</h4>
            <div className="flex flex-wrap gap-2">
              {variations.map((variation, index) => {
                const isSelected = selectedValue === variation.value;
                const isColor = variation.type === 'color';

                if (isColor) {
                  return (
                    <button
                      key={index}
                      onClick={() => handleVariationSelect(attribute, variation)}
                      className={`w-10 h-10 rounded-full border-2 ${
                        isSelected ? 'border-cyan-500 scale-110' : 'border-gray-300'
                      } transition-all duration-200`}
                      style={{ backgroundColor: variation.hex_color }}
                      title={variation.value}
                    />
                  );
                }

                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVariationSelect(attribute, variation)}
                    className={isSelected ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                  >
                    {variation.value}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <Card className="border border-cyan-200 bg-cyan-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">Selected Variant</p>
                <p className="text-sm text-gray-600">SKU: {selectedVariant.sku}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-bold text-lg">
                    {selectedVariant.currency.symbol}{selectedVariant.price.toFixed(2)}
                  </span>
                  {selectedVariant.original_price > selectedVariant.price && (
                    <span className="text-sm line-through text-gray-500">
                      {selectedVariant.currency.symbol}{selectedVariant.original_price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge className={selectedVariant.stock > 0 ? "bg-green-500" : "bg-red-500"}>
                  {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};