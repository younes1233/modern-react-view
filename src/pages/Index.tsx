
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCards } from "@/components/MetricCards";
import { SalesChart } from "@/components/SalesChart";
import { TopProducts } from "@/components/TopProducts";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening with your store today.</p>
            </div>
            <MetricCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesChart />
              </div>
              <div className="lg:col-span-1">
                <TopProducts />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
