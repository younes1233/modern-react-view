# Implementation Strategy

Step-by-step guide to replace mock data with real APIs.

## Phase 1: Setup API Infrastructure

### 1.1 Create API Service Layer

Create `src/services/apiService.ts`:

```typescript
class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.authToken = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }
}

export const apiService = new ApiService();
```

### 1.2 Create API Hook Layer

Create `src/hooks/useApi.ts`:

```typescript
import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

export function useApi<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.get<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}
```

## Phase 2: Replace Store Data

### 2.1 Products API Integration

Replace functions in `src/data/storeData.ts`:

```typescript
import { apiService } from '@/services/apiService';

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiService.get<PaginationResponse<Product>>('/products');
  return response.data;
};

export const getProductById = async (id: number): Promise<Product | undefined> => {
  try {
    return await apiService.get<Product>(`/products/${id}`);
  } catch {
    return undefined;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
  try {
    return await apiService.get<Product>(`/products/slug/${slug}`);
  } catch {
    return undefined;
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const response = await apiService.get<PaginationResponse<Product>>('/products?featured=true');
  return response.data;
};

export const getNewArrivals = async (): Promise<Product[]> => {
  const response = await apiService.get<PaginationResponse<Product>>('/products?new_arrivals=true');
  return response.data;
};

export const getProductsOnSale = async (): Promise<Product[]> => {
  const response = await apiService.get<PaginationResponse<Product>>('/products?on_sale=true');
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  return await apiService.get<Category[]>('/categories');
};

export const getAllCategories = async (): Promise<Category[]> => {
  return await apiService.get<Category[]>('/categories/all');
};

export const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
  return await apiService.post<Category>('/categories', categoryData);
};

export const updateCategory = async (id: number, updates: Partial<Category>): Promise<void> => {
  await apiService.put(`/categories/${id}`, updates);
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiService.delete(`/categories/${id}`);
};

export const reorderCategories = async (newOrder: Category[]): Promise<void> => {
  await apiService.put('/categories/reorder', { categories: newOrder });
};

export const getBanners = async (): Promise<Banner[]> => {
  return await apiService.get<Banner[]>('/banners');
};

export const addBanner = async (bannerData: Omit<Banner, 'id'>): Promise<Banner> => {
  return await apiService.post<Banner>('/banners', bannerData);
};

export const updateBanner = async (id: number, updates: Partial<Banner>): Promise<void> => {
  await apiService.put(`/banners/${id}`, updates);
};

export const deleteBanner = async (id: number): Promise<void> => {
  await apiService.delete(`/banners/${id}`);
};

export const reorderBanners = async (newOrder: Banner[]): Promise<void> => {
  await apiService.put('/banners/reorder', { banners: newOrder });
};

export const getProductListings = async (): Promise<ProductListing[]> => {
  return await apiService.get<ProductListing[]>('/product-listings');
};

export const addProductListing = async (listingData: Omit<ProductListing, 'id'>): Promise<ProductListing> => {
  return await apiService.post<ProductListing>('/product-listings', listingData);
};

export const updateProductListing = async (id: number, updates: Partial<ProductListing>): Promise<void> => {
  await apiService.put(`/product-listings/${id}`, updates);
};

export const deleteProductListing = async (id: number): Promise<void> => {
  await apiService.delete(`/product-listings/${id}`);
};

export const getProductsForListing = async (listing: ProductListing): Promise<Product[]> => {
  const params = new URLSearchParams({
    type: listing.type,
    limit: listing.maxProducts.toString(),
    ...(listing.categoryFilter && { category: listing.categoryFilter }),
    ...(listing.productIds && { ids: listing.productIds.join(',') })
  });
  
  const response = await apiService.get<PaginationResponse<Product>>(`/products?${params}`);
  return response.data;
};

export const getHomeSections = async (): Promise<HomeSection[]> => {
  return await apiService.get<HomeSection[]>('/home-sections');
};

export const getActiveHomeSections = async (): Promise<HomeSection[]> => {
  return await apiService.get<HomeSection[]>('/home-sections?active=true');
};

export const addHomeSection = async (sectionData: Omit<HomeSection, 'id'>): Promise<HomeSection> => {
  return await apiService.post<HomeSection>('/home-sections', sectionData);
};

export const updateHomeSection = async (id: number, updates: Partial<HomeSection>): Promise<void> => {
  await apiService.put(`/home-sections/${id}`, updates);
};

export const deleteHomeSection = async (id: number): Promise<void> => {
  await apiService.delete(`/home-sections/${id}`);
};

export const reorderHomeSections = async (newOrder: HomeSection[]): Promise<void> => {
  await apiService.put('/home-sections/reorder', { sections: newOrder });
};

export const getHeroSection = async (): Promise<HeroSection> => {
  return await apiService.get<HeroSection>('/hero-section');
};

export const updateHeroSection = async (updates: Partial<HeroSection>): Promise<void> => {
  await apiService.put('/hero-section', updates);
};

export const getDisplaySettings = async (): Promise<DisplaySettings> => {
  return await apiService.get<DisplaySettings>('/display-settings');
};

export const updateDisplaySettings = async (newSettings: Partial<DisplaySettings>): Promise<void> => {
  await apiService.put('/display-settings', newSettings);
};
```

