import BaseApiService from './baseApiService';

export interface DeliveryZone {
  id: number;
  name: string;
  code: string;
  description?: string;
  zipcode?: string;
  default_delivery_cost: number;
  estimated_delivery_days: number;
}

export interface ApiResponse<T> {
  error: boolean;
  message: string;
  details: T;
}

class DeliveryZoneService extends BaseApiService {
  // countryId is now optional - backend uses user preferences
  async getDeliveryZones(countryId?: number): Promise<DeliveryZone[]> {
    const queryString = countryId ? `?country_id=${countryId}` : '';
    const response = await this.get<ApiResponse<{ zones: DeliveryZone[] }>>(
      `/delivery-zones${queryString}`
    );
    return response.details.zones;
  }
}

export const deliveryZoneService = new DeliveryZoneService();