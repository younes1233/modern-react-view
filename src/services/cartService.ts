import BaseApiService from './baseApiService';

export interface CartItem {
  id: number;
  product_variant_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    slug: string;
  };
  product_variant?: {
    id: number;
    type: string;
    value: string;
    price_modifier: number;
  };
}

export interface Cart {
  items: CartItem[];
  total_items: number;
  total_amount: number;
  subtotal: number;
  tax_amount?: number;
  shipping_amount?: number;
}

export interface AddToCartRequest {
  product_variant_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

class CartService extends BaseApiService {
  // Get cart (creates session automatically for guests)
  async getCart(): Promise<Cart> {
    return this.get<Cart>('/cart', true); // Include credentials for session
  }

  // Get cart item count for header badge
  async getCartCount(): Promise<{ count: number }> {
    return this.get<{ count: number }>('/cart/count', true); // Include credentials
  }

  // Add item to cart
  async addToCart(data: AddToCartRequest): Promise<Cart> {
    return this.post<Cart>('/cart/add', data, true); // Include credentials
  }

  // Update item quantity
  async updateCartItem(itemId: number, data: UpdateCartItemRequest): Promise<Cart> {
    return this.put<Cart>(`/cart/items/${itemId}`, data, true); // Include credentials
  }

  // Remove item from cart
  async removeFromCart(itemId: number): Promise<Cart> {
    return this.delete<Cart>(`/cart/items/${itemId}`, true); // Include credentials
  }

  // Clear entire cart
  async clearCart(): Promise<{ message: string }> {
    return this.delete<{ message: string }>('/cart', true); // Include credentials
  }

  // Move item to wishlist (requires auth)
  async moveToWishlist(itemId: number): Promise<{ message: string }> {
    return this.post<{ message: string }>(`/cart/items/${itemId}/move-to-wishlist`, undefined, true); // Include credentials
  }
}

// Export singleton instance
export const cartService = new CartService();