export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  sku?: string;
  thumbnails: ProductThumbnail[];
  variations: ProductVariation[];
}

export interface ProductThumbnail {
  id: number;
  url: string;
  alt: string;
}

export interface ProductVariation {
  id: number;
  type: string;
  value: string;
  priceModifier: number;
  stock: number;
}

export interface DisplaySettings {
  layout: 'grid' | 'list';
  gridColumns: number;
  productsPerPage: number;
  showPricing: boolean;
  showRatings: boolean;
  showStock: boolean;
  enableQuickView: boolean;
  featuredSection: boolean;
  newArrivalsSection: boolean;
  saleSection: boolean;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  position: 'hero' | 'secondary' | 'sidebar';
  isActive: boolean;
  order: number;
}

export interface ProductListing {
  id: number;
  title: string;
  subtitle?: string;
  type: 'featured' | 'newArrivals' | 'sale' | 'category' | 'custom';
  categoryFilter?: string;
  productIds?: number[];
  maxProducts: number;
  layout: 'grid' | 'slider';
  showTitle: boolean;
  isActive: boolean;
  order: number;
}

export interface HomeSection {
  id: number;
  type: 'banner' | 'productListing';
  itemId: number;
  order: number;
  isActive: boolean;
}

export interface HeroSection {
  id: number;
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  icon: string;
  productCount: number;
  isActive: boolean;
  order: number;
}

// Function to calculate the price based on selected variations
export const calculateVariationPrice = (basePrice: number, variations: ProductVariation[]): number => {
  let priceModifier = 0;
  variations.forEach(variation => {
    priceModifier += variation.priceModifier;
  });
  return basePrice + priceModifier;
};

