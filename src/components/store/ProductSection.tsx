
import { useState, useEffect } from "react";
import { ProductListing, getProductsForListing } from "@/data/storeData";
import { ProductCard } from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductSectionProps {
  listing: ProductListing;
}

export function ProductSection({ listing }: ProductSectionProps) {
  const [products, setProducts] = useState(() => getProductsForListing(listing));
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const refreshProducts = () => {
      console.log("Refreshing products for listing:", listing.title);
      setProducts(getProductsForListing(listing));
    };

    refreshProducts();

    // Listen for data updates
    const handleDataUpdate = () => {
      refreshProducts();
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

  const productsPerSlide = 6;
  const totalSlides = Math.ceil(products.length / productsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const startIndex = currentSlide * productsPerSlide;
  const visibleProducts = products.slice(startIndex, startIndex + productsPerSlide);

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        {/* Header Section - Light Blue Background */}
        {listing.showTitle && (
          <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg mb-8 p-6">
            <h2 className="text-4xl font-bold text-cyan-600 mb-2">
              {listing.title}
            </h2>
            {listing.subtitle && (
              <p className="text-gray-600 text-lg">
                {listing.subtitle}
              </p>
            )}
          </div>
        )}

        <div className="relative">
          {/* Product Grid - Exactly 6 products per slide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Navigation Arrows - Rectangular buttons */}
          {totalSlides > 1 && (
            <>
              <Button
                variant="outline"
                onClick={prevSlide}
                className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-8 h-16 bg-white shadow-lg hover:bg-gray-50 border border-gray-300 rounded-md hidden lg:flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                onClick={nextSlide}
                className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-16 bg-white shadow-lg hover:bg-gray-50 border border-gray-300 rounded-md hidden lg:flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Button>
            </>
          )}

          {/* Pagination dots */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentSlide ? 'bg-cyan-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
