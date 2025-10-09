import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { OrderStatusEditor } from "@/components/OrderStatusEditor";
import { OrderActions } from "@/components/OrderActions";
import { Package, Truck, Clock, DollarSign, Plus, XCircle, Tag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import {
  orderService,
  Order,
  OrderFilters,
  OrderStatus,
  AdminOrderViewResponse,
} from "@/services/orderService";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

/* =========================
   Orders Page
   ========================= */

const Orders = () => {
  const { toast } = useToast();

  /* -------- Filters & Lists -------- */
  const [filters, setFilters] = useState<OrderFilters>({});
  const { data: ordersData, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: () => orderService.getAdminOrders(filters),
    staleTime: 30 * 1000,
  });

  const orders = ordersData?.details?.orders || [];
  const statusOptions = (ordersData?.details?.statuses || []) as OrderStatus[];
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  /* -------- Filters handlers -------- */
  const handleSearch = (term: string) => {
    setFilters((prev) => ({ ...prev, search: term || undefined }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status: status || undefined }));
  };

  const handleDateRangeFilter = (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      date_from: startDate ? startDate.toISOString().split("T")[0] : undefined,
      date_to: endDate ? endDate.toISOString().split("T")[0] : undefined,
    }));
  };

  const handleAmountRangeFilter = (min: number | undefined, max: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      min_amount: min,
      max_amount: max,
    }));
  };

  const handleExportExcel = () => {
    const exportData = filteredOrders.map((order) => ({
      "Order ID": `#${order.id}`,
      Customer: order.user
        ? `${order.user.first_name || ""} ${order.user.last_name || ""}`.trim() || "N/A"
        : "N/A",
      Email: order.user?.email || "N/A",
      Date: new Date(order.created_at).toLocaleDateString(),
      Items: order.items?.length || 0,
      Total: `$${order.total_price}`,
      Status: order.status.replace("_", " ").toUpperCase(),
    }));

    exportToExcel(exportData, "orders-export", "Orders");
    toast({
      title: "Export Successful",
      description: "Orders data has been exported to Excel file",
    });
  };

  /* -------- Row actions (stubbed except view) -------- */
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // TODO: Implement status update API call
    toast({
      title: "Status Update",
      description: `Order #${orderId} status will be updated to ${newStatus}`,
    });
    refetch();
  };

  const handleEditOrder = (orderId: string) => {
    toast({
      title: "Edit Order",
      description: `Opening edit form for order ${orderId}`,
    });
    // TODO: navigate to edit page or open edit dialog
  };

  const handleDeleteOrder = async (orderId: string) => {
    toast({
      title: "Order Deletion",
      description: `Order #${orderId} deletion is not yet implemented`,
      variant: "destructive",
    });
  };

  const handleDownloadOrder = (orderId: string) => {
    toast({
      title: "Download Started",
      description: `Downloading invoice for order ${orderId}`,
    });
    // TODO: trigger invoice download
  };

  const handleEmailOrder = (orderId: string) => {
    toast({
      title: "Email Sent",
      description: `Order confirmation email sent for ${orderId}`,
    });
    // TODO: call email endpoint
  };

  const handleTrackOrder = (orderId: string) => {
    toast({
      title: "Tracking Information",
      description: `Showing tracking details for order ${orderId}`,
    });
    // TODO: show tracking info
  };

  const handleRefundOrder = (orderId: string) => {
    toast({
      title: "Refund Processing",
      description: `Refund has been initiated for order ${orderId}`,
    });
    // TODO: call refund endpoint
  };

  /* -------- View Order (admin) -------- */
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);

  const {
    data: adminOrderView,
    isFetching: isViewing,
    isError: isViewError,
  } = useQuery<AdminOrderViewResponse>({
    queryKey: ["admin-order-view", viewOrderId],
    queryFn: () => orderService.getAdminOrderView(viewOrderId!),
    enabled: !!viewOrderId,
    staleTime: 30 * 1000,
  });

  const handleViewOrder = (orderId: string) => {
    setViewOrderId(orderId);
  };

  /* -------- Status badge -------- */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Pending
          </Badge>
        );
      case "pending_payment":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
            Pending Payment
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Confirmed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Processing
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
            Delivered
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">
            Completed
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Canceled
          </Badge>
        );
      case "payment_failed":
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200">
            Payment Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  /* -------- Stats -------- */
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "pending_payment"
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.total_price) || 0),
    0
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Orders
                </h1>
                <p className="text-gray-600">Track and manage customer orders</p>
              </div>
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4" />
                New Order
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Orders</p>
                      <p className="text-2xl lg:text-3xl font-bold text-blue-900">
                        {totalOrders}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600">Revenue</p>
                      <p className="text-xl lg:text-2xl font-bold text-emerald-900">
                        ${totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600">Pending</p>
                      <p className="text-2xl lg:text-3xl font-bold text-amber-900">
                        {pendingOrders}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Delivered</p>
                      <p className="text-2xl lg:text-3xl font-bold text-purple-900">
                        {deliveredOrders}
                      </p>
                    </div>
                    <Truck className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Filters */}
            <AdvancedFilterBar
              searchPlaceholder="Search orders by ID, customer, or email..."
              statusOptions={statusOptions}
              onSearch={handleSearch}
              onStatusFilter={handleStatusFilter}
              onDateRangeFilter={handleDateRangeFilter}
              onAmountRangeFilter={handleAmountRangeFilter}
              onExportExcel={handleExportExcel}
              showStatusFilter
              showDateFilter
              showAmountFilter
              showExcelExport
              exportLabel="Export"
            />

            {/* Orders Table */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="text-xl font-bold text-gray-900">
                  Recent Orders ({filteredOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : isError ? (
                    <div className="p-6 text-center text-red-600">
                      <p>Failed to load orders. Please try again.</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <p>No orders found.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr className="text-left">
                          <th className="p-4 font-semibold text-gray-700">Order ID</th>
                          <th className="p-4 font-semibold text-gray-700">Customer</th>
                          <th className="p-4 font-semibold text-gray-700 hidden sm:table-cell">
                            Date
                          </th>
                          <th className="p-4 font-semibold text-gray-700 hidden lg:table-cell">
                            Items
                          </th>
                          <th className="p-4 font-semibold text-gray-700">Total</th>
                          <th className="p-4 font-semibold text-gray-700">Status</th>
                          <th className="p-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-4 font-medium text-blue-600">
                              #{order.id}
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {order.user
                                    ? `${order.user.first_name || ""} ${
                                        order.user.last_name || ""
                                      }`.trim() || "N/A"
                                    : "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.user?.email || "N/A"}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600 hidden sm:table-cell">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-gray-600 hidden lg:table-cell">
                              {order.items?.length || 0}
                            </td>
                            <td className="p-4 font-semibold text-gray-900">
                              ${order.total_price}
                            </td>
                            <td className="p-4">
                              <OrderStatusEditor
                                orderId={order.id.toString()}
                                currentStatus={order.status}
                                statuses={statusOptions}
                                onStatusChange={handleStatusChange}
                              />
                            </td>
                            <td className="p-4">
                              <OrderActions
                                orderId={order.id.toString()}
                                orderStatus={order.status}
                                onView={handleViewOrder}
                                onEdit={handleEditOrder}
                                onDelete={handleDeleteOrder}
                                onDownload={handleDownloadOrder}
                                onEmail={handleEmailOrder}
                                onTrack={handleTrackOrder}
                                onRefund={handleRefundOrder}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Order Dialog */}
          <Dialog
            open={!!viewOrderId}
            onOpenChange={(open) => !open && setViewOrderId(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>Order #{viewOrderId}</DialogTitle>
                    <DialogDescription>
                      Detailed view of the selected order.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              <ScrollArea className="max-h-[calc(90vh-120px)]">
                <div className="p-6">
                {isViewing ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : isViewError ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <p>Failed to fetch order. Please try again.</p>
                  </div>
                ) : adminOrderView ? (
                  <div className="space-y-6">
                    {/* Header Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Package className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="text-xs text-blue-600 font-medium">CUSTOMER</p>
                              <p className="font-semibold text-blue-900">{adminOrderView.order.user}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-8 h-8 text-green-600" />
                            <div>
                              <p className="text-xs text-green-600 font-medium">TOTAL</p>
                              <p className="font-bold text-xl text-green-900">${adminOrderView.order.total_price}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 text-purple-600" />
                            <div>
                              <p className="text-xs text-purple-600 font-medium">STATUS</p>
                              <p className="font-semibold text-purple-900 capitalize">
                                {adminOrderView.order.order_status?.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Delivery Information */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Delivery Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                            <p className="text-sm font-medium text-gray-900">
                              {adminOrderView.order.user_address}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Order Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(adminOrderView.order.created_at).toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Payment Information */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Payment Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Method</p>
                            <p className="text-sm font-medium text-gray-900">
                              {adminOrderView.order.payment_method || 'Not specified'}
                            </p>
                          </div>
                          {adminOrderView.order.payment_method_details?.description && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Details</p>
                              <p className="text-sm text-gray-700">
                                {adminOrderView.order.payment_method_details.description}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Order Items */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Order Items ({adminOrderView.order.items.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-80">
                          <div className="space-y-4">
                            {adminOrderView.order.items.map((item: any) => {
                              const hasDiscount = item.pricing_details?.has_discount || 
                                (item.pricing_details?.original_price && 
                                 Number(item.pricing_details.original_price) > Number(item.selling_price));
                              
                              const originalPrice = item.pricing_details?.original_price || item.selling_price;
                              const discountAmount = hasDiscount ? 
                                (Number(originalPrice) - Number(item.selling_price)) : 0;
                              const discountPercentage = hasDiscount && originalPrice > 0 ? 
                                Math.round((discountAmount / originalPrice) * 100) : 0;

                              return (
                                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                  {/* Product Image */}
                                  <div className="flex-shrink-0">
                                    {item.product_image ? (
                                      <img 
                                        src={item.product_image} 
                                        alt={item.product_name}
                                        className="w-16 h-16 object-cover rounded-md border"
                                        onError={(e) => {
                                          e.currentTarget.src = '/placeholder-product.png';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Product Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                                    {item.variant_values && (
                                      <p className="text-sm text-gray-500 mt-1">{item.variant_values}</p>
                                    )}
                                    
                                    {/* Pricing Info */}
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                                      {hasDiscount ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm line-through text-gray-400">
                                            ${Number(originalPrice).toFixed(2)}
                                          </span>
                                          <span className="text-sm font-medium text-green-600">
                                            ${Number(item.selling_price).toFixed(2)}
                                          </span>
                                          <Badge className="bg-green-100 text-green-800 text-xs">
                                            {discountPercentage}% OFF
                                          </Badge>
                                        </div>
                                      ) : (
                                        <span className="text-sm font-medium text-gray-900">
                                          ${Number(item.selling_price).toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Total */}
                                  <div className="text-right">
                                    <div className="font-semibold text-gray-900">
                                      ${Number(item.final_total || item.subtotal || (item.selling_price * item.quantity)).toFixed(2)}
                                    </div>
                                    {hasDiscount && (
                                      <div className="text-xs text-green-600 mt-1">
                                        Save ${(discountAmount * item.quantity).toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <p className="text-gray-500">No data.</p>
                )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Orders;
