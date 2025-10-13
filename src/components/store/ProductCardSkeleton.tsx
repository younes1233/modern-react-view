
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="group border border-gray-200 bg-white relative overflow-hidden h-full">
      <div className="relative overflow-hidden bg-white">
        {/* Product Image Skeleton - Must match ProductCard aspect-[1/1] for no layout shift */}
        <div className="aspect-[1/1] bg-white overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        
        {/* Badges Skeleton */}
        <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1">
          <Skeleton className="h-5 w-12 rounded" />
        </div>

        {/* Wishlist button Skeleton */}
        <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1">
          <Skeleton className="w-7 h-7 md:w-6 md:h-6 rounded" />
        </div>
      </div>

      <CardContent className="p-3 flex flex-col flex-1">
        {/* Product Title & Rating - matches ProductCard h-10 height */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 h-10">
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
            <Skeleton className="h-4 w-12 flex-shrink-0" />
          </div>
        </div>

        {/* Price & Express - matches ProductCard space-y-2 mt-auto pt-2 */}
        <div className="space-y-2 mt-auto pt-2">
          {/* Price Section */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>

          {/* Express + Cart */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="w-9 h-9 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
