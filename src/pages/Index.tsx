
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCards } from "@/components/MetricCards";
import { SalesChart } from "@/components/SalesChart";
import { TopProducts } from "@/components/TopProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  ArrowUpRight,
  Calendar,
  Activity,
  Target
} from "lucide-react";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-white/5"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
                    <p className="text-lg text-purple-100">
                      Here's what's happening with your store today.
                    </p>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-100">Monthly Goal</p>
                        <p className="text-xl font-bold">85% Complete</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-100">Active Orders</p>
                        <p className="text-xl font-bold">24</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-100">Growth</p>
                        <p className="text-xl font-bold">+12.5%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Metrics */}
            <MetricCards />

            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    <Users className="w-6 h-6" />
                    <span className="text-sm font-medium">Add Customer</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="text-sm font-medium">New Order</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    <DollarSign className="w-6 h-6" />
                    <span className="text-sm font-medium">Add Product</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-sm font-medium">View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SalesChart />
              </div>
              <div className="lg:col-span-1">
                <TopProducts />
              </div>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "New order received", detail: "Order #ORD-2024-001 from John Doe", time: "2 min ago", type: "order" },
                    { action: "Product updated", detail: "Premium Headphones stock updated", time: "15 min ago", type: "product" },
                    { action: "Customer registered", detail: "Jane Smith created an account", time: "1 hour ago", type: "customer" },
                    { action: "Payment processed", detail: "Payment of $299.99 confirmed", time: "2 hours ago", type: "payment" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'order' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        activity.type === 'product' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        activity.type === 'customer' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        {activity.type === 'order' && <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {activity.type === 'product' && <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                        {activity.type === 'customer' && <Users className="w-4 h-4 text-green-600 dark:text-green-400" />}
                        {activity.type === 'payment' && <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{activity.action}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{activity.detail}</p>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
