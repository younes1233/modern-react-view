
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { StoreLayout } from './StoreLayout';

export function ProductDetailSkeleton() {
  return (
    <StoreLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Breadcrumb Skeleton */}
          <div className="lg:hidden px-4 py-2 border-b border-gray-100">
            <div className="flex items-center space-x-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          {/* Desktop Breadcrumb Skeleton */}
          <div className="hidden lg:block px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-16" />
              <span>/</span>
              <Skeleton className="h-4 w-20" />
              <span>/</span>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:px-4 sm:lg:px-6 lg:lg:px-8">
            {/* Product Images Skeleton */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              {/* Main Image Skeleton */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden lg:rounded-2xl">
                <Skeleton className="w-full h-full" />
                
                {/* Mobile badges */}
                <div className="lg:hidden absolute top-4 left-4">
                  <Skeleton className="h-6 w-16 rounded" />
                </div>

                {/* Mobile action buttons */}
                <div className="lg:hidden absolute top-4 right-4 flex items-center space-x-1">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <Skeleton className="w-9 h-9 rounded-full" />
                </div>

                {/* Pagination dots */}
                <div className="lg:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="w-1.5 h-1.5 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Thumbnails Skeleton */}
              <div className="hidden lg:block mt-4">
                <div className="flex gap-3 pb-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-16 h-16 rounded-lg flex-shrink-0" />
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="px-4 py-6 lg:px-0 lg:py-0 space-y-6">
              {/* Badges Skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-12 rounded" />
                </div>
                <div className="hidden lg:flex items-center space-x-2">
                  <Skeleton className="w-8 h-8 rounded" />
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </div>

              {/* Product Title Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </div>
              
              {/* Rating Skeleton */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-4 h-4" />
                  ))}
                </div>
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Price Skeleton */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-3">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-5 w-12 rounded" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Stock Status Skeleton */}
              <div className="hidden lg:block">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              {/* SKU Skeleton */}
              <Skeleton className="h-4 w-24" />

              {/* Quantity & Actions Skeleton */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
                <Skeleton className="w-full h-14 rounded-xl" />
              </div>

              {/* Features Skeleton */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details Tabs Skeleton */}
          <div className="mt-8 lg:mt-12 px-4 sm:px-6 lg:px-8 pb-8">
            <div className="w-full">
              <div className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-xl mb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 rounded-lg" />
                ))}
              </div>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