### 2.2 Update Components to Use APIs

Update `src/components/store/ProductSection.tsx`:

```typescript
import { useState, useEffect } from "react";
import { ProductListing, getProductsForListing, getDisplaySettings, Product, DisplaySettings } from "@/data/storeData";
import { ProductCard } from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductSectionProps {
  listing: ProductListing;
}

export function ProductSection({ listing }: ProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const refreshData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Refreshing products for listing:", listing.title);
        const [productsData, settingsData] = await Promise.all([
          getProductsForListing(listing),
          getDisplaySettings()
        ]);
        setProducts(productsData);
        setDisplaySettings(settingsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    refreshData();

    const handleDataUpdate = () => {
      refreshData();
    };

    window.addEventListener('storeDataUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('storeDataUpdated', handleDataUpdate);
    };
  }, [listing]);

  console.log(`ProductSection for "${listing.title}" has ${products.length} products`);

  if (loading) {
    return (
      <section className="py-2 md:py-4 bg-white overflow-hidden">
        <div className="w-full max-w-full px-2 md:px-4">
          <div className="mx-auto">
            {listing.showTitle && (
              <div className="mb-2 md:mb-4 relative">
                <div className="relative bg-gradient-to-r from-cyan-100 to-blue-100 pt-6 md:pt-10 overflow-visible w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] absolute">
                  <div className="absolute -top-3 md:-top-6 text-xl md:text-3xl font-bold text-cyan-600 ml-4 md:ml-8 z-10 animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
                  {listing.subtitle && (
                    <div className="text-gray-600 text-sm md:text-base ml-4 md:ml-8 animate-pulse bg-gray-200 h-4 w-32 rounded mt-2"></div>
                  )}
                </div>
              </div>
            )}
            <div className="grid gap-1 md:gap-2 grid-cols-2 md:grid-cols-6">
              {Array.from({ length: isMobile ? 2 : 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[4/6] md:aspect-[4/5] rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded mb-1"></div>
                  <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-2 md:py-4 bg-white overflow-hidden">
        <div className="w-full max-w-full px-2 md:px-4">
          <div className="mx-auto text-center">
            <p className="text-red-500 mb-4">Error loading products: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </section>
    );
  }

  if (!listing.isActive || products.length === 0) {
    console.log(`ProductSection "${listing.title}" not showing: active=${listing.isActive}, products=${products.length}`);
    return null;
  }

  const productsPerSlide = isMobile ? 2 : 6;
  const totalSlides = Math.ceil(products.length / productsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  const startIndex = currentSlide * productsPerSlide;
  const visibleProducts = products.slice(startIndex, startIndex + productsPerSlide);

  return (
    <section className="py-2 md:py-4 bg-white overflow-hidden">
      <div className="w-full max-w-full px-2 md:px-4">
        <div className="mx-auto">
          {listing.showTitle && (
            <div className="mb-2 md:mb-4 relative">
            <div className="relative bg-gradient-to-r from-cyan-100 to-blue-100 pt-6 md:pt-10 overflow-visible w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] absolute">
              <h2 className="absolute -top-3 md:-top-6 text-xl md:text-3xl font-bold text-cyan-600 ml-4 md:ml-8 z-10">
                {listing.title}
              </h2>
              {listing.subtitle && (
             <p className="text-gray-600 text-sm md:text-base ml-4 md:ml-8">
               {listing.subtitle}
             </p>
        )}
      </div>

            </div>
          )}

          <div className="relative overflow-hidden">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => {
                  const slideStartIndex = slideIndex * productsPerSlide;
                  const slideProducts = products.slice(slideStartIndex, slideStartIndex + productsPerSlide);
                  
                  return (
                    <div
                      key={slideIndex}
                      className="w-full flex-shrink-0"
                    >
                      <div className={`grid gap-1 md:gap-2 ${
                        isMobile 
                          ? 'grid-cols-2' 
                          : 'grid-cols-6'
                      }`}>
                        {slideProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {totalSlides > 1 && (
              <>
                <Button
                  variant="outline"
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 w-6 h-10 md:w-8 md:h-12 bg-white shadow-lg hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center z-10"
                >
                  <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                </Button>
                <Button
                  variant="outline"
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 w-6 h-10 md:w-8 md:h-12 bg-white shadow-lg hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center z-10"
                >
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                </Button>
              </>
            )}

            {totalSlides > 1 && (
              <div className="flex justify-end mt-2 md:mt-4 space-x-1 md:space-x-2 pr-4">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      index === currentSlide 
                        ? 'bg-cyan-500 shadow-lg scale-110' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

## Phase 3: Authentication Integration

### 3.1 Update Auth Contexts

Modify `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<User>;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          apiService.setAuthToken(token);
          const userData = await apiService.get<User>('/auth/me');
          setUser(userData);
        } catch (error) {
          console.error('Failed to verify token:', error);
          localStorage.removeItem('auth_token');
          apiService.clearAuthToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiService.post<{user: User, token: string}>('/auth/login', {
        email,
        password
      });
      
      apiService.setAuthToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      const response = await apiService.post<{user: User, token: string}>('/auth/register', userData);
      
      apiService.setAuthToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    try {
      await apiService.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      apiService.clearAuthToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

Modify `src/contexts/RoleAuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

interface RoleUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'manager' | 'super_admin';
  avatar?: string;
  sellerId?: string;
  isActive: boolean;
}

interface RoleAuthContextType {
  user: RoleUser | null;
  login: (email: string, password: string, role?: string) => Promise<RoleUser>;
  logout: () => void;
  register: (userData: RoleRegisterData) => Promise<RoleUser>;
  isLoading: boolean;
}

interface RoleRegisterData {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'seller';
  firstName?: string;
  lastName?: string;
}

const RoleAuthContext = createContext<RoleAuthContextType | undefined>(undefined);

export function RoleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RoleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('role_auth_token');
      if (token) {
        try {
          apiService.setAuthToken(token);
          const userData = await apiService.get<RoleUser>('/auth/me');
          setUser(userData);
        } catch (error) {
          console.error('Failed to verify token:', error);
          localStorage.removeItem('role_auth_token');
          apiService.clearAuthToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, role?: string): Promise<RoleUser> => {
    try {
      const response = await apiService.post<{user: RoleUser, token: string}>('/auth/role-login', {
        email,
        password,
        role
      });
      
      localStorage.setItem('role_auth_token', response.token);
      apiService.setAuthToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (userData: RoleRegisterData): Promise<RoleUser> => {
    try {
      const response = await apiService.post<{user: RoleUser, token: string}>('/auth/role-register', userData);
      
      localStorage.setItem('role_auth_token', response.token);
      apiService.setAuthToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    try {
      await apiService.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('role_auth_token');
      apiService.clearAuthToken();
      setUser(null);
    }
  };

  return (
    <RoleAuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isLoading
    }}>
      {children}
    </RoleAuthContext.Provider>
  );
}

export function useRoleAuth() {
  const context = useContext(RoleAuthContext);
  if (context === undefined) {
    throw new Error('useRoleAuth must be used within a RoleAuthProvider');
  }
  return context;
}
```

## Phase 4: Cart & Wishlist API Integration

### 4.1 Enhance Cart Context

Update `src/contexts/CartContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/storeData';
import { toast } from '@/components/ui/sonner';
import { apiService } from '@/services/apiService';

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

  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    
    loadCartFromApi();
  }, []);

  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(items));
  }, [items]);

  const loadCartFromApi = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('role_auth_token');
      if (!token) return;

      const cartData = await apiService.get<{items: CartItem[]}>('/cart');
      setItems(cartData.items);
    } catch (error) {
      console.error('Failed to load cart from API:', error);
    }
  };

  const syncCartToApi = async (cartItems: CartItem[]) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('role_auth_token');
      if (!token) return;

      await apiService.post('/cart/sync', { items: cartItems });
    } catch (error) {
      console.error('Failed to sync cart to API:', error);
    }
  };

  const addToCart = async (product: Product, quantity = 1) => {
    if (!product.inStock) {
      toast.error("This product is out of stock");
      return;
    }

    const optimisticUpdate = () => {
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

    optimisticUpdate();

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('role_auth_token');
      if (token) {
        await apiService.post('/cart/items', {
          productId: product.id,
          quantity
        });
      }
    } catch (error) {
      console.error('Failed to add to cart via API:', error);
      loadCartFromApi();
    }
  };

  const removeFromCart = async (productId: number) => {
    const item = items.find(item => item.product.id === productId);
    
    setItems(currentItems => {
      const filtered = currentItems.filter(item => item.product.id !== productId);
      if (item) {
        toast.success(`Removed ${item.product.name} from cart`);
      }
      return filtered;
    });

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('role_auth_token');
      if (token) {
        await apiService.delete(`/cart/items/${productId}`);
      }
    } catch (error) {
      console.error('Failed to remove from cart via API:', error);
      loadCartFromApi();
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
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

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('role_auth_token');
      if (token) {
        await apiService.put(`/cart/items/${productId}`, { quantity });
      }
    } catch (error) {
      console.error('Failed to update cart quantity via API:', error);
      loadCartFromApi();
    }
  };

  const clearCart = async () => {
    setItems([]);
    toast.success("Cart cleared");

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('role_auth_token');
      if (token)  {
        await apiService.delete('/cart');
      }
    } catch (error) {
      console.error('Failed to clear cart via API:', error);
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
```

### 4.2 Enhance Wishlist Context

Update `src/contexts/WishlistContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/storeData';
import { toast } from '@/components/ui/sonner';
import { apiService } from '@/services/apiService';

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

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }

    loadWishlistFromApi();
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  const loadWishlistFromApi = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('role_auth_token');
      if (!token) return;

      const wishlistData = await apiService.get<{items: Product[]}>('/wishlist');
      setItems(wishlistData.items);
    } catch (error) {
      console.error('Failed to load wishlist from API:', error);
    }
  };

  const addToWishlist = async (product: Product) => {
    if (items.some(item => item.id === product.id)) {
      toast.info(`${product.name} is already in your wishlist`);
      return;
    }

    setItems(currentItems => {
      toast.success(`Added ${product.name} to wishlist`);
      return [...currentItems, product];
    });

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('role_auth_token');
      if (token) {
        await apiService.post('/wishlist/items', { productId: product.id });
      }
    } catch (error) {
      console.error('Failed to add to wishlist via API:', error);
      loadWishlistFromApi();
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const product = items.find(item => item.id === productId);
    
    setItems(currentItems => {
      if (product) {
        toast.success(`Removed ${product.name} from wishlist`);
      }
      return currentItems.filter(item => item.id !== productId);
    });

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('role_auth_token');
      if (token) {
        await apiService.delete(`/wishlist/items/${productId}`);
      }
    } catch (error) {
      console.error('Failed to remove from wishlist via API:', error);
      loadWishlistFromApi();
    }
  };

  const isInWishlist = (productId: number) => {
    return items.some(item => item.id === productId);
  };

  const clearWishlist = async () => {
    setItems([]);
    toast.success("Wishlist cleared");

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('role_auth_token');
      if (token) {
        await apiService.delete('/wishlist');
      }
    } catch (error) {
      console.error('Failed to clear wishlist via API:', error);
    }
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
```

## Phase 5: Search Integration

### 5.1 Update Search Context

Replace local filtering in `src/contexts/SearchContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProducts, Product } from '@/data/storeData';
import { apiService } from '@/services/apiService';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filteredProducts: Product[];
  searchResults: Product[];
  isSearching: boolean;
  clearFilters: () => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('featured');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = async (
    query: string,
    category: string,
    priceMin: number,
    priceMax: number,
    sort: string
  ) => {
    setIsSearching(true);
    
    try {
      const params = new URLSearchParams();
      
      if (query.trim()) {
        params.append('q', query.trim());
      }
      
      if (category !== 'all') {
        params.append('category', category);
      }
      
      params.append('min_price', priceMin.toString());
      params.append('max_price', priceMax.toString());
      params.append('sort', sort);

      const results = await apiService.get<{
        products: Product[];
        totalCount: number;
        facets: any;
      }>(`/products/search?${params}`);
      
      setSearchResults(results.products);
      setFilteredProducts(results.products);
    } catch (error) {
      console.error('Search failed:', error);
      
      const allProducts = await getProducts();
      let filtered = [...allProducts];

      if (query.trim()) {
        const queryLower = query.toLowerCase().trim();
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(queryLower) ||
          product.category.toLowerCase().includes(queryLower) ||
          (product.sku && product.sku.toLowerCase().includes(queryLower)) ||
          (product.description && product.description.toLowerCase().includes(queryLower))
        );
      }

      if (category !== 'all') {
        filtered = filtered.filter(product => product.category === category);
      }

      filtered = filtered.filter(product => 
        product.price >= priceMin && product.price <= priceMax
      );

      switch (sort) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
          break;
        case 'name-asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'featured':
        default:
          filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }

      setFilteredProducts(filtered);
      setSearchResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const hasQuery = searchQuery.trim().length > 0;
    setIsSearching(hasQuery);
    
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery, selectedCategory, priceRange[0], priceRange[1], sortBy);
    }, hasQuery ? 300 : 0);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 1000]);
    setSortBy('featured');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      priceRange,
      setPriceRange,
      sortBy,
      setSortBy,
      filteredProducts,
      searchResults,
      isSearching,
      clearFilters,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
```

## Phase 6: Dashboard & Admin Integration

### 6.1 Update Dashboard Pages

For pages like `src/pages/Products.tsx`:

```typescript
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleBasedSidebar } from "@/components/dashboard/RoleBasedSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/data/storeData";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    image: '',
    sku: '',
    inStock: true,
    isFeatured: false,
    isNewArrival: false,
    isOnSale: false
  });
  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<Product[]>('/products');
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : undefined,
        rating: 0,
        reviews: 0,
        thumbnails: [],
        variations: []
      };

      await apiService.post<Product>('/products', productData);
      await loadProducts();
      setNewProduct({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        image: '',
        sku: '',
        inStock: true,
        isFeatured: false,
        isNewArrival: false,
        isOnSale: false
      });
      setIsAddModalOpen(false);
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      await apiService.put(`/products/${editingProduct.id}`, editingProduct);
      await loadProducts();
      setEditingProduct(null);
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiService.delete(`/products/${productId}`);
      await loadProducts();
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (product: Product) => {
    if (!product.inStock) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (product.isFeatured) {
      return <Badge className="bg-purple-100 text-purple-800">Featured</Badge>;
    }
    if (product.isNewArrival) {
      return <Badge className="bg-green-100 text-green-800">New</Badge>;
    }
    if (product.isOnSale) {
      return <Badge className="bg-orange-100 text-orange-800">Sale</Badge>;
    }
    return <Badge variant="secondary">Active</Badge>;
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <RoleBasedSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <div className="flex-1 overflow-auto p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <RoleBasedSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <div className="flex-1 overflow-auto p-6">
              <div className="text-center">
                <p className="text-red-500 mb-4">Error loading products: {error}</p>
                <Button onClick={loadProducts}>Retry</Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <RoleBasedSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Package className="w-8 h-8 text-blue-600" />
                  Products
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your product catalog</p>
              </div>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Create a new product in your catalog
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your product"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        value={newProduct.originalPrice}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, originalPrice: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={newProduct.category} 
                        onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="home">Home & Kitchen</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="beauty">Beauty</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                        placeholder="Product SKU"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="col-span-2 flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newProduct.inStock}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, inStock: e.target.checked }))}
                        />
                        <span>In Stock</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newProduct.isFeatured}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        />
                        <span>Featured</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newProduct.isNewArrival}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, isNewArrival: e.target.checked }))}
                        />
                        <span>New Arrival</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newProduct.isOnSale}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, isOnSale: e.target.checked }))}
                        />
                        <span>On Sale</span>
                      </label>
                    </div>
                    <div className="col-span-2">
                      <Button onClick={handleAddProduct} className="w-full">
                        Add Product
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Products</p>
                      <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">In Stock</p>
                      <p className="text-2xl font-bold">{products.filter(p => p.inStock).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Out of Stock</p>
                      <p className="text-2xl font-bold">{products.filter(p => !p.inStock).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Featured</p>
                      <p className="text-2xl font-bold">{products.filter(p => p.isFeatured).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Product List</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.sku && `SKU: ${product.sku}`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                        </TableCell>
