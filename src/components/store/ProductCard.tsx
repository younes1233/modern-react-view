import { useState, memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Package } from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'
import { Product } from '@/data/storeData'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useNavigate } from 'react-router-dom'
import { useCountryCurrency } from '@/contexts/CountryCurrencyContext'

interface ProductCardProps {
  product: Product
}

// Memoize ProductCard to prevent re-renders when product data hasn't changed
const ProductCardComponent = ({ product }: ProductCardProps) => {
  const [hoveredThumbnail, setHoveredThumbnail] = useState<number | null>(null)
  const { addToCart, isInCart, isLoading: cartLoading } = useCart()
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isLoading: wishlistLoading,
  } = useWishlist()
  const { selectedCurrency } = useCountryCurrency()
  const navigate = useNavigate()

  // Get currency symbol from product data or fallback to selected currency
  const currencySymbol =
    (product as any).currency?.symbol || selectedCurrency?.symbol || '$'

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await addToCart(product)
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product)
    }
  }


  const handleProductClick = () => {
    navigate(`/store/product/${product.slug}`)
  }

  const currentImage =
    hoveredThumbnail !== null
      ? product.thumbnails[hoveredThumbnail]?.url || product.image
      : product.image

  const allImages = [
    { url: product.image, alt: product.name },
    ...product.thumbnails.map((thumb) => ({ url: thumb.url, alt: thumb.alt })),
  ]

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0

  const originalPrice = product.originalPrice

  return (
    <>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative overflow-hidden h-full">
        <div
          className="relative overflow-hidden bg-white"
          onClick={handleProductClick}
        >
          {/* Product Image - Taller with better containment */}
          <div className="aspect-[1/1] md:aspect-[1/1] bg-white overflow-hidden">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Thumbnail Navigation - Show on hover if thumbnails exist */}
          {product.thumbnails && product.thumbnails.length > 0 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex space-x-1">
                <button
                  className={`w-2 h-2 rounded-full transition-colors ${
                    hoveredThumbnail === null ? 'bg-white' : 'bg-white/50'
                  }`}
                  onMouseEnter={() => setHoveredThumbnail(null)}
                />
                {product.thumbnails.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      hoveredThumbnail === index ? 'bg-white' : 'bg-white/50'
                    }`}
                    onMouseEnter={() => setHoveredThumbnail(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Badges - Top Left */}
          <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1 flex flex-col gap-1">
            {product.isOnSale && discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                -{discountPercentage}%
              </Badge>
            )}
            {product.isNewArrival && (
              <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                NEW
              </Badge>
            )}
          </div>

          {/* Wishlist button - Top Right */}
          <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`w-9 h-9 md:w-7 md:h-7 p-0 shadow-md ${
                isInWishlist(product.id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/90 hover:bg-white'
              }`}
            >
              <Heart
                className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                  isInWishlist(product.id) ? 'fill-current' : ''
                }`}
              />
            </Button>
          </div>
        </div>

        <CardContent
          className="p-3 flex flex-col flex-1"
          onClick={handleProductClick}
        >
          {/* Top Content - Fixed height for consistent cards */}
          <div className="flex-1">
            {/* Product Name with Rating Badge - Fixed height for 2 lines */}
            <div className="flex items-start justify-between gap-2 h-10">
              <h3 className="font-medium text-sm text-gray-800 line-clamp-2 leading-tight flex-1">
                {product.name}
              </h3>
              <StarRating rating={product.rating || 0} className="flex-shrink-0" />
            </div>
          </div>

          {/* Bottom Section - Always at bottom with tighter spacing */}
          <div className="space-y-2 mt-auto pt-2">
            {/* Price Section - Clean and modern */}
            <div className="flex items-center gap-2">
              <span className="text-base md:text-lg font-semibold text-gray-900">
                {currencySymbol}{product.price}
              </span>
              {product.isOnSale && originalPrice && (
                <>
                  <span className="text-xs text-gray-400 line-through">
                    {currencySymbol}{originalPrice}
                  </span>
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Express and Cart Section - Aligned and balanced */}
            <div className="flex items-center justify-between">
              {/* Simplified Express Badge */}
              <div className="flex items-center bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                <Package size={10} className="text-white mr-1" />
                <span>EXPRESS</span>
              </div>

              {/* Add to Cart Button - Same shape as wishlist */}
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg w-9 h-9 p-0 flex items-center justify-center shadow-sm hover:shadow transition-all duration-200"
                variant="outline"
              >
                <ShoppingCart className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </>
  )
}

// Export memoized version - only re-renders if product.id changes
export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  // Custom comparison: only re-render if product ID changed
  // This prevents re-renders when unrelated products update
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.name === nextProps.product.name &&
         prevProps.product.price === nextProps.product.price;
});
