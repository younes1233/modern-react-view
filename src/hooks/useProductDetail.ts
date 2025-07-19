
import { useQuery } from '@tanstack/react-query';
import { productService, ProductAPI } from '@/services/productService';

export const useProductDetail = (
  productId: string,
  countryId: number = 1,
  currencyId?: number,
  storeId?: number
) => {
  return useQuery({
    queryKey: ['product', productId, countryId, currencyId, storeId],
    queryFn: async () => {
      console.log('useProductDetail: Calling API with params:', { productId, countryId, currencyId, storeId });
      
      // Parse as number - the API expects product ID, not slug
      const numericId = parseInt(productId);
      
      if (isNaN(numericId)) {
        throw new Error('Invalid product ID');
      }
      
      const response = await productService.getProductById(numericId, countryId, currencyId, storeId);
      
      console.log('useProductDetail: API response:', response);
      return response;
    },
    enabled: !!productId,
    select: (data) => {
      console.log('useProductDetail: Selecting data:', data);
      // The API response structure is: { error: false, message: "...", details: { product: {...} } }
      if (data && data.details && data.details.product) {
        return data.details.product;
      }
      return null;
    }
  });
};
