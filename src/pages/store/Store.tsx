import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopByCategory } from "@/components/store/ShopByCategory";
import { ProductSection } from "@/components/store/ProductSection";
import { StoriesRing } from "@/components/store/StoriesRing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, Heart, ShoppingCart, ShoppingBag, Zap, Shield, Truck, AlertCircle, RefreshCw, Wifi } from "lucide-react";
import { useBanners, Banner } from "@/hooks/useBanners";
import { useProductListings } from "@/hooks/useProductListings";
import { useHomeSections } from "@/hooks/useHomeSections";
import { useStoreHeroes } from "@/hooks/useStoreHeroes";
import { useSaleProducts } from "@/hooks/useProducts";
import { HeroSkeleton } from "@/components/store/HeroSkeleton";
import { BannerSkeleton } from "@/components/store/BannerSkeleton";
import { ShopByCategorySkeleton } from "@/components/store/ShopByCategorySkeleton";
import { ProductSectionSkeleton } from "@/components/store/ProductSectionSkeleton";
import { useResponsiveImage } from "@/contexts/ResponsiveImageContext";
import { useCountryCurrency } from "@/contexts/CountryCurrencyContext";

const Store = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visibleSections, setVisibleSections] = useState(new Set<number>());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const scrollRestoredRef = useRef(false);
  const location = useLocation();
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const { selectedCountry, selectedCurrency } = useCountryCurrency();
  const { banners, isLoading: bannersLoading, error: bannersError, refetch: refetchBanners } = useBanners();
  const { productListings, isLoading: productListingsLoading, error: productListingsError, refetch: refetchProductListings } = useProductListings();
  const { data: homeSections = [], isLoading: homeSectionsLoading, error: homeSectionsError, refetch: refetchHomeSections } = useHomeSections();
  const { data: heroes = [], isLoading: heroesLoading, error: heroesError, refetch: refetchHeroes } = useStoreHeroes();
  const { deviceType } = useResponsiveImage();
  
  // Use real API for sale products with selected country and currency
  const { data: saleProducts = [], isLoading: saleProductsLoading, error: saleProductsError, refetch: refetchSaleProducts } = useSaleProducts(
    selectedCountry?.id || 1, 
    selectedCurrency?.id || 1
  );

  // console.log('Store: Heroes data:', heroes);
  // console.log('Store: Heroes loading state:', heroesLoading);

  // Memoize hero slides calculation to prevent unnecessary recalculations
  const slides = useMemo(() => {
    if (!heroes?.length) return [];
    
    const sliderHero = heroes.find(hero => hero.type === 'slider');
    const singleHeroes = heroes.filter(hero => hero.type === 'single') || [];
    
    return sliderHero?.slides?.length > 0 
      ? sliderHero.slides 
      : singleHeroes;
  }, [heroes]);
  
  // console.log('Store: Final slides array:', slides);
  
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

  const currentSlide = useMemo(() => slides[currentSlideIndex], [slides, currentSlideIndex]);
  
  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);
  
  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);
  
  const goToSlide = useCallback((index: number) => {
    setCurrentSlideIndex(index);
  }, []);

  // Unified loading state for smooth transitions - only consider essential data
  const isGlobalLoading = homeSectionsLoading; // Only wait for sections structure, not individual content
  
  // Check for critical errors that would break the store experience
  const hasCriticalErrors = homeSectionsError || heroesError;
  const hasDataErrors = bannersError || productListingsError || saleProductsError;

  // Error components
  const NetworkErrorComponent = ({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 rounded-lg mx-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      <Button onClick={onRetry} className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );

  const EmptyStateComponent = ({ title, message }: { title: string; message: string }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <ShoppingBag className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md">{message}</p>
    </div>
  );

  const OfflineComponent = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-amber-50 rounded-lg mx-4">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
        <Wifi className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">You're Offline</h3>
      <p className="text-gray-600 mb-6 max-w-md">
        Please check your internet connection. Some content may not be available while offline.
      </p>
      <div className="text-sm text-amber-600 bg-amber-100 px-4 py-2 rounded-full">
        Reconnecting automatically when online...
      </div>
    </div>
  );

  // Enhanced scroll restoration with element-relative positioning
  useEffect(() => {
    // Save scroll position when scrolling
    const handleScroll = () => {
      if (location.pathname === '/') {
        const scrollY = window.scrollY;
        
        // Find the closest section/element to current scroll position for better reference
        const sections = document.querySelectorAll('section, [data-section]');
        let closestSection = null;
        let minDistance = Infinity;
        
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          const sectionTop = scrollY + rect.top;
          const distance = Math.abs(scrollY - sectionTop);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestSection = section;
          }
        });
        
        // Save both absolute position and relative position to closest section
        sessionStorage.setItem('storeScrollPosition', scrollY.toString());
        
        if (closestSection) {
          const sectionId = closestSection.id || closestSection.className || 'unknown';
          const rect = closestSection.getBoundingClientRect();
          const relativeOffset = scrollY - (scrollY + rect.top);
          
          sessionStorage.setItem('storeScrollSection', sectionId);
          sessionStorage.setItem('storeScrollOffset', relativeOffset.toString());
        }
      }
    };

    // Save position immediately when clicking product links
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/product/"]');
      if (link && location.pathname === '/') {
        handleScroll(); // Use the enhanced scroll saving
        sessionStorage.setItem('shouldRestoreScroll', 'true');
      }
    };

    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('click', handleLinkClick);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [location.pathname]);

  // Restore scroll position using element-relative positioning
  useEffect(() => {
    if (location.pathname === '/' && sessionStorage.getItem('shouldRestoreScroll') === 'true') {
      const savedPosition = sessionStorage.getItem('storeScrollPosition');
      const savedSection = sessionStorage.getItem('storeScrollSection');
      const savedOffset = sessionStorage.getItem('storeScrollOffset');
      
      if (savedPosition) {
        const restoreScroll = () => {
          let targetPosition = parseInt(savedPosition, 10);
          
          // Try to use relative positioning if we have section data
          if (savedSection && savedOffset) {
            const sections = document.querySelectorAll('section, [data-section]');
            const targetSection = Array.from(sections).find(section => {
              const sectionId = section.id || section.className || 'unknown';
              return sectionId === savedSection;
            });
            
            if (targetSection) {
              const rect = targetSection.getBoundingClientRect();
              const sectionTop = window.scrollY + rect.top;
              const offset = parseInt(savedOffset, 10);
              targetPosition = sectionTop + offset;
              
              console.log('Store: Using relative positioning to section', savedSection, 'at position', targetPosition);
            }
          }
          
          window.scrollTo({ top: targetPosition, behavior: 'instant' });
          
          // Clean up
          sessionStorage.removeItem('shouldRestoreScroll');
          sessionStorage.removeItem('storeScrollSection');
          sessionStorage.removeItem('storeScrollOffset');
        };
        
        // Wait for content to render, then restore
        setTimeout(() => {
          restoreScroll();
          
          // Additional restoration after a small delay to catch any final layout adjustments
          setTimeout(restoreScroll, 200);
        }, 100);
      }
    }
  }, [location.pathname]);

  // Progressive loading with intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = parseInt(entry.target.getAttribute('data-section-id') || '0');
            if (sectionId) {
              setVisibleSections(prev => new Set([...prev, sectionId]));
            }
          }
        });
      },
      { 
        rootMargin: '100px 0px', // Start loading 100px before entering viewport
        threshold: 0.1 
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  // Memoize API product conversion to prevent unnecessary recalculations
  const convertAPIProductToLegacy = useCallback((apiProduct: any) => {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      slug: apiProduct.slug,
      description: apiProduct.short_description || '',
      price: apiProduct.pricing?.price || 0,
      originalPrice: apiProduct.pricing?.original_price,
      currency: apiProduct.pricing?.currency,
      category: 'general',
      image: apiProduct.cover_image?.desktop || apiProduct.cover_image?.mobile || '/placeholder.svg',
      inStock: apiProduct.has_variants ? true : (apiProduct.stock > 0),
      rating: apiProduct.rating?.average || 0,
      reviews: apiProduct.rating?.count || 0,
      isFeatured: apiProduct.flags?.is_featured || false,
      isNewArrival: apiProduct.flags?.is_new_arrival || false,
      isOnSale: apiProduct.flags?.on_sale || false,
      sku: apiProduct.sku || '',
      thumbnails: [],
      has_variants: apiProduct.has_variants || false,
      variants_count: apiProduct.variants_count || 0,
      variations: apiProduct.variations || []
    };
  }, []);

  const getSectionContent = useCallback((section: any) => {
    if (!section.is_active) return null;

    // Only use progressive loading on FIRST render when core data is still loading
    // If data is cached (homeSections loaded), show content immediately
    const shouldUseProgressiveLoading = homeSectionsLoading; // Only wait for sections structure
    const isVisible = visibleSections.has(section.id) || !shouldUseProgressiveLoading;
    
    if (!isVisible && shouldUseProgressiveLoading) {
      return (
        <div 
          key={section.id}
          data-section-id={section.id}
          ref={(el) => {
            if (el && observerRef.current) {
              observerRef.current.observe(el);
            }
          }}
          className="min-h-[200px] bg-gray-50 animate-pulse"
        />
      );
    }

    if (section.type === 'banner') {
      // Show skeleton only if banners are actually loading
      if (bannersLoading) {
        return <BannerSkeleton key={`banner-skeleton-${section.id}`} />;
      }

      // Show error if banners failed to load
      if (bannersError) {
        return (
          <div key={section.id} className="py-8">
            <NetworkErrorComponent
              title="Banner Unavailable"
              message="Unable to load promotional content."
              onRetry={refetchBanners}
            />
          </div>
        );
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
            <div className="relative overflow-hidden shadow-lg bg-white" style={{ aspectRatio: '4/1' }}>
              <img
                src={bannerImage}
                alt={banner.images?.alt || banner.title}
                className="w-full transition-all duration-300"
                style={{ height: 'auto', objectFit: 'cover' }}
                loading="lazy"
                decoding="async"
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
      // Show skeleton only if product listings are actually loading
      if (productListingsLoading) {
        return <ProductSectionSkeleton key={`product-skeleton-${section.id}`} />;
      }

      // Show error if product listings failed to load
      if (productListingsError) {
        return (
          <div key={section.id} className="py-8">
            <NetworkErrorComponent
              title="Products Unavailable"
              message="Unable to load product listings."
              onRetry={refetchProductListings}
            />
          </div>
        );
      }

      const listing = productListings.find((l) => l.id === section.item_id && l.is_active) || section.item;
      if (!listing) {
        return (
          <div key={section.id} className="py-8">
            <EmptyStateComponent
              title="No Products Available"
              message="This product section is currently empty. Check back soon for new items!"
            />
          </div>
        );
      }

      return (
        <section key={section.id} className="py-1 md:py-2 bg-white animate-fade-in">
          <ProductSection listing={listing} disableIndividualLoading />
        </section>
      );
    }
    return null;
  }, [isGlobalLoading, homeSectionsLoading, banners, productListings, deviceType, visibleSections]);

  // Memoize filtered and sorted sections to prevent unnecessary processing
  const activeSortedSections = useMemo(() => {
    return homeSections
      .filter(section => section.is_active)
      .sort((a, b) => a.order - b.order);
  }, [homeSections]);

  // Memoize converted sale products
  const convertedSaleProducts = useMemo(() => {
    return saleProducts.map(convertAPIProductToLegacy);
  }, [saleProducts, convertAPIProductToLegacy]);

  // console.log('Store: Home sections from API:', homeSections);
  // console.log('Store: Product listings from API:', productListings);
  // console.log('Store: Banners from API:', banners);

  // Handle critical errors that would break the entire store experience
  if (hasCriticalErrors) {
    return (
      <div className="min-h-screen bg-white light overflow-x-hidden" data-store-page>
        <StoreLayout>
          <div className="min-h-screen flex items-center justify-center">
            {isOffline ? (
              <OfflineComponent />
            ) : (
              <NetworkErrorComponent
                title="Store Temporarily Unavailable"
                message="We're experiencing technical difficulties loading the store. Please check your internet connection and try again."
                onRetry={() => {
                  refetchHomeSections();
                  refetchHeroes();
                }}
              />
            )}
          </div>
        </StoreLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white light overflow-x-hidden" data-store-page>
      <StoreLayout>
        {/* Offline indicator banner */}
        {isOffline && (
          <div className="bg-amber-100 border-l-4 border-amber-500 p-4 text-amber-700 text-center">
            <div className="flex items-center justify-center gap-2">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">
                You're offline. Some content may not be available.
              </span>
            </div>
          </div>
        )}
  {/* Hero Section (auto height, image contained) */}
{heroesLoading ? (
  <HeroSkeleton />
) : heroesError && slides.length === 0 ? (
  <div className="py-16">
    <NetworkErrorComponent
      title="Featured Content Unavailable"
      message="Unable to load featured content. Please try refreshing the page."
      onRetry={refetchHeroes}
    />
  </div>
) : (
  currentSlide && (
    <section
      className="relative w-full overflow-hidden z-10 flex justify-center items-center bg-white"
      style={{
        // no fixed height — section will match image height
        maxHeight: deviceType === 'mobile' ? 'auto' : 'none',
      }}
    >
      {/* SINGLE IMAGE — contained, centered */}
      <img
        src={currentSlide.image_url || "/placeholder.svg"}
        alt="Hero Background"
        className="max-w-full h-auto object-contain transition-opacity duration-500"
        style={{ objectPosition: "center center" }}
        loading="eager"
        decoding="async"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg";
        }}
      />



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
              {activeSortedSections.map((section) => getSectionContent(section))}
            </div>
          )}
        </div>

        {/* Fallback Best Sellers if no sections are configured or handle empty state */}
        {!isGlobalLoading && activeSortedSections.length === 0 && !homeSectionsError && (
          <section className="py-8 md:py-16 bg-white overflow-hidden">
            <div className="w-full max-w-full px-2 md:px-4">
              <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                  <div className="bg-cyan-500 text-white px-6 py-2 rounded-t-lg inline-block">
                    <h2 className="text-2xl lg:text-3xl font-bold">Sale Products</h2>
                  </div>
                </div>
                {saleProductsLoading ? (
                  <ProductSectionSkeleton />
                ) : saleProductsError ? (
                  <NetworkErrorComponent
                    title="Products Unavailable"
                    message="Unable to load sale products. Please try again."
                    onRetry={refetchSaleProducts}
                  />
                ) : convertedSaleProducts.length === 0 ? (
                  <EmptyStateComponent
                    title="No Sale Products"
                    message="Check back soon for exciting deals and discounts!"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {convertedSaleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}

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

        {/* Show error message when sections fail to load and no fallback */}
        {!isGlobalLoading && activeSortedSections.length === 0 && homeSectionsError && (
          <div className="py-16">
            <NetworkErrorComponent
              title="Store Content Unavailable"
              message="We're having trouble loading store content. Please check your connection and try again."
              onRetry={refetchHomeSections}
            />
          </div>
        )}
      </StoreLayout>
    </div>
  );
};

export default Store;
