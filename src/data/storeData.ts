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

const sampleDisplaySettings: DisplaySettings = {
  layout: 'grid',
  gridColumns: 3,
  productsPerPage: 12,
};

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

export const getDisplaySettings = (): DisplaySettings => {
  return sampleDisplaySettings;
};
