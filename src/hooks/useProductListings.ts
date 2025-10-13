
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productListingService, ProductListingAPI, CreateProductListingRequest, UpdateProductListingRequest } from '@/services/productListingService';
import { toast } from '@/components/ui/sonner';

export const useProductListings = () => {
  const queryClient = useQueryClient();
  

  const {
    data: productListingsResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['productListings'],
    queryFn: async () => {
      const response = await productListingService.getProductListings();
      return response;
    },
    select: (data) => {
      // Handle both success and error cases
      if (data && data.details && data.details.product_listings) {
        return data.details.product_listings;
      }
      return [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - increased for better caching
    gcTime: 30 * 60 * 1000, // 30 minutes - increased
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductListingRequest) => {
      return productListingService.createProductListing(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['productListings'] });
      toast({
        title: "Success",
        description: data.message || "Product listing created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product listing",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductListingRequest }) => {
      return productListingService.updateProductListing(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['productListings'] });
      toast({
        title: "Success",
        description: data.message || "Product listing updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product listing",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return productListingService.deleteProductListing(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['productListings'] });
      toast({
        title: "Success",
        description: data.message || "Product listing deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product listing",
        variant: "destructive"
      });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (orders: number[]) => {
      return productListingService.reorderProductListings(orders);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['productListings'] });
      toast({
        title: "Success",
        description: data.message || "Product listings reordered successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reorder product listings",
        variant: "destructive"
      });
    }
  });

  return {
    productListings: productListingsResponse || [],
    isLoading,
    error,
    refetch,
    createProductListing: createMutation.mutateAsync,
    updateProductListing: updateMutation.mutateAsync,
    deleteProductListing: deleteMutation.mutateAsync,
    reorderProductListings: reorderMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending
  };
};

// countryId and currencyId are now optional - backend uses user preferences
export const useProductListingProducts = (productListingId: number, countryId?: number, currencyId?: number) => {
  return useQuery({
    queryKey: ['productListingProducts', productListingId, countryId, currencyId],
    queryFn: async () => {
      const response = await productListingService.getProductListingProducts(productListingId, countryId, currencyId);
      return response;
    },
    enabled: !!productListingId,
    staleTime: 15 * 60 * 1000, // 15 minutes - increased for better caching
    gcTime: 30 * 60 * 1000, // 30 minutes
    select: (data) => {
      if (data && data.details) {
        return {
          productListing: data.details.product_listing,
          products: data.details.products || []
        };
      }
      return {
        productListing: null,
        products: []
      };
    }
  });
};
