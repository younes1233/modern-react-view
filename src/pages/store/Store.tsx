import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopByCategory } from "@/components/store/ShopByCategory";
import { ProductSection } from "@/components/store/ProductSection";
import { StoriesRing } from "@/components/store/StoriesRing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, Heart, ShoppingCart, Zap, Shield, Truck } from "lucide-react";
import {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductsOnSale,
} from "@/data/storeData";
import { useBanners, Banner } from "@/hooks/useBanners";
import { useProductListings } from "@/hooks/useProductListings";
import { useHomeSections } from "@/hooks/useHomeSections";
import { useStoreHeroes } from "@/hooks/useStoreHeroes";
import { HeroSkeleton } from "@/components/store/HeroSkeleton";
import { BannerSkeleton } from "@/components/store/BannerSkeleton";
import { ShopByCategorySkeleton } from "@/components/store/ShopByCategorySkeleton";
import { ProductSectionSkeleton } from "@/components/store/ProductSectionSkeleton";
import { useResponsiveImage } from "@/contexts/ResponsiveImageContext";

const Store = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const { banners, isLoading: bannersLoading } = useBanners();
  const { productListings, isLoading: productListingsLoading } = useProductListings();
  const { data: homeSections = [], isLoading: homeSectionsLoading } = useHomeSections();
  const { data: heroes = [], isLoading: heroesLoading } = useStoreHeroes();
  const { deviceType } = useResponsiveImage();

  console.log('Store: Heroes data:', heroes);
  console.log('Store: Heroes loading state:', heroesLoading);

  // Handle hero carousel for different types
  const sliderHero = heroes?.find(hero => hero.type === 'slider');
  const singleHeroes = heroes?.filter(hero => hero.type === 'single') || [];
  
  // Use slider slides if available, otherwise use single heroes
  const slides = sliderHero?.slides?.length > 0 
    ? sliderHero.slides 
    : singleHeroes;
  
  console.log('Store: Final slides array:', slides);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Auto-slide functionality
  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      }, 5000); // Change slide every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  const currentSlide = slides[currentSlideIndex];
  
  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };
  
  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };
  
  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  // Unified loading state for smooth transitions
  const isGlobalLoading = bannersLoading || productListingsLoading || homeSectionsLoading;


  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const products = getProducts();
  const bestSellers = getProductsOnSale();

  const getSectionContent = (section: any) => {
    if (!section.is_active) return null;

    if (section.type === 'banner') {
      // Use unified loading state for consistent behavior
      if (isGlobalLoading) {
        return <BannerSkeleton key={`banner-skeleton-${section.id}`} />;
      }

      // Find banner by ID and check if it's active using the correct property name
      const banner = banners.find((b) => b.id === section.item_id && b.isActive);
      if (!banner) return null;
      
      // Get the responsive image based on device type
      let bannerImage = '/placeholder.svg';
      if (banner.images?.urls?.banner) {
        bannerImage = banner.images.urls.banner[deviceType] || 
                     banner.images.urls.banner.desktop || 
                     banner.images.urls.original || 
                     '/placeholder.svg';
      }
      
      console.log('Banner found:', banner);
      console.log('Device type:', deviceType);
      console.log('Selected image URL:', bannerImage);
      
      return (
        <section key={section.id} className="py-1 md:py-2 bg-white animate-fade-in">
          <div className="w-full max-w-full overflow-hidden bg-white">
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white" style={{ aspectRatio: '4/1' }}>
              <img
                src={bannerImage}
                alt={banner.images?.alt || banner.title}
                className="w-full transition-all duration-300"
                style={{ height: 'auto', objectFit: 'cover' }}
                onError={(e) => {
                  console.error('Failed to load banner image:', bannerImage);
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 from-black/50 to-transparent flex items-center">
                <div className="p-3 sm:p-4 md:p-8 text-white">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold mb-1 sm:mb-2">{banner.title}</h2>
                  {banner.subtitle && (
                    <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4 opacity-90">{banner.subtitle}</p>
                  )}
                  {banner.ctaText && banner.ctaLink && (
                    <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full text-sm md:text-base transition-all duration-200 hover-scale">
                      {banner.ctaText}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    } else if (section.type === 'productListing') {
      // Use unified loading state for consistent behavior
      if (isGlobalLoading) {
        return <ProductSectionSkeleton key={`product-skeleton-${section.id}`} />;
      }

      const listing = productListings.find((l) => l.id === section.item_id && l.is_active) || section.item;
      if (!listing) return null;
      
      const convertedListing = {
        id: listing.id,
        title: listing.title,
        subtitle: listing.subtitle,
        type: listing.type,
        maxProducts: listing.max_products || listing.maxProducts,
        layout: listing.layout,
        showTitle: listing.show_title !== undefined ? listing.show_title : listing.showTitle,
        isActive: listing.is_active !== undefined ? listing.is_active : listing.isActive,
        order: listing.order
      };
      
      return (
        <section key={section.id} className="py-1 md:py-2 bg-white animate-fade-in">
          <ProductSection listing={convertedListing} disableIndividualLoading />
        </section>
      );
    }
    return null;
  };

  console.log('Store: Home sections from API:', homeSections);
  console.log('Store: Product listings from API:', productListings);
  console.log('Store: Banners from API:', banners);

  return (
    <div className="min-h-screen bg-white light overflow-x-hidden" data-store-page>
      <StoreLayout>
        {/* Hero Section with Loading - Reduced height on mobile */}
        {heroesLoading ? (
          <HeroSkeleton />
        ) : (
          currentSlide && (
            <section className="relative w-full overflow-hidden z-10" style={{
              height: deviceType === 'mobile' ? '300px' : '360px', // Much smaller: 768x300 mobile, 1920x360 desktop
              minHeight: deviceType === 'mobile' ? '300px' : '360px',
              maxHeight: deviceType === 'mobile' ? '300px' : '360px'
            }}>
              <div className="absolute inset-0">
                <img
                  src={currentSlide.image_url || "/placeholder.svg"}
                  alt="Hero Background"
                  className="w-full h-full object-cover transition-opacity duration-500"
                  style={{
                    objectPosition: 'center center',
                    transform: 'scale(1.02)',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
              </div>

              {/* Navigation arrows for multiple slides */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
                  >
                    <ArrowRight className="h-6 w-6 text-white rotate-180" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
                  >
                    <ArrowRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}

              <div className="relative z-20 h-full flex items-center rounded-md mx-0">
                <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                  {/* Left side: title + subtitle */}
                  <div className="max-w-2xl text-white">
                    <div className="inline-block bg-cyan-500/20 backdrop-blur-sm text-cyan-200 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm font-medium mb-2 sm:mb-3 md:mb-4">
                      ✨ Premium Quality
                    </div>
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-2 sm:mb-3 md:mb-4">
                      {currentSlide.title}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed mb-3 sm:mb-4 md:mb-6 max-w-xl">
                      {currentSlide.subtitle}
                    </p>
                  </div>

                  {/* Bottom right: button + contact info with small left margin */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3 md:mt-0 ml-0 md:ml-6 self-end">
                    {currentSlide.cta_text && currentSlide.cta_link && (
                      <Button
                        size="lg"
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base font-semibold shadow-xl"
                        onClick={() => window.open(currentSlide.cta_link, '_blank')}
                      >
                        {currentSlide.cta_text}
                      </Button>
                    )}
                    <div className="text-left">
                      <div className="text-sm sm:text-base md:text-lg font-bold text-white">961 76591765</div>
                      <div className="text-xs sm:text-sm text-gray-300">WWW.MEEMHOME.COM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide indicators */}
              {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentSlideIndex
                          ? 'bg-white'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        )}

        {/* Stories Ring */}
        <StoriesRing />

        {/* Shop by Category with Loading */}
        <div className="w-full overflow-hidden">
          {isGlobalLoading ? (
            <ShopByCategorySkeleton />
          ) : (
            <div className="animate-fade-in">
              <ShopByCategory />
            </div>
          )}
        </div>

        {/* Dynamic Home Sections from API with Loading */}
        <div className="w-full overflow-hidden bg-white">
          {isGlobalLoading ? (
            // Show skeleton sections while loading
            <div className="animate-fade-in">
              <BannerSkeleton />
              <ProductSectionSkeleton />
              <BannerSkeleton />
            </div>
          ) : (
            <div className="animate-fade-in">
              {homeSections
                .filter(section => section.is_active)
                .sort((a, b) => a.order - b.order)
                .map((section) => getSectionContent(section))}
            </div>
          )}
        </div>

        {/* Fallback Best Sellers if no sections are configured */}
        {!isGlobalLoading && homeSections.filter(s => s.is_active).length === 0 && (
          <section className="py-8 md:py-16 bg-white overflow-hidden">
            <div className="w-full max-w-full px-2 md:px-4">
              <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                  <div className="bg-cyan-500 text-white px-6 py-2 rounded-t-lg inline-block">
                    <h2 className="text-2xl lg:text-3xl font-bold">Electronic</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {bestSellers.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination dots */}
                <div className="flex justify-center mt-8 space-x-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </section>
        )}
      </StoreLayout>
    </div>
  );
};

export default Store;
