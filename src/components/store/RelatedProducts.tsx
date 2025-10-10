import { memo, useEffect, useRef, useState } from 'react';
import { ProductCard } from './ProductCard';
import { useResponsiveImage } from '@/contexts/ResponsiveImageContext';

interface RelatedProduct {
  id: number;
  name: string;
  slug: string;
  pricing: {
    price: number;
    original_price?: number;
    currency: {
      code: string;
      symbol: string;
    };
  };
  cover_image?: {
    desktop: string;
    tablet: string;
    mobile: string;
  } | null;
  flags?: {
    on_sale?: boolean;
    is_featured?: boolean;
    is_new_arrival?: boolean;
  };
  stock?: number;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
}

// Lazy loaded product card component
const LazyProductCard = memo(({ product, isVisible }: { product: RelatedProduct; isVisible: boolean }) => {
  const { getImageUrl } = useResponsiveImage();
  
  // Transform RelatedProduct to BackendProduct format for ProductCard
  const transformedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    pricing: {
      original_price: product.pricing.original_price || null,
      price: product.pricing.price,
      currency_id: null,
      currency: product.pricing.currency,
      applied_discounts: [],
      vat: {
        rate: 0,
        amount: 0,
      },
    },
    flags: {
      on_sale: product.flags?.on_sale || false,
      is_featured: product.flags?.is_featured || false,
      is_new_arrival: product.flags?.is_new_arrival || false,
      is_best_seller: false,
    },
    cover_image: product.cover_image || '/placeholder.svg',
    stock: product.stock,
    rating: {
      average: product.rating?.average || 0,
      count: product.rating?.count || 0,
    },
  };

  // Only render the ProductCard when it's visible
  if (!isVisible) {
    return (
      <div className="aspect-[4/5] bg-gray-100 animate-pulse rounded-lg">
        <div className="h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-cyan-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return <ProductCard product={transformedProduct} />;
});

const RelatedProductsComponent = ({ products }: RelatedProductsProps) => {
  const [visibleProducts, setVisibleProducts] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create intersection observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const productId = parseInt(entry.target.getAttribute('data-product-id') || '0');
            setVisibleProducts((prev) => new Set([...prev, productId]));
            // Stop observing once the product is visible
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before the element is visible
        threshold: 0.1,
      }
    );

    // Observe all product containers
    const productElements = containerRef.current?.querySelectorAll('[data-product-id]');
    productElements?.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Related Products</h3>
      <div 
        ref={containerRef}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            data-product-id={product.id}
            className="h-full"
          >
            <LazyProductCard 
              product={product} 
              isVisible={visibleProducts.has(product.id)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Memoize RelatedProducts - only re-render if products array changes
export const RelatedProducts = memo(RelatedProductsComponent, (prevProps, nextProps) => {
  // Deep comparison of product IDs to prevent unnecessary re-renders
  if (prevProps.products.length !== nextProps.products.length) return false;
  return prevProps.products.every((p, i) => p.id === nextProps.products[i]?.id);
});