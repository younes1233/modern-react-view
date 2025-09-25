import BaseApiService, { ApiResponse } from './baseApiService';

export interface UserAddress {
  id: number;
  user_id: number;
  name: string;
  type: string;
  country_code: string;
  delivery_zone_id: number;
  address: string;
  additional_address_details: string;
  latitude: string;
  longitude: string;
  google_place_id: string;
  google_map_link: string;
  google_place_details: any[];
  formatted_address: string;
  is_default: boolean;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface UserOrder {
  id: number;
  user_id: number;
  store_id: number;
  address_id: number;
  payment_method_id: number;
  subtotal: string;
  discount_total: string;
  coupon_discount: string;
  delivery_fee: string;
  total_price: string;
  status: string;
  cancel_reason: string;
  review_rating: number;
  review_comment: string;
  delivery_status: string;
  collection_status: string;
  delivery_method_type: string;
  delivery_company_id: number;
  delivery_cost_calculated: string;
  delivery_cost_override: string;
  is_custom_delivery_cost: number;
  packaging_notes: string;
  parent_order_id: number;
  split_reason: string;
  delivery_tracking_number: string;
  estimated_delivery_date: string;
  delivered_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserWishlist {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
  updated_at: string;
}

export interface UserAPIResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isPhoneVerified: boolean;
  phoneVerifiedAt: string;
  avatar: string;
  role: string | { id: string; name: string } | null;
  permissions: string | { id: string; name: string } | null;
  isActive: string | { id: string; name: string } | boolean;
  isEmailVerified: boolean;
  emailVerifiedAt: string;
  isSeller: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  balance: string;
  gender: string;
  dateOfBirth: string;
  timezone: string;
  sellerId: string;
  sellerStatus: string;
  orders: UserOrder[];
  wishlist: UserWishlist[];
  cart: string;
  addresses: UserAddress[];
}

export interface PaginationResponse {
  current_page: string;
  per_page: string;
  total: string;
  last_page: string;
}

export interface UsersListResponse {
  error: boolean;
  message: string;
  details: {
    users: UserAPIResponse[];
    pagination: PaginationResponse;
  };
}

class UserService extends BaseApiService {
  async getUsers(page: number = 1, perPage: number = 20, search?: string, roleFilter?: string): Promise<UsersListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    if (roleFilter && roleFilter !== 'all') {
      params.append('role', roleFilter);
    }
    
    return this.get<UsersListResponse>(`/users?${params.toString()}`, true);
  }

  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    password: string;
  }): Promise<ApiResponse<{ user: UserAPIResponse }>> {
    return this.post<ApiResponse<{ user: UserAPIResponse }>>('/users', {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      password: userData.password,
    }, true);
  }

  async updateUser(userId: number, userData: Partial<UserAPIResponse>): Promise<ApiResponse<{ user: UserAPIResponse }>> {
    return this.put<ApiResponse<{ user: UserAPIResponse }>>(`/users/${userId}`, userData, true);
  }

  async deleteUser(userId: number): Promise<ApiResponse<{}>> {
    return this.delete<ApiResponse<{}>>(`/users/${userId}`, true);
  }

  async toggleUserStatus(userId: number): Promise<ApiResponse<{ user: UserAPIResponse }>> {
    return this.post<ApiResponse<{ user: UserAPIResponse }>>(`/users/${userId}/toggle-status`, {}, true);
  }

  async updateUserRole(userId: number, role: string): Promise<ApiResponse<{ user: UserAPIResponse }>> {
    return this.put<ApiResponse<{ user: UserAPIResponse }>>(`/users/${userId}/role`, { role }, true);
  }

  async assignRole(userId: number, roleId: number): Promise<ApiResponse<{ user: string }>> {
    return this.post<ApiResponse<{ user: string }>>(`/users/${userId}/assign-role`, { role_id: roleId }, true);
  }
}

// Create and export a singleton instance
export const userService = new UserService();
export default userService;