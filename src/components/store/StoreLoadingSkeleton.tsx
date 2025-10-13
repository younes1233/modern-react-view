import { HeroSkeleton } from './HeroSkeleton';
import { ShopByCategorySkeleton } from './ShopByCategorySkeleton';
import { ProductSectionSkeleton } from './ProductSectionSkeleton';

// Minimal Store page skeleton - shown while lazy loading the Store component
export function StoreLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSkeleton />
      <ShopByCategorySkeleton />
      <div className="w-full overflow-hidden bg-white animate-pulse">
        <ProductSectionSkeleton />
        <ProductSectionSkeleton />
      </div>
    </div>
  );
}
