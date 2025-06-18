
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/storeData';
import { toast } from '@/components/ui/sonner';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  const addToWishlist = (product: Product) => {
    setItems(currentItems => {
      if (currentItems.some(item => item.id === product.id)) {
        toast.info(`${product.name} is already in your wishlist`);
        return currentItems;
      }
      toast.success(`Added ${product.name} to wishlist`);
      return [...currentItems, product];
    });
  };

  const removeFromWishlist = (productId: number) => {
    setItems(currentItems => {
      const product = currentItems.find(item => item.id === productId);
      if (product) {
        toast.success(`Removed ${product.name} from wishlist`);
      }
      return currentItems.filter(item => item.id !== productId);
    });
  };

  const isInWishlist = (productId: number) => {
    return items.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setItems([]);
    toast.success("Wishlist cleared");
  };

  return (
    <WishlistContext.Provider value={{
      items,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
