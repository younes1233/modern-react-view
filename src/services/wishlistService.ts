import BaseApiService from './baseApiService';

export interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  category: string | null;
  store: string;
  cover_image: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  flags: {
    on_sale: boolean;
    is_featured: boolean;
    is_new_arrival: boolean;
    is_best_seller: boolean;
    is_vat_exempt: boolean;
    seller_product_status: string;
  };
  pricing: {
    original_price: number | null;
    price: number | null;
    currency_id: number | null;
    currency: {
      code: string;
      symbol: string;
    } | null;
    applied_discounts: any[];
    vat: any[];
  };
  stock: number;
  rating: {
    average: number;
    count: number;
  };
  meta: {
    seo_title: string;
    seo_description: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface WishlistItem {
  id: number;
  wishlist_item: WishlistProduct;
  added_at: string;
}

export interface WishlistResponse {
  error: boolean;
  message: string;
  details: {
    wishlist: WishlistItem[];
    country_id: string;
  };
}

export interface AddWishlistResponse {
  error: boolean;
  message: string;
  details: {
    wishlist_item: WishlistItem;
  };
}

export interface RemoveWishlistResponse {
  error: boolean;
  message: string;
  details: [];
}

export interface ClearWishlistResponse {
  error: boolean;
  message: string;
  details: {
    deleted_count: string;
  };
}

export interface AddToWishlistRequest {
  product_id: number;
}

class WishlistService extends BaseApiService {
  // Get user's wishlist (requires auth)
  async getWishlist(): Promise<WishlistResponse> {
    return this.get<WishlistResponse>('/auth/wishlist', true);
  }

  // Add product to wishlist (requires auth)
  async addToWishlist(data: AddToWishlistRequest): Promise<AddWishlistResponse> {
    return this.post<AddWishlistResponse>('/auth/wishlist', data, true);
  }

  // Remove product from wishlist (requires auth)
  async removeFromWishlist(productId: number): Promise<RemoveWishlistResponse> {
    return this.delete<RemoveWishlistResponse>(`/auth/wishlist/products/${productId}`, true);
  }

  // Clear entire wishlist (requires auth)
  async clearWishlist(): Promise<ClearWishlistResponse> {
    return this.delete<ClearWishlistResponse>('/auth/wishlist/clear', true);
  }

  // Check if product is in wishlist (requires auth)
  async isInWishlist(productId: number): Promise<{ is_in_wishlist: boolean }> {
    return this.get<{ is_in_wishlist: boolean }>(`/auth/wishlist/check/${productId}`, true);
  }

  // Move item to cart (requires auth)
  async moveToCart(productId: number, quantity: number = 1): Promise<{ message: string }> {
    return this.post<{ message: string }>(`/auth/wishlist/move-to-cart/${productId}`, { quantity }, true);
  }
}

// Export singleton instance
export const wishlistService = new WishlistService();