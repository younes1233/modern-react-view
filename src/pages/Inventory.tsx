import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
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
    
    exportToPDF(filteredInventory, 'inventory-report', 'Inventory Report', columns);
    toast({
      title: "Export Successful",
      description: "Inventory report has been exported to PDF file"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case "low_stock":
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const lowStockItems = inventory.filter(item => item.status === "low_stock").length;
  const outOfStockItems = inventory.filter(item => item.status === "out_of_stock").length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * 50), 0); // Assuming avg price of $50

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
                <p className="text-gray-600">Monitor stock levels and manage inventory</p>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Stock
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold">143</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-yellow-50">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Low Stock</p>
                      <p className="text-2xl font-bold">{lowStockItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-red-50">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Out of Stock</p>
                      <p className="text-2xl font-bold">{outOfStockItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-50">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Inventory Value</p>
                      <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {(lowStockItems > 0 || outOfStockItems > 0) && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Inventory Alerts</h3>
                      <p className="text-yellow-700">
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

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Inventory Overview</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-3 font-semibold">Product</th>
                        <th className="pb-3 font-semibold">SKU</th>
                        <th className="pb-3 font-semibold">Current Stock</th>
                        <th className="pb-3 font-semibold">Reorder Level</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Last Restocked</th>
                        <th className="pb-3 font-semibold">Supplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 font-medium">{item.product}</td>
                          <td className="py-4 text-gray-600">{item.sku}</td>
                          <td className="py-4">
                            <span className={`font-medium ${
                              item.currentStock <= item.reorderLevel ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {item.currentStock}
                            </span>
                          </td>
                          <td className="py-4 text-gray-600">{item.reorderLevel}</td>
                          <td className="py-4">{getStatusBadge(item.status)}</td>
                          <td className="py-4 text-gray-600">{item.lastRestocked}</td>
                          <td className="py-4 text-gray-600">{item.supplier}</td>
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
