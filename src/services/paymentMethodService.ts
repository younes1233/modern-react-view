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

    // Handle both old format {payment_methods: [...]} and new format with details
    if (response.details) {
      // New format with Resource
      if (Array.isArray(response.details)) {
        return response.details;
      }
      // Old cached format {payment_methods: [...]}
      if ((response.details as any).payment_methods) {
        return (response.details as any).payment_methods;
      }
    }

    return [];
  }
}

export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;
