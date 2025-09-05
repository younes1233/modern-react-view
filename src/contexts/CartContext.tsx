import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/storeData';
import { toast } from '@/components/ui/sonner';
import { cartService, Cart } from '@/services/cartService';
import { useAuth } from '@/hooks/useAuth';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  product_variant_id?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, productVariantId?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: number) => boolean;
  isLoading: boolean;
  moveToWishlist: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Convert API cart items to our CartItem format
  const convertApiCartItems = (apiCart: Cart): CartItem[] => {
    return apiCart.items.map(item => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
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
      product_variant_id: item.product_variant_id
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

  const addToCart = async (product: Product, quantity = 1, productVariantId?: number) => {
    if (!product.inStock) {
      toast.error("This product is out of stock");
      return;
    }

    try {
      setIsLoading(true);
      
      // Use the first variation if no specific variant is provided
      const variantId = productVariantId || product.variations[0]?.id || product.id;
      
      const cart = await cartService.addToCart({
        product_variant_id: variantId,
        quantity
      });
      
      setItems(convertApiCartItems(cart));
      toast.success(`Added ${product.name} to cart`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      if (error?.status === 401) {
        toast.error("Please login to manage your cart");
      } else {
        toast.error("Failed to add item to cart");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setIsLoading(true);
      const item = items.find(item => item.id === itemId);
      
      const cart = await cartService.removeFromCart(itemId);
      setItems(convertApiCartItems(cart));
      
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

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      setIsLoading(true);
      const cart = await cartService.updateCartItem(itemId, { quantity });
      setItems(convertApiCartItems(cart));
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

  const moveToWishlist = async (itemId: number) => {
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