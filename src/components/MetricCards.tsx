
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  {
    title: "Total Revenue",
    value: "$42,250",
    change: "+20.1% from last month",
    icon: DollarSign,
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    borderColor: "border-emerald-200",
    trending: "up"
  },
  {
    title: "Orders",
    value: "1,234",
    change: "+180.1% from last month",
    icon: ShoppingCart,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    trending: "up"
  },
  {
    title: "Customers",
    value: "2,547",
    change: "+19% from last month",
    icon: Users,
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
    trending: "up"
  },
  {
    title: "Products",
    value: "234",
    change: "5 low stock items",
    icon: Package,
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
    borderColor: "border-orange-200",
    trending: "up"
  },
];

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {metrics.map((metric, index) => (
        <Card 
          key={index} 
          className={`hover:shadow-xl transition-all duration-300 border-0 shadow-lg transform hover:-translate-y-1 ${metric.bgColor} ${metric.borderColor}`}
        >
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl shadow-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.textColor}`} />
              </div>
              {metric.trending === "up" ? (
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">↗</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-medium">↘</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{metric.value}</p>
              <p className={`text-xs font-medium ${metric.textColor}`}>{metric.change}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
