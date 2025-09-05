import BaseApiService from './baseApiService';

export interface WishlistItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    price: number;
    original_price?: number;
    image: string;
    slug: string;
    in_stock: boolean;
    rating: number;
    reviews_count: number;
  };
  created_at: string;
}

export interface Wishlist {
  items: WishlistItem[];
  total_items: number;
}

export interface AddToWishlistRequest {
  product_id: number;
}

class WishlistService extends BaseApiService {
  // Get user's wishlist (requires auth)
  async getWishlist(): Promise<Wishlist> {
    return this.get<Wishlist>('/wishlist', true); // Include credentials
  }

  // Add product to wishlist (requires auth)
  async addToWishlist(data: AddToWishlistRequest): Promise<Wishlist> {
    return this.post<Wishlist>('/wishlist/add', data, true); // Include credentials
  }

  // Remove product from wishlist (requires auth)
  async removeFromWishlist(productId: number): Promise<Wishlist> {
    return this.delete<Wishlist>(`/wishlist/remove/${productId}`, true); // Include credentials
  }

  // Clear entire wishlist (requires auth)
  async clearWishlist(): Promise<{ message: string }> {
    return this.delete<{ message: string }>('/wishlist/clear', true); // Include credentials
  }

  // Check if product is in wishlist (requires auth)
  async isInWishlist(productId: number): Promise<{ is_in_wishlist: boolean }> {
    return this.get<{ is_in_wishlist: boolean }>(`/wishlist/check/${productId}`, true); // Include credentials
  }

  // Move item to cart (requires auth)
  async moveToCart(productId: number, quantity: number = 1): Promise<{ message: string }> {
    return this.post<{ message: string }>(`/wishlist/move-to-cart/${productId}`, { quantity }, true); // Include credentials
  }
}

// Export singleton instance
export const wishlistService = new WishlistService();