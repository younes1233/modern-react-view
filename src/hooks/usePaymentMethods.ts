import { useQuery } from '@tanstack/react-query';
import { paymentMethodService } from '@/services/paymentMethodService';

export const usePaymentMethods = (enabled: boolean = true) => {
  const {
    data: allPaymentMethods = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => paymentMethodService.getPaymentMethods(),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  // Ensure allPaymentMethods is always an array (handle backend cache issue)
  let methodsArray: any[] = [];

  if (Array.isArray(allPaymentMethods)) {
    methodsArray = allPaymentMethods;
  } else if (allPaymentMethods && (allPaymentMethods as any).payment_methods) {
    // Old format from cache: {payment_methods: [...]}
    methodsArray = (allPaymentMethods as any).payment_methods;
  }

  // Filter active payment methods
  const paymentMethods = methodsArray.filter(pm => pm.is_active);

  return {
    paymentMethods,
    allPaymentMethods: methodsArray,
    isLoading,
    isError,
    error,
  };
};
