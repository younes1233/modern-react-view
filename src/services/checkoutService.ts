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

export interface PricingBreakdown {
  subtotal: number;
  delivery_cost: number;
  delivery_calculated: boolean;
  delivery_message?: string;
  coupon_discount?: number;
  promotion_discount?: number;
  vat_amount?: number;
  vat_rate?: number;
  final_total: number;
  currency: {
    id: number;
    code: string;
    symbol: string;
  };
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

export interface StockUnavailableError {
  error: boolean;
  message: string;
  details: {
    unavailable_items: Array<{
      product_name: string;
      requested_quantity: number;
      available_quantity: number;
    }>;
    action_required: string;
  };
}

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
}

export const checkoutService = new CheckoutService();
export default checkoutService;
