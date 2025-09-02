import BaseApiService, { ApiResponse } from './baseApiService';

export interface DeliveryCompany {
  id: number;
  name: string;
  code: string;
}

export interface DeliveryMethod {
  id: number;
  name: string;
  type: string;
  delivery_company_id: number;
  delivery_company: DeliveryCompany;
  enabled: boolean;
  description: string;
  is_store_vehicle: boolean;
  is_delivery_company: boolean;
  requires_calculation: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryMethodsResponse {
  delivery_methods: DeliveryMethod[];
}

class DeliveryMethodService extends BaseApiService {
  // Get all delivery methods
  async getDeliveryMethods(): Promise<ApiResponse<DeliveryMethodsResponse>> {
    console.log('Fetching delivery methods');

    try {
      const endpoints = ['/admin/delivery-methods'];

      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          const response = await this.get<ApiResponse<DeliveryMethodsResponse>>(endpoint);
          console.log('Delivery methods API response:', response);
          return response;
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
        }
      }

      throw new Error('All endpoints failed');
    } catch (error: any) {
      console.error('All delivery method endpoints failed:', error);
      
      // Return mock data when API is not available
      return {
        error: false,
        message: "Mock data - API endpoint not available",
        details: {
          delivery_methods: [
            {
              id: 1,
              name: "Standard Delivery",
              type: "standard",
              delivery_company_id: 1,
              delivery_company: {
                id: 1,
                name: "Express Delivery Co.",
                code: "EDC"
              },
              enabled: true,
              description: "Standard delivery service",
              is_store_vehicle: false,
              is_delivery_company: true,
              requires_calculation: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              name: "Express Delivery",
              type: "express",
              delivery_company_id: 1,
              delivery_company: {
                id: 1,
                name: "Express Delivery Co.",
                code: "EDC"
              },
              enabled: true,
              description: "Fast delivery service",
              is_store_vehicle: false,
              is_delivery_company: true,
              requires_calculation: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 3,
              name: "Store Vehicle",
              type: "store",
              delivery_company_id: 0,
              delivery_company: {
                id: 0,
                name: "Store Vehicle",
                code: "STORE"
              },
              enabled: true,
              description: "Delivery by store vehicle",
              is_store_vehicle: true,
              is_delivery_company: false,
              requires_calculation: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        }
      };
    }
  }
}

export const deliveryMethodService = new DeliveryMethodService();