
import { useQuery } from '@tanstack/react-query';
import { productService, ProductAPI } from '@/services/productService';

export const useProductDetail = (
  productSlug: string,
  countryId: number = 1,
  currencyId?: number,
  storeId?: number
) => {
  return useQuery({
    queryKey: ['product', productSlug, countryId, currencyId, storeId],
    queryFn: async () => {
      console.log('useProductDetail: Calling API with params:', { productSlug, countryId, currencyId, storeId });
      
      if (!productSlug || productSlug.trim() === '') {
        throw new Error('Invalid product slug');
      }
      
      const response = await productService.getProductBySlug(productSlug, countryId, currencyId, storeId);
      
      console.log('useProductDetail: API response:', response);
      return response;
    },
    enabled: !!productSlug && productSlug !== ':slug',
    select: (data) => {
      console.log('useProductDetail: Selecting data:', data);
      // Handle the API response structure: { error: false, message: "...", details: { product: {...} } }
      if (data && data.details && data.details.product) {
        return data.details.product;
      }
      // Fallback - return null if no product found
      return null;
    },
    retry: (failureCount, error) => {
      console.error('Product fetch error:', error);
      return failureCount < 2; // Only retry twice
    }
  });
};
