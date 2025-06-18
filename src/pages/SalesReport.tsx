import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { Calendar, Filter, TrendingUp, DollarSign, ShoppingCart, Users, FileText } from "lucide-react";
import { exportToPDF } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

// TODO: Replace with API calls to fetch sales report data
const salesReportData = [
  { period: "Jan 2024", sales: 45000, orders: 120, customers: 89, avgOrder: 375 },
  { period: "Feb 2024", sales: 52000, orders: 145, customers: 112, avgOrder: 359 },
  { period: "Mar 2024", sales: 48000, orders: 135, customers: 98, avgOrder: 356 },
  { period: "Apr 2024", sales: 61000, orders: 165, customers: 134, avgOrder: 370 },
  { period: "May 2024", sales: 55000, orders: 152, customers: 118, avgOrder: 362 },
  { period: "Jun 2024", sales: 67000, orders: 178, customers: 145, avgOrder: 376 },
];

const topSellingProducts = [
  { product: "Wireless Headphones", sales: 1234, revenue: 98720, percentage: 25.3 },
  { product: "Smart Watch", sales: 987, revenue: 78960, percentage: 20.2 },
  { product: "Bluetooth Speaker", sales: 756, revenue: 45360, percentage: 11.6 },
  { product: "Phone Case", sales: 654, revenue: 32700, percentage: 8.4 },
  { product: "Laptop Stand", sales: 543, revenue: 27150, percentage: 7.0 },
];

const SalesReport = () => {
  const [dateRange, setDateRange] = useState("last_6_months");
  const { toast } = useToast();

  const handleExportPDF = () => {
    const columns = [
      { header: 'Period', dataKey: 'period' },
      { header: 'Sales', dataKey: 'sales' },
      { header: 'Orders', dataKey: 'orders' },
      { header: 'Customers', dataKey: 'customers' },
      { header: 'Avg Order Value', dataKey: 'avgOrder' }
    ];
    
    exportToPDF(salesReportData, 'sales-report', 'Sales Report', columns);
    toast({
      title: "Export Successful",
      description: "Sales report has been exported to PDF file"
    });
  };

  const totalSales = salesReportData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesReportData.reduce((sum, item) => sum + item.orders, 0);
  const totalCustomers = salesReportData.reduce((sum, item) => sum + item.customers, 0);
  const avgOrderValue = totalSales / totalOrders;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
                <p className="text-gray-600">Detailed analysis of your sales performance</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </Button>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button onClick={handleExportPDF} className="gap-2 bg-red-600 hover:bg-red-700">
                  <FileText className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className="text-2xl font-bold">${totalSales.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">+15.2%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">+12.8%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Customers</p>
                      <p className="text-2xl font-bold">{totalCustomers.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">+8.4%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Order Value</p>
                      <p className="text-2xl font-bold">${avgOrderValue.toFixed(0)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">+2.1%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-50">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesReportData}>
                        <XAxis 
                          dataKey="period" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          tickFormatter={(value) => `$${value/1000}k`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']}
                          labelStyle={{ color: '#374151' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Orders by Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesReportData}>
                        <XAxis 
                          dataKey="period" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value) => [value, 'Orders']}
                          labelStyle={{ color: '#374151' }}
                        />
                        <Bar 
                          dataKey="orders" 
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSellingProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div>
                          <h3 className="font-semibold">{product.product}</h3>
                          <p className="text-sm text-gray-600">{product.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{product.percentage}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Sales Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-3 font-semibold">Period</th>
                        <th className="pb-3 font-semibold">Sales</th>
                        <th className="pb-3 font-semibold">Orders</th>
                        <th className="pb-3 font-semibold">Customers</th>
                        <th className="pb-3 font-semibold">Avg Order Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReportData.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-4 font-medium">{item.period}</td>
                          <td className="py-4">${item.sales.toLocaleString()}</td>
                          <td className="py-4">{item.orders}</td>
                          <td className="py-4">{item.customers}</td>
                          <td className="py-4">${item.avgOrder}</td>
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

export default SalesReport;
