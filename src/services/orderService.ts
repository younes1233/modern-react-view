import BaseApiService from './baseApiService';

export interface OrderItem {
  id: number;
  product_id: number;
  product_variant_id?: number;
  product_name: string;
  variant_values?: string;
  quantity: number;
  selling_price: number;
  cost: number;
  discount_amount: number;
  subtotal: number;
  profit: number;
  refunded_quantity: number;
  refunded_amount: number;
  refund_reason?: string;
}

export interface Order {
  id: number;
  user_id: number;
  store_id: number;
  address_id?: number;
  payment_method_id?: number;
  subtotal: number;
  discount_total: number;
  coupon_discount: number;
  delivery_fee: number;
  total_price: number;
  status: string;
  cancel_reason?: string;
  review_rating?: number;
  review_comment?: string;
  delivery_status: string;
  collection_status: string;
  delivery_method_type?: string;
  delivery_company_id?: number;
  delivery_cost_calculated?: number;
  delivery_cost_override?: number;
  is_custom_delivery_cost: boolean;
  packaging_notes?: string;
  parent_order_id?: number;
  split_reason?: string;
  delivery_tracking_number?: string;
  estimated_delivery_date?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  user?: any;
  store?: any;
  address?: any;
  payment_method?: any;
}

export interface OrderStatus {
  value: string;
  label: string;
  color: string;
  icon: string;
}

export interface OrdersResponse {
  error: boolean;
  message: string;
  details: {
    orders: Order[];
    statuses?: OrderStatus[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface OrderFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

class OrderService extends BaseApiService {
  // User orders (authenticated user's own orders)
  async getOrders(filters?: OrderFilters): Promise<OrdersResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.min_amount) params.append('min_amount', filters.min_amount.toString());
      if (filters.max_amount) params.append('max_amount', filters.max_amount.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/auth/orders?${queryString}` : '/auth/orders';

    return this.get<OrdersResponse>(url);
  }

  // Admin orders (all orders - for dashboard)
  async getAdminOrders(filters?: OrderFilters): Promise<OrdersResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.min_amount) params.append('min_amount', filters.min_amount.toString());
      if (filters.max_amount) params.append('max_amount', filters.max_amount.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/admin/orders?${queryString}` : '/admin/orders';

    return this.get<OrdersResponse>(url);
  }

  async getOrder(id: number): Promise<{ error: boolean; message: string; details: { order: Order } }> {
    return this.get<{ error: boolean; message: string; details: { order: Order } }>(`/auth/orders/${id}`);
  }

  async cancelOrder(id: number, reason?: string): Promise<Order> {
    return this.post<Order>(`/auth/orders/${id}/cancel`, { reason });
  }

  async submitReview(id: number, rating: number, comment?: string): Promise<Order> {
    return this.post<Order>(`/auth/orders/${id}/review`, { rating, comment });
  }
}

export const orderService = new OrderService();
