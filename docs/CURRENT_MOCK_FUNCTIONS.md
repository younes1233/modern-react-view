
# Current Mock Functions to Replace

This document lists all current mock functions and where to find them for API replacement.

## src/data/storeData.ts

### Product Functions (Lines ~500-600)
```typescript
// Replace these functions:
export const getProducts = (): Product[] => {
  return sampleProducts;
};

export const getProductById = (id: number): Product | undefined => {
  return sampleProducts.find(product => product.id === id);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return sampleProducts.find(product => product.slug === slug);
};

export const getFeaturedProducts = (): Product[] => {
  return sampleProducts.filter(product => product.isFeatured);
};

export const getNewArrivals = (): Product[] => {
  return sampleProducts.filter(product => product.isNewArrival);
};

export const getProductsOnSale = (): Product[] => {
  return sampleProducts.filter(product => product.isOnSale);
};
```

**Replace with**: API calls to `/api/products` endpoints

### Category Functions (Lines ~650-700)
```typescript
// Replace these functions:
export const getCategories = (): Category[] => {
  return sampleCategories.filter(c => c.isActive).sort((a, b) => a.order - b.order);
};

export const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
  // Mock implementation
};

export const updateCategory = (id: number, updates: Partial<Category>): void => {
  // Mock implementation
};

export const deleteCategory = (id: number): void => {
  // Mock implementation
};
```

**Replace with**: API calls to `/api/categories` endpoints

### Banner & Hero Functions (Lines ~550-650)
```typescript
// Replace these functions:
export const getBanners = (): Banner[] => {
  return sampleBanners.sort((a, b) => a.order - b.order);
};

export const addBanner = (bannerData: Omit<Banner, 'id'>): Banner => {
  // Mock implementation
};

export const getHeroSection = (): HeroSection => {
  return sampleHeroSection;
};

export const updateHeroSection = (updates: Partial<HeroSection>): void => {
  // Mock implementation
};
```

**Replace with**: API calls to `/api/banners` and `/api/hero-section`

## src/data/users.ts

### User Data (Lines ~1-100)
```typescript
// Replace these mock arrays:
export const demoUsers: User[] = [
  // Mock user data
];

export const demoProducts: Product[] = [
  // Mock product data for sellers
];
```

**Replace with**: API calls to `/api/users` and `/api/seller-products`

## src/contexts/CartContext.tsx

### Current Implementation (Lines ~40-120)
```typescript
// Currently only uses localStorage
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

useEffect(() => {
  localStorage.setItem('shopping-cart', JSON.stringify(items));
}, [items]);
```

**Enhance with**: API calls to `/api/cart` while keeping localStorage for offline support

## src/contexts/WishlistContext.tsx

### Current Implementation (Lines ~30-100)
```typescript
// Currently only uses localStorage
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
```

**Enhance with**: API calls to `/api/wishlist` while keeping localStorage for offline support

## src/contexts/SearchContext.tsx

### Current Search Logic (Lines ~30-80)
```typescript
// Replace this local filtering:
useEffect(() => {
  const allProducts = getProducts();
  let filtered = [...allProducts];

  // Apply search query
  if (searchQuery.trim()) {
    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.sku && product.sku.toLowerCase().includes(query)) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
  }

  // Apply category filter
  if (selectedCategory !== 'all') {
    filtered = filtere, filters);
  }

  // Apply price range filter
  // Apply sorting
  
  setFilteredProducts(filtered);
}, [searchQuery, selectedCategory, priceRange, sortBy]);
```

**Replace with**: API call to `/api/products/search` with query parameters

## Dashboard Pages with Mock Data

### src/pages/Customers.tsx (Lines ~20-50)
```typescript
// Replace mockCustomers array with API call
const mockCustomers: Customer[] = [
  // Mock data
];
```

### src/pages/Orders.tsx (Lines ~20-50)
```typescript
// Replace mockOrders array with API call
const mockOrders: Order[] = [
  // Mock data
];
```

### src/pages/Analytics.tsx (Lines ~20-50)
```typescript
// Replace mock analytics data with API calls
const mockSalesData = [
  // Mock data
];
```

### src/pages/Products.tsx (Lines ~30-60)
```typescript
// Replace mockProducts with API call
const mockProducts: Product[] = [
  // Mock data
];
```

## File Locations Summary

| File | Function | Replace With |
|------|----------|--------------|
| `src/data/storeData.ts` | All export functions | API service calls |
| `src/data/users.ts` | Mock arrays | User management APIs |
| `src/contexts/CartContext.tsx` | localStorage only | API + localStorage |
| `src/contexts/WishlistContext.tsx` | localStorage only | API + localStorage |
| `src/contexts/SearchContext.tsx` | Local filtering | Search API |
| `src/pages/Customers.tsx` | mockCustomers | `/api/customers` |
| `src/pages/Orders.tsx` | mockOrders | `/api/orders` |
| `src/pages/Analytics.tsx` | Mock analytics | `/api/analytics/*` |
| `src/pages/Products.tsx` | mockProducts | `/api/products` |
| `src/pages/SellerProducts.tsx` | demoProducts | `/api/seller/products` |

## Priority Order for Replacement

1. **Authentication APIs** - Critical for user management
2. **Products APIs** - Core functionality
3. **Cart/Wishlist APIs** - User experience
4. **Search APIs** - User experience  
5. **Categories APIs** - Content management
6. **Admin Dashboard APIs** - Management features
7. **Analytics APIs** - Business intelligence
8. **File Upload APIs** - Content management

## Testing Each Replacement

For each function you replace:

1. **Test the API endpoint** with tools like Postman
2. **Update the component** to handle loading states
3. **Implement error handling** 
4. **Test the UI** to ensure it works the same way
5. **Add appropriate loading skeletons**

## Backward Compatibility

During development, you can:

1. Keep both mock and API functions
2. Use environment variable to switch between them
3. Gradually migrate each feature
4. Test thoroughly before removing mock data

```typescript
// Example transition approach:
const USE_API = process.env.REACT_APP_USE_API === 'true';

export const getProducts = USE_API ? getProductsFromAPI : getProductsFromMock;
```
