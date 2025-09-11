import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, Percent } from 'lucide-react';

interface ProductDiscount {
  id: number;
  name: string;
  type: string;
  value: number;
  discount_amount: number;
}

interface ProductDiscountsProps {
  discounts: ProductDiscount[];
  currency: {
    code: string;
    symbol: string;
  };
}

export const ProductDiscounts = ({ discounts, currency }: ProductDiscountsProps) => {
  if (!discounts || discounts.length === 0) return null;

  return (
    <Card className="border border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Tag className="w-4 h-4 text-green-600" />
          <h4 className="font-medium text-green-800">Active Discounts</h4>
        </div>
        <div className="space-y-2">
          {discounts.map((discount) => (
            <div key={discount.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-600 text-white">
                  {discount.name}
                </Badge>
                <span className="text-sm text-green-700">
                  {discount.type === 'percentage' ? (
                    <span className="flex items-center space-x-1">
                      <Percent className="w-3 h-3" />
                      <span>{discount.value}% off</span>
                    </span>
                  ) : (
                    `${currency.symbol}${discount.value} off`
                  )}
                </span>
              </div>
              <span className="font-medium text-green-800">
                Save {currency.symbol}{discount.discount_amount ? Number(discount.discount_amount).toFixed(2) : '0.00'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};