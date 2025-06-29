
import BaseApiService, { ApiResponse } from './baseApiService';

export interface ProductAPI {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  category: {
    id: number;
    name: string;
    slug: string;
    path: Array<{ id: number; name: string }>;
  };
  store: {
    id: number;
    name: string;
    slug: string;
  };
  media: {
    cover_image: string;
    thumbnails: Array<{
      id: number;
      image: string;
      alt_text: string;
      is_cover: number;
    }>;
  };
  identifiers: {
    sku: string;
    barcode: string;
  };
  flags: {
    on_sale: boolean;
    is_featured: boolean;
    is_new_arrival: boolean;
    is_seller_product: boolean;
    has_variants: boolean;
  };
  pricing: {
    final: {
      original_price: number;
      price: number;
      currency_id: number;
      currency: {
        code: string;
        symbol: string;
      };
      applied_discounts: Array<{
        label: string;
        type: string;
        value: string;
        amount_value: number;
        max_discount: number | null;
      }>;
    };
    variant_price_range?: {
      min: string;
      max: string;
      currency: string;
      currency_symbol: string;
    } | null;
  };
  inventory: {
    is_available: boolean;
    stock: string | null;
  };
  rating: {
    average: number;
    count: number;
  };
  meta: {
    seo_title: string;
    seo_description: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ProductsResponse {
  products: {
    current_page: number;
    data: ProductAPI[];
    per_page: number;
    from: number;
    to: number;
    last_page: number;
    total: number;
  };
}

class ProductService extends BaseApiService {
  // Get all products with country and currency parameters
  async getProducts(
    countryId: number = 1,
    currencyId: number = 1,
    page: number = 1,
    limit: number = 25
  ): Promise<ApiResponse<ProductsResponse>> {
    console.log('Fetching products from API:', { countryId, currencyId, page, limit });
    const response = await this.get<ApiResponse<ProductsResponse>>(
      `/products?country_id=${countryId}&currency_id=${currencyId}&page=${page}&limit=${limit}`
    );
    console.log('Products API response:', response);
    return response;
  }

  // Get products by category
  async getProductsByCategory(
    categorySlug: string,
    countryId: number = 1,
    currencyId: number = 1,
    page: number = 1,
    limit: number = 25
  ): Promise<ApiResponse<ProductsResponse>> {
    console.log('Fetching products by category:', { categorySlug, countryId, currencyId });
    const response = await this.get<ApiResponse<ProductsResponse>>(
      `/products?category=${categorySlug}&country_id=${countryId}&currency_id=${currencyId}&page=${page}&limit=${limit}`
    );
    console.log('Products by category response:', response);
    return response;
  }

  // Get featured products
  async getFeaturedProducts(
    countryId: number = 1,
    currencyId: number = 1
  ): Promise<ApiResponse<ProductsResponse>> {
    console.log('Fetching featured products:', { countryId, currencyId });
    const response = await this.get<ApiResponse<ProductsResponse>>(
      `/products?featured=true&country_id=${countryId}&currency_id=${currencyId}`
    );
    console.log('Featured products response:', response);
    return response;
  }

  // Get new arrivals
  async getNewArrivals(
    countryId: number = 1,
    currencyId: number = 1
  ): Promise<ApiResponse<ProductsResponse>> {
    console.log('Fetching new arrivals:', { countryId, currencyId });
    const response = await this.get<ApiResponse<ProductsResponse>>(
      `/products?new_arrivals=true&country_id=${countryId}&currency_id=${currencyId}`
    );
    console.log('New arrivals response:', response);
    return response;
  }

  // Get sale products
  async getSaleProducts(
    countryId: number = 1,
    currencyId: number = 1
  ): Promise<ApiResponse<ProductsResponse>> {
    console.log('Fetching sale products:', { countryId, currencyId });
    const response = await this.get<ApiResponse<ProductsResponse>>(
      `/products?on_sale=true&country_id=${countryId}&currency_id=${currencyId}`
    );
    console.log('Sale products response:', response);
    return response;
  }

  // Search products
  async searchProducts(
    query: string,
    countryId: number = 1,
    currencyId: number = 1,
    filters: {
      category?: string;
      min_price?: number;
      max_price?: number;
      sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'featured';
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<ProductsResponse>> {
    console.log('Searching products:', { query, countryId, currencyId, filters });
    
    const params = new URLSearchParams({
      q: query,
      country_id: countryId.toString(),
      currency_id: currencyId.toString(),
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 25).toString(),
    });

    if (filters.category) params.append('category', filters.category);
    if (filters.min_price) params.append('min_price', filters.min_price.toString());
    if (filters.max_price) params.append('max_price', filters.max_price.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const response = await this.get<ApiResponse<ProductsResponse>>(
      `/products/search?${params.toString()}`
    );
    console.log('Search products response:', response);
    return response;
  }
}

export const productService = new ProductService();
export default productService;
