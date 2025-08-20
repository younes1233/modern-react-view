
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BannerManagement } from "@/components/store-management/BannerManagement";
import { ProductDisplay } from "@/components/store-management/ProductDisplay";
import { HeroManagement } from "@/components/store-management/HeroManagement";
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

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Total Categories Card */}
              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200 dark:border-pink-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-pink-500/10 dark:bg-pink-400/10">
                      <Package className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Total Categories</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-2xl lg:text-3xl font-bold text-pink-900 dark:text-pink-100">{stats.totalCategories}</p>
                    )}
                    {loading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <p className="text-xs font-medium text-pink-600 dark:text-pink-400">{stats.activeCategories} active</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Products Card */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 dark:bg-orange-400/10">
                      <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Products</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-2xl lg:text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.totalProducts}</p>
                    )}
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Across all categories</p>
                  </div>
                </CardContent>
              </Card>

              {/* Top Category Card */}
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10">
                      <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Top Category</p>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <p className="text-2xl lg:text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.topCategory?.name || 'N/A'}</p>
                    )}
                    {loading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{stats.topCategory?.percentage}% of total sales</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Featured Categories Card */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 dark:bg-purple-400/10">
                      <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Featured</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-2xl lg:text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.featuredCategories}</p>
                    )}
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Categories featured</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Management Tabs */}
            <Tabs defaultValue="hero" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
                <TabsTrigger value="hero" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Hero
                </TabsTrigger>
                <TabsTrigger value="stories" className="flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Stories
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="banners" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Banners
                </TabsTrigger>
                <TabsTrigger value="listings" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Product Listings
                </TabsTrigger>
                <TabsTrigger value="display" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Display
                </TabsTrigger>
              </TabsList>

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
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default StoreManagement;
