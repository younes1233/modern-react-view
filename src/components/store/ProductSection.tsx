
import { useState, useEffect } from "react";
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
    maxProducts: number;
    layout: string;
    showTitle: boolean;
    isActive: boolean;
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
  meta: {
    seo_title: string;
    seo_description: string;
    created_at: string;
    updated_at: string;
  };
}

export function ProductSection({ listing, disableIndividualLoading = false }: ProductSectionProps) {
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
  
  console.log(`ProductSection for "${listing.title}":`, {
    listing,
    listingData,
    isLoading,
    error
  });

  // Convert new API product to legacy format for ProductCard
  const convertNewAPIProductToLegacy = (apiProduct: NewProductAPI) => {
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
      inStock: apiProduct.stock > 0,
      variations: []
    };
  };

  // Ensure apiProducts is always an array, even if API call fails
  const apiProducts = Array.isArray(listingData?.products) ? listingData.products : [];
  const products = apiProducts.map(convertNewAPIProductToLegacy);

  if (!listing.isActive) {
    return null;
  }

  if (isLoading && !disableIndividualLoading) {
    return <ProductSectionSkeleton showTitle={listing.showTitle} isMobile={isMobile} />;
  }

  if (error || products.length === 0) {
    console.log(`ProductSection "${listing.title}" not showing: error=${error}, products=${products.length}`);
    return null;
  }

  // Desktop slider configuration
  const productsPerSlide = 6;
  const totalSlides = Math.ceil(products.length / productsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <section className="py-2 md:py-4 bg-white overflow-hidden animate-fade-in transition-all duration-300">
      <div className="w-full max-w-full px-2 md:px-4">
        <div className="mx-auto">
          {/* Header Section */}
          {listing.showTitle && (
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
            {/* Mobile: Horizontal scroll container */}
            {isMobile ? (
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
              /* Desktop: Slider with navigation */
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
            )}

            {/* Navigation Arrows - Desktop only */}
            {!isMobile && totalSlides > 1 && (
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

            {/* Modern Pagination Dots - Desktop only */}
            {!isMobile && totalSlides > 1 && (
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
