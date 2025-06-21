
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
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative overflow-hidden h-full">
        <div className="relative overflow-hidden bg-white" onClick={handleProductClick}>
          {/* Product Image - Taller with better containment and white background */}
          <div className="aspect-[4/6] md:aspect-[4/5] bg-white overflow-hidden p-2">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-white"
              style={{ backgroundColor: 'white' }}
            />
          </div>
          
          {/* Discount badge - Top Left */}
          {product.isOnSale && (
            <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1">
              <Badge className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                -{discountPercentage}%
              </Badge>
            </div>
          )}

          {/* Wishlist button - Top Right */}
          <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWishlistToggle}
              className={`w-5 h-5 md:w-6 md:h-6 p-0 shadow-md ${
                isInWishlist(product.id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/90 hover:bg-white'
              }`}
            >
              <Heart className={`w-2.5 h-2.5 md:w-3 md:h-3 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        <CardContent className="p-3 md:p-4 flex flex-col justify-between flex-1" onClick={handleProductClick}>
          <div className="space-y-1 md:space-y-1.5 flex-1">
            {/* Product Name - Smaller text, more compact */}
            <h3 className="font-normal text-xs md:text-sm text-gray-800 line-clamp-2 leading-tight min-h-[1.5rem] md:min-h-[2rem]">
              {product.name}
            </h3>

            {/* Price Section - More compact */}
            <div className="flex items-center gap-1 md:gap-1.5 mb-1 md:mb-2">
              <span className="text-sm md:text-base font-bold text-gray-900">
                ${product.price}
              </span>
              {product.isOnSale && (
                <>
                  <span className="text-xs text-gray-500 line-through">
                    ${originalPrice}
                  </span>
                  <span className="text-xs text-red-500 font-medium">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Bottom Section with Express and Add to Cart - More compact */}
            <div className="flex items-center justify-between mt-auto">
              {/* Express Badge */}
              <div className="flex items-center">
                <Badge className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                  express
                </Badge>
              </div>

              {/* Add to Cart Button - Smaller and no text on mobile */}
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-md px-1.5 md:px-2 py-0.5 text-xs"
                variant="outline"
              >
                <ShoppingCart className="w-3 h-3 md:mr-1" />
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
