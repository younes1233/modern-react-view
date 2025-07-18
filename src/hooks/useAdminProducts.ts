
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
      const response = await adminProductService.getAdminProducts(filters);
      return response;
    },
    select: (data) => {
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
    }
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
    enabled: !!id
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
    enabled: !!sku
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
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
    }
  });
};
