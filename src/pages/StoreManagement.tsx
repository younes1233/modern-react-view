
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BannerManagement } from "@/components/store-management/BannerManagement";
import { ProductDisplay } from "@/components/store-management/ProductDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Image, Package, Palette } from "lucide-react";

const StoreManagement = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Store className="w-8 h-8 text-blue-600" />
                  Store Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your store's appearance and product display</p>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Banners</p>
                      <p className="text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">3</p>
                    </div>
                    <Image className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Featured Products</p>
                      <p className="text-2xl lg:text-3xl font-bold text-emerald-900 dark:text-emerald-100">12</p>
                    </div>
                    <Package className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Categories</p>
                      <p className="text-2xl lg:text-3xl font-bold text-purple-900 dark:text-purple-100">8</p>
                    </div>
                    <Palette className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Active Promotions</p>
                      <p className="text-2xl lg:text-3xl font-bold text-amber-900 dark:text-amber-100">5</p>
                    </div>
                    <Store className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Management Tabs */}
            <Tabs defaultValue="banners" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
                <TabsTrigger value="banners" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Banner Management
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Product Display
                </TabsTrigger>
              </TabsList>

              <TabsContent value="banners">
                <BannerManagement />
              </TabsContent>

              <TabsContent value="products">
                <ProductDisplay />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default StoreManagement;
