
import BaseApiService, { ApiResponse } from './baseApiService';
import { ProductListing } from '@/data/storeData';

// Use the unified ProductListing interface that matches API snake_case
export type ProductListingAPI = ProductListing;

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
    console.log('Fetching product listings from API...');
    const response = await this.get<ApiResponse<{ product_listings: ProductListingAPI[] }>>('/product-listings');
    console.log('Product listings API response:', response);
    return response;
  }

  // Create a new product listing
  async createProductListing(data: CreateProductListingRequest): Promise<ApiResponse<{ product_listing: ProductListingAPI }>> {
    console.log('Creating product listing:', data);
    const response = await this.post<ApiResponse<{ product_listing: ProductListingAPI }>>('/product-listings', data);
    console.log('Create product listing response:', response);
    return response;
  }

  // Update a product listing
  async updateProductListing(id: number, data: UpdateProductListingRequest): Promise<ApiResponse<{ product_listing: ProductListingAPI }>> {
    console.log('Updating product listing:', id, data);
    const response = await this.put<ApiResponse<{ product_listing: ProductListingAPI }>>(`/product-listings/${id}`, data);
    console.log('Update product listing response:', response);
    return response;
  }

  // Delete a product listing
  async deleteProductListing(id: number): Promise<ApiResponse<{ product_listing: ProductListingAPI }>> {
    console.log('Deleting product listing:', id);
    const response = await this.delete<ApiResponse<{ product_listing: ProductListingAPI }>>(`/product-listings/${id}`);
    console.log('Delete product listing response:', response);
    return response;
  }

  // Reorder product listings
  async reorderProductListings(orders: number[]): Promise<ApiResponse<{ product_listings: ProductListingAPI[] }>> {
    console.log('Reordering product listings:', orders);
    const response = await this.put<ApiResponse<{ product_listings: ProductListingAPI[] }>>('/product-listings/reorder', { orders });
    console.log('Reorder product listings response:', response);
    return response;
  }

  // Get products for a specific listing
  async getProductListingProducts(
    productListingId: number, 
    countryId: number = 1, 
    currencyId: number = 1
  ): Promise<ApiResponse<ProductListingWithProducts>> {
    console.log('Fetching products for listing:', productListingId, 'country:', countryId, 'currency:', currencyId);
    const response = await this.get<ApiResponse<ProductListingWithProducts>>(`/product-listings/${productListingId}/products?country_id=${countryId}&currency_id=${currencyId}`);
    console.log('Product listing products response:', response);
    return response;
  }
}

export const productListingService = new ProductListingService();
export default productListingService;
