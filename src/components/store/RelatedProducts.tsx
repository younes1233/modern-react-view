import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface RelatedProduct {
  id: number;
  name: string;
  slug: string;
  pricing: {
    price: number;
    currency: {
      code: string;
      symbol: string;
    };
  };
  media?: {
    images: Array<{
      urls?: {
        original?: string;
        medium?: any;
      };
      alt_text?: string;
    }>;
  };
}

interface RelatedProductsProps {
  products: RelatedProduct[];
}

export const RelatedProducts = ({ products }: RelatedProductsProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  if (!products || products.length === 0) return null;

  const handleProductClick = (slug: string) => {
    navigate(`/store/products/${slug}`);
  };

  const handleAddToCart = (product: RelatedProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.pricing.price,
      image: product.media?.images[0]?.urls?.original || '/placeholder.svg',
      category: '',
      inStock: true,
      rating: 0,
      reviews: 0,
      isFeatured: false,
      isNewArrival: false,
      isOnSale: false,
      sku: '',
      description: '',
      thumbnails: [],
      variations: []
    };
    
    addToCart(cartProduct, 1);
  };

  const handleAddToWishlist = (product: RelatedProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const wishlistProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.pricing.price,
      image: product.media?.images[0]?.urls?.original || '/placeholder.svg',
      category: '',
      inStock: true,
      rating: 0,
      reviews: 0,
      isFeatured: false,
      isNewArrival: false,
      isOnSale: false,
      sku: '',
      description: '',
      thumbnails: [],
      variations: []
    };
    
    addToWishlist(wishlistProduct);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Related Products</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
            onClick={() => handleProductClick(product.slug)}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                <img
                  src={product.media?.images[0]?.urls?.original || '/placeholder.svg'}
                  alt={product.media?.images[0]?.alt_text || product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleAddToWishlist(product, e)}
                    className={`p-2 bg-white/90 hover:bg-white shadow-lg rounded-full w-8 h-8 ${
                      isInWishlist(product.id) ? 'text-red-500' : 'text-gray-700'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <h4 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">
                    {product.pricing.currency?.symbol || '$'}{product.pricing.price?.toFixed(2) || '0.00'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleAddToCart(product, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full w-7 h-7"
                  >
                    <ShoppingCart className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};