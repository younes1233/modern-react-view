import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { toast } from '@/components/ui/sonner'
import { cartService, Cart, AddToCartRequest } from '@/services/cartService'
import { useAuth } from '@/contexts/AuthContext'
import { metaPixelService } from '@/services/metaPixelService'

// New API-based product interface for cart
export interface ApiProduct {
  id: number
  name: string
  slug: string
  short_description?: string | null
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
    applied_discounts: Array<any>
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
  meta?: any
}

export interface CartItem {
  id: string
  purchasableType:
    | 'App\\Models\\Product'
    | 'App\\Models\\ProductVariant'
    | 'App\\Models\\Package'
  purchasableId: number
  productId?: number
  productVariantId?: number
  isVariant: boolean
  isPackage: boolean
  quantity: number
  price: number
  product: {
    id?: number
    name?: string
    slug?: string
    sku?: string
    image?: string | null
    hasVariants?: boolean
  }
  selectedVariations?: Array<{
    id: number
    attribute_id: number
    attribute_name?: string
    value: string
  }> | null
}

interface CartNotificationItem {
  name: string
  image: string | { desktop?: string; tablet?: string; mobile?: string } | null
  price: number
  quantity: number
  currency?: {
    symbol?: string
    code?: string
  }
}

interface VariantSelectionRequest {
  product: ApiProduct
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (
    product: ApiProduct,
    quantity?: number,
    productVariantId?: string,
    preloadedImage?: string
  ) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
  isInCart: (productId: number) => boolean
  isLoading: boolean
  moveToWishlist: (itemId: string) => Promise<void>
  notificationItem: CartNotificationItem | null
  clearNotification: () => void
  variantSelectionRequest: VariantSelectionRequest | null
  clearVariantSelection: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [notificationItem, setNotificationItem] =
    useState<CartNotificationItem | null>(null)
  const [variantSelectionRequest, setVariantSelectionRequest] =
    useState<VariantSelectionRequest | null>(null)
  const { user } = useAuth()

