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

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  discount?: number;
  inStock: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
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

export interface DisplaySettings {
  layout: 'grid' | 'list';
  productsPerPage: number;
  showPricing: boolean;
  showRatings: boolean;
  showStock: boolean;
  enableQuickView: boolean;
  featuredSection: boolean;
  newArrivalsSection: boolean;
  saleSection: boolean;
  gridColumns: number;
}

// Initial banners data
let banners: Banner[] = [
  {
    id: 1,
    title: "Summer Sale - Up to 50% Off",
    subtitle: "Shop the best deals of the season",
    image: "/placeholder.svg",
    ctaText: "Shop Now",
    ctaLink: "/store/categories",
    position: "hero",
    isActive: true,
    order: 1
  },
  {
    id: 2,
    title: "New Electronics Collection",
    subtitle: "Latest gadgets and devices",
    image: "/placeholder.svg",
    ctaText: "Explore",
    ctaLink: "/store/categories?category=electronics",
    position: "secondary",
    isActive: true,
    order: 2
  },
  {
    id: 3,
    title: "Free Shipping",
    subtitle: "On orders over $50",
    image: "/placeholder.svg",
    position: "sidebar",
    isActive: true,
    order: 3
  }
];

// Initial products data
let products: Product[] = [
  {
    id: 1,
    name: 'Comfortable Ergonomic Office Chair with Lumbar Support Cushion',
    category: 'furniture',
    price: 150,
    originalPrice: 200,
    image: '/placeholder.svg',
    rating: 4.5,
    reviews: 124,
    discount: 25,
    inStock: true,
    isFeatured: true,
    isNewArrival: false,
    isOnSale: true,
    order: 1
  },
  {
    id: 2,
    name: '3-Tier 3-Cube Heavy-Duty Shelf Storage Metal Shelf Heavy Duty',
    category: 'furniture',
    price: 29,
    originalPrice: 45,
    image: '/placeholder.svg',
    rating: 4.3,
    reviews: 89,
    discount: 35,
    inStock: true,
    isFeatured: true,
    isNewArrival: false,
    isOnSale: true,
    order: 2
  },
  {
    id: 3,
    name: 'Universal Black Wheel Heavy Duty 4" Universal Bench Wheel Heavy',
    category: 'home',
    price: 90,
    originalPrice: 120,
    image: '/placeholder.svg',
    rating: 4.7,
    reviews: 156,
    discount: 25,
    inStock: false,
    isFeatured: true,
    isNewArrival: true,
    isOnSale: true,
    order: 3
  },
  {
    id: 4,
    name: 'Samsung 75AU7000 AU 4K UHD TV Smart - 75AU7000 4K for great',
    category: 'electronics',
    price: 15,
    originalPrice: 25,
    image: '/placeholder.svg',
    rating: 4.2,
    reviews: 203,
    discount: 40,
    inStock: true,
    isFeatured: false,
    isNewArrival: true,
    isOnSale: true,
    order: 4
  },
  {
    id: 5,
    name: 'BAMENE Lion Dog Chew Toy with 50g Soft - BAMENE',
    category: 'home',
    price: 60,
    originalPrice: 80,
    image: '/placeholder.svg',
    rating: 4.6,
    reviews: 78,
    discount: 25,
    inStock: true,
    isFeatured: false,
    isNewArrival: true,
    isOnSale: true,
    order: 5
  },
  {
    id: 6,
    name: 'Miljan Trampoline WINOL TOTAL Safety Enclosure Safety Trampoline',
    category: 'home',
    price: 78,
    originalPrice: 95,
    image: '/placeholder.svg',
    rating: 4.4,
    reviews: 92,
    discount: 18,
    inStock: true,
    isFeatured: false,
    isNewArrival: false,
    isOnSale: false,
    order: 6
  },
];

// Initial product listings data
let productListings: ProductListing[] = [
  {
    id: 1,
    title: "Featured Products",
    subtitle: "Our top picks for you",
    type: "featured",
    maxProducts: 8,
    layout: "grid",
    showTitle: true,
    isActive: true,
    order: 1
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Latest additions to our store",
    type: "newArrivals",
    maxProducts: 6,
    layout: "grid",
    showTitle: true,
    isActive: true,
    order: 2
  },
  {
    id: 3,
    title: "Sale Items",
    subtitle: "Don't miss these deals",
    type: "sale",
    maxProducts: 10,
    layout: "grid",
    showTitle: true,
    isActive: true,
    order: 3
  }
];

// Home page sections order
let homeSections: HomeSection[] = [
  {
    id: 1,
    type: 'banner',
    itemId: 1, // Hero banner
    order: 1,
    isActive: true
  },
  {
    id: 2,
    type: 'productListing',
    itemId: 1, // Featured products
    order: 2,
    isActive: true
  },
  {
    id: 3,
    type: 'banner',
    itemId: 2, // Secondary banner
    order: 3,
    isActive: true
  },
  {
    id: 4,
    type: 'productListing',
    itemId: 2, // New arrivals
    order: 4,
    isActive: true
  },
  {
    id: 5,
    type: 'productListing',
    itemId: 3, // Sale items
    order: 5,
    isActive: true
  }
];

// Initial display settings
let displaySettings: DisplaySettings = {
  layout: 'grid',
  productsPerPage: 12,
  showPricing: true,
  showRatings: true,
  showStock: true,
  enableQuickView: true,
  featuredSection: true,
  newArrivalsSection: true,
  saleSection: true,
  gridColumns: 3
};

// Banner management functions
export const getBanners = (): Banner[] => {
  return [...banners].sort((a, b) => a.order - b.order);
};

export const getActiveBanners = (): Banner[] => {
  return getBanners().filter(banner => banner.isActive);
};

