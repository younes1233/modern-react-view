
# Data Models & API Response Formats

Expected response formats for all API endpoints.

## Product Model

```typescript
interface ProductAPIResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: number;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  sku?: string;
  createdAt: string;
  updatedAt: string;
  thumbnails: ProductThumbnail[];
  variations: ProductVariation[];
  seoTitle?: string;
  seoDescription?: string;
}

interface ProductThumbnail {
  id: number;
  url: string;
  alt: string;
  order: number;
}

interface ProductVariation {
  id: number;
  type: string; // 'color', 'size', etc.
  value: string;
  priceModifier: number;
  stock: number;
  sku?: string;
}
```

## Category Model

```typescript
interface CategoryAPIResponse {
  id: number;
  name: string;
  slug: string;
  image: string;
  icon: string;
  description?: string;
  productCount: number;
  isActive: boolean;
  order: number;
  parentId?: number;
  children?: CategoryAPIResponse[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}
```

## User Model

```typescript
interface UserAPIResponse {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'seller' | 'manager' | 'super_admin';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  
  // For sellers
  sellerId?: string;
  sellerStatus?: 'pending' | 'approved' | 'suspended';
  
  // Address information
  addresses?: Address[];
}

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}
```

## Cart Model

```typescript
interface CartAPIResponse {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: string;
  productId: number;
  quantity: number;
  price: number; // Price at time of adding to cart
  product: ProductAPIResponse;
  selectedVariations?: ProductVariation[];
}
```

## Order Model

```typescript
interface OrderAPIResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: UserAPIResponse;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

interface OrderItem {
  id: string;
  productId: number;
  product: ProductAPIResponse;
  quantity: number;
  price: number;
  totalPrice: number;
  selectedVariations?: ProductVariation[];
}
```

## Wishlist Model

```typescript
interface WishlistAPIResponse {
  id: string;
  userId: string;
  items: WishlistItem[];
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

interface WishlistItem {
  id: string;
  productId: number;
  product: ProductAPIResponse;
  addedAt: string;
}
```

## Banner Model

```typescript
interface BannerAPIResponse {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  ctaText?: string;
  ctaLink?: string;
  position: 'hero' | 'secondary' | 'sidebar';
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Search Response Model

```typescript
interface SearchAPIResponse {
  products: ProductAPIResponse[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  facets: {
    categories: Array<{
      id: number;
      name: string;
      count: number;
    }>;
    priceRanges: Array<{
      min: number;
      max: number;
      count: number;
    }>;
    brands: Array<{
      name: string;
      count: number;
    }>;
  };
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  };
}
```

## Analytics Models

```typescript
interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  topProducts: Array<{
    product: ProductAPIResponse;
    sales: number;
    revenue: number;
  }>;
  salesByPeriod: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

interface ProductAnalytics {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  newProducts: number;
  topPerforming: ProductAPIResponse[];
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerGrowth: number;
  topCustomers: Array<{
    customer: UserAPIResponse;
    totalOrders: number;
    totalSpent: number;
  }>;
}
```

## File Upload Response

```typescript
interface UploadAPIResponse {
  success: boolean;
  file: {
    url: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  };
}

interface MultipleUploadAPIResponse {
  success: boolean;
  files: UploadAPIResponse['file'][];
}
```

## Error Response Format

```typescript
interface APIError {
  error: true;
  message: string;
  code?: string;
  details?: {
    field?: string;
    value?: any;
    constraint?: string;
  }[];
  timestamp: string;
  path: string;
}
```

## Pagination Format

```typescript
interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

All timestamps should be in ISO 8601 format (e.g., "2024-01-15T10:30:00Z").
All monetary values should be in the smallest currency unit (cents for USD).
