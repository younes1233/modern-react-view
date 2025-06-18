
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/FilterBar";
import { ActionButtons } from "@/components/ActionButtons";
import { Package, Truck, Clock, XCircle, DollarSign } from "lucide-react";

// TODO: Replace with API call to fetch orders
const mockOrders = [
  { id: "#ORD-001", customer: "John Doe", email: "john@example.com", total: 299.98, status: "pending", date: "2024-01-15", items: 3 },
  { id: "#ORD-002", customer: "Jane Smith", email: "jane@example.com", total: 89.99, status: "shipped", date: "2024-01-14", items: 1 },
  { id: "#ORD-003", customer: "Mike Johnson", email: "mike@example.com", total: 159.97, status: "delivered", date: "2024-01-13", items: 2 },
  { id: "#ORD-004", customer: "Sarah Wilson", email: "sarah@example.com", total: 199.99, status: "processing", date: "2024-01-12", items: 1 },
  { id: "#ORD-005", customer: "Tom Brown", email: "tom@example.com", total: 324.95, status: "cancelled", date: "2024-01-11", items: 4 },
];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const Orders = () => {
  const [orders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);

  const handleSearch = (term: string) => {
    const filtered = orders.filter(order =>
      order.id.toLowerCase().includes(term.toLowerCase()) ||
      order.customer.toLowerCase().includes(term.toLowerCase()) ||
      order.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilteredOrders(orders);
      return;
    }
    const filtered = orders.filter(order => order.status === status);
    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Processing</Badge>;
      case "shipped":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Delivered</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const shippedOrders = orders.filter(o => o.status === "shipped").length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600">Track and manage customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Orders</p>
                      <p className="text-2xl lg:text-3xl font-bold text-blue-900">{totalOrders}</p>
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
                      <p className="text-xl lg:text-2xl font-bold text-emerald-900">${totalRevenue.toFixed(2)}</p>
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
                      <p className="text-2xl lg:text-3xl font-bold text-amber-900">{pendingOrders}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Shipped</p>
                      <p className="text-2xl lg:text-3xl font-bold text-purple-900">{shippedOrders}</p>
                    </div>
                    <Truck className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <FilterBar
              searchPlaceholder="Search orders by ID, customer, or email..."
              statusOptions={statusOptions}
              onSearch={handleSearch}
              onStatusFilter={handleStatusFilter}
              showStatusFilter
              showDateFilter
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
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-left">
                        <th className="p-4 font-semibold text-gray-700">Order ID</th>
                        <th className="p-4 font-semibold text-gray-700">Customer</th>
                        <th className="p-4 font-semibold text-gray-700 hidden sm:table-cell">Date</th>
                        <th className="p-4 font-semibold text-gray-700 hidden lg:table-cell">Items</th>
                        <th className="p-4 font-semibold text-gray-700">Total</th>
                        <th className="p-4 font-semibold text-gray-700">Status</th>
                        <th className="p-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-blue-600">{order.id}</td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-gray-900">{order.customer}</div>
                              <div className="text-sm text-gray-500">{order.email}</div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600 hidden sm:table-cell">{order.date}</td>
                          <td className="p-4 text-gray-600 hidden lg:table-cell">{order.items}</td>
                          <td className="p-4 font-semibold text-gray-900">${order.total}</td>
                          <td className="p-4">{getStatusBadge(order.status)}</td>
                          <td className="p-4">
                            <ActionButtons
                              itemId={order.id}
                              itemName={`Order ${order.id}`}
                              variant="compact"
                              showEmail
                              showDownload
                              showDelete={false}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Orders;
