import { useState, useEffect } from 'react';
import { StoreLayout } from '@/components/store/StoreLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Truck, Shield, ArrowLeft, Lock, MapPin, Plus, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { AuthModal } from '@/components/auth/AuthModal';
import { checkoutService, PricingBreakdown } from '@/services/checkoutService';
import { addressService, Address } from '@/services/addressService';
import { paymentMethodService, PaymentMethod } from '@/services/paymentMethodService';

const CheckoutNew = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  // Data states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Pricing state
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);

  // Load addresses and payment methods
  useEffect(() => {
    if (user) {
      loadAddresses();
      loadPaymentMethods();
    }
  }, [user]);

  // Calculate pricing when address or coupon changes
  useEffect(() => {
    if (selectedAddressId) {
      calculatePricing();
    }
  }, [selectedAddressId, appliedCoupon]);

  const loadAddresses = async () => {
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
      // Auto-select default address
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast.error('Failed to load addresses');
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const data = await paymentMethodService.getPaymentMethods();
      const activeMethods = data.filter(pm => pm.is_active);
      setPaymentMethods(activeMethods);
      // Auto-select first payment method
      if (activeMethods.length > 0) {
        setSelectedPaymentMethodId(activeMethods[0].id);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      toast.error('Failed to load payment methods');
    }
  };

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
        setPricing(response.details);
      }
    } catch (error: any) {
      console.error('Failed to calculate pricing:', error);
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

    setIsProcessing(true);

    try {
      const response = await checkoutService.processCheckout({
        address_id: selectedAddressId,
        payment_method_id: selectedPaymentMethodId,
        coupon_code: appliedCoupon || undefined,
      });

      if (response.error) {
        toast.error(response.message);
        return;
      }

      toast.success('Order placed successfully! Order #' + response.details.order_number);
      clearCart();
      navigate('/store/orders/' + response.details.order_id);
    } catch (error: any) {
      console.error('Checkout error:', error);

      // Handle stock unavailable error
      if (error.status === 409 && error.details?.unavailable_items) {
        const items = error.details.unavailable_items;
        const itemsList = items.map((item: any) =>
          `${item.product_name} (requested: ${item.requested_quantity}, available: ${item.available_quantity})`
        ).join(', ');
        toast.error(`Some items are no longer available: ${itemsList}`, {
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
              <Button variant="outline" onClick={() => navigate('/store')}>
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
            <Button onClick={() => navigate('/store')} className="bg-cyan-600 hover:bg-cyan-700">
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
                    onClick={() => navigate('/profile/addresses')}
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
                      onClick={() => navigate('/profile/addresses')}
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
                          You saved {pricing.currency.symbol}{pricing.coupon_discount.toFixed(2)}
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
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <span className="absolute top-1 right-1 z-10 bg-cyan-600 text-white text-[11px] leading-none rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center shadow ring-2 ring-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">${item.product.price.toFixed(2)}</p>
                      </div>
                      <span className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                {isLoadingPricing ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Calculating prices...</p>
                  </div>
                ) : pricing ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{pricing.currency.symbol}{pricing.subtotal.toFixed(2)}</span>
                    </div>
                    {pricing.delivery_calculated && (
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>{pricing.currency.symbol}{pricing.delivery_cost.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.coupon_discount && pricing.coupon_discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount</span>
                        <span>-{pricing.currency.symbol}{pricing.coupon_discount.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.promotion_discount && pricing.promotion_discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Promotions</span>
                        <span>-{pricing.currency.symbol}{pricing.promotion_discount.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.vat_amount && pricing.vat_amount > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>VAT ({pricing.vat_rate}%)</span>
                        <span>{pricing.currency.symbol}{pricing.vat_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{pricing.currency.symbol}{pricing.final_total.toFixed(2)}</span>
                    </div>
                    {!pricing.delivery_calculated && (
                      <p className="text-xs text-gray-500 text-center">{pricing.delivery_message}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
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
      </div>
    </StoreLayout>
  );
};

export default CheckoutNew;
