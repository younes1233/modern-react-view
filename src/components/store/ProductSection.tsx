
import { ProductListing, getProductsForListing } from "@/data/storeData";
import { ProductCard } from "./ProductCard";

interface ProductSectionProps {
  listing: ProductListing;
}

export function ProductSection({ listing }: ProductSectionProps) {
  const products = getProductsForListing(listing);

  if (!listing.isActive || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      {listing.showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {listing.title}
          </h2>
          {listing.subtitle && (
            <p className="text-gray-600 text-lg">
              {listing.subtitle}
            </p>
          )}
        </div>
      )}

      {listing.layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
            {products.map((product) => (
              <div key={product.id} className="w-64 flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
