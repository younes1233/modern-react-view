import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  cartService,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '@/services/cartService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function useCart() {
  const queryClient = useQueryClient()
  const { user } = useAuth() || {}

  const {
    data: cart,
    isLoading,
    error,
  } = useQuery<Cart>({
    queryKey: ['cart', user?.id],
    queryFn: () => cartService.getCart(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const addToCartMutation = useMutation<Cart, unknown, AddToCartRequest>({
    mutationFn: (data) => cartService.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Added to cart')
    },
    onError: (error: any) =>
      toast.error(error?.message || 'Failed to add to cart'),
  })

  const updateCartMutation = useMutation<
    Cart,
    unknown,
    { itemId: string; data: UpdateCartItemRequest }
  >({
    mutationFn: ({ itemId, data }) => cartService.updateCartItem(itemId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (error: any) =>
      toast.error(error?.message || 'Failed to update cart'),
  })

  const removeFromCartMutation = useMutation<Cart, unknown, string>({
    mutationFn: (itemId) => cartService.removeFromCart(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (error: any) =>
      toast.error(error?.message || 'Failed to remove from cart'),
  })

  const clearCartMutation = useMutation<Cart>({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (error: any) =>
      toast.error(error?.message || 'Failed to clear cart'),
  })

  return {
    cart,
    isLoading,
    error,
    addToCart: addToCartMutation.mutate,
    updateCart: updateCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.status === 'pending',
    isUpdating: updateCartMutation.status === 'pending',
    isRemoving: removeFromCartMutation.status === 'pending',
    isClearing: clearCartMutation.status === 'pending',
  }
}
