
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/storeData';
import { toast } from '@/components/ui/sonner';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    if (!product.inStock) {
      toast.error("This product is out of stock");
      return;
    }

    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        toast.success(`Updated ${product.name} quantity in cart`);
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast.success(`Added ${product.name} to cart`);
        return [...currentItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(currentItems => {
      const item = currentItems.find(item => item.product.id === productId);
      if (item) {
        toast.success(`Removed ${item.product.name} from cart`);
      }
      return currentItems.filter(item => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success("Cart cleared");
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
      isInCart
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
