
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  {
    title: "Total Revenue",
    value: "$42.25",
    change: "+20.1% from last month",
    icon: DollarSign,
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    trending: "up"
  },
  {
    title: "Orders",
    value: "5",
    change: "+180.1% from last month",
    icon: ShoppingCart,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
    trending: "up"
  },
  {
    title: "Customers",
    value: "5",
    change: "+19% from last month",
    icon: Users,
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
    trending: "up"
  },
  {
    title: "Products",
    value: "5 (2 low stock)",
    change: "+201 since last hour",
    icon: Package,
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgColor: "bg-orange-50",
    trending: "up"
  },
];

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.textColor}`} />
              </div>
              {metric.trending === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className={`text-xs ${metric.textColor}`}>{metric.change}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
