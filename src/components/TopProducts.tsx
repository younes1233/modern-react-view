
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Flame, Star } from "lucide-react";

const products = [
  {
    name: "Wireless Headphones",
    category: "Electronics",
    sales: 1234,
    revenue: "$98,720",
    trend: "up",
    trendValue: "+12.5%",
    trending: true
  },
  {
    name: "Smart Watch",
    category: "Electronics", 
    sales: 987,
    revenue: "$78,960",
    trend: "up",
    trendValue: "+8.3%",
    hot: true
  },
  {
    name: "Bluetooth Speaker",
    category: "Electronics",
    sales: 756,
    revenue: "$45,360",
    trend: "down",
    trendValue: "-2.1%"
  },
  {
    name: "Phone Case",
    category: "Accessories",
    sales: 654,
    revenue: "$32,700",
    trend: "up",
    trendValue: "+5.7%"
  }
];

export function TopProducts() {
  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          <CardTitle className="text-xl font-bold">Top Products</CardTitle>
        </div>
        <p className="text-emerald-100 text-sm">Best performing items this month</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {products.map((product, index) => (
            <div key={index} className="p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 border-b border-gray-100 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    {product.trending && (
                      <Badge className="text-xs px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0">
                        <Flame className="w-3 h-3 mr-1" />
                        trending
                      </Badge>
                    )}
                    {product.hot && (
                      <Badge className="text-xs px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
                        🔥 hot
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{product.category}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {product.trend === "up" ? (
                      <div className="flex items-center gap-1 bg-emerald-100 rounded-full px-2 py-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">{product.trendValue}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-red-100 rounded-full px-2 py-1">
                        <TrendingDown className="w-3 h-3 text-red-600" />
                        <span className="text-xs font-semibold text-red-700">{product.trendValue}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{product.revenue}</p>
                    <p className="text-xs text-gray-500">{product.sales.toLocaleString()} sales</p>
                  </div>
                </div>
              </div>
              
              {/* Progress bar for visual appeal */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    product.trend === "up" 
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-600" 
                      : "bg-gradient-to-r from-red-400 to-red-600"
                  }`}
                  style={{ width: `${Math.min((product.sales / 1500) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
