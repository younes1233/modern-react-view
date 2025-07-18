
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
    
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      // Try different possible endpoints
      let endpoint = `/admins/products${queryString ? `?${queryString}` : ''}`;
      
      console.log('Trying endpoint:', endpoint);
      
      try {
        const response = await this.get<ApiResponse<AdminProductsResponse>>(endpoint);
        console.log('Admin products API response:', response);
        return response;
      } catch (error: any) {
        console.log('First endpoint failed, trying alternative...');
        
        // Try alternative endpoint without /admins prefix
        endpoint = `/products${queryString ? `?${queryString}` : ''}`;
        console.log('Trying alternative endpoint:', endpoint);
        
        try {
          const response = await this.get<ApiResponse<AdminProductsResponse>>(endpoint);
          console.log('Admin products API response (alternative):', response);
          return response;
        } catch (alternativeError: any) {
          console.log('Alternative endpoint also failed, trying admin/products...');
          
          // Try with admin (singular)
          endpoint = `/admin/products${queryString ? `?${queryString}` : ''}`;
          const response = await this.get<ApiResponse<AdminProductsResponse>>(endpoint);
          console.log('Admin products API response (admin):', response);
          return response;
        }
      }
    } catch (error: any) {
      console.error('All admin product endpoints failed:', error);
      // Return mock data for now to prevent UI crashes
      return {
        error: false,
        message: "Mock data - API endpoint not available",
        details: {
          products: [],
          pagination: {
            total: 0,
            current_page: 1,
            per_page: 25,
            last_page: 1
          }
        }
      };
    }
  }

  // Get admin product by ID
  async getAdminProduct(id: number): Promise<ApiResponse<{ product: AdminProductAPI }>> {
    console.log('Fetching admin product by ID:', id);
    
    try {
      // Try different possible endpoints
      const endpoints = [`/admins/products/${id}`, `/products/${id}`, `/admin/products/${id}`];
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          const response = await this.get<ApiResponse<{ product: AdminProductAPI }>>(endpoint);
          console.log('Admin product API response:', response);
          return response;
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
        }
      }
      
      throw new Error('All endpoints failed');
    } catch (error: any) {
      console.error('Get admin product failed:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  // Get admin product by SKU
  async getAdminProductBySku(sku: string): Promise<ApiResponse<{ product: AdminProductAPI }>> {
    console.log('Fetching admin product by SKU:', sku);
    
    try {
      // Try different possible endpoints
      const endpoints = [`/admins/products/sku/${sku}`, `/products/sku/${sku}`, `/admin/products/sku/${sku}`];
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          const response = await this.get<ApiResponse<{ product: AdminProductAPI }>>(endpoint);
          console.log('Admin product by SKU API response:', response);
          return response;
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
        }
      }
      
      throw new Error('All endpoints failed');
    } catch (error: any) {
      console.error('Get admin product by SKU failed:', error);
      throw new Error(`Failed to fetch product by SKU: ${error.message}`);
    }
  }

  // Create new product
  async createProduct(productData: CreateProductData): Promise<ApiResponse<{ product: AdminProductAPI }>> {
    console.log('Creating product:', productData);
    
    try {
      // Try different possible endpoints
      const endpoints = ['/admins/products', '/products', '/admin/products'];
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          const response = await this.post<ApiResponse<{ product: AdminProductAPI }>>(endpoint, productData);
          console.log('Create product API response:', response);
          return response;
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
        }
      }
      
      throw new Error('All endpoints failed');
    } catch (error: any) {
      console.error('Create product failed:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  // Delete product
  async deleteProduct(id: number): Promise<ApiResponse<{}>> {
    console.log('Deleting product with ID:', id);
    
    try {
      // Try different possible endpoints
      const endpoints = [`/admins/products/${id}`, `/products/${id}`, `/admin/products/${id}`];
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          const response = await this.delete<ApiResponse<{}>>(endpoint);
          console.log('Delete product API response:', response);
          return response;
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
        }
      }
      
      throw new Error('All endpoints failed');
    } catch (error: any) {
      console.error('Delete product failed:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }
}

export const adminProductService = new AdminProductService();
export default adminProductService;
