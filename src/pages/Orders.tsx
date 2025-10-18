import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { OrderStatusEditor } from "@/components/OrderStatusEditor";
import { OrderActions } from "@/components/OrderActions";
import { OrderCancellationDialog } from "@/components/OrderCancellationDialog";
import { Package, Truck, Clock, DollarSign, Plus, XCircle, Tag, CreditCard, Mail, Phone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/utils/exportUtils";
import { toast } from '@/components/ui/sonner';
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
  // Removed useToast hook;
  const queryClient = useQueryClient();

  // Helper function to format dates as dd/MM/yyyy
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB'); // en-GB uses dd/MM/yyyy format
  };

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
      Total: `${(order as any).currency?.symbol || '$'}${order.total_price}`,
      Status: order.status.replace("_", " ").toUpperCase(),
    }));

    exportToExcel(exportData, "orders-export", "Orders");
    toast.success("Orders data has been exported to Excel file", { duration: 2000 });
  };

  /* -------- Row actions (stubbed except view) -------- */
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      console.log('Attempting to update order status:', { orderId, newStatus });
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      console.log('Status update response:', response);
      
      toast.success(`Order #${orderId} status has been updated to ${newStatus}`, { duration: 2000 });
      
      // Invalidate and refetch the orders cache
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await refetch();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error(`Failed to update order #${orderId} status. Please try again.`, { duration: 2500 });
    }
  };

  const handleEditOrder = (orderId: string) => {
    toast.success(`Opening edit form for order ${orderId}`, { duration: 2000 });
    // TODO: navigate to edit page or open edit dialog
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to delete order #${orderId}? This action can be undone later.`)) {
      return;
    }

    try {
      const response = await orderService.deleteOrder(orderId);

      if (response.error) {
        toast.error(response.message || `Failed to delete order #${orderId}`);
        return;
      }

      toast.success(`Order #${orderId} has been deleted successfully`);
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await refetch();
    } catch (error: any) {
      console.error('Failed to delete order:', error);
      toast.error(`Failed to delete order #${orderId}. Please try again.`);
    }
  };

  const handleCancelOrderClick = (orderId: string) => {
    setCancelOrderId(orderId);
  };

  const handleCancelOrderSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    await refetch();
  };

  const handleDownloadOrder = (orderId: string) => {
    toast.success(`Downloading invoice for order ${orderId}`, { duration: 2000 });
    // TODO: trigger invoice download
  };

  const handleEmailOrder = (orderId: string) => {
    toast.success(`Order confirmation email sent for ${orderId}`, { duration: 2000 });
    // TODO: call email endpoint
  };

  const handleTrackOrder = (orderId: string) => {
    toast.success(`Showing tracking details for order ${orderId}`, { duration: 2000 });
    // TODO: show tracking info
  };

  const handleRefundOrder = (orderId: string) => {
    toast.success(`Refund has been initiated for order ${orderId}`, { duration: 2000 });
    // TODO: call refund endpoint
  };

  /* -------- View Order (admin) -------- */
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);

  /* -------- Cancel Order Dialog -------- */
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

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

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      // Use the same base URL as your API service (production ready)
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://meemhome.com/api';
      const token = localStorage.getItem('auth_token');
      const apiSecret = import.meta.env.VITE_API_SECRET || '';

      if (!token) {
        toast.error('Authentication required to download invoice', { duration: 2500 });
        return;
      }

      // Build the download URL
      const downloadUrl = `${baseURL}/admin/orders/${orderId}/invoice`;

      // Fetch the PDF with proper authentication
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-SECRET': apiSecret,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.', { duration: 2500 });
          return;
        }
        throw new Error(`Failed to download invoice: ${response.statusText}`);
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Invoice for order #${orderId} downloaded successfully`, { duration: 2000 });
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error('Failed to download invoice. Please try again.', { duration: 2500 });
    }
  };

  /* -------- Status badge -------- */
  const getStatusBadge = (status: string) => {
    // Find the status in the full list from backend
    const statusInfo = statusOptions.find(s => s.value === status);
    
    if (statusInfo) {
      // Use backend-defined colors and labels
      const colorClasses = {
        'amber': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
        'orange': 'bg-orange-100 text-orange-800 hover:bg-orange-200', 
        'green': 'bg-green-100 text-green-800 hover:bg-green-200',
        'blue': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        'emerald': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
        'teal': 'bg-teal-100 text-teal-800 hover:bg-teal-200',
        'red': 'bg-red-100 text-red-800 hover:bg-red-200',
        'rose': 'bg-rose-100 text-rose-800 hover:bg-rose-200',
        'purple': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
        'gray': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      };
      
      const colorClass = colorClasses[statusInfo.color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={colorClass}>
          {statusInfo.label}
        </Badge>
      );
    }
    
    // Fallback for any unknown statuses
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        {status || 'Unknown'}
      </Badge>
    );
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
                              {(order as any).currency?.symbol || '$'}{order.total_price}
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
                                onCancel={handleCancelOrderClick}
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
            <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] p-0 overflow-hidden">
              <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg sm:text-xl">Order #{viewOrderId}</DialogTitle>
                    <DialogDescription className="text-sm">
                      Detailed view of the selected order.
                    </DialogDescription>
                  </div>
                  <Button
                    onClick={() => viewOrderId && handleDownloadInvoice(viewOrderId)}
                    className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                    disabled={isViewing}
                  >
                    <Download className="w-4 h-4" />
                    <span className="sm:inline">Download Invoice</span>
                  </Button>
                </div>
              </DialogHeader>

              <Separator />

              <ScrollArea className="max-h-[calc(90vh-200px)] sm:max-h-[calc(90vh-120px)]">
                <div className="p-4 sm:p-6 pb-20 sm:pb-6">
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
                  <div className="space-y-4 sm:space-y-6">
                    {/* Header Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Package className="w-8 h-8 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-xs text-blue-600 font-medium">CUSTOMER</p>
                              <p className="font-semibold text-blue-900">{adminOrderView.order.user}</p>
                              {adminOrderView.order.user_email && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-blue-600" />
                                  <p className="text-xs text-blue-700">{adminOrderView.order.user_email}</p>
                                </div>
                              )}
                              {adminOrderView.order.user_phone && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-blue-600" />
                                  <p className="text-xs text-blue-700">{adminOrderView.order.user_phone}</p>
                                </div>
                              )}
                              <p className="text-xs text-blue-700 mt-1">Order #{adminOrderView.order.id}</p>
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
                              <p className="font-bold text-xl text-green-900">
                                {(adminOrderView.order as any).currency?.symbol || '$'}{adminOrderView.order.total_price}
                              </p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Delivery Cost</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-green-600">
                                {(adminOrderView.order as any).currency?.symbol || '$'}{Number(adminOrderView.order.delivery_fee || 0).toFixed(2)}
                              </p>
                              {adminOrderView.order.is_custom_delivery_cost && (
                                <Badge variant="outline" className="text-xs">Custom</Badge>
                              )}
                            </div>
                            {adminOrderView.order.delivery_method_type && (
                              <p className="text-xs text-gray-500 mt-1">
                                Method: {adminOrderView.order.delivery_method_type}
                              </p>
                            )}
                          </div>
                          {adminOrderView.order.delivery_tracking_number && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Tracking Number</p>
                              <p className="text-sm font-medium text-gray-900 font-mono">
                                {adminOrderView.order.delivery_tracking_number}
                              </p>
                            </div>
                          )}
                          {adminOrderView.order.estimated_delivery_date && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Estimated Delivery</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(adminOrderView.order.estimated_delivery_date)}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Order Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(adminOrderView.order.created_at)}
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
                        <div className="space-y-3 sm:space-y-4">
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
                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                  {/* Product Image */}
                                  <div className="flex-shrink-0 self-start sm:self-center">
                                    {item.product_image ? (
                                      <img
                                        src={item.product_image}
                                        alt={item.product_name}
                                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md border"
                                        onError={(e) => {
                                          e.currentTarget.src = '/placeholder-product.png';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Product Info */}
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                                    
                                    {/* Product Variations */}
                                    {(() => {
                                      console.log('=== VARIANT DEBUG ===');
                                      console.log('Product:', item.product_name);
                                      console.log('is_variant:', item.is_variant);
                                      console.log('variant_values:', item.variant_values);
                                      console.log('variant_values type:', typeof item.variant_values);
                                      console.log('variant_values isArray:', Array.isArray(item.variant_values));
                                      if (item.debug_variant_info) {
                                        console.log('Backend debug info:', item.debug_variant_info);
                                      }
                                      console.log('===================');
                                      return null;
                                    })()}
                                    
                                    {item.variant_values && Array.isArray(item.variant_values) && item.variant_values.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item.variant_values.map((variant: any, index: number) => (
                                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                            {variant.attribute}: {variant.value}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Fallback for old orders without variant_values - show indicator */}
                                    {item.is_variant && (!item.variant_values || (Array.isArray(item.variant_values) && item.variant_values.length === 0)) && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                                        Product Variant (Legacy Order)
                                      </span>
                                    )}
                                    
                                    
                                    {/* Product Type Indicator */}
                                    <div className="flex items-center gap-2 mt-1">
                                      {item.is_package && (
                                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">Package</Badge>
                                      )}
                                    </div>
                                    
                                    {/* Pricing Info */}
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                                      {hasDiscount ? (
                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                          <span className="text-xs sm:text-sm line-through text-gray-400">
                                            {(adminOrderView.order as any).currency?.symbol || '$'}{Number(originalPrice).toFixed(2)}
                                          </span>
                                          <span className="text-xs sm:text-sm font-medium text-green-600">
                                            {(adminOrderView.order as any).currency?.symbol || '$'}{Number(item.selling_price).toFixed(2)}
                                          </span>
                                          <Badge className="bg-green-100 text-green-800 text-xs">
                                            {discountPercentage}% OFF
                                          </Badge>
                                        </div>
                                      ) : (
                                        <span className="text-sm font-medium text-gray-900">
                                          {(adminOrderView.order as any).currency?.symbol || '$'}{Number(item.selling_price).toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Total */}
                                  <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0">
                                    <div className="flex sm:block justify-between items-center">
                                      <span className="text-sm sm:hidden text-gray-600">Total:</span>
                                      <div className="font-semibold text-gray-900">
                                        {(adminOrderView.order as any).currency?.symbol || '$'}{Number(item.final_total || item.subtotal || (item.selling_price * item.quantity)).toFixed(2)}
                                      </div>
                                    </div>
                                    {hasDiscount && (
                                      <div className="text-xs text-green-600 mt-1">
                                        Save {(adminOrderView.order as any).currency?.symbol || '$'}{(discountAmount * item.quantity).toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Order Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {/* Items Total */}
                          <div className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-600">Items ({adminOrderView.order.items.length})</span>
                            <span className="text-sm font-medium">
                              {(adminOrderView.order as any).currency?.symbol || '$'}{Number(adminOrderView.order.subtotal || 0).toFixed(2)}
                            </span>
                          </div>
                          
                          {/* Discounts if any */}
                          {adminOrderView.order.items.some((item: any) => 
                            item.pricing_details?.has_discount || 
                            (item.pricing_details?.original_price && Number(item.pricing_details.original_price) > Number(item.selling_price))
                          ) && (
                            <div className="bg-green-50 p-2 rounded border border-green-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Tag className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Discounts Applied</span>
                              </div>
                              {adminOrderView.order.items.map((item: any) => {
                                const hasDiscount = item.pricing_details?.has_discount || 
                                  (item.pricing_details?.original_price && 
                                   Number(item.pricing_details.original_price) > Number(item.selling_price));
                                
                                if (!hasDiscount) return null;
                                
                                const originalPrice = Number(item.pricing_details?.original_price || item.selling_price);
                                const sellingPrice = Number(item.selling_price);
                                const discountAmount = originalPrice - sellingPrice;
                                const discountPercentage = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;
                                const totalSavings = discountAmount * item.quantity;
                                
                                const discountName = item.pricing_details?.discount_details?.name || 
                                                   item.discount_details?.name || 
                                                   item.pricing_details?.discount_type || 
                                                   item.discount_type || 
                                                   'Discount';
                                
                                return (
                                  <div key={item.id} className="text-xs text-green-700 ml-6 flex justify-between items-center">
                                    <span>{item.product_name}: -{discountPercentage}% (Save {(adminOrderView.order as any).currency?.symbol || '$'}{totalSavings.toFixed(2)})</span>
                                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                      {discountName}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Tax if any */}
                          {adminOrderView.order.items.some((item: any) => Number(item.pricing_details?.tax_amount || 0) > 0) && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-gray-600">Tax</span>
                              <span className="text-sm font-medium">
                                {(adminOrderView.order as any).currency?.symbol || '$'}{adminOrderView.order.items.reduce((total: number, item: any) =>
                                  total + (Number(item.pricing_details?.tax_amount || 0) * item.quantity), 0
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}

                          {/* Delivery Fee */}
                          <div className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-600">Delivery Fee</span>
                            <span className="text-sm font-medium text-green-600">
                              {(adminOrderView.order as any).currency?.symbol || '$'}{Number(adminOrderView.order.delivery_fee || 0).toFixed(2)}
                            </span>
                          </div>

                          {/* Total */}
                          <div className="border-t pt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900">Total</span>
                              <span className="font-bold text-lg text-gray-900">
                                {(adminOrderView.order as any).currency?.symbol || '$'}{Number(adminOrderView.order.total_price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <p className="text-gray-500">No data.</p>
                )}
                </div>
              </ScrollArea>

              {/* Mobile Close Button - Sticky at bottom */}
              <div className="sm:hidden sticky bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
                <Button
                  onClick={() => setViewOrderId(null)}
                  className="w-full bg-gray-600 hover:bg-gray-700"
                  size="lg"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Order Cancellation Dialog */}
          <OrderCancellationDialog
            isOpen={!!cancelOrderId}
            onClose={() => setCancelOrderId(null)}
            onSuccess={handleCancelOrderSuccess}
            orderId={cancelOrderId}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Orders;
