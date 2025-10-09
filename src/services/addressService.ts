import BaseApiService from './baseApiService';

export interface DeliveryZone {
  id: number;
  name: string;
  country: {
    id: number;
    name: string;
    code: string;
  };
}

export interface Address {
  id: number;
  type: 'home' | 'office' | 'other';
  address: string;
  additional_address_details?: string;
  phone?: string;
  is_default: boolean;
  delivery_zone?: DeliveryZone;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  error: boolean;
  message: string;
  details: T;
}

export interface CreateAddressRequest {
  type?: 'home' | 'office' | 'other';
  address: string;
  additional_address_details?: string;
  phone?: string;
  delivery_zone_id?: number;
  is_default?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

class AddressService extends BaseApiService {
  // Get all user addresses
  async getAddresses(): Promise<Address[]> {
    const response = await this.get<ApiResponse<Address[]>>('/auth/addresses');
    // Handle both formats: {details: [...]} and {details: {addresses: [...]}}
    if (Array.isArray(response.details)) {
      return response.details;
    }
    return (response.details as any).addresses || [];
  }

  // Get single address
  async getAddress(id: number): Promise<Address> {
    const response = await this.get<ApiResponse<Address>>(`/auth/addresses/${id}`);
    return response.details;
  }

  // Create new address
  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await this.post<ApiResponse<Address>>('/auth/addresses', data);
    return response.details;
  }

  // Update address
  async updateAddress(id: number, data: UpdateAddressRequest): Promise<Address> {
    const response = await this.put<ApiResponse<Address>>(`/auth/addresses/${id}`, data);
    return response.details;
  }

  // Delete address
  async deleteAddress(id: number): Promise<void> {
    await this.delete<ApiResponse<any>>(`/auth/addresses/${id}`);
  }

  // Set default address
  async setDefaultAddress(id: number): Promise<Address> {
    const response = await this.post<ApiResponse<Address>>(`/auth/addresses/${id}/set-default`);
    return response.details;
  }
}

// Export singleton instance
export const addressService = new AddressService();