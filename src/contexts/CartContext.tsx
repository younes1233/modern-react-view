import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Convert API cart items to our CartItem format
  const convertApiCartItems = (apiCart: Cart): CartItem[] => {
    if (!apiCart?.items) return [];
    return apiCart.items.map(item => ({
      id: item.id,
      product: {
        id: parseInt(item.product.id),
        name: item.product.name,
        price: item.price,
        image: item.product.cover_image || item.product.image,
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
    }));
  };

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [user]); // Reload when user logs in/out to get merged cart

  const loadCart = async () => {
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
  };

  const addToCart = async (product: Product, quantity = 1, productVariantId?: string) => {
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
      toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} of "${product.name}" to cart`, {
        description: product.price ? `Price: $${product.price.toFixed(2)} each` : 'Added to cart successfully',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      console.error('Error details:', { status: error?.status, response: error?.response?.data });
      if (error?.status === 401) {
        toast.error("Please login to manage your cart");
      } else if (error?.response?.data?.details?.product_id) {
        toast.error("Please select a variant for this product");
      } else {
        toast.error("Failed to add item to cart");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
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
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
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
  };

  const clearCart = async () => {
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
  };

  const moveToWishlist = async (itemId: string) => {
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
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const isInCart = (productId: number) => {
    return items.some(item => item.product.id === productId);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isInCart,
      isLoading,
      moveToWishlist
    }}>
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