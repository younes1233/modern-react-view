
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const currentImage = hoveredThumbnail !== null 
    ? product.thumbnails[hoveredThumbnail]?.url || product.image
    : product.image;

  const allImages = [
    { url: product.image, alt: product.name },
    ...product.thumbnails.map(thumb => ({ url: thumb.url, alt: thumb.alt }))
  ];

  return (
    <>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:shadow-xl">
        <div className="relative overflow-hidden">
          <div className="aspect-square bg-gray-100 overflow-hidden" onClick={handleProductClick}>
            <img
              src={currentImage}
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
              onClick={handleImageZoom}
              className="bg-white/90 text-gray-900 hover:bg-white shadow-lg"
            >
              <ZoomIn className="w-4 h-4" />
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

          {/* Thumbnail Preview */}
          {product.thumbnails.length > 0 && (
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex space-x-1">
                {product.thumbnails.slice(0, 4).map((thumbnail, index) => (
                  <button
                    key={thumbnail.id}
                    onMouseEnter={() => setHoveredThumbnail(index)}
                    onMouseLeave={() => setHoveredThumbnail(null)}
                    className="w-8 h-8 rounded border border-white/50 overflow-hidden hover:border-white transition-colors"
                  >
                    <img
                      src={thumbnail.url}
                      alt={thumbnail.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {product.thumbnails.length > 4 && (
                  <div className="w-8 h-8 rounded border border-white/50 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs">+{product.thumbnails.length - 4}</span>
                  </div>
                )}
              </div>
            </div>
          )}
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

            {/* Variations Preview */}
            {product.variations.length > 0 && (
              <div className="flex items-center space-x-2">
                {product.variations.filter(v => v.type === 'color').slice(0, 3).map((variation) => (
                  <div
                    key={variation.id}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: variation.value.toLowerCase() }}
                    title={variation.value}
                  />
                ))}
                {product.variations.filter(v => v.type === 'color').length > 3 && (
                  <span className="text-xs text-gray-500">+{product.variations.filter(v => v.type === 'color').length - 3}</span>
                )}
              </div>
            )}

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
