import BaseApiService from './baseApiService';

const baseApiService = new BaseApiService();

// Types for your unified discount system
export interface Discount {
  id: number;
  discountable_id?: number;
  discountable_type?: string;
  country_id?: number;
  store_id?: number;
  coupon_id?: number;
  user_id?: number;
  type: 'percentage' | 'fixed' | 'discounted_price' | 'buy_x_get_y';
  value: number;
  max_discount?: number;
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
  is_stackable: boolean;
  label?: string;
  created_at?: string;
  updated_at?: string;
  // For Buy X Get Y promotions
  promotion_rule?: PromotionRule;
  // For polymorphic relations
  discountable?: any;
}

export interface PromotionRule {
  id?: number;
  discount_id: number;
  buy_quantity: number;
  get_quantity: number;
  buy_product_ids?: number[];
  buy_category_ids?: number[];
  buy_any_product?: boolean;
  get_product_ids?: number[];
  get_category_ids?: number[];
  get_same_as_buy?: boolean;
  max_applications_per_cart?: number;
  max_applications_per_customer?: number;
  max_discount_amount?: number;
  get_discount_type?: 'free' | 'percentage' | 'fixed';
  get_discount_value?: number;
}

export interface Coupon {
  id: number;
  name: string;
  code: string;
  coupon_type?: string;
  discount_type: 'percentage' | 'fixed' | 'delivery_free';
  discount_value: number;
  max_discount?: number;
  starts_at?: string;
  expires_at?: string;
  usage_limit?: number;
  per_user_limit?: number;
  used_count?: number;
  applies_to?: string;
  is_stackable?: boolean;
  status?: string;
  minimum_order_amount?: number;
  is_public?: boolean;
  created_by?: number;
  store_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product_id: number;
  quantity: number;
  price: number;
  category_id?: number;
}

export interface DiscountPreviewRequest {
  cart_items: CartItem[];
  country_id?: number;
  store_id?: number;
  currency_id?: number;
}

export interface DiscountPreviewResponse {
  original_total: number;
  final_total: number;
  total_discount_amount: number;
  savings_percentage: number;
  applied_promotions: Array<{
    type: string;
    label: string;
    discount_amount: number;
    buy_quantity?: number;
    get_quantity?: number;
  }>;
  currency?: {
    code: string;
    symbol: string;
  };
  vat?: {
    rate: number;
    amount: number;
  };
}

export interface CreateDiscountRequest {
  // Basic discount fields
  type: 'percentage' | 'fixed' | 'discounted_price' | 'buy_x_get_y';
  value: number;
  label?: string;
  max_discount?: number;
  starts_at?: string;
  expires_at?: string;
  is_active?: boolean;
  is_stackable?: boolean;
  
  // Targeting
  discountable_type?: 'product' | 'category' | 'package';
  discountable_ids?: number[];
  country_id?: number;
  store_id?: number;
  coupon_id?: number;
  user_id?: number;
  
  // Buy X Get Y fields
  buy_quantity?: number;
  get_quantity?: number;
  buy_product_ids?: number[];
  buy_category_ids?: number[];
  buy_any_product?: boolean;
  get_product_ids?: number[];
  get_category_ids?: number[];
  get_same_as_buy?: boolean;
  max_applications_per_cart?: number;
  max_applications_per_customer?: number;
  max_discount_amount?: number;
  get_discount_type?: 'free' | 'percentage' | 'fixed';
  get_discount_value?: number;
}

export interface CreateCouponRequest {
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'delivery_free';
  discount_value: number;
  max_discount?: number;
  starts_at?: string;
  expires_at?: string;
  usage_limit?: number;
  per_user_limit?: number;
  applies_to?: string;
  is_stackable?: boolean;
  minimum_order_amount?: number;
  is_public?: boolean;
  store_id?: number;
}

export interface CouponApplicationRequest {
  coupon_code: string;
  total_price: number;
  type: string;
  store_id?: number;
}

export interface CouponValidationRequest {
  coupon_code: string;
  total_price: number;
  type: string;
  store_id?: number;
}

class DiscountService {
  // ==========================================
  // UNIFIED DISCOUNT API (Admin Management)
  // ==========================================

  /**
   * Get all discounts with pagination and filtering
   */
  async getDiscounts(params?: {
    page?: number;
    per_page?: number;
    type?: string;
    scope?: string;
    is_active?: boolean;
    q?: string;
  }) {
    const response = await baseApiService.get('/admin/discounts', { params });
    return response;
  }

