
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProductService, AdminProductAPI, CreateProductData } from '@/services/adminProductService';
import { useToast } from '@/hooks/use-toast';

export const useAdminProducts = (
  filters: {
    store_id?: number;
    status?: 'active' | 'inactive' | 'draft';
    is_seller_product?: boolean;
    q?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  return useQuery({
    queryKey: ['admin-products', filters],
    queryFn: async () => {
      try {
        console.log('useAdminProducts: Starting API call with filters:', filters);
        const response = await adminProductService.getAdminProducts(filters);
        console.log('useAdminProducts: Raw API response:', response);
        return response;
      } catch (error: any) {
        console.error('useAdminProducts: API call failed:', error);
        // Return a safe fallback structure
        return {
          error: false,
          message: "Using fallback data",
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
    },
    select: (data) => {
      console.log('useAdminProducts: Processing data in select:', data);
      
      // Ensure we always return a safe structure
      const safeResponse = {
        products: [],
        pagination: {
          total: 0,
          current_page: 1,
          per_page: 25,
          last_page: 1
        }
      };

      // Handle different response structures safely
      if (!data) {
        console.warn('useAdminProducts: No data received');
        return safeResponse;
      }

      if (data.error) {
        console.warn('useAdminProducts: API returned error:', data.message);
        return safeResponse;
      }

      if (!data.details) {
        console.warn('useAdminProducts: No details in response');
        return safeResponse;
      }

      // Safely extract products - ensure it's always an array
      let products = [];
      if (data.details.products) {
        if (Array.isArray(data.details.products)) {
          products = data.details.products;
        } else if (data.details.products.data && Array.isArray(data.details.products.data)) {
          products = data.details.products.data;
        }
      }

      // Safely extract pagination
      let pagination = safeResponse.pagination;
      if (data.details.pagination) {
        pagination = {
          total: data.details.pagination.total || 0,
          current_page: data.details.pagination.current_page || 1,
          per_page: data.details.pagination.per_page || 25,
          last_page: data.details.pagination.last_page || 1
        };
      }

      const result = { products, pagination };
      console.log('useAdminProducts: Final processed result:', result);
      return result;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminProduct = (id: number) => {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const response = await adminProductService.getAdminProduct(id);
      return response;
    },
    select: (data) => {
      if (data && data.details && data.details.product) {
        return data.details.product;
      }
      return null;
    },
    enabled: !!id,
    retry: 1,
  });
};

export const useAdminProductBySku = (sku: string) => {
  return useQuery({
    queryKey: ['admin-product-sku', sku],
    queryFn: async () => {
      const response = await adminProductService.getAdminProductBySku(sku);
      return response;
    },
    select: (data) => {
      if (data && data.details && data.details.product) {
        return data.details.product;
      }
      return null;
    },
    enabled: !!sku,
    retry: 1,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (productData: CreateProductData) => adminProductService.createProduct(productData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Success",
        description: "Product created successfully"
      });
    },
    onError: (error: Error) => {
      console.error('Create product error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => adminProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
    },
    onError: (error: Error) => {
      console.error('Delete product error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
    }
  });
};
