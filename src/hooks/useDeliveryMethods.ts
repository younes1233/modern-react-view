import { useQuery } from '@tanstack/react-query';
import { deliveryMethodService, DeliveryMethod } from '@/services/deliveryMethodService';

export function useDeliveryMethods() {
  return useQuery({
    queryKey: ['delivery-methods'],
    queryFn: async () => {
      const response = await deliveryMethodService.getDeliveryMethods();
      if (response.error) {
        throw new Error(response.message);
      }
      return response.details?.delivery_methods || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}