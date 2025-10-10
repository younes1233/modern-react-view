import BaseApiService from "./baseApiService";

/* =========================
   Domain Types (User-side)
   ========================= */

export interface OrderItemPricingDetails {
  original_price: number;
  selling_price: number;
  cost: number;
  profit: number;
  discount_amount: number;
  item_discount_amount: number;
  item_discount_percentage: number;
  discount_type?: string;
  discount_details?: any;
  has_discount: boolean;
  coupon_code?: string;
  coupon_discount_amount: number;
  tax_amount: number;
  tax_rate: number;
  line_total_before_tax: number;
  line_total_after_tax: number;
  currency_code: string;
  exchange_rate: number;
  total_savings: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_variant_id?: number;
  product_name: string;
  variant_values?: string;
  quantity: number;
  selling_price: number;
  original_price?: number;
  cost: number;
  discount_amount: number;
  item_discount_amount?: number;
  item_discount_percentage?: number;
  discount_type?: string;
  discount_details?: any;
  coupon_code?: string;
  coupon_discount_amount?: number;
  tax_amount?: number;
  tax_rate?: number;
  line_total_before_tax?: number;
  line_total_after_tax?: number;
  currency_code?: string;
  exchange_rate?: number;
  subtotal: number;
  profit: number;
  refunded_quantity: number;
  refunded_amount: number;
  refund_reason?: string;
  pricing_details?: OrderItemPricingDetails;
}

export interface OrderPricingBreakdown {
  subtotal: number;
  original_subtotal: number;
  discount_total: number;
  item_discounts_total: number;
  bulk_discount_total: number;
  promotion_discount_total: number;
  coupon_discount: number;
  coupon_code_used?: string;
  all_coupons_used?: string[];
  coupon_breakdown?: any;
  tax_total: number;
  tax_rate: number;
  tax_breakdown?: any;
  delivery_fee: number;
  currency_code: string;
  exchange_rate: number;
  items_total_before_discounts: number;
  items_total_after_discounts: number;
  total_savings: number;
  applied_discounts?: any;
  pricing_breakdown_full?: any;
}

export interface Order {
  id: number;
  user_id: number;
  store_id: number;
  address_id?: number;
  payment_method_id?: number;
  subtotal: number;
  original_subtotal?: number;
  discount_total: number;
  item_discounts_total?: number;
  bulk_discount_total?: number;
  promotion_discount_total?: number;
  coupon_discount: number;
  coupon_code_used?: string;
  all_coupons_used?: string[];
  coupon_breakdown?: any;
  tax_total?: number;
  tax_rate?: number;
  tax_breakdown?: any;
  pricing_breakdown?: any;
  applied_discounts?: any;
  currency_code?: string;
  exchange_rate?: number;
  items_total_before_discounts?: number;
  items_total_after_discounts?: number;
  total_savings?: number;
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
  pricing_breakdown_summary?: OrderPricingBreakdown;
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
  variant_values: Array<{
    attribute: string;
    type: string;
    value: string;
    slug?: string;
    hex_color?: string;
  }> | null;
  product_image?: string;
  debug_variant_info?: any;
  quantity: number;
  selling_price: string;
  discount_amount: string;
  item_discount_amount?: string;
  item_discount_percentage?: string;
  discount_type?: string;
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
  subtotal: string;
  order_status: string;
  payment_method: string;
  payment_method_details?: any;
  delivery_fee: string;
  delivery_method_type?: string;
  delivery_tracking_number?: string;
  estimated_delivery_date?: string;
  is_custom_delivery_cost: boolean;
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

  /** Update order status (admin) */
  async updateOrderStatus(orderId: number | string, status: string): Promise<{ message: string; order: any }> {
    return this.put<{ message: string; order: any }>(`/admin/orders/${orderId}`, {
      order_status: status
    });
  }
}

export const orderService = new OrderService();