  /**
   * Get specific discount by ID
   */
  async getDiscount(id: number) {
    const response = await baseApiService.get(`/admin/discounts/${id}`);
    return response.data;
  }

  /**
   * Create new discount (supports normal, package, and buy_x_get_y)
   */
  async createDiscount(data: CreateDiscountRequest) {
    const response = await baseApiService.post('/admin/discounts', data);
    return response;
  }

  /**
   * Update existing discount
   */
  async updateDiscount(id: number, data: Partial<CreateDiscountRequest>) {
    const response = await baseApiService.put(`/admin/discounts/${id}`, data);
    return response;
  }

  /**
   * Delete discount
   */
  async deleteDiscount(id: number) {
    const response = await baseApiService.delete(`/admin/discounts/${id}`);
    return response;
  }

  /**
   * Toggle discount status
   */
  async toggleDiscountStatus(id: number, is_active: boolean) {
    const response = await baseApiService.patch(`/admin/discounts/${id}/toggle-status`, {
      is_active
    });
    return response;
  }

  /**
   * Get discount analytics
   */
  async getDiscountAnalytics(params?: {
    date_from?: string;
    date_to?: string;
    scope?: string;
  }) {
    // Note: Move analytics route to be inside admin prefix in backend routes
    const response = await baseApiService.get('/admin/discounts/analytics', { params });
    return response.data;
  }

  // ==========================================
  // BUY X GET Y PROMOTIONS
  // ==========================================

  /**
   * Get Buy X Get Y promotions
   */
  async getBuyXGetYDiscounts(params?: {
    store_id?: number;
    country_id?: number;
    is_active?: boolean;
  }) {
    const response = await baseApiService.get('/discounts/buy-x-get-y', { params });
    return response.data;
  }

  /**
   * Test Buy X Get Y promotion against cart items
   */
  async testBuyXGetYPromotion(discountId: number, cartItems: CartItem[]) {
    const response = await baseApiService.post(`/discounts/${discountId}/test`, {
      cart_items: cartItems
    });
    return response.data;
  }

  /**
   * Get applicable promotions for products
   */
  async getApplicablePromotions(data: {
    product_ids: number[];
    store_id?: number;
    country_id?: number;
  }) {
    const response = await baseApiService.post('/discounts/applicable', data);
    return response.data;
  }

  /**
   * Calculate discount preview for cart
   */
  async calculateDiscountPreview(data: DiscountPreviewRequest): Promise<DiscountPreviewResponse> {
    const response = await baseApiService.post('/discounts/preview', data);
    return response.data.details;
  }

  // ==========================================
  // COUPON MANAGEMENT
  // ==========================================

  /**
   * Get all coupons
   */
  async getCoupons(params?: {
    page?: number;
    per_page?: number;
    store_id?: number;
    is_active?: boolean;
  }) {
    const response = await baseApiService.get('/coupons', { params });
    return response.data;
  }

  /**
   * Get specific coupon
   */
  async getCoupon(id: number) {
    const response = await baseApiService.get(`/coupons/${id}`);
    return response.data;
  }

  /**
   * Create new coupon
   */
  async createCoupon(data: CreateCouponRequest) {
    const response = await baseApiService.post('/coupons', data);
    return response.data;
  }

  /**
   * Update coupon
   */
  async updateCoupon(id: number, data: Partial<CreateCouponRequest>) {
    const response = await baseApiService.put(`/coupons/${id}`, data);
    return response.data;
  }

  /**
   * Delete coupon
   */
  async deleteCoupon(id: number) {
    const response = await baseApiService.delete(`/coupons/${id}`);
    return response.data;
  }

  /**
   * Apply coupon to cart/order
   */
  async applyCoupon(data: CouponApplicationRequest) {
    const response = await baseApiService.post('/coupons/apply', data);
    return response.data;
  }

  /**
   * Validate coupon before application
   */
  async validateCoupon(data: CouponValidationRequest) {
    const response = await baseApiService.post('/coupons/validate', data);
    return response.data;
  }

  /**
   * Mark coupon as used
   */
  async markCouponAsUsed(data: {
    coupon_id: number;
    order_id?: number;
    user_id: number;
  }) {
    const response = await baseApiService.post('/coupons/mark-used', data);
    return response.data;
  }

  /**
   * Get available coupons for user
   */
  async getAvailableCoupons(params?: {
    user_id?: number;
    store_id?: number;
    type?: string;
  }) {
    const response = await baseApiService.get('/coupons/available', { params });
    return response.data;
  }

  // ==========================================
  // HELPER METHODS FOR FRONTEND
  // ==========================================

