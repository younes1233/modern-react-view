
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productListingService, ProductListingAPI, CreateProductListingRequest, UpdateProductListingRequest } from '@/services/productListingService';
import { useToast } from '@/hooks/use-toast';

export const useProductListings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: productListingsResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['productListings'],
    queryFn: async () => {
      console.log('useProductListings: Calling API...');
      const response = await productListingService.getProductListings();
      console.log('useProductListings: Raw API response:', response);
      return response;
    },
    select: (data) => {
      console.log('useProductListings: Selecting data from response:', data);
      // Handle both success and error cases
      if (data && data.details && data.details.product_listings) {
        console.log('useProductListings: Found product listings:', data.details.product_listings);
        return data.details.product_listings;
      }
      console.log('useProductListings: No product listings found in response');
      return [];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductListingRequest) => {
      console.log('Creating product listing mutation:', data);
      return productListingService.createProductListing(data);
    },
    onSuccess: (data) => {
      console.log('Create mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['productListings'] });
      toast({
        title: "Success",
        description: data.message || "Product listing created successfully"
      });
    },
    onError: (error: any) => {
      console.error('Create mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product listing",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductListingRequest }) => {
      console.log('Updating product listing mutation:', id, data);
      return productListingService.updateProductListing(id, data);
    },
    onSuccess: (data) => {
      console.log('Update mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['productListings'] });
      toast({
        title: "Success",
        description: data.message || "Product listing updated successfully"
      });
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product listing",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      console.log('Deleting product listing mutation:', id);
      return productListingService.deleteProductListing(id);
    },
    onSuccess: (data) => {
      console.log('Delete mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['productListings'] });
      toast({
        title: "Success",
        description: data.message || "Product listing deleted successfully"
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product listing",
        variant: "destructive"
      });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (orders: number[]) => {
      console.log('Reordering product listings mutation:', orders);
      return productListingService.reorderProductListings(orders);
    },
    onSuccess: (data) => {
      console.log('Reorder mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['productListings'] });
      toast({
        title: "Success",
        description: data.message || "Product listings reordered successfully"
      });
    },
    onError: (error: any) => {
      console.error('Reorder mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reorder product listings",
        variant: "destructive"
      });
    }
  });

  console.log('useProductListings: Current state:', {
    productListings: productListingsResponse || [],
    isLoading,
    error
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

export const useProductListingProducts = (productListingId: number, countryId: number = 1, currencyId: number = 1) => {
  return useQuery({
    queryKey: ['productListingProducts', productListingId, countryId, currencyId],
    queryFn: async () => {
      console.log('useProductListingProducts: Calling API for listing:', productListingId);
      const response = await productListingService.getProductListingProducts(productListingId, countryId, currencyId);
      console.log('useProductListingProducts: API response:', response);
      return response;
    },
    enabled: !!productListingId,
    select: (data) => {
      console.log('useProductListingProducts: Selecting data:', data);
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
