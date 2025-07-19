
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
      
      // Try to parse as number first, if fails try as slug
      const numericId = parseInt(productId);
      let response;
      
      if (!isNaN(numericId)) {
        response = await productService.getProductById(numericId, countryId, currencyId, storeId);
      } else {
        response = await productService.getProductBySlug(productId, countryId, currencyId, storeId);
      }
      
      console.log('useProductDetail: API response:', response);
      return response;
    },
    enabled: !!productId,
    select: (data) => {
      console.log('useProductDetail: Selecting data:', data);
      if (data && data.details && data.details.product) {
        return data.details.product;
      }
      return null;
    }
  });
};
