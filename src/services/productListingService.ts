
import BaseApiService, { ApiResponse } from './baseApiService';

export interface ProductListingAPI {
  id: number;
  title: string;
  subtitle?: string;
  type: 'featured' | 'newArrivals' | 'sale' | 'category' | 'custom';
  products?: any[];
  max_products: number;
  layout: 'grid' | 'slider';
  show_title: boolean;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  category_id?: number;
}

export interface CreateProductListingRequest {
  title: string;
  subtitle?: string;
  type: 'featured' | 'newArrivals' | 'sale' | 'category' | 'custom';
  category_id?: number;
  products?: number[];
  max_products: number;
  layout: 'grid' | 'slider';
  show_title?: boolean;
  is_active?: boolean;
}

export interface UpdateProductListingRequest {
  title?: string;
  subtitle?: string;
  type?: 'featured' | 'newArrivals' | 'sale' | 'category' | 'custom';
  category_id?: number;
  products?: number[];
  max_products?: number;
  layout?: 'grid' | 'slider';
  show_title?: boolean;
  is_active?: boolean;
}

export interface ProductListingWithProducts {
  product_listing: ProductListingAPI;
  products: any[];
}

class ProductListingService extends BaseApiService {
  // Get all product listings
  async getProductListings(): Promise<ApiResponse<{ product_listings: ProductListingAPI[] }>> {
    return this.get('/product-listings');
  }

  // Create a new product listing
  async createProductListing(data: CreateProductListingRequest): Promise<ApiResponse<{ product_listing: ProductListingAPI }>> {
    return this.post('/product-listings', data);
  }

  // Update a product listing
  async updateProductListing(id: number, data: UpdateProductListingRequest): Promise<ApiResponse<{ product_listing: ProductListingAPI }>> {
    return this.put(`/product-listings/${id}`, data);
  }

  // Delete a product listing
  async deleteProductListing(id: number): Promise<ApiResponse<{ product_listing: ProductListingAPI }>> {
    return this.delete(`/product-listings/${id}`);
  }

  // Reorder product listings
  async reorderProductListings(orders: number[]): Promise<ApiResponse<{ product_listings: ProductListingAPI[] }>> {
    return this.put('/product-listings/reorder', { orders });
  }

  // Get products for a specific listing
  async getProductListingProducts(
    productListingId: number, 
    countryId: number = 1, 
    currencyId: number = 1
  ): Promise<ApiResponse<ProductListingWithProducts>> {
    return this.get(`/product-listings/${productListingId}/products?country_id=${countryId}&currency_id=${currencyId}`);
  }
}

export const productListingService = new ProductListingService();
export default productListingService;