// Sample product data with real images
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    description: "Premium wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 299.99,
    originalPrice: 399.99,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&crop=center",
    inStock: true,
    rating: 4.5,
    reviews: 234,
    isFeatured: true,
    isNewArrival: false,
    isOnSale: true,
    sku: "WBH-001",
    thumbnails: [
      {
        id: 1,
        url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop&crop=center",
        alt: "Headphones side view"
      },
      {
        id: 2,
        url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop&crop=center",
        alt: "Headphones folded"
      },
      {
        id: 3,
        url: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=500&fit=crop&crop=center",
        alt: "Headphones with case"
      }
    ],
    variations: [
      { id: 1, type: "color", value: "Black", priceModifier: 0, stock: 15 },
      { id: 2, type: "color", value: "White", priceModifier: 0, stock: 12 },
      { id: 3, type: "color", value: "Silver", priceModifier: 20, stock: 8 }
    ]
  },
  {
    id: 2,
    name: "Modern Laptop Stand",
    slug: "modern-laptop-stand",
    description: "Ergonomic aluminum laptop stand with adjustable height and angle. Compatible with all laptop sizes.",
    price: 79.99,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop&crop=center",
    inStock: true,
    rating: 4.2,
    reviews: 89,
    isFeatured: false,
    isNewArrival: true,
    isOnSale: false,
    sku: "MLS-002",
    thumbnails: [
      {
        id: 4,
        url: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=500&h=500&fit=crop&crop=center",
        alt: "Laptop stand angle view"
      },
      {
        id: 5,
        url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=500&fit=crop&crop=center",
        alt: "Laptop stand with laptop"
      }
    ],
    variations: [
      { id: 4, type: "color", value: "Silver", priceModifier: 0, stock: 20 },
      { id: 5, type: "color", value: "Space Gray", priceModifier: 10, stock: 15 }
    ]
  },
  {
    id: 3,
    name: "Ergonomic Office Chair",
    slug: "ergonomic-office-chair",
    description: "Premium ergonomic office chair with lumbar support, adjustable height, and breathable mesh back.",
    price: 349.99,
    originalPrice: 449.99,
    category: "furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&crop=center",
    inStock: true,
    rating: 4.7,
    reviews: 156,
    isFeatured: true,
    isNewArrival: false,
    isOnSale: true,
    sku: "EOC-003",
    thumbnails: [
      {
        id: 6,
        url: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500&h=500&fit=crop&crop=center",
        alt: "Office chair front view"
      },
      {
        id: 7,
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&crop=center",
        alt: "Office chair side profile"
      }
    ],
    variations: [
      { id: 6, type: "color", value: "Black", priceModifier: 0, stock: 10 },
      { id: 7, type: "color", value: "Gray", priceModifier: 0, stock: 8 },
      { id: 8, type: "color", value: "White", priceModifier: 25, stock: 5 }
    ]
  },
  {
    id: 4,
    name: "Designer Cotton T-Shirt",
    slug: "designer-cotton-t-shirt",
    description: "Premium 100% organic cotton t-shirt with modern fit and sustainable production.",
    price: 39.99,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&crop=center",
    inStock: true,
    rating: 4.3,
    reviews: 412,
    isFeatured: false,
    isNewArrival: true,
    isOnSale: false,
    sku: "DCT-004",
    thumbnails: [
      {
        id: 8,
        url: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500&h=500&fit=crop&crop=center",
        alt: "T-shirt flat lay"
      },
      {
        id: 9,
        url: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500&h=500&fit=crop&crop=center",
        alt: "T-shirt detail"
      }
    ],
    variations: [
      { id: 9, type: "size", value: "XS", priceModifier: 0, stock: 12 },
      { id: 10, type: "size", value: "S", priceModifier: 0, stock: 25 },
      { id: 11, type: "size", value: "M", priceModifier: 0, stock: 30 },
      { id: 12, type: "size", value: "L", priceModifier: 0, stock: 28 },
      { id: 13, type: "size", value: "XL", priceModifier: 5, stock: 15 },
      { id: 14, type: "color", value: "Navy", priceModifier: 0, stock: 40 },
      { id: 15, type: "color", value: "White", priceModifier: 0, stock: 35 },
      { id: 16, type: "color", value: "Charcoal", priceModifier: 0, stock: 20 }
    ]
  },
  {
    id: 5,
    name: "Smart Coffee Maker",
    slug: "smart-coffee-maker",
    description: "WiFi-enabled coffee maker with app control, programmable brewing, and built-in grinder.",
    price: 199.99,
    category: "home",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop&crop=center",
    inStock: true,
    rating: 4.6,
    reviews: 78,
    isFeatured: true,
    isNewArrival: true,
    isOnSale: false,
    sku: "SCM-005",
    thumbnails: [
      {
        id: 10,
        url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=500&fit=crop&crop=center",
        alt: "Coffee maker brewing"
      },
      {
        id: 11,
        url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&h=500&fit=crop&crop=center",
        alt: "Coffee maker detail"
      }
    ],
    variations: [
      { id: 17, type: "color", value: "Stainless Steel", priceModifier: 0, stock: 15 },
      { id: 18, type: "color", value: "Black", priceModifier: -20, stock: 12 }
    ]
  },
  {
    id: 6,
    name: "Minimalist Desk Lamp",
    slug: "minimalist-desk-lamp",
    description: "LED desk lamp with touch controls, adjustable brightness, and USB charging port.",
    price: 89.99,
    category: "furniture",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=center",
    inStock: true,
    rating: 4.4,
    reviews: 203,
    isFeatured: false,
    isNewArrival: false,
    isOnSale: false,
    sku: "MDL-006",
    thumbnails: [
      {
        id: 12,
        url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&h=500&fit=crop&crop=center",
        alt: "Desk lamp on"
      },
      {
        id: 13,
        url: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500&h=500&fit=crop&crop=center",
        alt: "Desk lamp workspace"
      }
    ],
    variations: [
      { id: 19, type: "color", value: "White", priceModifier: 0, stock: 18 },
      { id: 20, type: "color", value: "Black", priceModifier: 0, stock: 22 }
    ]
  },
  {
    id: 7,
    name: "Wireless Charging Pad",
    slug: "wireless-charging-pad",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.",
    price: 49.99,
    originalPrice: 69.99,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop&crop=center",
    inStock: true,
    rating: 4.1,
    reviews: 145,
    isFeatured: false,
    isNewArrival: false,
    isOnSale: true,
    sku: "WCP-007",
    thumbnails: [
      {
        id: 14,
        url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop&crop=center",
        alt: "Charging pad with phone"
      },
      {
        id: 15,
        url: "https://images.unsplash.com/photo-1580191947416-62d35a55e71d?w=500&h=500&fit=crop&crop=center",
        alt: "Charging pad detail"
      }
    ],
    variations: [
      { id: 21, type: "color", value: "Black", priceModifier: 0, stock: 25 },
      { id: 22, type: "color", value: "White", priceModifier: 0, stock: 20 }
    ]
  },
  {
    id: 8,
    name: "Premium Sneakers",
    slug: "premium-sneakers",
    description: "Comfortable and stylish sneakers made with sustainable materials and modern design.",
    price: 129.99,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop&crop=center",
    inStock: true,
    rating: 4.5,
    reviews: 89,
    isFeatured: true,
    isNewArrival: true,
    isOnSale: false,
    sku: "PS-008",
    thumbnails: [
      {
        id: 16,
        url: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=500&fit=crop&crop=center",
        alt: "Sneakers side view"
      },
      {
        id: 17,
        url: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=500&h=500&fit=crop&crop=center",
        alt: "Sneakers pair"
      }
    ],
    variations: [
      { id: 23, type: "size", value: "7", priceModifier: 0, stock: 8 },
      { id: 24, type: "size", value: "8", priceModifier: 0, stock: 12 },
      { id: 25, type: "size", value: "9", priceModifier: 0, stock: 15 },
      { id: 26, type: "size", value: "10", priceModifier: 0, stock: 10 },
      { id: 27, type: "size", value: "11", priceModifier: 0, stock: 6 },
      { id: 28, type: "color", value: "White", priceModifier: 0, stock: 25 },
      { id: 29, type: "color", value: "Black", priceModifier: 0, stock: 20 },
      { id: 30, type: "color", value: "Gray", priceModifier: 10, stock: 15 }
    ]
  }
];

