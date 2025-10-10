import { useState, useEffect, useCallback } from 'react';
import { discountService, Discount, Coupon, CreateDiscountRequest, CreateCouponRequest, DiscountPreviewRequest } from '@/services/discountService';
import { useToast } from '@/hooks/use-toast';

interface UseDiscountsOptions {
  autoFetch?: boolean;
  type?: 'all' | 'normal' | 'buy_x_get_y';
  scope?: string;
  is_active?: boolean;
}

export const useDiscounts = (options: UseDiscountsOptions = {}) => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1
  });
  const { toast } = useToast();

  const fetchDiscounts = useCallback(async (params?: {
    page?: number;
    per_page?: number;
    type?: string;
    scope?: string;
    is_active?: boolean;
    q?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await discountService.getDiscounts({
        ...params,
        type: options.type === 'all' ? undefined : options.type,
        scope: options.scope,
        is_active: options.is_active,
      });

      if (response.error === false && response.details?.discounts) {
        console.log('Raw API response:', response);
        console.log('Discounts data received:', response.details.discounts.data);
        console.log('Total discounts count:', response.details.discounts.data?.length);
        
        setDiscounts(response.details.discounts.data || []);
        setPagination({
          current_page: response.details.discounts.current_page || 1,
          per_page: response.details.discounts.per_page || 20,
          total: response.details.discounts.total || 0,
          last_page: response.details.discounts.last_page || 1
        });
      } else {
        throw new Error(response.message || 'Failed to fetch discounts');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch discounts';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [options.type, options.scope, options.is_active, toast]);

  const createDiscount = useCallback(async (data: CreateDiscountRequest) => {
    try {
      setLoading(true);
      const response = await discountService.createDiscount(data);
      
      if (response.error === false) {
        toast({
          title: "Success",
          description: response.message || "Discount created successfully",
        });
        await fetchDiscounts(); // Refresh list
        return response.details?.discount;
      } else {
        throw new Error(response.message || 'Failed to create discount');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create discount';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDiscounts, toast]);

  const updateDiscount = useCallback(async (id: number, data: Partial<CreateDiscountRequest>) => {
    try {
      setLoading(true);
      const response = await discountService.updateDiscount(id, data);
      
      if (response.error === false) {
        toast({
          title: "Success",
          description: response.message || "Discount updated successfully",
        });
        await fetchDiscounts(); // Refresh list
        return response.details?.discount;
      } else {
        throw new Error(response.message || 'Failed to update discount');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update discount';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDiscounts, toast]);

  const deleteDiscount = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await discountService.deleteDiscount(id);
      
      if (response.error === false) {
        toast({
          title: "Success",
          description: response.message || "Discount deleted successfully",
        });
        await fetchDiscounts(); // Refresh list
      } else {
        throw new Error(response.message || 'Failed to delete discount');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete discount';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDiscounts, toast]);

  const toggleDiscountStatus = useCallback(async (id: number, is_active: boolean) => {
    try {
      const response = await discountService.toggleDiscountStatus(id, is_active);
      
      if (response.error === false) {
        toast({
          title: "Success",
          description: response.message || "Discount status updated successfully",
        });
        // Update the local state immediately for better UX
        setDiscounts(prev => prev.map(discount => 
          discount.id === id ? { ...discount, is_active } : discount
        ));
      } else {
        throw new Error(response.message || 'Failed to update discount status');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update discount status';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  const calculateDiscountPreview = useCallback(async (data: DiscountPreviewRequest) => {
    try {
      setLoading(true);
      const response = await discountService.calculateDiscountPreview(data);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to calculate discount preview';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Helper methods for specific discount types
  const createProductDiscount = useCallback(async (data: {
    product_ids: number[];
    type: 'percentage' | 'fixed';
    value: number;
    label: string;
    max_discount?: number;
    starts_at?: string;
    expires_at?: string;
    is_active?: boolean;
    store_id?: number;
    country_id?: number;
  }) => {
    return createDiscount({
      ...data,
      discountable_type: 'product',
      discountable_ids: data.product_ids,
    });
  }, [createDiscount]);

  const createCategoryDiscount = useCallback(async (data: {
    category_ids: number[];
    type: 'percentage' | 'fixed';
    value: number;
    label: string;
    max_discount?: number;
    starts_at?: string;
    expires_at?: string;
    is_active?: boolean;
    store_id?: number;
    country_id?: number;
  }) => {
    return createDiscount({
      ...data,
      discountable_type: 'category',
      discountable_ids: data.category_ids,
    });
  }, [createDiscount]);

  const createBuyXGetYPromotion = useCallback(async (data: {
    label: string;
    buy_quantity: number;
    get_quantity: number;
    buy_product_ids?: number[];
    buy_category_ids?: number[];
    buy_any_product?: boolean;
    get_product_ids?: number[];
    get_category_ids?: number[];
    get_same_as_buy?: boolean;
    get_discount_type?: 'free' | 'percentage' | 'fixed';
    get_discount_value?: number;
    max_applications_per_cart?: number;
    max_applications_per_customer?: number;
    starts_at?: string;
    expires_at?: string;
    is_active?: boolean;
    store_id?: number;
    country_id?: number;
  }) => {
    return createDiscount({
      type: 'buy_x_get_y',
      value: 0,
      ...data,
    });
  }, [createDiscount]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchDiscounts();
    }
  }, [options.autoFetch, fetchDiscounts]);

  return {
    discounts,
    loading,
    error,
    pagination,
    fetchDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus,
    calculateDiscountPreview,
    // Helper methods
    createProductDiscount,
    createCategoryDiscount,
    createBuyXGetYPromotion,
    // Utility methods
    formatDiscountValue: discountService.formatDiscountValue,
    getDiscountScope: discountService.getDiscountScope,
    isDiscountActive: discountService.isDiscountActive,
    getDiscountStatus: discountService.getDiscountStatus,
  };
};

// Separate hook for coupon management
export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1
  });
  const { toast } = useToast();

  const fetchCoupons = useCallback(async (params?: {
    page?: number;
    per_page?: number;
    store_id?: number;
    is_active?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await discountService.getCoupons(params);

      if (response.error === false && response.details?.coupons) {
        setCoupons(response.details.coupons.data || []);
        setPagination({
          current_page: response.details.coupons.current_page || 1,
          per_page: response.details.coupons.per_page || 20,
          total: response.details.coupons.total || 0,
          last_page: response.details.coupons.last_page || 1
        });
      } else {
        throw new Error(response.message || 'Failed to fetch coupons');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch coupons';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createCoupon = useCallback(async (data: CreateCouponRequest) => {
    try {
      setLoading(true);
      const response = await discountService.createCoupon(data);
      
      if (response.error === false) {
        toast({
          title: "Success",
          description: response.message || "Coupon created successfully",
        });
        await fetchCoupons(); // Refresh list
        return response.details?.coupon;
      } else {
        throw new Error(response.message || 'Failed to create coupon');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create coupon';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCoupons, toast]);

  const updateCoupon = useCallback(async (id: number, data: Partial<CreateCouponRequest>) => {
    try {
      setLoading(true);
      const response = await discountService.updateCoupon(id, data);
      
      if (response.error === false) {
        toast({
          title: "Success",
          description: response.message || "Coupon updated successfully",
        });
        await fetchCoupons(); // Refresh list
        return response.details?.coupon;
      } else {
        throw new Error(response.message || 'Failed to update coupon');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update coupon';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCoupons, toast]);

  const deleteCoupon = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await discountService.deleteCoupon(id);
      
      if (response.error === false) {
        toast({
          title: "Success",
          description: response.message || "Coupon deleted successfully",
        });
        await fetchCoupons(); // Refresh list
      } else {
        throw new Error(response.message || 'Failed to delete coupon');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete coupon';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCoupons, toast]);

  const applyCoupon = useCallback(async (data: {
    coupon_code: string;
    total_price: number;
    type: string;
    store_id?: number;
  }) => {
    try {
      setLoading(true);
      const response = await discountService.applyCoupon(data);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Coupon applied successfully",
        });
        return response;
      } else {
        throw new Error(response.message || 'Failed to apply coupon');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to apply coupon';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const validateCoupon = useCallback(async (data: {
    coupon_code: string;
    total_price: number;
    type: string;
    store_id?: number;
  }) => {
    try {
      const response = await discountService.validateCoupon(data);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to validate coupon';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return {
    coupons,
    loading,
    error,
    pagination,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    applyCoupon,
    validateCoupon,
  };
};

// Hook for discount analytics
export const useDiscountAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalytics = useCallback(async (params?: {
    date_from?: string;
    date_to?: string;
    scope?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await discountService.getDiscountAnalytics(params);

      if (response.error === false && response.details?.analytics) {
        setAnalytics(response.details.analytics);
      } else {
        throw new Error(response.message || 'Failed to fetch analytics');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch analytics';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  };
};