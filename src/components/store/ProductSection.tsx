
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowRight, ShoppingCart, Heart } from "lucide-react";
import { useResponsiveImage } from "@/contexts/ResponsiveImageContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { bannerService, BannerImages } from "@/services/bannerService";

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  images: BannerImages;
  ctaText?: string;
  ctaLink?: string;
  position: string;
  isActive: boolean;
  order: number;
}

interface ProductSectionProps {
  title: string;
  products: any[];
  showViewAll?: boolean;
  onViewAll?: () => void;
  position?: 'hero' | 'secondary' | 'sidebar';
}

export const ProductSection = ({ 
  title, 
  products, 
  showViewAll = false, 
  onViewAll,
  position = 'secondary'
}: ProductSectionProps) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const { getResponsiveImage } = useResponsiveImage();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerService.getBanners();
        if (response.error) {
          console.error("Failed to fetch banners:", response.message);
          return;
        }
        const filteredBanners = response.details.banners
          .filter((banner: any) => banner.position === position && banner.is_active)
          .sort((a: any, b: any) => a.order - b.order)
          .map((apiBanner: any) => ({
            id: apiBanner.id,
            title: apiBanner.title,
            subtitle: apiBanner.subtitle,
            images: apiBanner.images,
            ctaText: apiBanner.cta_text,
            ctaLink: apiBanner.cta_link,
            position: apiBanner.position,
            isActive: Boolean(apiBanner.is_active),
            order: apiBanner.order,
          }));
        setBanners(filteredBanners as Banner[]);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }
    };

    fetchBanners();
  }, [position]);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast({
      title: "Success",
      description: `${product.name} added to cart.`,
    });
  };

  const handleAddToWishlist = (product: any) => {
    addToWishlist(product);
    toast({
      title: "Success",
      description: `${product.name} added to wishlist.`,
    });
  };

  const renderBanner = (banner: Banner) => (
    <Card key={banner.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        <AspectRatio ratio={4/1}>
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={getResponsiveImage(banner.images)}
              alt={banner.images.alt || banner.title}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-8">
              <div className="max-w-lg">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-white/90 text-lg mb-4 line-clamp-2">
                    {banner.subtitle}
                  </p>
                )}
                {banner.ctaText && (
                  <Button 
                    variant="secondary" 
                    className="bg-white text-gray-900 hover:bg-white/90 font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (banner.ctaLink) {
                        window.open(banner.ctaLink, '_blank');
                      }
                    }}
                  >
                    {banner.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </AspectRatio>
      </CardContent>
    </Card>
  );

  const renderProduct = (product: any) => (
    <Card key={product.id} className="overflow-hidden group cursor-pointer">
      <CardContent className="p-4">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md mb-4 transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="absolute top-2 left-2 z-10">{product.category}</Badge>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            ${product.price}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleAddToWishlist(product)}
            >
              <Heart 
                className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
            <Button variant="default" size="sm" onClick={() => handleAddToCart(product)}>
              Add to Cart
              <ShoppingCart className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Render banners first */}
      {banners.length > 0 && (
        <div className="space-y-4">
          {banners.map(renderBanner)}
        </div>
      )}

      {/* Section header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {showViewAll && onViewAll && (
          <Button 
            variant="outline" 
            onClick={onViewAll}
            className="flex items-center gap-2"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.slice(0, 8).map(renderProduct)}
      </div>
    </div>
  );
};
