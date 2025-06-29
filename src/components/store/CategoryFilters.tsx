
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  showFilters: boolean;
}

export function CategoryFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  onClearFilters,
  showFilters
}: CategoryFiltersProps) {
  return (
    <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
      <div className="space-y-4 sm:space-y-6">
        {/* Categories */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Categories</h3>
            <div className="space-y-1 sm:space-y-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className={`w-full justify-between text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-auto ${
                    selectedCategory === category.id 
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => onCategoryChange(category.id)}
                >
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Price Range</h3>
            <div className="space-y-3 sm:space-y-4">
              <Slider
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clear Filters */}
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="w-full text-xs sm:text-sm py-2"
        >
          <X className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
