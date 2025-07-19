
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductGridSkeletonProps {
  count?: number;
  isMobile?: boolean;
}

export function ProductGridSkeleton({ count = 12, isMobile = false }: ProductGridSkeletonProps) {
  const getGridColumns = () => {
    if (isMobile) return 'grid-cols-2';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  return (
    <div className={`grid gap-3 sm:gap-6 ${getGridColumns()}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
