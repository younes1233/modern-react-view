
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
    <section className="py-8 lg:py-12 bg-white">
      {listing.showTitle && (
        <div className="mb-8">
          <div className="bg-cyan-500 text-white px-6 py-3 rounded-t-lg inline-block">
            <h2 className="text-2xl lg:text-3xl font-bold">
              {listing.title}
            </h2>
          </div>
          {listing.subtitle && (
            <p className="text-gray-600 text-lg mt-4 max-w-2xl">
              {listing.subtitle}
            </p>
          )}
        </div>
      )}

      {listing.layout === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {/* Pagination dots like in the image */}
          <div className="flex justify-center mt-8 space-x-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </>
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
          {/* Navigation arrows */}
          <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full shadow-lg p-2 hidden lg:block cursor-pointer hover:bg-gray-50">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full shadow-lg p-2 hidden lg:block cursor-pointer hover:bg-gray-50">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}
    </section>
  );
}
