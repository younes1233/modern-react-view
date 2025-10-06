import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '@/data/storeData';
import { toast } from '@/components/ui/sonner';
import { cartService, Cart } from '@/services/cartService';
import { useAuth } from '@/hooks/useAuth';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  productVariantId?: string;
  isVariant?: boolean;
  price?: number;
  selectedVariations?: string;
}

interface CartNotificationItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  currency?: {
    symbol?: string;
    code?: string;
  };
}

interface VariantSelectionRequest {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, productVariantId?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: number) => boolean;
  isLoading: boolean;
  moveToWishlist: (itemId: string) => Promise<void>;
  notificationItem: CartNotificationItem | null;
  clearNotification: () => void;
  variantSelectionRequest: VariantSelectionRequest | null;
  clearVariantSelection: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationItem, setNotificationItem] = useState<CartNotificationItem | null>(null);
  const [variantSelectionRequest, setVariantSelectionRequest] = useState<VariantSelectionRequest | null>(null);
  const { user } = useAuth();

  // Convert API cart items to our CartItem format
  const convertApiCartItems = (apiCart: Cart): CartItem[] => {
    if (!apiCart?.items) return [];
    return apiCart.items.map(item => {
      // Handle image - backend returns object with urls property
      let imageUrl = '/placeholder.svg';
      const img = item.product.image;

      if (typeof img === 'string') {
        imageUrl = img;
      } else if (img && typeof img === 'object') {
        // Check for urls object (from getApiImageData)
        if ((img as any).urls) {
          const urls = (img as any).urls;
          // Prefer catalog > main > original > thumbnail_small
          imageUrl = urls.catalog || urls.main || urls.original || urls.thumbnail_small || '/placeholder.svg';
        }
        // Check for responsive image object { desktop, tablet, mobile }
        else if ((img as any).desktop) {
          imageUrl = (img as any).desktop || (img as any).tablet || (img as any).mobile;
        }
        // Check for URL properties
        else if ((img as any).url || (img as any).image_url) {
          imageUrl = (img as any).url || (img as any).image_url;
        }
      }

      return {
        id: item.id,
        product: {
          id: parseInt(item.product.id),
          name: item.product.name,
          price: item.price,
          image: imageUrl,
          slug: item.product.slug,
          // Add default values for required Product fields
          description: '',
          originalPrice: undefined,
          category: '',
          inStock: true,
          rating: 0,
          reviews: 0,
          isFeatured: false,
          isNewArrival: false,
          isOnSale: false,
          thumbnails: [],
          variations: []
        },
        quantity: item.quantity,
        productVariantId: item.productVariantId,
        isVariant: item.isVariant,
        price: item.price,
        selectedVariations: item.selectedVariations
      };
    });
  };

  // Memoize loadCart so it doesn't change on every render
  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const cart = await cartService.getCart();
      setItems(convertApiCartItems(cart));
    } catch (error) {
      console.error('Error loading cart:', error);
      // On error, fall back to empty cart
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - uses service and setters which are stable

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [user, loadCart]); // Include loadCart in deps (it's memoized so won't cause loops)

  const addToCart = useCallback(async (product: Product, quantity = 1, productVariantId?: string) => {
    console.log('addToCart called with:', { product: product.name, quantity, productVariantId, inStock: product.inStock });
    
    if (!product.inStock) {
      toast.error("This product is out of stock");
      return;
    }

    try {
      setIsLoading(true);
      
      // Build request data based on whether we have a variant or not
      const requestData: any = { quantity };
      
      // Check if product has variants
      const hasVariants = product.variations && product.variations.length > 0;
      console.log('Product variants check:', { hasVariants, variationsLength: product.variations?.length });
      
      if (productVariantId) {
        requestData.product_variant_id = parseInt(productVariantId);
        console.log('Using provided variant ID:', requestData.product_variant_id);
      } else if (hasVariants) {
        // If product has variants but no variant selected, use the first variant
        requestData.product_variant_id = product.variations[0].id;
        console.log('Using first variant ID:', requestData.product_variant_id);
      } else {
        requestData.product_id = product.id;
        console.log('Using product ID:', requestData.product_id);
      }
      
      console.log('Making API call with data:', requestData);
      const cart = await cartService.addToCart(requestData);
      console.log('API call successful, cart response:', cart);
      setItems(convertApiCartItems(cart));

      // Show notification instead of toast
      setNotificationItem({
        name: product.name,
        image: typeof product.image === 'string' ? product.image : '/placeholder.svg',
        price: product.price || 0,
        quantity: quantity,
        currency: (product as any).currency
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);

      if (error?.status === 401) {
        toast.error("Please login to add items to cart");
      } else if (error?.status === 422) {
        // Validation error from Laravel - errors are in error.details
        const validationErrors = error.details || {};
        console.log('Validation errors:', validationErrors);

        // Check if product_id field has variant error
        if (validationErrors?.product_id) {
          const errorMessage = Array.isArray(validationErrors.product_id)
            ? validationErrors.product_id[0]
            : validationErrors.product_id;

          console.log('product_id error:', errorMessage);

          if (errorMessage?.includes('variants') || errorMessage?.includes('product_variant_id')) {
            // Product has variants but no variant was selected - trigger variant selection modal
            console.log('Triggering variant selection modal for product:', product.name);
            setVariantSelectionRequest({ product, quantity });
            return; // Don't show toast
          }
        }

        // Other validation errors - show first error message
        const firstErrorKey = Object.keys(validationErrors)[0];
        const firstError = validationErrors[firstErrorKey];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError || "Invalid product selection");
        toast.error(errorMessage);
      } else {
        const errorMessage = error?.message || "Failed to add item to cart";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // No external dependencies - all stable

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      setIsLoading(true);
      const item = items.find(item => item.id === itemId);
      
      await cartService.removeFromCart(itemId);
      await loadCart(); // Reload cart after removal
      
      if (item) {
        toast.success(`Removed ${item.product.name} from cart`);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error("Failed to remove item from cart");
    } finally {
      setIsLoading(false);
    }
  }, [items, loadCart]); // Depends on items and loadCart

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      setIsLoading(true);
      await cartService.updateCartItem(itemId, { quantity });
      await loadCart(); // Reload cart after update
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error("Failed to update quantity");
    } finally {
      setIsLoading(false);
    }
  }, [removeFromCart, loadCart]); // Depends on removeFromCart and loadCart

  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      await cartService.clearCart();
      setItems([]);
      toast.success("Cart cleared");
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error("Failed to clear cart");
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies

  const moveToWishlist = useCallback(async (itemId: string) => {
    if (!user) {
      toast.error("Please login to save to wishlist");
      return;
    }

    try {
      setIsLoading(true);
      const item = items.find(item => item.id === itemId);
      
      await cartService.moveToWishlist(itemId);
      await loadCart(); // Reload cart after moving item
      
      if (item) {
        toast.success(`Moved ${item.product.name} to wishlist`);
      }
    } catch (error: any) {
      console.error('Error moving to wishlist:', error);
      if (error?.status === 401) {
        toast.error("Please login to save to wishlist");
      } else {
        toast.error("Failed to move item to wishlist");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, items, loadCart]); // Depends on user, items, and loadCart

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]); // Recalculate when items change

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [items]); // Recalculate when items change

  const isInCart = useCallback((productId: number) => {
    return items.some(item => item.product.id === productId);
  }, [items]); // Check against current items

  const clearNotification = useCallback(() => {
    setNotificationItem(null);
  }, []); // No dependencies

  const clearVariantSelection = useCallback(() => {
    setVariantSelectionRequest(null);
  }, []); // No dependencies

  // Memoize the context value to prevent unnecessary re-renders
  // Only creates new object when dependencies actually change
  const contextValue = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    isLoading,
    moveToWishlist,
    notificationItem,
    clearNotification,
    variantSelectionRequest,
    clearVariantSelection
  }), [
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    isLoading,
    moveToWishlist,
    notificationItem,
    clearNotification,
    variantSelectionRequest,
    clearVariantSelection
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}