
import { useRoleAuth } from "@/contexts/RoleAuthContext";
import { Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleBasedSidebar } from "@/components/dashboard/RoleBasedSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCards } from "@/components/MetricCards";
import { SalesChart } from "@/components/SalesChart";
import { TopProducts } from "@/components/TopProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
  CheckCircle, 
  UserPlus, 
  Package, 
  ShoppingCart, 
  FileText,
  TrendingUp
} from "lucide-react";

const Index = () => {
  const { user, isLoading } = useRoleAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/role-login" replace />;
  }

  // Redirect customers to the store
  if (user.role === 'customer') {
    return <Navigate to="/store" replace />;
  }

  // Sellers are redirected to their products page
  if (user.role === 'seller') {
    return <Navigate to="/seller-products" replace />;
  }

  // Only super_admin and manager can see the main dashboard
  if (user.role !== 'super_admin' && user.role !== 'manager') {
    return <Navigate to="/unauthorized" replace />;
  }

  const renderSuperAdminDashboard = () => (
    <>
      <MetricCards />
      
      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Manage Users</div>
            <p className="text-xs text-muted-foreground mb-4">
              Add sellers, managers, and control user roles
            </p>
            <Link to="/user-management">
              <Button className="w-full gap-2">
                <UserPlus className="w-4 h-4" />
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Approval</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Review Products</div>
            <p className="text-xs text-muted-foreground mb-4">
              Approve or reject seller product submissions
            </p>
            <Link to="/product-approval">
              <Button className="w-full gap-2">
                <CheckCircle className="w-4 h-4" />
                Review Products
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/products">
                <Button variant="outline" className="w-full gap-2 justify-start">
                  <Package className="w-4 h-4" />
                  Manage Products
                </Button>
              </Link>
              <Link to="/orders">
                <Button variant="outline" className="w-full gap-2 justify-start">
                  <ShoppingCart className="w-4 h-4" />
                  View Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <TopProducts />
      </div>
    </>
  );

  const renderManagerDashboard = () => (
    <>
      {/* Manager-specific metrics - no analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Orders</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">1,234</p>
              <p className="text-xs font-medium text-blue-600">Manage all orders</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">2,547</p>
              <p className="text-xs font-medium text-purple-600">Customer management</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg transform hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">234</p>
              <p className="text-xs font-medium text-orange-600">Product catalog</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manager Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/products">
              <Button className="w-full gap-2 justify-start">
                <Package className="w-4 h-4" />
                Manage Products
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <FileText className="w-4 h-4" />
                Categories
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Business Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/orders">
              <Button className="w-full gap-2 justify-start">
                <ShoppingCart className="w-4 h-4" />
                Orders
              </Button>
            </Link>
            <Link to="/customers">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Users className="w-4 h-4" />
                Customers
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <RoleBasedSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {user.role === 'super_admin' ? 'Admin Dashboard' : 'Manager Dashboard'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.role === 'super_admin' 
                    ? 'Manage your store operations and oversee all activities' 
                    : 'Manage products, orders, and customer relationships'
                  }
                </p>
              </div>
            </div>

            {user.role === 'super_admin' ? renderSuperAdminDashboard() : renderManagerDashboard()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