// Sample hero section data
let sampleHeroSection: HeroSection = {
  id: 1,
  title: "Welcome to Our Store",
  subtitle: "Discover amazing products at unbeatable prices with fast shipping and exceptional customer service",
  backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
  ctaText: "Shop Now",
  ctaLink: "/store/categories",
  isActive: true
};

// Sample categories data
let sampleCategories: Category[] = [
  {
    id: 1,
    name: "Shoes",
    slug: "shoes",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
    icon: "👟",
    productCount: 45,
    isActive: true,
    order: 1
  },
  {
    id: 2,
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop",
    icon: "💻",
    productCount: 128,
    isActive: true,
    order: 2
  },
  {
    id: 3,
    name: "Furniture",
    slug: "furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
    icon: "🪑",
    productCount: 67,
    isActive: true,
    order: 3
  },
  {
    id: 4,
    name: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
    icon: "👔",
    productCount: 89,
    isActive: true,
    order: 4
  },
  {
    id: 5,
    name: "Home & Kitchen",
    slug: "home",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
    icon: "🏠",
    productCount: 156,
    isActive: true,
    order: 5
  },
  {
    id: 6,
    name: "Beauty",
    slug: "beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop",
    icon: "💄",
    productCount: 73,
    isActive: true,
    order: 6
  },
  {
    id: 7,
    name: "Sports",
    slug: "sports",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
    icon: "⚽",
    productCount: 92,
    isActive: true,
    order: 7
  }
];

