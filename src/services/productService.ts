import BaseApiService, { ApiResponse } from './baseApiService';

export interface ProductAPI {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
    level: number;
    path: Array<{ id: number; name: string; level: number; slug: string }>;
  };
  store: {
    id: number;
    store_name: string;
    slug: string;
    description: string;
    image: string;
    store_type: string;
    status: string;
    working_hours: string;
    contact: any[];
    legal: any[];
    average_rating: number;
    created_at: string;
    updated_at: string;
  };
  media: {
    cover_image: {
      id: number;
      image: string;
      alt_text: string;
      is_cover: boolean;
      order: number;
      created_at: string;
      updated_at: string;
    };
    thumbnails: Array<{
      id: number;
      image: string;
      alt_text: string;
      is_cover: boolean;
      order: number;
      created_at: string;
      updated_at: string;
    }>;
  };
  identifiers: {
    sku: string;
    barcode: string;
    qr_code: string;
    serial_number: string;
  };
  flags: {
    on_sale: boolean;
    is_featured: boolean;
    is_new_arrival: boolean;
    is_best_seller: boolean;
    is_vat_exempt: boolean;
    seller_product_status: string;
  };
  pricing: {
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
      scope: string;
    }>;
    vat: {
      rate: number;
      amount: number;
    };
  };
  inventory: {
    stock: string;
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
  variants: any[];
  specifications: Array<{
    name: string;
    value: string;
  }>;
  reviews: Array<{
    id: number;
    user: {
      id: number;
      name: string | null;
    };
    rating: number;
    comment: string;
    created_at: string;
  }>;
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

export interface ProductDetailResponse {
  product: ProductAPI;
}

export interface SearchByQueryProduct {
  name: string;
  slug: string;
  cover_image: string | null;
  price: number;
  currency: { code: string; symbol: string };
}
export interface SearchByQueryDetails {
  products: SearchByQueryProduct[];
  search_query: string;
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

  // Get product by ID
  async getProductById(
    productId: number,
    countryId: number = 1,
    currencyId?: number,
    storeId?: number
  ): Promise<ApiResponse<{ product: ProductAPI }>> {
    console.log('Fetching product by ID:', { productId, countryId, currencyId, storeId });
    
    const params = new URLSearchParams({
      country_id: countryId.toString(),
    });

    if (currencyId) params.append('currency_id', currencyId.toString());
    if (storeId) params.append('store_id', storeId.toString());

    // Use the public API endpoint that doesn't require authentication
    const response = await this.get<ApiResponse<{ product: ProductAPI }>>(
      `/api/products/${productId}?${params.toString()}`
    );
    console.log('Product detail API response:', response);
    return response;
  }

  // Get product by slug
  async getProductBySlug(
    slug: string,
    countryId: number = 1,
    currencyId?: number,
    storeId?: number
  ): Promise<ApiResponse<ProductDetailResponse>> {
    console.log('Fetching product by slug:', { slug, countryId, currencyId, storeId });
    
    const params = new URLSearchParams({
      country_id: countryId.toString(),
    });

    if (currencyId) params.append('currency_id', currencyId.toString());
    if (storeId) params.append('store_id', storeId.toString());

    const response = await this.get<ApiResponse<ProductDetailResponse>>(
      `/products/slug/${slug}?${params.toString()}`
    );
    console.log('Product by slug API response:', response);
    return response;
  }
  /**
   * GET /products/search-by-query?country_id=&q=
   * NOTE: server returns newest-first, max 20, no pagination.
   */
  async searchByQuery(
    countryId: number,
    q: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<SearchByQueryDetails>> {
    const ep = `/products/search-by-query?country_id=${encodeURIComponent(countryId)}&q=${encodeURIComponent(q)}`;
    return this.request<ApiResponse<SearchByQueryDetails>>(ep, { method: 'GET', signal });
  }

}

export const productService = new ProductService();
export default productService;
