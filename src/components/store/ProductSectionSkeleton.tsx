
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSectionSkeletonProps {
  showTitle?: boolean;
  isMobile?: boolean;
}

export function ProductSectionSkeleton({ showTitle = true, isMobile = false }: ProductSectionSkeletonProps) {
  const productsCount = isMobile ? 4 : 6;

  return (
    <section className="py-2 md:py-4 bg-white overflow-hidden animate-pulse">
      <div className="w-full max-w-full px-2 md:px-4">
        <div className="mx-auto">
          {/* Header Section Skeleton */}
          {showTitle && (
            <div className="mb-2 md:mb-4 relative">
              <div className="relative bg-gradient-to-r from-cyan-100 to-blue-100 pt-6 md:pt-10 overflow-visible w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] absolute">
                <Skeleton className="absolute -top-3 md:-top-6 h-6 md:h-8 w-48 ml-4 md:ml-8 z-10" />
                <Skeleton className="h-4 w-64 ml-4 md:ml-8" />
              </div>
            </div>
          )}

          <div className="relative overflow-hidden">
            {/* Mobile: Horizontal scroll container */}
            {isMobile ? (
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
                  {Array.from({ length: productsCount }).map((_, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0"
                      style={{ width: 'calc(40vw - 8px)' }}
                    >
                      <ProductCardSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Desktop: Grid */
              <div className="grid gap-2 grid-cols-6">
                {Array.from({ length: productsCount }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            )}

            {/* Navigation Arrows Skeleton - Desktop only */}
            {!isMobile && (
              <>
                <Skeleton className="absolute top-1/2 left-0 transform -translate-y-1/2 w-8 h-12 rounded-md" />
                <Skeleton className="absolute top-1/2 right-0 transform -translate-y-1/2 w-8 h-12 rounded-md" />
              </>
            )}

            {/* Pagination Dots Skeleton - Desktop only */}
            {!isMobile && (
              <div className="flex justify-end mt-4 space-x-2 pr-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="w-3 h-3 rounded-full" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
