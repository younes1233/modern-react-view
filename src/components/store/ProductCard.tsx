
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

  const handleImageZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowImageZoom(true);
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

  const discountPercentage = Math.floor(Math.random() * 30) + 10; // Mock discount
  const originalPrice = Math.floor(product.price * 1.3);

  return (
    <>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative">
        <div className="relative overflow-hidden bg-white">
          <div className="aspect-square bg-gray-50 overflow-hidden p-4" onClick={handleProductClick}>
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Quick action buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleQuickView}
              className="w-8 h-8 p-0 bg-white shadow-md hover:bg-gray-100"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWishlistToggle}
              className={`w-8 h-8 p-0 shadow-md ${
                isInWishlist(product.id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Discount badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white text-xs px-2 py-1">
              -{discountPercentage}%
            </Badge>
          </div>

          {/* Express badge */}
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              🚚 express
            </Badge>
          </div>
        </div>

        <CardContent className="p-3" onClick={handleProductClick}>
          <div className="space-y-2">
            {/* Product Name */}
            <h3 className="font-medium text-sm text-gray-800 line-clamp-2 leading-tight min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${originalPrice}
                  </span>
                </div>
              </div>
              
              {/* Add to cart button */}
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-8 h-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-600"
                variant="ghost"
              >
                <ShoppingCart className="w-4 h-4" />
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