// Sample data for store management
let sampleBanners: Banner[] = [
  {
    id: 1,
    title: "Winter Sale 2024",
    subtitle: "Up to 50% off on selected items",
    image: "https://images.unsplash.com/photo-1607083206325-caf1edba7a0f?w=1200&h=400&fit=crop",
    ctaText: "Shop Now",
    ctaLink: "/store/categories?category=sale",
    position: "hero",
    isActive: true,
    order: 1
  },
  {
    id: 2,
    title: "New Electronics Collection",
    subtitle: "Discover the latest tech gadgets",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=400&fit=crop",
    ctaText: "Explore",
    ctaLink: "/store/categories?category=electronics",
    position: "secondary",
    isActive: true,
    order: 2
  }
];

let sampleProductListings: ProductListing[] = [
  {
    id: 1,
    title: "Featured Products",
    subtitle: "",
    type: "featured",
    maxProducts: 16,
    layout: "slider",
    showTitle: true,
    isActive: true,
    order: 1
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "",
    type: "newArrivals",
    maxProducts: 12,
    layout: "slider",
    showTitle: true,
    isActive: true,
    order: 2
  },
  {
    id: 3,
    title: "Sale Items",
    subtitle: "",
    type: "sale",
    maxProducts: 10,
    layout: "slider",
    showTitle: true,
    isActive: true,
    order: 3
  }
];

let sampleHomeSections: HomeSection[] = [
  { id: 1, type: "banner", itemId: 1, order: 1, isActive: true },
  { id: 2, type: "productListing", itemId: 1, order: 2, isActive: true },
  { id: 3, type: "banner", itemId: 2, order: 3, isActive: true },
  { id: 4, type: "productListing", itemId: 2, order: 4, isActive: true },
  { id: 5, type: "productListing", itemId: 3, order: 5, isActive: true }
];

const sampleDisplaySettings: DisplaySettings = {
  layout: 'grid',
  gridColumns: 3,
  productsPerPage: 12,
  showPricing: true,
  showRatings: true,
  showStock: true,
  enableQuickView: true,
  featuredSection: true,
  newArrivalsSection: true,
  saleSection: true,
};

// Helper function to emit data update events
const emitDataUpdate = () => {
  window.dispatchEvent(new CustomEvent('storeDataUpdated'));
};

// Product functions
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

// Display settings functions
export const getDisplaySettings = (): DisplaySettings => {
  return sampleDisplaySettings;
};

export const updateDisplaySettings = (newSettings: Partial<DisplaySettings>): void => {
  Object.assign(sampleDisplaySettings, newSettings);
  emitDataUpdate();
};

// Banner functions
export const getBanners = (): Banner[] => {
  return sampleBanners.sort((a, b) => a.order - b.order);
};

export const addBanner = (bannerData: Omit<Banner, 'id'>): Banner => {
  const newId = Math.max(...sampleBanners.map(b => b.id), 0) + 1;
  const newBanner = { ...bannerData, id: newId };
  sampleBanners.push(newBanner);
  emitDataUpdate();
  return newBanner;
};

export const updateBanner = (id: number, updates: Partial<Banner>): void => {
  const index = sampleBanners.findIndex(b => b.id === id);
  if (index !== -1) {
    sampleBanners[index] = { ...sampleBanners[index], ...updates };
    emitDataUpdate();
  }
};

export const deleteBanner = (id: number): void => {
  sampleBanners = sampleBanners.filter(b => b.id !== id);
  emitDataUpdate();
};

export const reorderBanners = (newOrder: Banner[]): void => {
  sampleBanners = newOrder.map((banner, index) => ({ ...banner, order: index + 1 }));
  emitDataUpdate();
};

// Product listing functions
export const getProductListings = (): ProductListing[] => {
  return sampleProductListings.sort((a, b) => a.order - b.order);
};

export const addProductListing = (listingData: Omit<ProductListing, 'id'>): ProductListing => {
  const newId = Math.max(...sampleProductListings.map(l => l.id), 0) + 1;
  const newListing = { ...listingData, id: newId };
  sampleProductListings.push(newListing);
  emitDataUpdate();
  return newListing;
};

