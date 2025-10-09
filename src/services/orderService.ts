import BaseApiService from "./baseApiService";

/* =========================
   Domain Types (User-side)
   ========================= */

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
  date_from?: string; // ISO date
  date_to?: string;   // ISO date
  min_amount?: number; // include 0
  max_amount?: number; // include 0
  search?: string;
  page?: number;       // include 0/1
  per_page?: number;   // include 0
}

/* =========================
   Admin View Types (exact to API)
   ========================= */

export interface AdminOrderItemView {
  id: number;
  purchasable_type: string;
  purchasable_id: number;
  is_variant: boolean;
  is_package: boolean;
  product_name: string;
  variant_values: string;
  quantity: number;
  selling_price: string;
  discount_amount: string;
  subtotal: string;
  final_total: string;
  product_id: string;
  product_variant_id: string;
}

export interface AdminOrderView {
  id: string;
  user: string;
  user_address: string;
  total_price: string;
  order_status: string;
  payment_method: string;
  created_at: string;
  items: AdminOrderItemView[];
}

export interface AdminOrderViewResponse {
  message: string;
  order: AdminOrderView;
}

/* ================
   Service
   ================ */

class OrderService extends BaseApiService {
  /** Build a query string from filters (keeps 0 values, skips null/undefined/empty strings). */
  private buildQuery(filters?: OrderFilters): string {
    if (!filters) return "";
    const params = new URLSearchParams();

    const append = (key: string, val: unknown) => {
      if (val === null || val === undefined) return;
      // allow 0 and false; skip only empty strings
      if (typeof val === "string" && val.trim() === "") return;
      params.append(key, String(val));
    };

    append("status", filters.status);
    append("date_from", filters.date_from);
    append("date_to", filters.date_to);
    append("min_amount", filters.min_amount);
    append("max_amount", filters.max_amount);
    append("search", filters.search);
    append("page", filters.page);
    append("per_page", filters.per_page);

    return params.toString();
  }

  /* -------- User endpoints -------- */

  /** Authenticated user's orders */
  async getOrders(filters?: OrderFilters): Promise<OrdersResponse> {
    const qs = this.buildQuery(filters);
    const url = qs ? `/auth/orders?${qs}` : "/auth/orders";
    return this.get<OrdersResponse>(url);
  }

  /** Single order (user scope) */
  async getOrder(
    id: number
  ): Promise<{ error: boolean; message: string; details: { order: Order } }> {
    return this.get<{ error: boolean; message: string; details: { order: Order } }>(
      `/auth/orders/${id}`
    );
  }

  /** Cancel order (user scope) */
  async cancelOrder(id: number, reason?: string): Promise<Order> {
    return this.post<Order>(`/auth/orders/${id}/cancel`, { reason });
  }

  /** Submit review (user scope) */
  async submitReview(id: number, rating: number, comment?: string): Promise<Order> {
    return this.post<Order>(`/auth/orders/${id}/review`, { rating, comment });
  }

  /* -------- Admin endpoints -------- */

  /** All orders (admin list) */
  async getAdminOrders(filters?: OrderFilters): Promise<OrdersResponse> {
    const qs = this.buildQuery(filters);
    const url = qs ? `/admin/orders?${qs}` : "/admin/orders";
    return this.get<OrdersResponse>(url);
  }

  /** Admin view order (matches /admin/orders/{order} response) */
  async getAdminOrderView(orderId: number | string): Promise<AdminOrderViewResponse> {
    return this.get<AdminOrderViewResponse>(`/admin/orders/${orderId}`);
  }
}

export const orderService = new OrderService();
