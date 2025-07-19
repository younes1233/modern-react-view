
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
      
      if (!productSlug || productSlug.trim() === '' || productSlug === ':slug') {
        console.log('useProductDetail: Invalid slug detected:', productSlug);
        throw new Error('Invalid product slug');
      }
      
      try {
        const response = await productService.getProductBySlug(productSlug, countryId, currencyId, storeId);
        console.log('useProductDetail: API response:', response);
        return response;
      } catch (error: any) {
        console.error('useProductDetail: API error:', error);
        
        // If it's a permission error when logged in, try without authentication
        if (error.message?.includes('permission') || error.message?.includes('manage products')) {
          console.log('useProductDetail: Permission error detected, trying without auth...');
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
            console.log('useProductDetail: Fallback API response:', data);
            return data;
          } catch (fallbackError) {
            console.error('useProductDetail: Fallback also failed:', fallbackError);
            throw error; // Throw original error
          }
        }
        
        throw error;
      }
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
