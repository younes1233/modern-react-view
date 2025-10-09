import BaseApiService, { ApiResponse } from './baseApiService';

export interface CheckoutStartRequest {
  country_id?: number;
  currency_id?: number;
}

export interface CalculatePricingRequest {
  country_id: number;
  currency_id?: number;
  address_id?: number;
  coupon_code?: string;
}

export interface ProcessCheckoutRequest {
  address_id: number;
  payment_method_id: number;
  currency_id?: number;
  coupon_code?: string;
  payment_session_id?: string;
  payment_confirmation?: boolean;
}

export interface DiscountedItem {
  product_id: number;
  variant_id?: number;
  quantity: number;
  price: number;
  original_price: number;
  has_discount: boolean;
  discount_amount: number;
  discount_percentage: number;
  discounted_price: number;
  total_savings: number;
}

export interface ItemsBreakdown {
  original_total: number;
  current_total: number;
  total_discount: number;
  discounted_items: DiscountedItem[];
  item_discounts_total?: number;
  bulk_discount_total?: number;
}

export interface PricingBreakdown {
  subtotal: number;
  original_subtotal?: number;
  delivery_cost: number;
  delivery_calculated: boolean;
  delivery_message?: string;
  coupon_discount?: number;
  promotion_discount?: number;
  item_discounts_total?: number;
  bulk_discount_total?: number;
  promotion_discount_total?: number;
  vat_amount?: number;
  vat_rate?: number;
  tax_total?: number;
  tax_rate?: number;
  final_total: number;
  grand_total?: number;
  total_savings?: number;
  items_total_before_discounts?: number;
  items_total_after_discounts?: number;
  exchange_rate?: number;
  currency: {
    id: number;
    code: string;
    symbol: string;
  };
  items_breakdown?: ItemsBreakdown;
  applied_coupons?: Array<{
    code: string;
    discount_amount: number;
  }>;
  applied_discounts?: any;
  pricing_breakdown?: any;
}

export interface CheckoutStartResponse {
  error: boolean;
  message: string;
  details: {
    pricing_breakdown: PricingBreakdown;
    cart_summary: {
      items_count: number;
      total_quantity: number;
    };
  };
}

export interface CreatePaymentSessionRequest {
  address_id: number;
  payment_method_id: number;
  coupon_code?: string;
}

export interface PaymentSessionResponse {
  error: boolean;
  message: string;
  details: {
    session_id: string;
    merchant_id: string;
    checkout_script_url?: string;
    payment_url?: string;
    expires_at: string;
    amount: number;
    order_id?: number;
    currency: {
      id: number;
      code: string;
      symbol: string;
    };
  };
}

export interface OrderResponse {
  error: boolean;
  message: string;
  details: {
    order_id: number;
    order_number: string | number;
    total_amount: number;
    currency: {
      id: number;
      code: string;
      symbol: string;
    };
    payment_reference?: string;
    payment_details?: any;
  };
}

export interface UnavailableItem {
  product_name: string;
  requested_quantity: number;
  available_quantity: number;
}

export interface StockUnavailableError {
  error: boolean;
  message: string;
  details: {
    unavailable_items: UnavailableItem[];
    action_required: string;
  };
}

// Helper function to check if error is stock unavailable
export const isStockUnavailableError = (error: any): error is StockUnavailableError => {
  return error?.details?.action_required === 'update_cart' && 
         Array.isArray(error?.details?.unavailable_items);
};

class CheckoutService extends BaseApiService {
  /**
   * Start checkout - validates cart and returns initial pricing
   * No stock reservation - stock checked at order placement
   */
  async startCheckout(data?: CheckoutStartRequest): Promise<CheckoutStartResponse> {
    return this.post<CheckoutStartResponse>('/auth/checkout/start', data || {});
  }

  /**
   * Calculate pricing with address and optional coupon
   */
  async calculatePricing(data: CalculatePricingRequest): Promise<ApiResponse<PricingBreakdown>> {
    return this.post<ApiResponse<PricingBreakdown>>('/auth/checkout/calculate-pricing', data);
  }

  /**
   * Create payment session for online payment methods (Areeba, Whish, etc.)
   */
  async createPaymentSession(data: CreatePaymentSessionRequest): Promise<PaymentSessionResponse> {
    return this.post<PaymentSessionResponse>('/auth/checkout/create-payment-session', data);
  }

  /**
   * Confirm Areeba payment after user completes payment
   * Verifies payment with Areeba and deducts inventory
   */
  async confirmAreebaPayment(orderId: number): Promise<OrderResponse> {
    return this.post<OrderResponse>('/auth/checkout/confirm-areeba-payment', { order_id: orderId });
  }

  /**
   * Process final checkout and create order
   * Stock is checked and deducted atomically at this point
   */
  async processCheckout(data: ProcessCheckoutRequest): Promise<OrderResponse> {
    return this.post<OrderResponse>('/auth/checkout/process', data);
  }

  /**
   * Clear checkout lock (for debugging)
   */
  async clearCheckoutLock(): Promise<{ error: boolean; message: string }> {
    return this.post<{ error: boolean; message: string }>('/auth/checkout/clear-lock', {});
  }
}

export const checkoutService = new CheckoutService();
export default checkoutService;
