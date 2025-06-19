
interface Product {
  id: string;
  title: string;
  price: number;
  category?: string;
  quantity?: number;
}

interface PackageDiscount {
  id: string;
  discountType: 'percentage' | 'fixed' | 'buy_x_get_y';
  discountValue: number;
  minQuantity: number;
  maxQuantity?: number;
  applicableProducts: string[];
  applicableCategories: string[];
  isActive: boolean;
}

export const calculatePackageDiscount = (
  products: Product[],
  packageDiscount: PackageDiscount
): { discount: number; applicableProducts: Product[] } => {
  if (!packageDiscount.isActive) {
    return { discount: 0, applicableProducts: [] };
  }

  // Filter applicable products
  const applicableProducts = products.filter(product => {
    // If no specific products or categories defined, apply to all
    if (packageDiscount.applicableProducts.length === 0 && packageDiscount.applicableCategories.length === 0) {
      return true;
    }
    
    // Check if product ID matches
    if (packageDiscount.applicableProducts.includes(product.id)) {
      return true;
    }
    
    // Check if product category matches
    if (product.category && packageDiscount.applicableCategories.includes(product.category)) {
      return true;
    }
    
    return false;
  });

  const totalQuantity = applicableProducts.reduce((sum, product) => sum + (product.quantity || 1), 0);
  
  // Check if quantity meets minimum requirements
  if (totalQuantity < packageDiscount.minQuantity) {
    return { discount: 0, applicableProducts: [] };
  }

  // Check if quantity exceeds maximum (if set)
  if (packageDiscount.maxQuantity && totalQuantity > packageDiscount.maxQuantity) {
    return { discount: 0, applicableProducts: [] };
  }

  const subtotal = applicableProducts.reduce((sum, product) => sum + (product.price * (product.quantity || 1)), 0);

  let discount = 0;

  switch (packageDiscount.discountType) {
    case 'percentage':
      discount = (subtotal * packageDiscount.discountValue) / 100;
      break;
      
    case 'fixed':
      discount = packageDiscount.discountValue;
      break;
      
    case 'buy_x_get_y':
      // For buy X get Y free, calculate how many free items
      const freeItems = Math.floor(totalQuantity / (packageDiscount.minQuantity + packageDiscount.discountValue)) * packageDiscount.discountValue;
      // Find cheapest items to make free
      const sortedProducts = [...applicableProducts].sort((a, b) => a.price - b.price);
      let freeItemsCount = freeItems;
      for (const product of sortedProducts) {
        if (freeItemsCount <= 0) break;
        const itemsToDiscount = Math.min(freeItemsCount, product.quantity || 1);
        discount += product.price * itemsToDiscount;
        freeItemsCount -= itemsToDiscount;
      }
      break;
      
    default:
      discount = 0;
  }

  return { discount: Math.max(0, discount), applicableProducts };
};

export const validatePackageDiscount = (packageData: Partial<PackageDiscount>): string[] => {
  const errors: string[] = [];
  
  if (!packageData.discountType) {
    errors.push('Discount type is required');
  }
  
  if (packageData.discountValue === undefined || packageData.discountValue < 0) {
    errors.push('Discount value must be a positive number');
  }
  
  if (!packageData.minQuantity || packageData.minQuantity < 1) {
    errors.push('Minimum quantity must be at least 1');
  }
  
  if (packageData.maxQuantity && packageData.maxQuantity < packageData.minQuantity) {
    errors.push('Maximum quantity must be greater than minimum quantity');
  }
  
  return errors;
};