export const updateProductListing = (id: number, updates: Partial<ProductListing>): void => {
  const index = sampleProductListings.findIndex(l => l.id === id);
  if (index !== -1) {
    sampleProductListings[index] = { ...sampleProductListings[index], ...updates };
    emitDataUpdate();
  }
};

export const deleteProductListing = (id: number): void => {
  sampleProductListings = sampleProductListings.filter(l => l.id !== id);
  emitDataUpdate();
};

export const getProductsForListing = (listing: ProductListing): Product[] => {
  let products: Product[] = [];
  
  switch (listing.type) {
    case 'featured':
      products = getFeaturedProducts();
      break;
    case 'newArrivals':
      products = getNewArrivals();
      break;
    case 'sale':
      products = getProductsOnSale();
      break;
    case 'category':
      if (listing.categoryFilter && listing.categoryFilter !== 'all') {
        products = sampleProducts.filter(p => p.category === listing.categoryFilter);
      } else {
        products = sampleProducts;
      }
      break;
    case 'custom':
      if (listing.productIds) {
        products = sampleProducts.filter(p => listing.productIds!.includes(p.id));
      }
      break;
    default:
      products = [];
  }
  
  return products.slice(0, listing.maxProducts);
};

// Home section functions
export const getHomeSections = (): HomeSection[] => {
  return sampleHomeSections.sort((a, b) => a.order - b.order);
};

export const getActiveHomeSections = (): HomeSection[] => {
  return sampleHomeSections.filter(s => s.isActive).sort((a, b) => a.order - b.order);
};

export const addHomeSection = (sectionData: Omit<HomeSection, 'id'>): HomeSection => {
  const newId = Math.max(...sampleHomeSections.map(s => s.id), 0) + 1;
  const newSection = { ...sectionData, id: newId };
  sampleHomeSections.push(newSection);
  emitDataUpdate();
  return newSection;
};

export const updateHomeSection = (id: number, updates: Partial<HomeSection>): void => {
  const index = sampleHomeSections.findIndex(s => s.id === id);
  if (index !== -1) {
    sampleHomeSections[index] = { ...sampleHomeSections[index], ...updates };
    emitDataUpdate();
  }
};

export const deleteHomeSection = (id: number): void => {
  sampleHomeSections = sampleHomeSections.filter(s => s.id !== id);
  emitDataUpdate();
};

export const reorderHomeSections = (newOrder: HomeSection[]): void => {
  sampleHomeSections = newOrder.map((section, index) => ({ ...section, order: index + 1 }));
  emitDataUpdate();
};

// Hero section functions
export const getHeroSection = (): HeroSection => {
  return sampleHeroSection;
};

export const updateHeroSection = (updates: Partial<HeroSection>): void => {
  sampleHeroSection = { ...sampleHeroSection, ...updates };
  emitDataUpdate();
};

// Category functions
export const getCategories = (): Category[] => {
  return sampleCategories.filter(c => c.isActive).sort((a, b) => a.order - b.order);
};

export const getAllCategories = (): Category[] => {
  return sampleCategories.sort((a, b) => a.order - b.order);
};

export const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
  const newId = Math.max(...sampleCategories.map(c => c.id), 0) + 1;
  const newCategory = { ...categoryData, id: newId };
  sampleCategories.push(newCategory);
  emitDataUpdate();
  return newCategory;
};

export const updateCategory = (id: number, updates: Partial<Category>): void => {
  const index = sampleCategories.findIndex(c => c.id === id);
  if (index !== -1) {
    sampleCategories[index] = { ...sampleCategories[index], ...updates };
    emitDataUpdate();
  }
};

export const deleteCategory = (id: number): void => {
  sampleCategories = sampleCategories.filter(c => c.id !== id);
  emitDataUpdate();
};

export const reorderCategories = (newOrder: Category[]): void => {
  sampleCategories = newOrder.map((category, index) => ({ ...category, order: index + 1 }));
  emitDataUpdate();
};
