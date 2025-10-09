import BaseApiService from './baseApiService'

export interface CartItem {
  id: string
  purchasableType: 'App\\Models\\Product' | 'App\\Models\\ProductVariant' | 'App\\Models\\Package'
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

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  totalItems: number
  totalAmount: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  error: boolean
  message: string
  details: T
}

export interface AddToCartRequest {
  product_id?: number
  product_variant_id?: number
  package_id?: number
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

class CartService extends BaseApiService {
  async getCart(): Promise<Cart> {
    const response = await this.get<ApiResponse<Cart>>('/cart', true)
    return response.details
  }

  async getCartCount(): Promise<{ count: string }> {
    const response = await this.get<ApiResponse<{ count: string }>>(
      '/cart/count',
      true
    )
    return response.details
  }

  async addToCart(data: AddToCartRequest): Promise<Cart> {
    const response = await this.post<ApiResponse<Cart>>('/cart/add', data, true)
    return response.details
  }

  async updateCartItem(
    itemId: string,
    data: UpdateCartItemRequest
  ): Promise<Cart> {
    const response = await this.put<ApiResponse<Cart>>(
      `/cart/items/${itemId}`,
      data,
      true
    )
    return response.details
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    const response = await this.delete<ApiResponse<Cart>>(
      `/cart/items/${itemId}`,
      true
    )
    return response.details
  }

  async clearCart(): Promise<Cart> {
    const response = await this.delete<ApiResponse<Cart>>('/cart/clear', true)
    return response.details
  }

  async moveToWishlist(itemId: string): Promise<{ message: string }> {
    const response = await this.post<ApiResponse<{ message: string }>>(
      `/cart/items/${itemId}/move-to-wishlist`,
      undefined,
      true
    )
    return response.details
  }
}

export const cartService = new CartService()
