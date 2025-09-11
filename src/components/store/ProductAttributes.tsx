import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ProductAttribute {
  attribute: string;
  type: string;
  value: string;
  hex_color?: string;
}

interface ProductAttributesProps {
  attributes: ProductAttribute[];
}

export const ProductAttributes = ({ attributes }: ProductAttributesProps) => {
  if (!attributes || attributes.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Attributes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attributes.map((attribute, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="font-medium text-gray-900">{attribute.attribute}:</span>
              <div className="flex items-center space-x-2">
                {attribute.type === 'color' && attribute.hex_color && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: attribute.hex_color }}
                  />
                )}
                <Badge variant="secondary" className="text-sm">
                  {attribute.value}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};