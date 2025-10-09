
import { useState, useEffect, useMemo, useCallback } from "react";
import { useProductListingProducts } from "@/hooks/useProductListings";
import { ProductCard } from "./ProductCard";
import { ProductSectionSkeleton } from "./ProductSectionSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResponsiveImage } from "@/contexts/ResponsiveImageContext";
import { useCountryCurrency } from "@/contexts/CountryCurrencyContext";

interface ProductSectionProps {
  listing: {
    id: number;
    title: string;
    subtitle?: string;
    type: string;
    max_products: number;
    layout: string;
    show_title: boolean;
    is_active: boolean;
    order: number;
  };
  disableIndividualLoading?: boolean;
}

// New API product interface based on the provided format
interface NewProductAPI {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  cover_image: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  flags: {
    on_sale: boolean;
    is_featured: boolean;
    is_new_arrival: boolean;
    is_best_seller: boolean;
    is_vat_exempt: boolean;
    seller_product_status: string;
  };
  pricing: {
    original_price: number;
    price: number;
    currency_id: number;
    currency: {
      code: string;
      symbol: string;
    };
    applied_discounts: Array<{
      label: string;
      type: string;
      value: string;
      amount_value: number;
      max_discount: number | null;
      scope: string;
    }>;
    vat: {
      rate: number;
      amount: number;
    };
  };
  stock: number;
  rating: {
    average: number;
    count: number;
  };
  variants_count: number;
  has_variants: boolean;
  variations?: any[];
  meta: {
    seo_title: string;
    seo_description: string;
    created_at: string;
    updated_at: string;
  };
}

