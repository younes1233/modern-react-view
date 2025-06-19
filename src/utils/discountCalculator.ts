
interface Product {
  id: string;
  price: number;
  category?: string;
}

interface PackageDiscount {
  id: string;
  name: string;
  discountType: 'percentage' | 'fixed' | 'buy_x_get_y';
  discountValue: number;
  minQuantity: number;
  maxQuantity: number;
  applicableProducts: string[];
  applicableCategories: string[];
  isActive: boolean;
  validUntil?: string;
}

export const calculatePackageDiscount = (
  cartItems: { product: Product; quantity: number }[],
  packageDiscounts: PackageDiscount[]
): {
  bestDiscount: PackageDiscount | null;
  discountAmount: number;
  originalTotal: number;
  finalTotal: number;
} => {
  const originalTotal = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity), 
    0
  );

  let bestDiscount: PackageDiscount | null = null;
  let maxDiscountAmount = 0;

  // Check each active package discount
  packageDiscounts
    .filter(discount => discount.isActive)
    .filter(discount => {
      // Check if discount is still valid
      if (discount.validUntil) {
        const validDate = new Date(discount.validUntil);
        const today = new Date();
        return validDate >= today;
      }
      return true;
    })
    .forEach(discount => {
      // Calculate total quantity of applicable items
      const applicableItems = cartItems.filter(item => {
        const productMatch = discount.applicableProducts.length === 0 || 
          discount.applicableProducts.includes(item.product.id) ||
          discount.applicableProducts.includes(item.product.name);
        
        const categoryMatch = discount.applicableCategories.length === 0 ||
          discount.applicableCategories.includes(item.product.category || '');
        
        return productMatch || categoryMatch;
      });

      const totalApplicableQuantity = applicableItems.reduce(
        (total, item) => total + item.quantity, 
        0
      );

      // Check if minimum quantity is met
      if (totalApplicableQuantity >= discount.minQuantity) {
        let discountAmount = 0;
        const applicableTotal = applicableItems.reduce(
          (total, item) => total + (item.product.price * item.quantity), 
          0
        );

        switch (discount.discountType) {
          case 'percentage':
            discountAmount = applicableTotal * (discount.discountValue / 100);
            break;
          case 'fixed':
            discountAmount = discount.discountValue;
            break;
          case 'buy_x_get_y':
            // For buy X get Y, calculate how many free items can be given
            const eligibleForFree = Math.floor(totalApplicableQuantity / discount.minQuantity);
            const freeItems = Math.min(eligibleForFree * discount.discountValue, totalApplicableQuantity);
            
            // Calculate discount based on cheapest items being free
            const sortedItems = applicableItems
              .flatMap(item => Array(item.quantity).fill(item.product.price))
              .sort((a, b) => a - b);
            
            discountAmount = sortedItems.slice(0, freeItems).reduce((sum, price) => sum + price, 0);
            break;
        }

        // Apply max quantity limit
        if (totalApplicableQuantity > discount.maxQuantity) {
          const ratio = discount.maxQuantity / totalApplicableQuantity;
          discountAmount *= ratio;
        }

        if (discountAmount > maxDiscountAmount) {
          maxDiscountAmount = discountAmount;
          bestDiscount = discount;
        }
      }
    });

  return {
    bestDiscount,
    discountAmount: maxDiscountAmount,
    originalTotal,
    finalTotal: Math.max(0, originalTotal - maxDiscountAmount)
  };
};

export const validatePackageDiscount = (discount: Partial<PackageDiscount>): string[] => {
  const errors: string[] = [];

  if (!discount.name?.trim()) {
    errors.push('Package name is required');
  }

  if (!discount.discountValue || discount.discountValue <= 0) {
    errors.push('Discount value must be greater than 0');
  }

  if (discount.discountType === 'percentage' && discount.discountValue > 100) {
    errors.push('Percentage discount cannot exceed 100%');
  }

  if (!discount.minQuantity || discount.minQuantity < 1) {
    errors.push('Minimum quantity must be at least 1');
  }

  if (discount.maxQuantity && discount.maxQuantity < discount.minQuantity!) {
    errors.push('Maximum quantity cannot be less than minimum quantity');
  }

  if (discount.validUntil) {
    const validDate = new Date(discount.validUntil);
    const today = new Date();
    if (validDate < today) {
      errors.push('Valid until date cannot be in the past');
    }
  }

  return errors;
};
