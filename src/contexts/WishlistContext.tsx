import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/storeData';
import { toast } from '@/components/ui/sonner';
import { wishlistService, WishlistResponse, AddWishlistResponse } from '@/services/wishlistService';
import { useAuth } from '@/contexts/AuthContext';
import { metaPixelService } from '@/services/metaPixelService';
import { AuthModal } from '@/components/auth/AuthModal';

// Backend product interface to match ProductCard expectations
interface BackendProduct {
  id: number
  name: string
  slug: string
  short_description?: string | null
  category?: any | null
  store?: string
  cover_image?:
    | {
        desktop: string
        tablet: string
        mobile: string
      }
    | string
  pricing?: {
    original_price: number | null
    price: number
    currency_id: number | null
    currency: {
      code: string
      symbol: string
    } | null
    applied_discounts: Array<any>
    vat: {
      rate: number
      amount: number
    }
  }
  flags?: {
    on_sale: boolean
    is_featured: boolean
    is_new_arrival: boolean
    is_best_seller: boolean
    is_vat_exempt?: boolean
    seller_product_status?: string
  }
  stock?: number
  rating?: {
    average: number
    count: number
  }
}

interface WishlistContextType {
  items: BackendProduct[];
  addToWishlist: (product: Product | BackendProduct) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<void>;
  moveToCart: (productId: number, quantity?: number) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BackendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();

  // Convert API wishlist items to BackendProduct format (exactly like RelatedProducts)
  const convertApiWishlistItems = (apiWishlist: WishlistResponse): BackendProduct[] => {
    console.log('Wishlist API response:', apiWishlist);
    
    if (!apiWishlist?.details?.wishlist || !Array.isArray(apiWishlist.details.wishlist)) {
      console.warn('Invalid wishlist data structure:', apiWishlist);
      return [];
    }
    
    return apiWishlist.details.wishlist
      .filter(item => item?.wishlist_item !== null && item?.wishlist_item !== undefined)
      .map(item => {
        const product = item.wishlist_item;
        console.log('Converting wishlist item:', product);
        console.log('Product pricing:', product.pricing);
      
      // Transform following exact RelatedProducts pattern
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        pricing: {
          original_price: product.pricing?.original_price,
          price: product.pricing?.price,
          currency_id: product.pricing?.currency_id,
          currency: product.pricing?.currency,
          applied_discounts: product.pricing?.applied_discounts || [],
          vat: {
            rate: product.pricing?.vat?.rate || 0,
            amount: product.pricing?.vat?.amount || 0,
          },
        },
        flags: {
          on_sale: product.flags?.on_sale || false,
          is_featured: product.flags?.is_featured || false,
          is_new_arrival: product.flags?.is_new_arrival || false,
          is_best_seller: product.flags?.is_best_seller || false,
          is_vat_exempt: product.flags?.is_vat_exempt || false,
          seller_product_status: product.flags?.seller_product_status,
        },
        cover_image: product.cover_image || '/placeholder.svg',
        stock: product.stock,
        rating: {
          average: product.rating?.average || 0,
          count: product.rating?.count || 0,
        },
        short_description: product.short_description,
        category: product.category,
        store: product.store,
        variants_count: product.variants_count,
        has_variants: product.has_variants,
        variations: product.variations,
      };
    });
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
      const convertedItems = convertApiWishlistItems(wishlist);
      setItems(convertedItems);
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

  const addToWishlist = async (product: Product | BackendProduct) => {
    if (!user) {
      setAuthModalOpen(true);
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

      // Track Meta Pixel AddToWishlist event
      try {
        await metaPixelService.trackAddToWishlist(product)
      } catch (pixelError) {
        console.warn('Meta Pixel tracking failed:', pixelError)
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      if (error?.status === 401) {
        setAuthModalOpen(true);
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
      {/* Global auth modal for wishlist actions */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode="signin"
      />
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