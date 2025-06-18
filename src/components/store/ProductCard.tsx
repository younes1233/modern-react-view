
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { Product } from '@/data/storeData';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { ProductQuickView } from './ProductQuickView';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false);
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleProductClick = () => {
    navigate(`/store/product/${product.id}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:shadow-xl">
        <div className="relative overflow-hidden">
          <div className="aspect-square bg-gray-100 overflow-hidden" onClick={handleProductClick}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleQuickView}
              className="bg-white/90 text-gray-900 hover:bg-white shadow-lg"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWishlistToggle}
              className={`shadow-lg ${
                isInWishlist(product.id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/90 text-gray-900 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 space-y-1">
            {product.isFeatured && (
              <Badge className="bg-cyan-500 text-white shadow-lg">Featured</Badge>
            )}
            {product.isNewArrival && (
              <Badge className="bg-green-500 text-white shadow-lg">New</Badge>
            )}
            {!product.inStock && (
              <Badge variant="destructive" className="shadow-lg">Out of Stock</Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4" onClick={handleProductClick}>
          <div className="space-y-3">
            {/* Category */}
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {product.category}
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-cyan-600 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-xs text-gray-500">({product.rating})</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`${
                  isInCart(product.id)
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                } text-white transition-colors shadow-md hover:shadow-lg`}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                {isInCart(product.id) ? 'Added' : 'Add'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductQuickView
        product={product}
        open={showQuickView}
        onOpenChange={setShowQuickView}
      />
    </>
  );
}
