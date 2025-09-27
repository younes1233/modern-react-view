
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BannerManagement } from "@/components/store-management/BannerManagement";
import { ProductDisplay } from "@/components/store-management/ProductDisplay";
import { HeroManagement } from "@/components/store-management/HeroManagementNew";
import { StoriesManagement } from "@/components/store-management/StoriesManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Image, Package, Palette, Zap, Grid3X3, TrendingUp, Star, Film } from "lucide-react";
import { LayoutManagement } from "@/components/store-management/LayoutManagement";
import { ProductListingManagement } from "@/components/store-management/ProductListingManagement";
import { useCategoryStats } from "@/hooks/useCategoryStats";
import { Skeleton } from "@/components/ui/skeleton";

const StoreManagement = () => {
  const { stats, loading, error } = useCategoryStats();

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


            {/* Management Tabs */}
            <Tabs defaultValue="hero" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-6">
                <TabsTrigger value="hero" className="flex items-center gap-2">
                  <Zap className="w-5 h-5 lg:w-4 lg:h-4" />
                  Hero
                </TabsTrigger>
                <TabsTrigger value="stories" className="flex items-center gap-2">
                  <Film className="w-5 h-5 lg:w-4 lg:h-4" />
                  Stories
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-2">
                  <Store className="w-5 h-5 lg:w-4 lg:h-4" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="banners" className="flex items-center gap-2">
                  <Image className="w-5 h-5 lg:w-4 lg:h-4" />
                  Banners
                </TabsTrigger>
                <TabsTrigger value="listings" className="flex items-center gap-2">
                  <Package className="w-5 h-5 lg:w-4 lg:h-4" />
                  Product Listings
                </TabsTrigger>
                <TabsTrigger value="display" className="flex items-center gap-2">
                  <Palette className="w-5 h-5 lg:w-4 lg:h-4" />
                  Display
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
              <TabsContent value="hero">
                <HeroManagement />
              </TabsContent>

              <TabsContent value="stories">
                <StoriesManagement />
              </TabsContent>

              <TabsContent value="layout">
                <LayoutManagement />
              </TabsContent>

              <TabsContent value="banners">
                <BannerManagement />
              </TabsContent>

              <TabsContent value="listings">
                <ProductListingManagement />
              </TabsContent>

              <TabsContent value="display">
                <ProductDisplay />
              </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default StoreManagement;
