
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
      
      const safeResponse = {
        products: [] as AdminProductAPI[],
        pagination: {
          total: 0,
          current_page: 1,
          per_page: 25,
          last_page: 1
        }
      };

      if (!data || data.error || !data.details) {
        console.warn('useAdminProducts: Invalid data structure');
        return safeResponse;
      }

      let products: AdminProductAPI[] = [];
      if (data.details.products) {
        if (Array.isArray(data.details.products)) {
          products = data.details.products;
        } else if (data.details.products && typeof data.details.products === 'object' && 'data' in data.details.products) {
          const productsData = data.details.products as any;
          if (Array.isArray(productsData.data)) {
            products = productsData.data;
          }
        }
      }

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
    staleTime: 5 * 60 * 1000,
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
        description: data.message || "Product created successfully"
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

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateProductData> }) => 
      adminProductService.updateProduct(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product'] });
      toast({
        title: "Success",
        description: data.message || "Product updated successfully"
      });
    },
    onError: (error: Error) => {
      console.error('Update product error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Success",
        description: data.message || "Product deleted successfully"
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
