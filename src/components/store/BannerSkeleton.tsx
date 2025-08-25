
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

export const BannerSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <AspectRatio ratio={4/1}>
          <div className="relative w-full h-full">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-8">
              <div className="max-w-lg space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </AspectRatio>
      </CardContent>
    </Card>
  );
};
