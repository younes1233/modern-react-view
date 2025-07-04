
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, Minus, Plus, ZoomIn } from "lucide-react";
import { Product, ProductVariation, calculateVariationPrice } from "@/data/storeData";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState } from "react";
import { ProductVariations } from "./ProductVariations";
import { ImageZoom } from "./ImageZoom";

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<ProductVariation[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageZoom, setShowImageZoom] = useState(false);

  if (!product) return null;

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const currentPrice = calculateVariationPrice(product.price, selectedVariations);

  const allImages = [
    { url: product.image, alt: product.name },
    ...product.thumbnails.map(thumb => ({ url: thumb.url, alt: thumb.alt }))
  ];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleVariationChange = (variations: ProductVariation[]) => {
    setSelectedVariations(variations);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Product Details</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative aspect-square">
                <img
                  src={allImages[selectedImageIndex]?.url}
                  alt={allImages[selectedImageIndex]?.alt}
                  className="w-full h-full object-cover rounded-lg"
                />
                
                {/* Zoom Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowImageZoom(true)}
                  className="absolute top-4 right-4"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNewArrival && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      New
                    </Badge>
                  )}
                  {product.isOnSale && discountPercentage > 0 && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white">
                      -{discountPercentage}%
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge className="bg-gray-500 text-white">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded border-2 overflow-hidden transition-all ${
                        index === selectedImageIndex
                          ? 'border-cyan-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500 uppercase tracking-wide">
                  {product.category}
                </p>
                {product.sku && (
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ${currentPrice.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${product.inStock ? 'text-green-700' : 'text-red-700'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Product Variations */}
              {product.variations.length > 0 && (
                <div>
                  <ProductVariations
                    variations={product.variations}
                    basePrice={product.price}
                    onVariationChange={handleVariationChange}
                  />
                </div>
              )}

              {/* Quantity Selector */}
              {product.inStock && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 ${
                    product.inStock 
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isInCart(product.id) ? 'Add More' : 'Add to Cart'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={`px-4 ${
                    isInWishlist(product.id) 
                      ? 'text-red-500 border-red-500 hover:bg-red-50' 
                      : 'hover:text-red-500 hover:border-red-500'
                  }`}
                  size="lg"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Product Description */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Product Details</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || `This high-quality ${product.name.toLowerCase()} is perfect for your needs. 
                  Made with premium materials and attention to detail, it offers excellent 
                  value and performance. Customer satisfaction is our priority.`}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
