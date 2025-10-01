import BaseApiService, { ApiResponse } from './baseApiService';

export interface CheckoutStartRequest {
  country_id: number;
  currency_id?: number;
}

export interface CheckoutStartResponse {
  error: boolean;
  message: string;
  details: {
    checkout_session_id: string;
    expires_at: string;
    reserved_items: any;
    pricing_breakdown: {
      original_total: string;
      final_total: string;
      total_discount_amount: string;
      savings_percentage: string;
      currency_id: string;
      currency: {
        code: string;
        symbol: string;
      };
      applied_promotions: any;
      promotion_details: {
        total_promotion_discount: string;
        affected_items: any;
      };
      vat: {
        rate: string;
        amount: string;
      };
      items: any[];
      item_count: string;
    };
    cart_summary: {
      items_count: string;
      updated_prices: any;
    };
  };
}

class CheckoutService extends BaseApiService {
  async startCheckout(data: CheckoutStartRequest): Promise<CheckoutStartResponse> {
    return this.post<CheckoutStartResponse>('/auth/checkout/start', data);
  }
}

export const checkoutService = new CheckoutService();
export default checkoutService;
