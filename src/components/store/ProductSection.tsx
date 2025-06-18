
import { useState, useEffect } from "react";
import { ProductListing, getProductsForListing } from "@/data/storeData";
import { ProductCard } from "./ProductCard";

interface ProductSectionProps {
  listing: ProductListing;
}

export function ProductSection({ listing }: ProductSectionProps) {
  const [products, setProducts] = useState(() => getProductsForListing(listing));

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

  return (
    <section className="py-8 lg:py-12">
      {listing.showTitle && (
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
            {listing.title}
          </h2>
          {listing.subtitle && (
            <p className="text-gray-600 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
              {listing.subtitle}
            </p>
          )}
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
        </div>
      )}

      {listing.layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 sm:gap-6 pb-4" style={{ width: 'max-content' }}>
              {products.map((product) => (
                <div key={product.id} className="w-64 sm:w-72 flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
          {/* Scroll indicators */}
          <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full shadow-lg p-2 hidden lg:block">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full shadow-lg p-2 hidden lg:block">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}
    </section>
  );
}