export const addBanner = (bannerData: Omit<Banner, 'id'>): Banner => {
  const newBanner: Banner = {
    ...bannerData,
    id: Date.now(),
  };
  banners.push(newBanner);
  return newBanner;
};

export const updateBanner = (id: number, bannerData: Partial<Banner>): Banner | null => {
  const index = banners.findIndex(banner => banner.id === id);
  if (index !== -1) {
    banners[index] = { ...banners[index], ...bannerData };
    return banners[index];
  }
  return null;
};

export const deleteBanner = (id: number): boolean => {
  const index = banners.findIndex(banner => banner.id === id);
  if (index !== -1) {
    banners.splice(index, 1);
    return true;
  }
  return false;
};

export const reorderBanners = (reorderedBanners: Banner[]): void => {
  banners = reorderedBanners.map((banner, index) => ({
    ...banner,
    order: index + 1
  }));
};

// Product management functions
export const getProducts = (): Product[] => {
  return [...products].sort((a, b) => a.order - b.order);
};

export const getFeaturedProducts = (): Product[] => {
  return getProducts().filter(product => product.isFeatured);
};

export const getNewArrivals = (): Product[] => {
  return getProducts().filter(product => product.isNewArrival);
};

export const getSaleProducts = (): Product[] => {
  return getProducts().filter(product => product.isOnSale);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return getProducts();
  return getProducts().filter(product => product.category === category);
};

export const addProduct = (productData: Omit<Product, 'id'>): Product => {
  const newProduct: Product = {
    ...productData,
    id: Date.now(),
  };
  products.push(newProduct);
  return newProduct;
};

export const updateProduct = (id: number, productData: Partial<Product>): Product | null => {
  const index = products.findIndex(product => product.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...productData };
    return products[index];
  }
  return null;
};

export const deleteProduct = (id: number): boolean => {
  const index = products.findIndex(product => product.id === id);
  if (index !== -1) {
    products.splice(index, 1);
    return true;
  }
  return false;
};

export const reorderProducts = (reorderedProducts: Product[]): void => {
  products = reorderedProducts.map((product, index) => ({
    ...product,
    order: index + 1
  }));
};

// Product listing management functions
export const getProductListings = (): ProductListing[] => {
  return [...productListings].sort((a, b) => a.order - b.order);
};

export const getActiveProductListings = (): ProductListing[] => {
  return getProductListings().filter(listing => listing.isActive);
};

export const addProductListing = (listingData: Omit<ProductListing, 'id'>): ProductListing => {
  const newListing: ProductListing = {
    ...listingData,
    id: Date.now(),
  };
  productListings.push(newListing);
  return newListing;
};

export const updateProductListing = (id: number, listingData: Partial<ProductListing>): ProductListing | null => {
  const index = productListings.findIndex(listing => listing.id === id);
  if (index !== -1) {
    productListings[index] = { ...productListings[index], ...listingData };
    return productListings[index];
  }
  return null;
};

export const deleteProductListing = (id: number): boolean => {
  const index = productListings.findIndex(listing => listing.id === id);
  if (index !== -1) {
    productListings.splice(index, 1);
    // Remove from home sections
    homeSections = homeSections.filter(section => !(section.type === 'productListing' && section.itemId === id));
    return true;
  }
  return false;
};

export const reorderProductListings = (reorderedListings: ProductListing[]): void => {
  productListings = reorderedListings.map((listing, index) => ({
    ...listing,
    order: index + 1
  }));
};

// Home sections management functions
export const getHomeSections = (): HomeSection[] => {
  return [...homeSections].sort((a, b) => a.order - b.order);
};

export const getActiveHomeSections = (): HomeSection[] => {
  return getHomeSections().filter(section => section.isActive);
};

export const addHomeSection = (sectionData: Omit<HomeSection, 'id'>): HomeSection => {
  const newSection: HomeSection = {
    ...sectionData,
    id: Date.now(),
  };
  homeSections.push(newSection);
  return newSection;
};

export const updateHomeSection = (id: number, sectionData: Partial<HomeSection>): HomeSection | null => {
  const index = homeSections.findIndex(section => section.id === id);
  if (index !== -1) {
    homeSections[index] = { ...homeSections[index], ...sectionData };
    return homeSections[index];
  }
  return null;
};

export const deleteHomeSection = (id: number): boolean => {
  const index = homeSections.findIndex(section => section.id === id);
  if (index !== -1) {
    homeSections.splice(index, 1);
    return true;
  }
  return false;
};

export const reorderHomeSections = (reorderedSections: HomeSection[]): void => {
  homeSections = reorderedSections.map((section, index) => ({
    ...section,
    order: index + 1
  }));
};

// Helper function to get products for a listing
export const getProductsForListing = (listing: ProductListing): Product[] => {
  let filteredProducts: Product[] = [];
  
  switch (listing.type) {
    case 'featured':
      filteredProducts = getFeaturedProducts();
      break;
    case 'newArrivals':
      filteredProducts = getNewArrivals();
      break;
    case 'sale':
      filteredProducts = getSaleProducts();
      break;
    case 'category':
      filteredProducts = listing.categoryFilter ? getProductsByCategory(listing.categoryFilter) : [];
      break;
    case 'custom':
      filteredProducts = listing.productIds ? products.filter(p => listing.productIds!.includes(p.id)) : [];
      break;
    default:
      filteredProducts = [];
  }
  
  return filteredProducts.slice(0, listing.maxProducts);
};

// Display settings functions
export const getDisplaySettings = (): DisplaySettings => {
  return { ...displaySettings };
};

export const updateDisplaySettings = (settings: Partial<DisplaySettings>): DisplaySettings => {
  displaySettings = { ...displaySettings, ...settings };
  return displaySettings;
};
