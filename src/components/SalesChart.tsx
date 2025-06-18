
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

const salesData = [
  { month: "Jan", sales: 1800, target: 2000 },
  { month: "Feb", sales: 1600, target: 1800 },
  { month: "Mar", sales: 1650, target: 1900 },
  { month: "Apr", sales: 1900, target: 2100 },
  { month: "May", sales: 2100, target: 2200 },
  { month: "Jun", sales: 1950, target: 2000 },
  { month: "Jul", sales: 2300, target: 2400 },
  { month: "Aug", sales: 2150, target: 2300 },
  { month: "Sep", sales: 2700, target: 2600 },
];

export function SalesChart() {
  const totalSales = salesData.reduce((sum, data) => sum + data.sales, 0);
  const avgGrowth = 12.5; // Mock growth percentage

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Sales Overview
            </CardTitle>
            <p className="text-sm text-gray-600">Monthly performance vs targets</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">${totalSales.toLocaleString()}</p>
            <p className="text-sm text-emerald-600 font-medium">+{avgGrowth}% growth</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `$${value}`, 
                  name === 'sales' ? 'Actual Sales' : 'Target'
                ]}
                labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="target" 
                fill="#e5e7eb"
                radius={[4, 4, 0, 0]}
                name="target"
              />
              <Bar 
                dataKey="sales" 
                fill="url(#salesGradient)"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
                name="sales"
              />
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
