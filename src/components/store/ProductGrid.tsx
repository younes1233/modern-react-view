
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './ProductGridSkeleton';
import { Button } from '@/components/ui/button';
import { Product, DisplaySettings } from '@/data/storeData';

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  displaySettings: DisplaySettings | null;
  isMobile: boolean;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export function ProductGrid({
  products,
  viewMode,
  displaySettings,
  isMobile,
  onClearFilters,
  isLoading = false
}: ProductGridProps) {
  const getGridColumns = () => {
    // Force 2 columns on mobile
    if (isMobile) return 'grid-cols-2';
    
    const cols = displaySettings?.gridColumns || 3;
    switch (cols) {
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 5: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  if (isLoading) {
    return <ProductGridSkeleton count={12} isMobile={isMobile} />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-base sm:text-lg">No products found matching your criteria.</p>
        <Button onClick={onClearFilters} className="mt-4 bg-cyan-600 hover:bg-cyan-700">
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:gap-6 ${
      isMobile || viewMode === 'grid' ? getGridColumns() : 'grid-cols-1'
    }`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
