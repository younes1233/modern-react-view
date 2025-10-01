
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
      if (!productSlug || productSlug.trim() === '' || productSlug === ':slug') {
        throw new Error('Invalid product slug');
      }

      try {
        const response = await productService.getProductBySlug(productSlug, countryId, currencyId, storeId);

        // Extract product from response immediately in queryFn to avoid select function
        if (response && response.details && response.details.product) {
          return response.details.product;
        }
        return null;
      } catch (error: any) {
        // If it's a permission error when logged in, try without authentication
        if (error.message?.includes('permission') || error.message?.includes('manage products')) {
          try {
            // Create a temporary service instance without authentication
            const tempResponse = await fetch(`https://meemhome.com/api/products/slug/${productSlug}?country_id=${countryId}${currencyId ? `&currency_id=${currencyId}` : ''}${storeId ? `&store_id=${storeId}` : ''}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-SECRET': 'qpBRMrOphIamxNVLNyzsHCCQGTBmLV33'
              }
            });

            if (!tempResponse.ok) {
              throw new Error(`HTTP error! status: ${tempResponse.status}`);
            }

            const data = await tempResponse.json();

            // Extract product from fallback response
            if (data && data.details && data.details.product) {
              return data.details.product;
            }
            return null;
          } catch (fallbackError) {
            throw error; // Throw original error
          }
        }

        throw error;
      }
    },
    enabled: !!productSlug && productSlug !== ':slug',
    retry: 2, // Retry twice on failure
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};
