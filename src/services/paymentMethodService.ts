import BaseApiService from './baseApiService';

export interface PaymentMethod {
  id: number;
  name: string;
  type: 'cod' | 'areeba' | 'whish' | 'card';
  description?: string;
  is_active: boolean;
  icon?: string;
}

export interface ApiResponse<T> {
  error: boolean;
  message: string;
  details: T;
}

class PaymentMethodService extends BaseApiService {
  /**
   * Get all available payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await this.get<ApiResponse<PaymentMethod[]>>('/payment-methods');
    return response.details;
  }
}

export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;
