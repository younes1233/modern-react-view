import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useWishlist() {
  const queryClient = useQueryClient();
  const authContext = useAuth();
  const user = authContext?.user;

  // Query for wishlist data with caching and deduplication
  const { data: wishlist, isLoading, error } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: () => wishlistService.getWishlist(),
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add to wishlist');
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove from wishlist');
    },
  });

  // Move to cart mutation
  const moveToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      wishlistService.moveToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Moved to cart');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to move to cart');
    },
  });

  return {
    wishlist,
    isLoading,
    error,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    moveToCart: moveToCartMutation.mutate,
    isAdding: addToWishlistMutation.isPending,
    isRemoving: removeFromWishlistMutation.isPending,
    isMoving: moveToCartMutation.isPending,
  };
}
