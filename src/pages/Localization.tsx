
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleBasedSidebar } from "@/components/dashboard/RoleBasedSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Globe, 
  MapPin, 
  Warehouse, 
  DollarSign 
} from "lucide-react";
import { CountryManagement } from "@/components/localization/CountryManagement";
import { WarehouseManagement } from "@/components/localization/WarehouseManagement";
import { CurrencyManagement } from "@/components/localization/CurrencyManagement";

const Localization = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <RoleBasedSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Globe className="w-8 h-8 text-blue-600" />
                    Localization
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage countries, warehouses, and currencies</p>
                </div>
              </div>

              <Tabs defaultValue="countries" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="countries" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Countries
                  </TabsTrigger>
                  <TabsTrigger value="warehouses" className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4" />
                    Warehouses
                  </TabsTrigger>
                  <TabsTrigger value="currencies" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Currencies
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="countries" className="space-y-6">
                  <CountryManagement />
                </TabsContent>

                <TabsContent value="warehouses" className="space-y-6">
                  <WarehouseManagement />
                </TabsContent>

                <TabsContent value="currencies" className="space-y-6">
                  <CurrencyManagement />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Localization;
