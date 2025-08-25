import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductSection } from "@/components/store/ProductSection";
import { BannerSkeleton } from "@/components/store/BannerSkeleton";
import { ArrowRight, Search } from "lucide-react";
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

const StorePage = () => {
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [secondaryBanners, setSecondaryBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getResponsiveImage } = useResponsiveImage();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBannersAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch banners
        const bannersResponse = await bannerService.getBanners();
        if (bannersResponse.error) {
          throw new Error(bannersResponse.message);
        }

        const transformedBanners = bannersResponse.details.banners.map((apiBanner: any) => ({
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

        // Separate banners by position
        setHeroBanners(transformedBanners.filter(banner => banner.position === 'hero'));
        setSecondaryBanners(transformedBanners.filter(banner => banner.position === 'secondary'));

        // Fetch products (replace with your actual product fetching logic)
        // For now, using dummy data
        const dummyProducts = [
          { id: 1, name: "Product 1", price: 25, imageUrl: "https://source.unsplash.com/400x300/?product" },
          { id: 2, name: "Product 2", price: 50, imageUrl: "https://source.unsplash.com/400x300/?clothing" },
          { id: 3, name: "Product 3", price: 75, imageUrl: "https://source.unsplash.com/400x300/?shoes" },
          { id: 4, name: "Product 4", price: 100, imageUrl: "https://source.unsplash.com/400x300/?accessories" },
          { id: 5, name: "Product 5", price: 25, imageUrl: "https://source.unsplash.com/400x300/?electronics" },
          { id: 6, name: "Product 6", price: 50, imageUrl: "https://source.unsplash.com/400x300/?books" },
          { id: 7, name: "Product 7", price: 75, imageUrl: "https://source.unsplash.com/400x300/?furniture" },
          { id: 8, name: "Product 8", price: 100, imageUrl: "https://source.unsplash.com/400x300/?toys" },
        ];
        setProducts(dummyProducts);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch banners and products';
        setError(errorMessage);
        console.error('Error fetching banners and products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBannersAndProducts();
  }, []);

  const renderHeroBanner = (banner: any) => (
    <Card key={banner.id} className="overflow-hidden group cursor-pointer">
      <CardContent className="p-0">
        <AspectRatio ratio={4/1}>
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={getResponsiveImage(banner.images)}
              alt={banner.images.alt || banner.title}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 lg:px-12">
              <div className="max-w-2xl">
                <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {banner.title}
                </h1>
                {banner.subtitle && (
                  <p className="text-white/90 text-lg lg:text-xl mb-6 leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
                {banner.ctaText && (
                  <Button 
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-white/90 font-semibold text-lg px-8 py-3"
                    onClick={() => {
                      if (banner.ctaLink) {
                        window.open(banner.ctaLink, '_blank');
                      }
                    }}
                  >
                    {banner.ctaText}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </AspectRatio>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <BannerSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <AspectRatio ratio={1}>
                  <div className="w-full h-full bg-gray-100 animate-pulse" />
                </AspectRatio>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-gray-100 animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-100 animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center text-red-600">
        <p>Error loading store data: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Banner Section */}
      {heroBanners.length > 0 ? (
        <div className="space-y-6">
          {heroBanners.map(renderHeroBanner)}
        </div>
      ) : null}

      {/* Product Section */}
      <ProductSection title="Featured Products" products={products} />

      {/* Secondary Banners Section */}
      {secondaryBanners.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Promotions & Offers
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {secondaryBanners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden group cursor-pointer">
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
                              onClick={() => {
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
            ))}
          </div>
        </div>
      ) : null}

      {/* More Product Sections can be added here */}
    </div>
  );
};

export default StorePage;
