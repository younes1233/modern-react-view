import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/storeData';
import { toast } from '@/components/ui/sonner';
import { wishlistService, WishlistResponse, AddWishlistResponse } from '@/services/wishlistService';
import { useAuth } from '@/hooks/useAuth';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<void>;
  moveToCart: (productId: number, quantity?: number) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Convert API wishlist items to our Product format
  const convertApiWishlistItems = (apiWishlist: WishlistResponse): Product[] => {
    return apiWishlist.details.wishlist.map(item => ({
      id: item.wishlist_item.id,
      name: item.wishlist_item.name || '',
      price: item.wishlist_item.pricing?.price ? parseFloat(item.wishlist_item.pricing.price) : 0,
      originalPrice: item.wishlist_item.pricing?.original_price ? parseFloat(item.wishlist_item.pricing.original_price) : undefined,
      image: item.wishlist_item.media?.cover_image || '',
      slug: item.wishlist_item.slug || '',
      inStock: item.wishlist_item.stock > 0,
      rating: item.wishlist_item.rating?.average ? parseFloat(item.wishlist_item.rating.average) : 0,
      reviews: item.wishlist_item.rating?.count ? parseInt(item.wishlist_item.rating.count) : 0,
      // Add default values for required Product fields with null safety
      description: item.wishlist_item.description || '',
      category: item.wishlist_item.category?.name || 'Uncategorized',
      isFeatured: item.wishlist_item.flags?.is_featured || false,
      isNewArrival: item.wishlist_item.flags?.is_new_arrival || false,
      isOnSale: item.wishlist_item.flags?.on_sale || false,
      sku: item.wishlist_item.sku || '',
      thumbnails: [],
      variations: []
    }));
  };

  // Load wishlist when user logs in
  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      // Clear wishlist when user logs out
      setItems([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const wishlist = await wishlistService.getWishlist();
      setItems(convertApiWishlistItems(wishlist));
    } catch (error: any) {
      console.error('Error loading wishlist:', error);
      if (error?.status === 401) {
        // User not authenticated, clear wishlist
        setItems([]);
      } else {
        toast.error("Failed to load wishlist");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (product: Product) => {
    if (!user) {
      toast.error("Please login to save items to your wishlist");
      return;
    }

    // Check if already in wishlist
    if (items.some(item => item.id === product.id)) {
      toast.info(`${product.name} is already in your wishlist`);
      return;
    }

    try {
      setIsLoading(true);
      await wishlistService.addToWishlist({
        product_id: product.id
      });
      
      // Reload wishlist after adding
      await loadWishlist();
      toast.success(`Added ${product.name} to wishlist`);
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      if (error?.status === 401) {
        toast.error("Please login to save to wishlist");
      } else {
        toast.error("Failed to add item to wishlist");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) {
      toast.error("Please login to manage your wishlist");
      return;
    }

    try {
      setIsLoading(true);
      const product = items.find(item => item.id === productId);
      
      await wishlistService.removeFromWishlist(productId);
      
      // Reload wishlist after removing
      await loadWishlist();
      
      if (product) {
        toast.success(`Removed ${product.name} from wishlist`);
      }
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      if (error?.status === 401) {
        toast.error("Please login to manage your wishlist");
      } else {
        toast.error("Failed to remove item from wishlist");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!user) {
      toast.error("Please login to manage your wishlist");
      return;
    }

    try {
      setIsLoading(true);
      await wishlistService.clearWishlist();
      setItems([]);
      toast.success("Wishlist cleared");
    } catch (error: any) {
      console.error('Error clearing wishlist:', error);
      if (error?.status === 401) {
        toast.error("Please login to manage your wishlist");
      } else {
        toast.error("Failed to clear wishlist");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const moveToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      toast.error("Please login to move items to cart");
      return;
    }

    try {
      setIsLoading(true);
      const product = items.find(item => item.id === productId);
      
      await wishlistService.moveToCart(productId, quantity);
      await loadWishlist(); // Reload wishlist after moving item
      
      if (product) {
        toast.success(`Moved ${product.name} to cart`);
      }
    } catch (error: any) {
      console.error('Error moving to cart:', error);
      if (error?.status === 401) {
        toast.error("Please login to move items to cart");
      } else {
        toast.error("Failed to move item to cart");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: number) => {
    return items.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      items,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      moveToCart,
      isLoading
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