export function ProductSection({ listing, disableIndividualLoading = false }: ProductSectionProps) {
  // All hooks must be called at the top level, before any conditional returns
  const [currentSlide, setCurrentSlide] = useState(0);
  const isMobile = useIsMobile();
  const { getImageUrl } = useResponsiveImage();
  const { selectedCountry, selectedCurrency } = useCountryCurrency();

  // Use the API to get products for this listing with selected country and currency
  const { data: listingData, isLoading, error } = useProductListingProducts(
    listing.id,
    selectedCountry?.id || 1,
    selectedCurrency?.id || 1
  );

  // Memoized product conversion function
  const convertNewAPIProductToLegacy = useCallback((apiProduct: NewProductAPI) => {
    // Get responsive image using the responsive image context
    const responsiveImage = getImageUrl(apiProduct.cover_image);

    return {
      id: apiProduct.id,
      name: apiProduct.name,
      slug: apiProduct.slug,
      image: responsiveImage, // Use responsive image selection
      price: apiProduct.pricing.price,
      originalPrice: apiProduct.pricing.original_price,
      currency: apiProduct.pricing.currency,
      category: 'general', // Default category since not provided in new format
      rating: apiProduct.rating.average,
      reviews: apiProduct.rating.count,
      isOnSale: apiProduct.flags.on_sale,
      isFeatured: apiProduct.flags.is_featured,
      isNewArrival: apiProduct.flags.is_new_arrival,
      sku: '', // Not provided in new format
      thumbnails: [], // Not provided in new format
      description: apiProduct.short_description,
      stock: apiProduct.stock,
      isAvailable: apiProduct.stock > 0,
      inStock: apiProduct.has_variants ? true : apiProduct.stock > 0, // Products with variants are always considered in stock; stock is checked at variant level
      has_variants: apiProduct.has_variants,
      variants_count: apiProduct.variants_count,
      variations: apiProduct.variations || []
    };
  }, [getImageUrl]);

  // Memoized products processing - pass raw API data directly to ProductCard
  const products = useMemo(() => {
    // Ensure apiProducts is always an array, even if API call fails
    const apiProducts = Array.isArray(listingData?.products) ? listingData.products : [];

    // Respect max_products limit from listing configuration
    return apiProducts.slice(0, listing.max_products);
  }, [listingData?.products, listing.max_products]);

  // Memoized slider configuration - always called
  const sliderConfig = useMemo(() => {
    const productsPerSlide = 6;
    const totalSlides = Math.ceil(products.length / productsPerSlide);
    return { productsPerSlide, totalSlides };
  }, [products.length]);

  const { productsPerSlide, totalSlides } = sliderConfig;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((slideIndex: number) => {
    setCurrentSlide(slideIndex);
  }, []);

  console.log(`ProductSection for "${listing.title}":`, {
    listing,
    listingData,
    isLoading,
    error,
    layoutType: listing.layout,
    isGrid: listing.layout === 'grid',
    isSlider: listing.layout === 'slider'
  });

  // Early returns after all hooks are called
  if (!listing.is_active) {
    return null;
  }

  if (isLoading && !disableIndividualLoading) {
    return <ProductSectionSkeleton showTitle={listing.show_title} isMobile={isMobile} layout={listing.layout as 'grid' | 'slider'} />;
  }

  // Better error handling
  if (error) {
    console.error(`ProductSection "${listing.title}" error:`, error);
    return (
      <section className="py-2 md:py-4 bg-white">
        <div className="w-full max-w-full px-2 md:px-4">
          {listing.show_title && (
            <div className="mb-2 md:mb-4 relative">
              <div className="relative bg-gradient-to-r from-red-100 to-pink-100 pt-6 md:pt-10 overflow-visible w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] absolute">
                <h2 className="absolute -top-3 md:-top-6 text-xl md:text-3xl font-bold text-red-600 ml-4 md:ml-8 z-10">
                  {listing.title}
                </h2>
                <p className="text-red-500 text-sm md:text-base ml-4 md:ml-8">
                  Failed to load products. Please try again later.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Empty state - show skeleton instead of empty message
  if (products.length === 0) {
    console.log(`ProductSection "${listing.title}" has no products - showing skeleton`);
    return <ProductSectionSkeleton showTitle={listing.show_title} isMobile={isMobile} layout={listing.layout as 'grid' | 'slider'} />;
  }

  return (
    <section className="py-2 md:py-4 bg-white overflow-hidden animate-fade-in transition-all duration-300">
      <div className="w-full max-w-full px-2 md:px-4">
        <div className="mx-auto">
          {/* Header Section */}
          {listing.show_title && (
            <div className="mb-2 md:mb-4 relative">
              <div className="relative bg-gradient-to-r from-cyan-100 to-blue-100 pt-6 md:pt-10 overflow-visible w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] absolute">
                <h2 className="absolute -top-3 md:-top-6 text-xl md:text-3xl font-bold text-cyan-600 ml-4 md:ml-8 z-10">
                  {listing.title}
                </h2>
                {listing.subtitle && (
                  <p className="text-gray-600 text-sm md:text-base ml-4 md:ml-8">
                    {listing.subtitle}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="relative overflow-hidden">
            {/* Universal Layout - Grid or Slider for all devices */}
            {listing.layout === 'grid' ? (
              /* Grid Layout - Modern staggered design */
              <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {products.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className={`${
                      index % 3 === 1 ? 'mt-4 md:mt-6' :
                      index % 5 === 3 ? 'mt-2 md:mt-4' : ''
                    }`}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              /* Slider Layout - Responsive for all devices */
              isMobile ? (
                /* Mobile Slider: Horizontal scroll */
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
                    {products.map((product: any) => (
                      <div
                        key={product.id}
                        className="flex-shrink-0"
                        style={{ width: 'calc(40vw - 8px)' }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Desktop Slider: Slides with navigation */
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {Array.from({ length: totalSlides }).map((_, slideIndex) => {
                      const slideStartIndex = slideIndex * productsPerSlide;
                      const slideProducts = products.slice(slideStartIndex, slideStartIndex + productsPerSlide);

                      return (
                        <div
                          key={slideIndex}
                          className="w-full flex-shrink-0"
                        >
                          <div className="grid gap-2 grid-cols-6">
                            {slideProducts.map((product: any) => (
                              <ProductCard key={product.id} product={product} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}

            {/* Navigation Arrows - Desktop Slider only */}
            {!isMobile && listing.layout === 'slider' && totalSlides > 1 && (
              <>
                <Button
                  variant="outline"
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 w-8 h-12 bg-white shadow-lg hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center z-10"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </Button>
                <Button
                  variant="outline"
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 w-8 h-12 bg-white shadow-lg hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center z-10"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </Button>
              </>
            )}

            {/* Modern Pagination Dots - Desktop Slider only */}
            {!isMobile && listing.layout === 'slider' && totalSlides > 1 && (
              <div className="flex justify-end mt-4 space-x-2 pr-4">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      index === currentSlide 
                        ? 'bg-cyan-500 shadow-lg scale-110' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </section>
  );
}
