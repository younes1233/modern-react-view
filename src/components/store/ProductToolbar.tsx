
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, List, Filter } from 'lucide-react';

interface ProductToolbarProps {
  totalProducts: number;
  displayedCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  isMobile: boolean;
}

export function ProductToolbar({
  totalProducts,
  displayedCount,
  showFilters,
  onToggleFilters,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  isMobile
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-gray-600 text-xs sm:text-sm">
          Showing {displayedCount} of {totalProducts} products
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="lg:hidden text-xs px-2 py-1.5"
        >
          <Filter className="w-3 h-3 mr-1" />
          Filters
        </Button>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-40 sm:w-48 text-xs sm:text-sm h-8 sm:h-10">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode - Hidden on mobile */}
        {!isMobile && (
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={`${viewMode === 'grid' ? 'bg-cyan-500 hover:bg-cyan-600' : ''} h-8 w-8 p-0`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`${viewMode === 'list' ? 'bg-cyan-500 hover:bg-cyan-600' : ''} h-8 w-8 p-0`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
