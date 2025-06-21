
import { useState, useEffect } from "react";
import { ProductListing, getProductsForListing, getDisplaySettings } from "@/data/storeData";
import { ProductCard } from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductSectionProps {
  listing: ProductListing;
}

export function ProductSection({ listing }: ProductSectionProps) {
  const [products, setProducts] = useState(() => getProductsForListing(listing));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displaySettings, setDisplaySettings] = useState(() => getDisplaySettings());
  const isMobile = useIsMobile();

  useEffect(() => {
    const refreshData = () => {
      console.log("Refreshing products for listing:", listing.title);
      setProducts(getProductsForListing(listing));
      setDisplaySettings(getDisplaySettings());
    };

    refreshData();

    // Listen for data updates
    const handleDataUpdate = () => {
      refreshData();
    };

    window.addEventListener('storeDataUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('storeDataUpdated', handleDataUpdate);
    };
  }, [listing]);

  console.log(`ProductSection for "${listing.title}" has ${products.length} products`);

  if (!listing.isActive || products.length === 0) {
    console.log(`ProductSection "${listing.title}" not showing: active=${listing.isActive}, products=${products.length}`);
    return null;
  }

  // Responsive products per slide based on settings and screen size
  const productsPerSlide = isMobile ? 2 : 6;
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

  const startIndex = currentSlide * productsPerSlide;
  const visibleProducts = products.slice(startIndex, startIndex + productsPerSlide);

  return (
    <section className="py-2 md:py-4 bg-white overflow-hidden">
      <div className="w-full max-w-full px-2 md:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          {listing.showTitle && (
            <div className="mb-2 md:mb-4 relative">
              <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-0 md:p-0 w-full">
                <h2 className="text-xl md:text-3xl font-bold text-cyan-600 mb-1 relative z-10">
                  <span className="ml-4 md:ml-8">
                    {listing.title}
                  </span>
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
            {/* Product Grid Container */}
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
                      <div className={`grid gap-1 md:gap-2 ${
                        isMobile 
                          ? 'grid-cols-2' 
                          : 'grid-cols-6'
                      }`}>
                        {slideProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            {totalSlides > 1 && (
              <>
                <Button
                  variant="outline"
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 w-6 h-10 md:w-8 md:h-12 bg-white shadow-lg hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center z-10"
                >
                  <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                </Button>
                <Button
                  variant="outline"
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 w-6 h-10 md:w-8 md:h-12 bg-white shadow-lg hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center z-10"
                >
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                </Button>
              </>
            )}

            {/* Modern Pagination Dots */}
            {totalSlides > 1 && (
              <div className="flex justify-end mt-2 md:mt-4 space-x-1 md:space-x-2 pr-4">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
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
    </section>
  );
}
