
import { useQuery } from '@tanstack/react-query';
import { productService, ProductAPI } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';

export const useProducts = (
  countryId: number = 1,
  currencyId: number = 1,
  page: number = 1,
  limit: number = 25
) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['products', countryId, currencyId, page, limit],
    queryFn: async () => {
      console.log('useProducts: Calling API with params:', { countryId, currencyId, page, limit });
      const response = await productService.getProducts(countryId, currencyId, page, limit);
      console.log('useProducts: API response:', response);
      return response;
    },
    select: (data) => {
      console.log('useProducts: Selecting data:', data);
      if (data && data.details && data.details.products) {
        return {
          products: data.details.products.data || [],
          pagination: {
            currentPage: data.details.products.current_page,
            totalPages: data.details.products.last_page,
            perPage: data.details.products.per_page,
            total: data.details.products.total,
            from: data.details.products.from,
            to: data.details.products.to,
          }
        };
      }
      return {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          perPage: 25,
          total: 0,
          from: 0,
          to: 0,
        }
      };
    },
    onError: (error: any) => {
      console.error('useProducts error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch products",
        variant: "destructive"
      });
    }
  });
};

export const useFeaturedProducts = (countryId: number = 1, currencyId: number = 1) => {
  return useQuery({
    queryKey: ['products', 'featured', countryId, currencyId],
    queryFn: async () => {
      console.log('useFeaturedProducts: Calling API...');
      const response = await productService.getFeaturedProducts(countryId, currencyId);
      console.log('useFeaturedProducts: API response:', response);
      return response;
    },
    select: (data) => {
      console.log('useFeaturedProducts: Selecting data:', data);
      if (data && data.details && data.details.products) {
        return data.details.products.data || [];
      }
      return [];
    }
  });
};

export const useNewArrivals = (countryId: number = 1, currencyId: number = 1) => {
  return useQuery({
    queryKey: ['products', 'newArrivals', countryId, currencyId],
    queryFn: async () => {
      console.log('useNewArrivals: Calling API...');
      const response = await productService.getNewArrivals(countryId, currencyId);
      console.log('useNewArrivals: API response:', response);
      return response;
    },
    select: (data) => {
      console.log('useNewArrivals: Selecting data:', data);
      if (data && data.details && data.details.products) {
        return data.details.products.data || [];
      }
      return [];
    }
  });
};

export const useSaleProducts = (countryId: number = 1, currencyId: number = 1) => {
  return useQuery({
    queryKey: ['products', 'sale', countryId, currencyId],
    queryFn: async () => {
      console.log('useSaleProducts: Calling API...');
      const response = await productService.getSaleProducts(countryId, currencyId);
      console.log('useSaleProducts: API response:', response);
      return response;
    },
    select: (data) => {
      console.log('useSaleProducts: Selecting data:', data);
      if (data && data.details && data.details.products) {
        return data.details.products.data || [];
      }
      return [];
    }
  });
};

export const useProductsByCategory = (
  categorySlug: string,
  countryId: number = 1,
  currencyId: number = 1,
  page: number = 1,
  limit: number = 25
) => {
  return useQuery({
    queryKey: ['products', 'category', categorySlug, countryId, currencyId, page, limit],
    queryFn: async () => {
      console.log('useProductsByCategory: Calling API...');
      const response = await productService.getProductsByCategory(categorySlug, countryId, currencyId, page, limit);
      console.log('useProductsByCategory: API response:', response);
      return response;
    },
    enabled: !!categorySlug,
    select: (data) => {
      console.log('useProductsByCategory: Selecting data:', data);
      if (data && data.details && data.details.products) {
        return {
          products: data.details.products.data || [],
          pagination: {
            currentPage: data.details.products.current_page,
            totalPages: data.details.products.last_page,
            perPage: data.details.products.per_page,
            total: data.details.products.total,
            from: data.details.products.from,
            to: data.details.products.to,
          }
        };
      }
      return {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          perPage: 25,
          total: 0,
          from: 0,
          to: 0,
        }
      };
    }
  });
};

export const useProductSearch = (
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
) => {
  return useQuery({
    queryKey: ['products', 'search', query, countryId, currencyId, filters],
    queryFn: async () => {
      console.log('useProductSearch: Calling API...');
      const response = await productService.searchProducts(query, countryId, currencyId, filters);
      console.log('useProductSearch: API response:', response);
      return response;
    },
    enabled: !!query,
    select: (data) => {
      console.log('useProductSearch: Selecting data:', data);
      if (data && data.details && data.details.products) {
        return {
          products: data.details.products.data || [],
          pagination: {
            currentPage: data.details.products.current_page,
            totalPages: data.details.products.last_page,
            perPage: data.details.products.per_page,
            total: data.details.products.total,
            from: data.details.products.from,
            to: data.details.products.to,
          }
        };
      }
      return {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          perPage: 25,
          total: 0,
          from: 0,
          to: 0,
        }
      };
    }
  });
};
