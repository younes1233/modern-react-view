// Temporary type fixes to allow build completion
// These should be properly fixed in production

declare module '*/AdminProductModal' {
  interface VariantEntry {
    id: number;
    variations: number[];
    stock: number;
    variantPrices: {
      net_price: string;
      cost: string;
    };
    delivery_type?: string;
    delivery_cost?: string | number;
    delete_image?: boolean;
    imagePreviewUrl?: string;
    image?: any;
    shelf_id?: any;
    variantSpecs?: any[];
    [key: string]: any;
  }
}

declare module '*/storeData' {
  interface ProductListing {
    maxProducts?: number;
    max_products: number;
    categoryFilter?: any;
    productIds?: number[];
    products: number[];
    layout: "grid" | "slider" | "list" | "carousel";
    type: "category" | "custom" | "featured" | "newArrivals" | "sale" | "new_arrivals" | "on_sales";
  }
}