import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { Plus, AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import { exportToPDF } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

// TODO: Replace with API call to fetch inventory data
const mockInventory = [
  { id: 1, product: "Wireless Headphones", sku: "WH-001", currentStock: 45, reorderLevel: 10, status: "in_stock", lastRestocked: "2024-01-10", supplier: "TechCorp" },
  { id: 2, product: "Smart Watch", sku: "SW-002", currentStock: 23, reorderLevel: 15, status: "in_stock", lastRestocked: "2024-01-08", supplier: "WearableTech" },
  { id: 3, product: "Bluetooth Speaker", sku: "BS-003", currentStock: 8, reorderLevel: 15, status: "low_stock", lastRestocked: "2024-01-05", supplier: "AudioMax" },
  { id: 4, product: "Phone Case", sku: "PC-004", currentStock: 67, reorderLevel: 20, status: "in_stock", lastRestocked: "2024-01-12", supplier: "AccessoryCo" },
  { id: 5, product: "Laptop Stand", sku: "LS-005", currentStock: 0, reorderLevel: 10, status: "out_of_stock", lastRestocked: "2023-12-28", supplier: "OfficePro" },
];

const statusOptions = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

const Inventory = () => {
  const [inventory] = useState(mockInventory);
  const [filteredInventory, setFilteredInventory] = useState(mockInventory);
  const { toast } = useToast();

  const handleSearch = (term: string) => {
    const filtered = inventory.filter(item =>
      item.product.toLowerCase().includes(term.toLowerCase()) ||
      item.sku.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredInventory(filtered);
  };

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilteredInventory(inventory);
      return;
    }
    const filtered = inventory.filter(item => item.status === status);
    setFilteredInventory(filtered);
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Product', dataKey: 'product' },
      { header: 'SKU', dataKey: 'sku' },
      { header: 'Current Stock', dataKey: 'currentStock' },
      { header: 'Reorder Level', dataKey: 'reorderLevel' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Last Restocked', dataKey: 'lastRestocked' },
      { header: 'Supplier', dataKey: 'supplier' }
    ];
    
    try {
      // Ensure data is properly formatted
      const dataToExport = filteredInventory.map(item => ({
        ...item,
        currentStock: item.currentStock.toString(),
        reorderLevel: item.reorderLevel.toString()
      }));
      
      exportToPDF(dataToExport, 'inventory-report', 'Inventory Report', columns);
      toast({
        title: "Export Successful",
        description: "Inventory report has been exported to PDF file"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the inventory report",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">In Stock</Badge>;
      case "low_stock":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge variant="destructive" className="dark:bg-red-900/20 dark:text-red-400">Out of Stock</Badge>;
      default:
        return <Badge className="dark:bg-gray-700 dark:text-gray-300">Unknown</Badge>;
    }
  };

  const lowStockItems = inventory.filter(item => item.status === "low_stock").length;
  const outOfStockItems = inventory.filter(item => item.status === "out_of_stock").length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * 50), 0); // Assuming avg price of $50

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory</h1>
                <p className="text-gray-600 dark:text-gray-300">Monitor stock levels and manage inventory</p>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Stock
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Items</p>
                      <p className="text-2xl font-bold dark:text-white">143</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Low Stock</p>
                      <p className="text-2xl font-bold dark:text-white">{lowStockItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Out of Stock</p>
                      <p className="text-2xl font-bold dark:text-white">{outOfStockItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Inventory Value</p>
                      <p className="text-2xl font-bold dark:text-white">${totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {(lowStockItems > 0 || outOfStockItems > 0) && (
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Inventory Alerts</h3>
                      <p className="text-yellow-700 dark:text-yellow-400">
                        You have {lowStockItems} items with low stock and {outOfStockItems} items out of stock that need attention.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <AdvancedFilterBar
              searchPlaceholder="Search inventory by product or SKU..."
              statusOptions={statusOptions}
              onSearch={handleSearch}
              onStatusFilter={handleStatusFilter}
              onExportPDF={handleExportPDF}
              showStatusFilter
              showPDFExport
            />

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Inventory Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b dark:border-gray-600">
                      <tr className="text-left">
                        <th className="pb-3 font-semibold dark:text-white">Product</th>
                        <th className="pb-3 font-semibold dark:text-white">SKU</th>
                        <th className="pb-3 font-semibold dark:text-white">Current Stock</th>
                        <th className="pb-3 font-semibold dark:text-white">Reorder Level</th>
                        <th className="pb-3 font-semibold dark:text-white">Status</th>
                        <th className="pb-3 font-semibold dark:text-white">Last Restocked</th>
                        <th className="pb-3 font-semibold dark:text-white">Supplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                          <td className="py-4 font-medium dark:text-white">{item.product}</td>
                          <td className="py-4 text-gray-600 dark:text-gray-300">{item.sku}</td>
                          <td className="py-4">
                            <span className={`font-medium ${
                              item.currentStock <= item.reorderLevel ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                            }`}>
                              {item.currentStock}
                            </span>
                          </td>
                          <td className="py-4 text-gray-600 dark:text-gray-300">{item.reorderLevel}</td>
                          <td className="py-4">{getStatusBadge(item.status)}</td>
                          <td className="py-4 text-gray-600 dark:text-gray-300">{item.lastRestocked}</td>
                          <td className="py-4 text-gray-600 dark:text-gray-300">{item.supplier}</td>
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

export default Inventory;
