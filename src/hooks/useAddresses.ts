import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService, Address, CreateAddressRequest, UpdateAddressRequest } from '@/services/addressService';
import { toast } from '@/components/ui/sonner';

export const useAddresses = (userId?: number) => {
  const queryClient = useQueryClient();

  // Fetch addresses with caching
  const {
    data: addresses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: () => addressService.getAddresses(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: (data: CreateAddressRequest) => addressService.createAddress(data),
    onSuccess: () => {
      // Invalidate and refetch addresses
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
      toast.success('Address added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add address');
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAddressRequest }) =>
      addressService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
      toast.success('Address updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update address');
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
      toast.success('Address deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete address');
    },
  });

  // Set default address mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => addressService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
      toast.success('Default address updated');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to set default address');
    },
  });

  return {
    // Data
    addresses,
    isLoading,
    isError,
    error,

    // Mutations
    createAddress: createAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    setDefaultAddress: setDefaultMutation.mutate,

    // Mutation states
    isCreating: createAddressMutation.isPending,
    isUpdating: updateAddressMutation.isPending,
    isDeleting: deleteAddressMutation.isPending,
    isSettingDefault: setDefaultMutation.isPending,
  };
};