  const convertApiCartItems = (apiCart: Cart): CartItem[] => {
    if (!apiCart?.items) return []
    return apiCart.items.map((item) => ({
      id: item.id,
      purchasableType: item.purchasableType,
      purchasableId: item.purchasableId,
      productId: (item as any).productId,
      productVariantId: (item as any).productVariantId,
      isVariant: (item as any).isVariant || false,
      isPackage: (item as any).isPackage || false,
      quantity: item.quantity,
      price: item.price,
      product: {
        id: item.product?.id,
        name: item.product?.name || 'Unknown Product',
        slug: item.product?.slug,
        sku: item.product?.sku,
        image: item.product?.image || '/placeholder.svg',
        hasVariants: (item.product as any)?.hasVariants || false,
      },
      selectedVariations: (item as any).selectedVariations || null,
    }))
  }

  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true)
      const cart = await cartService.getCart()
      setItems(convertApiCartItems(cart))
    } catch (error) {
      console.error('Error loading cart:', error)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Load cart when user changes (login/logout) or on mount
    // The backend will automatically merge guest cart with user cart on first authenticated request
    loadCart()
  }, [user, loadCart])

  const addToCart = useCallback(
    async (product: ApiProduct, quantity = 1, productVariantId?: string) => {
      // Skip stock check if adding a variant (stock will be checked for the specific variant on the backend)
      const isOutOfStock =
        !productVariantId && product.stock !== undefined && product.stock <= 0

      if (isOutOfStock) {
        toast.error('This product is out of stock', { duration: 2500 })
        return
      }

      setIsLoading(true)

      try {
        const requestData: AddToCartRequest = { quantity }

        // Check if it's a package (you might need to add a flag for this in the API)
        const isPackage = (product as any).isPackage || false

        if (isPackage) {
          requestData.package_id = product.id
        } else if (productVariantId) {
          requestData.product_variant_id = parseInt(productVariantId)
        } else if (product.has_variants) {
          setVariantSelectionRequest({ product, quantity })
          setIsLoading(false)
          return
        } else {
          requestData.product_id = product.id
        }

        const cart = await cartService.addToCart(requestData)
        setItems(convertApiCartItems(cart))

        // Find the cart item to get the total quantity (after increment)
        let cartItem = null
        if (productVariantId) {
          cartItem = cart.items.find((item: any) =>
            item.productVariantId === parseInt(productVariantId)
          )
        } else if (isPackage) {
          cartItem = cart.items.find((item: any) =>
            item.isPackage && item.purchasableId === product.id
          )
        } else {
          cartItem = cart.items.find((item: any) =>
            item.productId === product.id && !item.isVariant
          )
        }

        // Always use the ORIGINAL product data that was clicked
        let notificationName = product.name
        const notificationImage = product.cover_image || '/placeholder.svg'
        const notificationPrice = product.pricing?.price || 0
        const notificationQuantity = cartItem?.quantity || quantity // Show total quantity in cart
        const notificationCurrency = {
          symbol: cart.currency === 'USD' ? '$' : cart.currency,
          code: cart.currency || 'USD'
        }

        // For variants, add variant labels to the name
        if (productVariantId && cartItem?.selectedVariations && Array.isArray(cartItem.selectedVariations)) {
          const variantLabels = cartItem.selectedVariations.map((v: any) => v.value).join(', ')
          notificationName = `${notificationName} - ${variantLabels}`
        }

        // Clear any existing notification first to ensure clean state
        setNotificationItem(null)

        // Set new notification after a brief delay to force component remount
        setTimeout(() => {
          setNotificationItem({
            name: notificationName,
            image: notificationImage,
            price: notificationPrice,
            quantity: notificationQuantity,
            currency: notificationCurrency,
          })
        }, 100) // 100ms delay ensures clean state reset between notifications

        // Track Meta Pixel AddToCart event
        try {
          await metaPixelService.trackAddToCart(product, quantity)
        } catch (pixelError) {
          console.warn('Meta Pixel tracking failed:', pixelError)
        }
      } catch (error: any) {
        console.error('Error adding to cart:', error)

        // Extract clean error message from backend response
        let errorMessage = 'Failed to add item to cart'

        if (error?.message) {
          // The error message from baseApiService already contains the backend message
          // Remove the "HTTP 400: Bad Request - " prefix if present
          errorMessage = error.message.replace(/^HTTP \d+: .+ - /, '')

          // If message still has "Details:" in it, extract just the main message
          const detailsIndex = errorMessage.indexOf(' - Details:')
          if (detailsIndex > 0) {
            errorMessage = errorMessage.substring(0, detailsIndex)
          }
        }

        toast.error(errorMessage, { duration: 3000 })
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const removeFromCart = useCallback(
    async (itemId: string) => {
      try {
        setIsLoading(true)
        const item = items.find((item) => item.id === itemId)

        await cartService.removeFromCart(itemId)
        await loadCart() // Reload cart after removal

        if (item) {
          toast.success(`Removed ${item.product.name} from cart`, { duration: 2000 })
        }
      } catch (error) {
        console.error('Error removing from cart:', error)
        toast.error('Failed to remove item from cart', { duration: 2500 })
      } finally {
        setIsLoading(false)
      }
    },
    [items, loadCart]
  ) // Depends on items and loadCart

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(itemId)
        return
      }

      try {
        setIsLoading(true)
        await cartService.updateCartItem(itemId, { quantity })
        await loadCart() // Reload cart after update
      } catch (error) {
        console.error('Error updating quantity:', error)
        toast.error('Failed to update quantity', { duration: 2500 })
      } finally {
        setIsLoading(false)
      }
    },
    [removeFromCart, loadCart]
  ) // Depends on removeFromCart and loadCart

  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true)
      await cartService.clearCart()
      setItems([])
      toast.success('Cart cleared', { duration: 2000 })
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart', { duration: 2500 })
    } finally {
      setIsLoading(false)
    }
  }, []) // No dependencies

  const moveToWishlist = useCallback(
    async (itemId: string) => {
      if (!user) {
        toast.error('Please login to save to wishlist', { duration: 2500 })
        return
      }

      try {
        setIsLoading(true)
        const item = items.find((item) => item.id === itemId)

        await cartService.moveToWishlist(itemId)
        await loadCart() // Reload cart after moving item

        if (item) {
          toast.success(`Moved ${item.product.name} to wishlist`, { duration: 2000 })
        }
      } catch (error: any) {
        console.error('Error moving to wishlist:', error)
        if (error?.status === 401) {
          toast.error('Please login to save to wishlist', { duration: 2500 })
        } else {
          toast.error('Failed to move item to wishlist', { duration: 2500 })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [user, items, loadCart]
  ) // Depends on user, items, and loadCart

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items]) // Recalculate when items change

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items]) // Recalculate when items change

  const isInCart = useCallback(
    (productId: number) => {
      return items.some(
        (item) => item.product.id === productId || item.productId === productId
      )
    },
    [items]
  ) // Check against current items

  const clearNotification = useCallback(() => {
    setNotificationItem(null)
  }, []) // No dependencies

  const clearVariantSelection = useCallback(() => {
    setVariantSelectionRequest(null)
  }, []) // No dependencies

  // Memoize the context value to prevent unnecessary re-renders
  // Only creates new object when dependencies actually change
  const contextValue = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isInCart,
      isLoading,
      moveToWishlist,
      notificationItem,
      clearNotification,
      variantSelectionRequest,
      clearVariantSelection,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isInCart,
      isLoading,
      moveToWishlist,
      notificationItem,
      clearNotification,
      variantSelectionRequest,
      clearVariantSelection,
    ]
  )

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
