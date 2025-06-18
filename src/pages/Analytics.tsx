import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesChart } from "@/components/SalesChart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

// TODO: Replace with API calls to fetch analytics data
const revenueData = [
  { month: "Jan", revenue: 45000, orders: 120 },
  { month: "Feb", revenue: 52000, orders: 145 },
  { month: "Mar", revenue: 48000, orders: 135 },
  { month: "Apr", revenue: 61000, orders: 165 },
  { month: "May", revenue: 55000, orders: 152 },
  { month: "Jun", revenue: 67000, orders: 178 },
];

const categoryData = [
  { name: "Electronics", value: 45, color: "#3b82f6" },
  { name: "Accessories", value: 25, color: "#10b981" },
  { name: "Home & Garden", value: 20, color: "#f59e0b" },
  { name: "Sports", value: 10, color: "#ef4444" },
];

const trafficData = [
  { source: "Organic Search", visitors: 4200, percentage: 35 },
  { source: "Direct", visitors: 3600, percentage: 30 },
  { source: "Social Media", visitors: 2400, percentage: 20 },
  { source: "Email", visitors: 1200, percentage: 10 },
  { source: "Paid Ads", visitors: 600, percentage: 5 },
];

const Analytics = () => {
  const { toast } = useToast();

  const handleExportPDF = () => {
    const analyticsData = [
      { metric: 'Total Revenue', value: '$328,000', change: '+12.5%' },
      { metric: 'Total Orders', value: '1,895', change: '+8.2%' },
      { metric: 'Website Visitors', value: '12,000', change: '-2.1%' },
      { metric: 'Conversion Rate', value: '15.8%', change: '+1.3%' }
    ];

    const columns = [
      { header: 'Metric', dataKey: 'metric' },
      { header: 'Value', dataKey: 'value' },
      { header: 'Change', dataKey: 'change' }
    ];
    
    try {
      exportToPDF(analyticsData, 'analytics-report', 'Analytics Report', columns);
      toast({
        title: "Export Successful",
        description: "Analytics report has been exported to PDF file"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the analytics report",
        variant: "destructive"
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-gray-600 dark:text-gray-300">Comprehensive insights into your business performance</p>
              </div>
              <Button onClick={handleExportPDF} variant="outline" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30">
                Export PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Revenue</p>
                      <p className="text-2xl font-bold dark:text-white">$328,000</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">+12.5%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Orders</p>
                      <p className="text-2xl font-bold dark:text-white">1,895</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">+8.2%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Website Visitors</p>
                      <p className="text-2xl font-bold dark:text-white">12,000</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">-2.1%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Conversion Rate</p>
                      <p className="text-2xl font-bold dark:text-white">15.8%</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">+1.3%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesChart />
              
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {categoryData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm dark:text-gray-300">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium dark:text-white">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trafficData.map((source, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium dark:text-white">{source.source}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">{source.visitors.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{source.percentage}% of total traffic</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Orders vs Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        name="Revenue"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Orders"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Analytics;
