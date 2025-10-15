import { useState, useEffect } from 'react';
import { StoreLayout } from '@/components/store/StoreLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Truck, Shield, ArrowLeft, Lock, MapPin, Plus, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { AuthModal } from '@/components/auth/AuthModal';
import AddressForm from '@/components/AddressForm';
import { checkoutService, PricingBreakdown, isStockUnavailableError, UnavailableItem } from '@/services/checkoutService';
import { useAddresses } from '@/hooks/useAddresses';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { AreebaCheckout } from '@/components/payment/AreebaCheckout';
import { StockUnavailableModal } from '@/components/modals/StockUnavailableModal';
import { metaPixelService } from '@/services/metaPixelService';
import { useQueryClient } from '@tanstack/react-query';
import { useCountryCurrency } from '@/contexts/CountryCurrencyContext';
import { OptimizedImage } from '@/components/ui/optimized-image';

const CheckoutNew = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedCurrency } = useCountryCurrency();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [stockUnavailableModal, setStockUnavailableModal] = useState<{
    isOpen: boolean;
    items: UnavailableItem[];
  }>({ isOpen: false, items: [] });

  // Selection states
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Pricing state
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);

  // Payment session states (for Areeba/online payments)
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [checkoutScriptUrl, setCheckoutScriptUrl] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  // Use custom hooks with automatic caching and cache invalidation
  const { addresses, isLoading: isLoadingAddresses } = useAddresses(user?.id);
  const { paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods(!!user);

  // Always use selectedCurrency symbol, fallback to $ (matches ProductCard pattern)
  const currencySymbol = selectedCurrency?.symbol || '$';

  // Auto-select default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.is_default);
      setSelectedAddressId(defaultAddr?.id || addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  // Auto-select first payment method when payment methods load
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethodId) {
      setSelectedPaymentMethodId(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPaymentMethodId]);

  // Calculate pricing when address or coupon changes
  useEffect(() => {
    if (selectedAddressId) {
      calculatePricing();
    }
  }, [selectedAddressId, appliedCoupon]);

  // Track Meta Pixel InitiateCheckout event when checkout page loads with items
  useEffect(() => {
    if (items.length > 0 && user) {
      const trackCheckout = async () => {
        try {
          const totalValue = getTotalPrice();
          await metaPixelService.trackInitiateCheckout(items, totalValue);
        } catch (error) {
          console.warn('Meta Pixel InitiateCheckout tracking failed:', error);
        }
      };
      trackCheckout();
    }
  }, [items, user]); // Track when items change or user logs in

  const calculatePricing = async () => {
    if (!selectedAddressId) return;

    setIsLoadingPricing(true);
    try {
      // Get selected address to get country_id from delivery zone
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      if (!selectedAddress || !selectedAddress.delivery_zone) {
        toast.error('Selected address does not have a delivery zone assigned');
        setIsLoadingPricing(false);
        return;
      }

      const response = await checkoutService.calculatePricing({
        country_id: selectedAddress.delivery_zone.country.id,
        address_id: selectedAddressId,
        coupon_code: appliedCoupon || undefined,
      });

      if (!response.error && response.details) {
        console.log("Response details from calculatePricing:", response.details);
        setPricing(response.details);
      }
    } catch (error: any) {
      console.error('Failed to calculate pricing:', error);
      
      // Handle stock unavailable errors
      if (isStockUnavailableError(error)) {
        setStockUnavailableModal({
          isOpen: true,
          items: error.details.unavailable_items
        });
        return;
      }
      
      // Don't show error toast if it's expected validation
      if (!error.message?.includes('same country')) {
        toast.error('Failed to calculate pricing');
      }
    } finally {
      setIsLoadingPricing(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setAppliedCoupon(couponCode.trim());
    toast.success('Coupon applied! Recalculating prices...');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!selectedPaymentMethodId) {
      toast.error('Please select a payment method');
      return;
    }

    // Check if selected payment method requires online processing
    const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);

    if (selectedMethod?.requires_online_processing) {
      // Create payment session for online payments (Areeba, Whish, etc.)
      await createPaymentSession();
    } else {
      // Process COD directly
      await processCheckoutDirectly();
    }
  };

  const createPaymentSession = async () => {
    setIsProcessing(true);

    try {
      const response = await checkoutService.createPaymentSession({
        address_id: selectedAddressId!,
        payment_method_id: selectedPaymentMethodId!,
        coupon_code: appliedCoupon || undefined,
      });

      if (response.error) {
        toast.error(response.message);
        return;
      }

      // Store session details and show payment form
      setPaymentSessionId(response.details.session_id);
      setMerchantId(response.details.merchant_id);
      setCheckoutScriptUrl(response.details.checkout_script_url);
      setPendingOrderId(response.details.order_id); // Store the pending order ID
      setShowPaymentForm(true);
      toast.info('Please complete your payment');
    } catch (error: any) {
      console.error('Payment session error:', error);
      toast.error(error.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processCheckoutDirectly = async () => {
    setIsProcessing(true);

    try {
      const response = await checkoutService.processCheckout({
        address_id: selectedAddressId!,
        payment_method_id: selectedPaymentMethodId!,
        coupon_code: appliedCoupon || undefined,
      });

      if (response.error) {
        toast.error(response.message);
        return;
      }

      toast.success('Order placed successfully! Order #' + response.details.order_number);
      clearCart();
      navigate('/orders/' + response.details.order_id);
    } catch (error: any) {
      console.error('Checkout error:', error);

      // Handle stock unavailable errors
      if (isStockUnavailableError(error)) {
        setStockUnavailableModal({
          isOpen: true,
          items: error.details.unavailable_items
        });
        return;
      }

      // Handle legacy stock unavailable error format
      if (error.status === 409 && error.details?.unavailable_items) {
        setStockUnavailableModal({
          isOpen: true,
          items: error.details.unavailable_items
        });
        return;
      }

      // Handle checkout lock errors
      if (error.details?.checkout_in_progress) {
        const secondsRemaining = error.details.seconds_remaining || 0;
        toast.error(`Another checkout is in progress. Please wait ${Math.ceil(secondsRemaining)} seconds.`, {
          duration: 7000,
        });
        navigate('/cart');
        return;
      }

      // Handle concurrent checkout error
      if (error.status === 409 && error.details?.checkout_in_progress) {
        toast.error('A checkout is already in progress. Please wait or refresh the page.');
        return;
      }

      toast.error(error.message || 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for when Areeba payment completes successfully
  const handlePaymentComplete = async () => {
    toast.success('Payment completed! Verifying...');

    // Confirm payment with backend (verify with Areeba and deduct inventory)
    try {
      if (!pendingOrderId) {
        toast.error('Order ID not found. Please contact support.');
        return;
      }

      const response = await checkoutService.confirmAreebaPayment(pendingOrderId);

      if (response.error) {
        toast.error(response.message);
        return;
      }

      toast.success('Order confirmed! Order #' + response.details.order_number);
      clearCart();
      navigate('/orders/' + response.details.order_id);
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      toast.error('Payment verification failed. Please contact support with your payment details.');
    }
  };

  const handlePaymentFailed = (error: string) => {
    toast.error(error);
    setShowPaymentForm(false);
    setPaymentSessionId(null);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setPaymentSessionId(null);
    toast.info('Payment cancelled');
  };

  // Guard: User must be logged in
  if (!user) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Lock className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Please sign in to proceed with checkout and complete your order.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            </div>
          </div>
          <AuthModal
            open={authModalOpen}
            onOpenChange={setAuthModalOpen}
            defaultMode="signin"
          />
        </div>
      </StoreLayout>
    );
  }

  // Guard: Cart must not be empty
  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart before proceeding to checkout.</p>
            <Button onClick={() => navigate('/')} className="bg-cyan-600 hover:bg-cyan-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order below</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Address
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddressModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No addresses found</p>
                    <Button
                      type="button"
                      onClick={() => setAddressModalOpen(true)}
                      variant="outline"
                    >
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedAddressId?.toString()}
                    onValueChange={(value) => setSelectedAddressId(parseInt(value))}
                  >
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? 'border-cyan-600 bg-cyan-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedAddressId(address.id)}
                        >
                          <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} className="mt-1" />
                          <Label htmlFor={`address-${address.id}`} className="ml-3 flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium capitalize">{address.type}</span>
                              {address.is_default && (
                                <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{address.address}</p>
                            {address.additional_address_details && (
                              <p className="text-sm text-gray-500">{address.additional_address_details}</p>
                            )}
                            {address.delivery_zone && (
                              <p className="text-sm text-gray-500">{address.delivery_zone.name}</p>
                            )}
                            {address.phone && (
                              <p className="text-sm text-gray-500 mt-1">Phone: {address.phone}</p>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <p className="text-gray-600">No payment methods available</p>
                ) : (
                  <RadioGroup
                    value={selectedPaymentMethodId?.toString()}
                    onValueChange={(value) => setSelectedPaymentMethodId(parseInt(value))}
                  >
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedPaymentMethodId === method.id
                              ? 'border-cyan-600 bg-cyan-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPaymentMethodId(method.id)}
                        >
                          <RadioGroupItem value={method.id.toString()} id={`payment-${method.id}`} />
                          <Label htmlFor={`payment-${method.id}`} className="ml-3 flex-1 cursor-pointer">
                            <div className="font-medium">{method.name}</div>
                            {method.description && (
                              <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Coupon Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Coupon Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Coupon Applied: {appliedCoupon}</p>
                      {pricing?.coupon_discount && (
                        <p className="text-sm text-green-600">
                          You saved {currencySymbol}{pricing.coupon_discount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={isLoadingPricing}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || isLoadingPricing}
                      variant="outline"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {items.map((item) => {
                    // Find discount info for this item
                    const discountInfo = pricing?.items_breakdown?.discounted_items?.find((discountedItem: any) => {
                      // Match by product ID and variant ID (if applicable)
                      const productMatch = discountedItem.product_id === item.product.id;
                      
                      // If discount is for a variant, match variant IDs using correct field names
                      if (discountedItem.variant_id) {
                        return productMatch && (
                          discountedItem.variant_id === item.purchasableId || 
                          discountedItem.variant_id === item.productVariantId
                        );
                      }
                      
                      // If discount is for a product (no variant), just match product
                      return productMatch && item.purchasableType !== 'App\\Models\\ProductVariant';
                    });

                    return (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-16 h-16 flex-shrink-0">
                          <OptimizedImage
                            src={item.product.image}
                            alt={item.product.name || 'Product'}
                            className="w-full h-full object-cover rounded-md"
                            eager
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                          {item.selectedVariations && item.selectedVariations.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {item.selectedVariations.map(v => `${v.attribute_name}: ${v.value}`).join(', ')}
                            </p>
                          )}
                          
                          {/* Show discount info if item has discount */}
                          {discountInfo ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs line-through text-gray-400">
                                  {currencySymbol}{discountInfo.original_price.toFixed(2)}
                                </span>
                                <span className="text-sm font-medium text-green-600">
                                  {currencySymbol}{discountInfo.discounted_price.toFixed(2)}
                                </span>
                                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                  {discountInfo.discount_percentage}% OFF
                                </span>
                              </div>
                              <p className="text-xs text-green-600">
                                Save {currencySymbol}{discountInfo.total_savings.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">{currencySymbol}{item.price.toFixed(2)} × {item.quantity}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                          </span>
                          {discountInfo && (
                            <div className="text-xs text-green-600">
                              -{currencySymbol}{discountInfo.total_savings.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                {isLoadingPricing ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Calculating prices...</p>
                  </div>
                ) : pricing ? (
                  <div className="space-y-2">
                    {/* Show original subtotal if there are discounts */}
                    {(() => {
                      // Calculate original subtotal from current subtotal + discounts
                      const totalDiscounts = (pricing.promotion_discount || 0) + 
                                            (pricing.coupon_discount || 0) + 
                                            (pricing.item_discounts_total || 0) + 
                                            (pricing.bulk_discount_total || 0);
                      
                      // Use provided original subtotal, or calculate it, or use items breakdown
                      const originalSubtotal = pricing.original_subtotal || 
                                              pricing.items_total_before_discounts || 
                                              (totalDiscounts > 0 ? pricing.subtotal + totalDiscounts : null);
                      
                      // Only show if we have an original subtotal and it's different from current subtotal
                      return originalSubtotal && originalSubtotal !== pricing.subtotal ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Original Subtotal</span>
                          <span className="text-gray-500 line-through">
                            {currencySymbol}{originalSubtotal.toFixed(2)}
                          </span>
                        </div>
                      ) : null;
                    })()}
                    
                    {/* Item-level discounts */}
                    {pricing.item_discounts_total && pricing.item_discounts_total > 0 ? (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Item Discounts</span>
                        <span>
                          -{currencySymbol}{pricing.item_discounts_total.toFixed(2)}
                        </span>
                      </div>
                    ) : null}

                    {/* Bulk discounts */}
                    {pricing.bulk_discount_total && pricing.bulk_discount_total > 0 ? (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Bulk Discount</span>
                        <span>
                          -{currencySymbol}{pricing.bulk_discount_total.toFixed(2)}
                        </span>
                      </div>
                    ) : null}

                    {/* Promotion discounts */}
                    {pricing.promotion_discount > 0 ? (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Promotion Discount</span>
                        <span>
                          -{currencySymbol}{pricing.promotion_discount.toFixed(2)}
                        </span>
                      </div>
                    ) : null}

                    {/* Coupon discounts */}
                    {pricing.coupon_discount > 0 ? (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount</span>
                        <span>
                          -{currencySymbol}{pricing.coupon_discount.toFixed(2)}
                        </span>
                      </div>
                    ) : null}

                    {/* Subtotal after discounts */}
                    <div className="flex justify-between text-sm font-medium border-t pt-2">
                      <span className="text-gray-900">Subtotal</span>
                      <span className="text-gray-900">
                        {currencySymbol}{pricing.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Total savings summary (only if there are discounts) */}
                    {pricing.total_savings && pricing.total_savings > 0 ? (
                      <div className="flex justify-between text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                        <span>You Saved</span>
                        <span>
                          {currencySymbol}{pricing.total_savings.toFixed(2)}
                        </span>
                      </div>
                    ) : (pricing.promotion_discount > 0 || pricing.coupon_discount > 0) ? (
                      <div className="flex justify-between text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                        <span>You Saved</span>
                        <span>
                          {currencySymbol}
                          {((pricing.promotion_discount || 0) + (pricing.coupon_discount || 0)).toFixed(2)}
                        </span>
                      </div>
                    ) : null}
                    {pricing.vat_amount > 0 ? (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>VAT ({pricing.vat_rate}%)</span>
                        <span>
                          {currencySymbol}{pricing.vat_amount.toFixed(2)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-semibold">
                        {currencySymbol}{(pricing.delivery_cost || 0).toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>
                        {currencySymbol}
                        {((pricing as any).grand_total ?? pricing.final_total ?? getTotalPrice()).toFixed(2)}
                      </span>
                    </div>
                    {!pricing.delivery_calculated && pricing.delivery_message && (
                      <p className="text-xs text-amber-600 text-center mt-2">{pricing.delivery_message}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{currencySymbol}{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Select an address to see delivery costs
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                  size="lg"
                  disabled={isProcessing || isLoadingPricing || !selectedAddressId || !selectedPaymentMethodId}
                >
                  {isProcessing ? 'Processing...' : 'Complete Order'}
                </Button>

                {/* Security Notice */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 pt-4">
                  <Shield className="w-4 h-4" />
                  <span>Secure SSL encrypted checkout</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Areeba Payment Modal */}
        {showPaymentForm && paymentSessionId && merchantId && checkoutScriptUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
              <AreebaCheckout
                sessionId={paymentSessionId}
                merchantId={merchantId}
                checkoutScriptUrl={checkoutScriptUrl}
                onPaymentComplete={handlePaymentComplete}
                onPaymentFailed={handlePaymentFailed}
                onCancel={handlePaymentCancel}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stock Unavailable Modal */}
      <StockUnavailableModal
        isOpen={stockUnavailableModal.isOpen}
        onClose={() => setStockUnavailableModal({ isOpen: false, items: [] })}
        unavailableItems={stockUnavailableModal.items}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Add Address Modal */}
      <AddressForm
        open={addressModalOpen}
        onOpenChange={setAddressModalOpen}
        onSuccess={() => {
          // Invalidate addresses cache to force refresh
          queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
        }}
      />
    </StoreLayout>
  );
};

export default CheckoutNew;
