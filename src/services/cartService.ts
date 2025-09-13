import BaseApiService from './baseApiService';

export interface CartItem {
  id: string;
  productId: string;
  productVariantId: string;
  isVariant: boolean;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    image: string;
    hasVariants: string;
  };
  selectedVariations: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  error: boolean;
  message: string;
  details: T;
}

export interface AddToCartRequest {
  product_id?: number;
  product_variant_id?: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

class CartService extends BaseApiService {
  // Get cart (creates session automatically for guests)
  async getCart(): Promise<Cart> {
    const response = await this.get<ApiResponse<Cart>>('/cart', true);
    return response.details;
  }

  // Get cart item count for header badge
  async getCartCount(): Promise<{ count: string }> {
    const response = await this.get<ApiResponse<{ count: string }>>('/cart/count', true);
    return response.details;
  }

  // Add item to cart
  async addToCart(data: AddToCartRequest): Promise<Cart> {
    const response = await this.post<ApiResponse<Cart>>('/cart/add', data, true);
    return response.details;
  }

  // Update item quantity
  async updateCartItem(itemId: string, data: UpdateCartItemRequest): Promise<CartItem> {
    const response = await this.put<ApiResponse<CartItem>>(`/cart/items/${itemId}`, data, true);
    return response.details;
  }

  // Remove item from cart
  async removeFromCart(itemId: string): Promise<void> {
    await this.delete<ApiResponse<any>>(`/cart/items/${itemId}`, true);
  }

  // Clear entire cart
  async clearCart(): Promise<void> {
    await this.delete<ApiResponse<any>>('/cart/clear', true);
  }

  // Move item to wishlist (requires auth)
  async moveToWishlist(itemId: string): Promise<{ message: string }> {
    const response = await this.post<ApiResponse<{ message: string }>>(`/cart/items/${itemId}/move-to-wishlist`, undefined, true);
    return response.details;
  }
}

// Export singleton instance
export const cartService = new CartService();