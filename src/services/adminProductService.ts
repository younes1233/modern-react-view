
import BaseApiService, { ApiResponse } from './baseApiService';

export interface AdminProductAPI {
  id: number;
  name: string;
  slug: string;
  sku: string;
  cover_image?: string;
  status: 'active' | 'inactive' | 'draft';
  has_variants: boolean;
  store_id?: number;
  category_id?: number;
  short_description?: string;
  long_description?: string;
  is_seller_product?: boolean;
  is_on_sale?: boolean;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  product_prices?: Array<{
    country_id: number;
    net_price: number;
    cost: number;
    vat_percentage: number;
  }>;
  specifications?: Array<{
    name: string;
    value: string;
  }>;
  variants?: Array<{
    id?: number;
    name: string;
    sku: string;
    product_variant_prices?: Array<{
      country_id: number;
      net_price: number;
      cost: number;
      vat_percentage: number;
    }>;
    available_countries?: number[];
  }>;
}

export interface AdminProductsResponse {
  products: AdminProductAPI[];
  pagination: {
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
  };
}

export interface CreateProductData {
  name: string;
  slug: string;
  sku: string;
  short_description?: string;
  long_description?: string;
  status: 'active' | 'inactive' | 'draft';
  has_variants: boolean;
  store_id?: number;
  category_id: number;
  is_seller_product?: boolean;
  is_on_sale?: boolean;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  available_countries?: number[];
  product_prices?: Array<{
    country_id: number;
    net_price: number;
    cost: number;
    vat_percentage: number;
  }>;
  variants?: Array<{
    name: string;
    sku: string;
    product_variant_prices?: Array<{
      country_id: number;
      net_price: number;
      cost: number;
      vat_percentage: number;
    }>;
    available_countries?: number[];
  }>;
  specifications?: Array<{
    name: string;
    value: string;
  }>;
}

class AdminProductService extends BaseApiService {
  // Get all admin products with filters
  async getAdminProducts(
    filters: {
      store_id?: number;
      status?: 'active' | 'inactive' | 'draft';
      is_seller_product?: boolean;
      q?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<AdminProductsResponse>> {
    console.log('Fetching admin products with filters:', filters);
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/admins/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.get<ApiResponse<AdminProductsResponse>>(endpoint);
    console.log('Admin products API response:', response);
    return response;
  }

  // Get admin product by ID
  async getAdminProduct(id: number): Promise<ApiResponse<{ product: AdminProductAPI }>> {
    console.log('Fetching admin product by ID:', id);
    const response = await this.get<ApiResponse<{ product: AdminProductAPI }>>(`/admins/products/${id}`);
    console.log('Admin product API response:', response);
    return response;
  }

  // Get admin product by SKU
  async getAdminProductBySku(sku: string): Promise<ApiResponse<{ product: AdminProductAPI }>> {
    console.log('Fetching admin product by SKU:', sku);
    const response = await this.get<ApiResponse<{ product: AdminProductAPI }>>(`/admins/products/sku/${sku}`);
    console.log('Admin product by SKU API response:', response);
    return response;
  }

  // Create new product
  async createProduct(productData: CreateProductData): Promise<ApiResponse<{ product: AdminProductAPI }>> {
    console.log('Creating product:', productData);
    const response = await this.post<ApiResponse<{ product: AdminProductAPI }>>('/admins/products', productData);
    console.log('Create product API response:', response);
    return response;
  }

  // Delete product
  async deleteProduct(id: number): Promise<ApiResponse<{}>> {
    console.log('Deleting product with ID:', id);
    const response = await this.delete<ApiResponse<{}>>(`/admins/products/${id}`);
    console.log('Delete product API response:', response);
    return response;
  }
}

export const adminProductService = new AdminProductService();
export default adminProductService;
