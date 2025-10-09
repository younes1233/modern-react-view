import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, CheckCircle, Truck, Clock, Box, ShoppingBag, Check, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";
import { StoreLayout } from "@/components/store/StoreLayout";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toastShown = useRef(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(Number(id)),
    enabled: !!id,
  });

  const order = data?.details?.order;
  const orderItems = data?.details?.order_items || [];

  // Debug logging
  useEffect(() => {
    if (order) {
      console.log('=== ORDER DEBUG ===');
      console.log('Full API response:', data);
      console.log('Order data:', order);
      console.log('Order items:', orderItems);
      if (orderItems && orderItems.length > 0) {
        console.log('First item details:', orderItems[0]);
        console.log('First item pricing_details:', orderItems[0].pricing_details);
      }
      console.log('===================');
    }
  }, [order, orderItems, data]);

  // Show success toast when order is confirmed
  useEffect(() => {
    if (order && order.status === 'confirmed' && !toastShown.current) {
      toastShown.current = true;
      toast.success('Order Confirmed!', {
        description: 'Your order has been confirmed and is being prepared for delivery. We\'ll notify you when it\'s on its way.',
        duration: 5000,
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      });
    }
  }, [order]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 text-sm px-3 py-1">Pending</Badge>;
      case "pending_payment":
        return <Badge className="bg-orange-100 text-orange-800 text-sm px-3 py-1">Pending Payment</Badge>;
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">Confirmed</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">Processing</Badge>;
      case "delivered":
        return <Badge className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1">Delivered</Badge>;
      case "completed":
        return <Badge className="bg-teal-100 text-teal-800 text-sm px-3 py-1">Completed</Badge>;
      case "canceled":
        return <Badge className="bg-red-100 text-red-800 text-sm px-3 py-1">Canceled</Badge>;
      case "payment_failed":
        return <Badge className="bg-rose-100 text-rose-800 text-sm px-3 py-1">Payment Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOrderStatusStep = (status: string): number => {
    const statusMap: { [key: string]: number } = {
      'pending': 0,
      'pending_payment': 0,
      'confirmed': 1,
      'processing': 2,
      'delivered': 3,
      'completed': 3,
    };
    return statusMap[status] ?? 0;
  };

  const OrderTimeline = ({ currentStatus }: { currentStatus: string }) => {
    const currentStep = getOrderStatusStep(currentStatus);

    const steps = [
      { label: 'Placed', icon: ShoppingBag },
      { label: 'Confirmed', icon: CheckCircle },
      { label: 'Preparing', icon: Box },
      { label: 'Delivered', icon: Truck },
    ];

    return (
      <div className="py-2">
        {/* Progress Bar Background */}
        <div className="relative flex items-center justify-between mb-3">
          {/* Line connecting all steps */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-10">
            <div
              className="h-full bg-cyan-600 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Step Checkpoints */}
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const Icon = step.icon;

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                  ${isCompleted || isCurrent
                    ? 'bg-cyan-600 text-white scale-100'
                    : 'bg-white border-2 border-gray-300 text-gray-400 scale-90'}
                `}>
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : isCurrent ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <p className={`
                  text-xs mt-2 font-medium transition-colors duration-300
                  ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
                `}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/store')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : isError || !order ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-red-600 text-lg mb-4">Order not found or you don't have access to this order.</p>
              <Button onClick={() => navigate('/store')}>Return to Store</Button>
            </CardContent>
          </Card>
        ) : order.status === 'payment_failed' || order.status === 'canceled' || order.status === 'cancelled' ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                {order.status === 'payment_failed' ? (
                  <>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                    <p className="text-gray-600 mb-6">
                      Unfortunately, your payment could not be processed. Please try again or use a different payment method.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate('/store/cart')} className="bg-cyan-600 hover:bg-cyan-700">
                        Return to Cart
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/store')}>
                        Continue Shopping
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Canceled</h2>
                    <p className="text-gray-600 mb-6">
                      This order has been canceled. If you have any questions, please contact our support team.
                    </p>
                    <Button onClick={() => navigate('/store')} className="bg-cyan-600 hover:bg-cyan-700">
                      Continue Shopping
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl font-bold mb-2.5">Order #{order.id}</CardTitle>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2.5">
                    <div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Total Amount</div>
                      <div className="text-2xl md:text-3xl font-bold text-cyan-600 whitespace-nowrap">
                        ${Number(order.total_price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Order Progress Timeline */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="w-5 h-5" />
                  Order Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6">
                <OrderTimeline currentStatus={order.status} />

                {/* Estimated Delivery Timeframe */}
                {order.status !== 'delivered' && order.status !== 'completed' && order.status !== 'canceled' && order.status !== 'cancelled' && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      <Clock className="w-4 h-4 inline-block mr-1 -mt-0.5" />
                      Expected delivery in <span className="font-semibold text-cyan-600">3-5 days</span>
                    </p>
                  </div>
                )}

                {/* Additional Tracking Info */}
                {order.delivery_tracking_number && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                    <p className="font-semibold text-lg text-gray-900">{order.delivery_tracking_number}</p>
                  </div>
                )}

                {order.delivered_at && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 mb-1">✓ Delivered On</p>
                    <p className="font-semibold text-green-900">
                      {new Date(order.delivered_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="w-5 h-5" />
                      Order Items ({orderItems?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    {/* Items List - Receipt Style */}
                    {(order.total_savings > 0 || order.discount_total > 0 || order.coupon_discount > 0) && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-green-800">
                          <Tag className="w-4 h-4" />
                          <span className="font-medium">
                            {order.coupon_code_used ? 'Discounted Order with Coupon' : 'Discounted Order'}
                          </span>
                          {order.coupon_code_used && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {order.coupon_code_used}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          Item prices shown include discounts. 
                          {order.total_savings && Number(order.total_savings) > 0 ? (
                            <span> Total savings: ${Number(order.total_savings).toFixed(2)}</span>
                          ) : order.discount_total > 0 ? (
                            <span> Total savings: ${Number(order.discount_total).toFixed(2)}</span>
                          ) : null}
                          {order.coupon_discount > 0 && (
                            <span className="ml-1">+ ${Number(order.coupon_discount).toFixed(2)} coupon discount</span>
                          )}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {orderItems?.map((item: any) => {
                        // Debug logging for each item
                        console.log(`=== ITEM ${item.id} DEBUG ===`);
                        console.log('Raw item data:', item);
                        console.log('pricing_details:', item.pricing_details);
                        console.log('item.original_price:', item.original_price);
                        console.log('item.selling_price:', item.selling_price);
                        console.log('item.discount_amount:', item.discount_amount);
                        console.log('item.item_discount_amount:', item.item_discount_amount);
                        console.log('item.item_discount_percentage:', item.item_discount_percentage);
                        
                        // Use comprehensive pricing breakdown if available, fallback to legacy logic
                        const pricingDetails = item.pricing_details;
                        
                        // Get basic values with proper fallbacks
                        const originalPrice = Number(pricingDetails?.original_price || item.original_price || item.selling_price || 0);
                        const sellingPrice = Number(item.selling_price || 0);
                        
                        // Calculate discount info
                        const hasActualDiscount = originalPrice > sellingPrice && originalPrice > 0;
                        const calculatedDiscountAmount = hasActualDiscount ? originalPrice - sellingPrice : 0;
                        
                        const hasDiscount = pricingDetails?.has_discount || hasActualDiscount;
                        const discountAmount = Number(pricingDetails?.item_discount_amount || calculatedDiscountAmount || 0);
                        const discountPercentage = Number(pricingDetails?.item_discount_percentage || 
                          (hasDiscount && originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0));
                        const totalSavings = Number(pricingDetails?.total_savings || (discountAmount * item.quantity) || 0);
                        
                        const discountType = pricingDetails?.discount_type || item.discount_type;
                        const couponCode = pricingDetails?.coupon_code || item.coupon_code;
                        const taxAmount = Number(pricingDetails?.tax_amount || item.tax_amount || 0);
                        
                        console.log('Calculated values:');
                        console.log('hasDiscount:', hasDiscount);
                        console.log('originalPrice:', originalPrice);
                        console.log('discountAmount:', discountAmount);
                        console.log('discountPercentage:', discountPercentage);
                        console.log('totalSavings:', totalSavings);
                        console.log('========================');

                        return (
                          <div key={item.id} className="py-3 border-b border-gray-100 last:border-0">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm">{item.product_name}</h4>
                                {item.variant_values && (
                                  <p className="text-xs text-gray-500 mt-0.5">{item.variant_values}</p>
                                )}
                                
                                {/* Show comprehensive pricing info */}
                                {hasDiscount ? (
                                  <div className="mt-1.5 space-y-1">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-gray-600">Qty: {item.quantity}</span>
                                      <span className="text-gray-400">×</span>
                                      <span className="line-through text-gray-400">
                                        ${originalPrice.toFixed(2)}
                                      </span>
                                      <span className="font-medium text-green-600">
                                        ${sellingPrice.toFixed(2)}
                                      </span>
                                      <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs">
                                        {discountPercentage}% OFF
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-green-600">Save ${totalSavings.toFixed(2)}</span>
                                      {discountType && (
                                        <span className="text-gray-500">({discountType})</span>
                                      )}
                                      {couponCode && (
                                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                                          {couponCode}
                                        </span>
                                      )}
                                    </div>
                                    {taxAmount > 0 && (
                                      <p className="text-xs text-gray-500">
                                        Tax: ${Number(taxAmount).toFixed(2)} ({Number(item.tax_rate || 0).toFixed(1)}%)
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="mt-1.5 space-y-1">
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                      <span>Qty: {item.quantity}</span>
                                      <span>×</span>
                                      <span>${sellingPrice.toFixed(2)}</span>
                                    </div>
                                    {taxAmount > 0 && (
                                      <p className="text-xs text-gray-500">
                                        Tax: ${Number(taxAmount).toFixed(2)} ({Number(item.tax_rate || 0).toFixed(1)}%)
                                      </p>
                                    )}
                                    {couponCode && (
                                      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                                        {couponCode}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900 text-sm">
                                  ${Number(item.subtotal).toFixed(2)}
                                </div>
                                {hasDiscount && (
                                  <div className="text-xs text-green-600 mt-0.5">
                                    -${totalSavings.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Summary - Comprehensive Receipt Style */}
                    <div className="mt-6 pt-4 border-t-2 border-gray-200 space-y-2">
                      {/* Show original subtotal if different from final subtotal */}
                      {order.original_subtotal && Number(order.original_subtotal) !== Number(order.subtotal) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 line-through">Original Subtotal</span>
                          <span className="text-gray-500 line-through">${Number(order.original_subtotal).toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">${Number(order.pricing_breakdown?.subtotal || order.subtotal || 0).toFixed(2)}</span>
                      </div>
                      
                      {/* Item-level discounts */}
                      {order.item_discounts_total && Number(order.item_discounts_total) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Item Discounts</span>
                          <span className="font-medium text-green-700">-${Number(order.item_discounts_total).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {/* Bulk discounts */}
                      {order.bulk_discount_total && Number(order.bulk_discount_total) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Bulk Discount</span>
                          <span className="font-medium text-green-700">-${Number(order.bulk_discount_total).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {/* Promotion discounts */}
                      {order.promotion_discount_total && Number(order.promotion_discount_total) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Promotion Discount</span>
                          <span className="font-medium text-green-700">-${Number(order.promotion_discount_total).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {/* Legacy discount total (for backward compatibility) */}
                      {order.discount_total && Number(order.discount_total) > 0 && 
                       (!order.item_discounts_total && !order.bulk_discount_total && !order.promotion_discount_total) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Promotion Discount</span>
                          <span className="font-medium text-green-700">-${Number(order.discount_total).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {/* Coupon discounts with code display */}
                      {order.coupon_discount && Number(order.coupon_discount) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">
                            Coupon Discount
                            {order.coupon_code_used && (
                              <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                {order.coupon_code_used}
                              </span>
                            )}
                          </span>
                          <span className="font-medium text-green-700">-${Number(order.coupon_discount).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {/* Tax information */}
                      {order.tax_total && Number(order.tax_total) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Tax
                            {order.tax_rate && ` (${Number(order.tax_rate).toFixed(1)}%)`}
                          </span>
                          <span className="font-medium text-gray-900">${Number(order.tax_total).toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium text-gray-900">${Number(order.pricing_breakdown?.delivery_fee || order.delivery_fee || 0).toFixed(2)}</span>
                      </div>
                      
                      {/* Total savings summary */}
                      {order.total_savings && Number(order.total_savings) > 0 && (
                        <div className="flex justify-between text-sm bg-green-50 px-3 py-2 rounded border border-green-200">
                          <span className="text-green-700 font-medium">Total Savings</span>
                          <span className="font-semibold text-green-700">${Number(order.total_savings).toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                        <span className="text-gray-900">Total</span>
                        <span className="text-cyan-600">${Number(order.total_price).toFixed(2)}</span>
                      </div>
                      
                      {/* Currency information */}
                      {order.currency_code && order.currency_code !== 'USD' && (
                        <div className="text-xs text-gray-500 text-center pt-2">
                          Currency: {order.currency_code}
                          {order.exchange_rate && order.exchange_rate !== 1 && (
                            <span className="ml-1">(Rate: {Number(order.exchange_rate).toFixed(4)})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Information */}
              <div>
                <Card className="shadow-sm">
                  <CardContent className="p-6 space-y-5">
                    {/* Delivery Address */}
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <MapPin className="w-4 h-4 text-cyan-600" />
                        <h3 className="font-semibold text-sm text-gray-900">Delivery Address</h3>
                      </div>
                      {order.address ? (
                        <div className="text-sm text-gray-700 space-y-0.5 pl-6">
                          {order.address.label && order.address.label !== 'Delivery Address' && (
                            <p className="font-medium text-gray-900">{order.address.label}</p>
                          )}
                          {order.address.first_name && (
                            <p className="font-medium text-gray-900">{order.address.first_name} {order.address.last_name}</p>
                          )}
                          <p>{order.address.address}</p>
                          {order.address.address_line2 && (
                            <p>{order.address.address_line2}</p>
                          )}
                          <p>
                            {order.address.city}, {order.address.state} {order.address.postal_code}
                          </p>
                          {order.address.phone && (
                            <p className="mt-1.5 text-gray-600">Phone: {order.address.phone}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 pl-6">No address information</p>
                      )}
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Payment Method */}
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <CreditCard className="w-4 h-4 text-cyan-600" />
                        <h3 className="font-semibold text-sm text-gray-900">Payment Method</h3>
                      </div>
                      {order.payment_method ? (
                        <div className="text-sm pl-6">
                          <p className="font-semibold text-gray-900">{order.payment_method.name}</p>
                          {order.payment_method.description && (
                            <p className="text-gray-600 mt-1">{order.payment_method.description}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 pl-6">No payment information</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default OrderDetail;
