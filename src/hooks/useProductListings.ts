
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
    queryFn: productListingService.getProductListings,
    select: (data) => data.details?.product_listings || []
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductListingRequest) => productListingService.createProductListing(data),
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
    mutationFn: ({ id, data }: { id: number; data: UpdateProductListingRequest }) => 
      productListingService.updateProductListing(id, data),
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
    mutationFn: (id: number) => productListingService.deleteProductListing(id),
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
    mutationFn: (orders: number[]) => productListingService.reorderProductListings(orders),
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

export const useProductListingProducts = (productListingId: number, countryId: number = 1, currencyId: number = 1) => {
  return useQuery({
    queryKey: ['productListingProducts', productListingId, countryId, currencyId],
    queryFn: () => productListingService.getProductListingProducts(productListingId, countryId, currencyId),
    enabled: !!productListingId,
    select: (data) => ({
      productListing: data.details?.product_listing,
      products: data.details?.products || []
    })
  });
};
