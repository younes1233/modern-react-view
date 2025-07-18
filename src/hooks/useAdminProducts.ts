
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
        const response = await adminProductService.getAdminProducts(filters);
        console.log('useAdminProducts response:', response);
        return response;
      } catch (error: any) {
        console.error('useAdminProducts error:', error);
        // Return empty structure instead of throwing to prevent UI crashes
        return {
          error: false,
          message: "No data available",
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
      console.log('useAdminProducts select data:', data);
      if (data && data.details) {
        return {
          products: data.details.products || [],
          pagination: data.details.pagination || {
            total: 0,
            current_page: 1,
            per_page: 10,
            last_page: 1
          }
        };
      }
      return {
        products: [],
        pagination: {
          total: 0,
          current_page: 1,
          per_page: 10,
          last_page: 1
        }
      };
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