  /**
   * Create a normal product discount
   */
  async createProductDiscount(data: {
    product_ids: number[];
    type: 'percentage' | 'fixed';
    value: number;
    label: string;
    max_discount?: number;
    starts_at?: string;
    expires_at?: string;
    is_active?: boolean;
    store_id?: number;
    country_id?: number;
  }) {
    return this.createDiscount({
      ...data,
      discountable_type: 'product',
      discountable_ids: data.product_ids,
    });
  }

  /**
   * Create a category discount
   */
  async createCategoryDiscount(data: {
    category_ids: number[];
    type: 'percentage' | 'fixed';
    value: number;
    label: string;
    max_discount?: number;
    starts_at?: string;
    expires_at?: string;
    is_active?: boolean;
    store_id?: number;
    country_id?: number;
  }) {
    return this.createDiscount({
      ...data,
      discountable_type: 'category',
      discountable_ids: data.category_ids,
    });
  }

  /**
   * Create a store-wide discount
   */
  async createStoreDiscount(data: {
    store_id: number;
    type: 'percentage' | 'fixed';
    value: number;
    label: string;
    max_discount?: number;
    starts_at?: string;
    expires_at?: string;
    is_active?: boolean;
    country_id?: number;
  }) {
    return this.createDiscount({
      ...data,
      // Store discounts are global within the store (no discountable_type)
    });
  }

  /**
   * Create a package/bundle discount
   */
  async createPackageDiscount(data: {
    package_ids: number[];
    type: 'percentage' | 'fixed';
    value: number;
    label: string;
    max_discount?: number;
    starts_at?: string;
    expires_at?: string;
    is_active?: boolean;
    store_id?: number;
    country_id?: number;
  }) {
    return this.createDiscount({
      ...data,
      discountable_type: 'package',
      discountable_ids: data.package_ids,
    });
  }

  /**
   * Create a Buy X Get Y promotion
   */
  async createBuyXGetYPromotion(data: {
    label: string;
    buy_quantity: number;
    get_quantity: number;
    buy_product_ids?: number[];
    buy_category_ids?: number[];
    buy_any_product?: boolean;
    get_product_ids?: number[];
    get_category_ids?: number[];
    get_same_as_buy?: boolean;
    get_discount_type?: 'free' | 'percentage' | 'fixed';
    get_discount_value?: number;
    max_applications_per_cart?: number;
    max_applications_per_customer?: number;
    starts_at?: string;
    expires_at?: string;
    is_active?: boolean;
    store_id?: number;
    country_id?: number;
  }) {
    return this.createDiscount({
      type: 'buy_x_get_y',
      value: 0, // Value is handled by promotion rule
      ...data,
    });
  }

  /**
   * Format discount for display in frontend
   */
  formatDiscountValue(discount: Discount): string {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}%`;
      case 'fixed':
        return `$${discount.value}`;
      case 'discounted_price':
        return `$${discount.value}`;
      case 'buy_x_get_y':
        const rule = discount.promotion_rule;
        if (!rule) return 'Buy X Get Y';
        return `Buy ${rule.buy_quantity} Get ${rule.get_quantity} ${rule.get_discount_type === 'free' ? 'Free' : `${rule.get_discount_value}% Off`}`;
      default:
        return `${discount.value}`;
    }
  }

  /**
   * Get discount scope for display
   */
  getDiscountScope(discount: Discount): string {
    if (discount.discountable_type === 'App\\Models\\Product') return 'product';
    if (discount.discountable_type === 'App\\Models\\Category') return 'category';
    if (discount.discountable_type === 'App\\Models\\Package') return 'package';
    if (discount.store_id) return 'store';
    if (discount.country_id) return 'country';
    return 'global';
  }

  /**
   * Check if discount is currently active
   */
  isDiscountActive(discount: Discount): boolean {
    if (!discount.is_active) return false;
    
    const now = new Date();
    
    if (discount.starts_at && new Date(discount.starts_at) > now) {
      return false;
    }
    
    if (discount.expires_at && new Date(discount.expires_at) < now) {
      return false;
    }
    
    return true;
  }

  /**
   * Get discount status for display
   */
  getDiscountStatus(discount: Discount): 'active' | 'inactive' | 'upcoming' | 'expired' {
    if (!discount.is_active) return 'inactive';
    
    const now = new Date();
    
    if (discount.starts_at && new Date(discount.starts_at) > now) {
      return 'upcoming';
    }
    
    if (discount.expires_at && new Date(discount.expires_at) < now) {
      return 'expired';
    }
    
    return 'active';
  }
}

export const discountService = new DiscountService();
export default discountService;