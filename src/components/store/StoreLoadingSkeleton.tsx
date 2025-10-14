import { HeroSkeleton } from './HeroSkeleton';
import { ShopByCategorySkeleton } from './ShopByCategorySkeleton';
import { ProductSectionSkeleton } from './ProductSectionSkeleton';
import { StoreHeaderSkeleton } from './StoreHeaderSkeleton';

// Minimal Store page skeleton - shown while lazy loading the Store component
// Includes header skeleton to prevent layout shift
export function StoreLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-blue-100">
      {/* Header skeleton prevents hero from shifting when real header loads */}
      <StoreHeaderSkeleton />
      <HeroSkeleton />
      <ShopByCategorySkeleton />
      <div className="w-full overflow-hidden bg-white">
        <ProductSectionSkeleton />
        <ProductSectionSkeleton />
      </div>
    </div>
  );
}
