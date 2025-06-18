
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

// Display settings functions
export const getDisplaySettings = (): DisplaySettings => {
  return { ...displaySettings };
};

export const updateDisplaySettings = (settings: Partial<DisplaySettings>): DisplaySettings => {
  displaySettings = { ...displaySettings, ...settings };
  return displaySettings;
};
