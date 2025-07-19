
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="group border border-gray-200 bg-white relative overflow-hidden h-full">
      <div className="relative overflow-hidden bg-white">
        {/* Product Image Skeleton */}
        <div className="aspect-[4/6] md:aspect-[4/5] bg-white overflow-hidden">
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

      <CardContent className="p-3 md:p-4 flex flex-col justify-between flex-1">
        <div className="space-y-1 md:space-y-1.5 flex-1">
          {/* Product Name Skeleton */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>

          {/* Price Section Skeleton */}
          <div className="flex items-center gap-1 md:gap-1.5 mb-1 md:mb-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-10" />
          </div>

          {/* Bottom Section Skeleton */}
          <div className="flex items-center justify-between mt-auto">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
