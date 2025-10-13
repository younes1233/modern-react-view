import { useState, memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Package } from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useNavigate } from 'react-router-dom'
import { useCountryCurrency } from '@/contexts/CountryCurrencyContext'

// Backend product interface based on actual API response
interface BackendProduct {
  id: number
  name: string
  slug: string
  short_description?: string | null
  category?: any | null
  store?: string
  cover_image?:
    | {
        desktop: string
        tablet: string
        mobile: string
      }
    | string
  pricing?: {
    original_price: number | null
    price: number
    currency_id: number | null
    currency: {
      code: string
      symbol: string
    } | null
    applied_discounts: Array<{
      id?: number
      label: string
      type: string
      value: string | number
      amount_value: number
      max_discount: number | null
      scope?: string
    }>
    vat: {
      rate: number
      amount: number
    }
  }
  flags?: {
    on_sale: boolean
    is_featured: boolean
    is_new_arrival: boolean
    is_best_seller: boolean
    is_vat_exempt?: boolean
    seller_product_status?: string
  }
  stock?: number
  rating?: {
    average: number
    count: number
  }
  variants_count?: number
  has_variants?: boolean
  variations?: any[]
  meta?: {
    seo_title: string
    seo_description: string | null
    created_at: string
    updated_at: string
  }
}

interface ProductCardProps {
  product: BackendProduct
  priority?: boolean // For above-the-fold images (first 6-8 products)
}

const ProductCardComponent = ({ product, priority = false }: ProductCardProps) => {
  const [hoveredThumbnail, setHoveredThumbnail] = useState<number | null>(null)
  const { addToCart, isLoading: cartLoading } = useCart()
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isLoading: wishlistLoading,
  } = useWishlist()
  const { selectedCurrency } = useCountryCurrency()
  const navigate = useNavigate()

  // Discount calculations with safe fallbacks following ProductDetail pattern
  const hasBackendDiscount = product.pricing?.applied_discounts?.length > 0
  const backendOriginalPrice = product.pricing?.original_price || 0
  const backendDiscountedPrice = product.pricing?.price || 0
  const backendDiscountPercentage =
    hasBackendDiscount && backendOriginalPrice && backendDiscountedPrice
      ? Math.round(
          ((backendOriginalPrice - backendDiscountedPrice) /
            backendOriginalPrice) *
            100
        )
      : 0

  const currencySymbol =
    product.pricing?.currency?.symbol || selectedCurrency?.symbol || '$'

  const savings =
    backendOriginalPrice && backendDiscountedPrice && backendOriginalPrice > backendDiscountedPrice
      ? backendOriginalPrice - backendDiscountedPrice
      : 0

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
    navigate(`/product/${product.slug}`)
  }

  const hasDiscount = hasBackendDiscount || (product.flags?.on_sale ?? false)

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative overflow-hidden h-full">
      <div
        className="relative overflow-hidden bg-white"
        onClick={handleProductClick}
      >
        {/* Product Image */}
        <div className="aspect-[1/1] bg-white overflow-hidden">
          <OptimizedImage
            src={product.cover_image}
            alt={product.name}
            eager={priority}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Top Left Badges */}
        <div className="absolute top-1 left-1 flex flex-col gap-1">
          {hasDiscount && savings > 0 && (
            <span className="bg-green-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              Save {currencySymbol}
              {savings.toFixed(2)}
            </span>
          )}
          {product.flags?.is_new_arrival && (
            <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
              NEW
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`w-8 h-8 p-0 shadow-md ${
              isInWishlist(product.id)
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 hover:bg-white'
            }`}
          >
            <Heart
              className={`w-3 h-3 ${
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
        {/* Product Title & Rating */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 h-10">
            <h3 className="font-medium text-sm text-gray-800 line-clamp-2 leading-tight flex-1">
              {product.name}
            </h3>
            <StarRating
              rating={product.rating?.average || 0}
              className="flex-shrink-0"
            />
          </div>
        </div>

        {/* Price & Express */}
        <div className="space-y-2 mt-auto pt-2">
          {/* Price Section */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span className="text-base md:text-lg font-semibold text-gray-900">
                {currencySymbol}
                {backendDiscountedPrice.toFixed(2)}
              </span>
              {hasDiscount &&
                backendOriginalPrice &&
                backendOriginalPrice !== backendDiscountedPrice && (
                  <span className="text-sm text-gray-400 line-through font-medium">
                    {currencySymbol}
                    {backendOriginalPrice.toFixed(2)}
                  </span>
                )}
            </div>
          </div>

          {/* Express + Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-red-500 text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
              <Package size={10} className="text-white mr-1" />
              <span>EXPRESS</span>
            </div>

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
  )
}

export const ProductCard = memo(
  ProductCardComponent,
  (prevProps, nextProps) => {
    // Only re-render if critical data changes
    const prev = prevProps.product;
    const next = nextProps.product;

    return (
      prev.id === next.id &&
      prev.name === next.name &&
      prev.slug === next.slug &&
      prev.pricing?.price === next.pricing?.price &&
      prev.pricing?.original_price === next.pricing?.original_price &&
      (prev.pricing?.applied_discounts?.length || 0) === (next.pricing?.applied_discounts?.length || 0) &&
      prev.stock === next.stock &&
      prev.rating?.average === next.rating?.average &&
      prev.rating?.count === next.rating?.count &&
      prev.cover_image === next.cover_image &&
      prev.flags?.on_sale === next.flags?.on_sale &&
      prev.flags?.is_featured === next.flags?.is_featured &&
      prev.flags?.is_new_arrival === next.flags?.is_new_arrival
    )
  }
)
