
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Eye, Star, ZoomIn } from 'lucide-react';
import { Product } from '@/data/storeData';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { ProductQuickView } from './ProductQuickView';
import { ImageZoom } from './ImageZoom';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [hoveredThumbnail, setHoveredThumbnail] = useState<number | null>(null);
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
    navigate(`/store/product/${product.slug}`);
  };

  const currentImage = hoveredThumbnail !== null 
    ? product.thumbnails[hoveredThumbnail]?.url || product.image
    : product.image;

  const allImages = [
    { url: product.image, alt: product.name },
    ...product.thumbnails.map(thumb => ({ url: thumb.url, alt: thumb.alt }))
  ];

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : Math.floor(Math.random() * 30) + 10;
  
  const originalPrice = product.originalPrice || Math.floor(product.price * 1.3);

  return (
    <>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative overflow-hidden">
        <div className="relative overflow-hidden bg-white" onClick={handleProductClick}>
          {/* Product Image - Larger on mobile */}
          <div className="aspect-square bg-white overflow-hidden">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Discount badge - Top Left */}
          {product.isOnSale && (
            <div className="absolute top-1 left-1 md:top-2 md:left-2">
              <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                -{discountPercentage}%
              </Badge>
            </div>
          )}

          {/* Wishlist button - Top Right */}
          <div className="absolute top-1 right-1 md:top-2 md:right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWishlistToggle}
              className={`w-6 h-6 md:w-8 md:h-8 p-0 shadow-md ${
                isInWishlist(product.id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/90 hover:bg-white'
              }`}
            >
              <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        <CardContent className="p-2 md:p-3" onClick={handleProductClick}>
          <div className="space-y-1.5 md:space-y-2">
            {/* Product Name - Smaller text */}
            <h3 className="font-normal text-xs md:text-sm text-gray-800 line-clamp-2 leading-tight min-h-[2rem] md:min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Price Section */}
            <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
              <span className="text-base md:text-lg font-bold text-gray-900">
                ${product.price}
              </span>
              {product.isOnSale && (
                <>
                  <span className="text-xs md:text-sm text-gray-500 line-through">
                    ${originalPrice}
                  </span>
                  <span className="text-xs text-red-500 font-medium">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Bottom Section with Express and Add to Cart */}
            <div className="flex items-center justify-between">
              {/* Express Badge */}
              <div className="flex items-center">
                <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                  express
                </Badge>
              </div>

              {/* Add to Cart Button - Responsive text */}
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-md px-2 md:px-3 py-1 text-xs"
                variant="outline"
              >
                <ShoppingCart className="w-3 h-3 mr-0 md:mr-1" />
                <span className="hidden md:inline">Add</span>
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

      <ImageZoom
        images={allImages}
        selectedIndex={selectedImageIndex}
        open={showImageZoom}
        onOpenChange={setShowImageZoom}
        onImageChange={setSelectedImageIndex}
      />
    </>
  );
}
